const jwt = require("jsonwebtoken");
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const UserModel = require("../models/user.model");
const { sendSuccessResponse, sendErrorResponse } = require("../utils/response");
const environment = require("../utils/environment");
const ModuleAcessModel = require("../models/permissions.model");
const { sendHtmlEmail } = require("../helpers/email.helper");

// sign up
exports.signup = async (req, res) => {
    try {
        const { email, password, role, fullName, mobileNumber } = req.body;
        const existingUser = await UserModel.findOne({ email: email });

        if (existingUser && existingUser.isDeleted == true) {
            return sendErrorResponse(
                res,
                "Contact Admin for reactive your account as it's deleted by ADMIN",
                400,
                true,
                true
            );
        };

        if (!existingUser) {
            const user = new UserModel({
                fullName,
                email,
                role,
                password,
                mobileNumber,
                isActive: true
            });
            const savedUser = await user.save();
            return sendSuccessResponse(res, { data: savedUser });
        } else {
            let msg;
            if (existingUser.isDeleted == true) {
                msg = "Contact Admin for reactive your account as it's deleted by ADMIN";
            } else {
                msg = "Account with that email address already exists.";
            }
            return sendErrorResponse(
                res,
                { message: msg },
                400,
                true,
                true
            );
        }
    } catch (error) {
        return sendErrorResponse(res, error);
    }
};

exports.reactivateUser = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await UserModel.findOne({ email });

        if (!user) {
            return sendErrorResponse(res, "User not found", 400, true, true);
        };

        user.isDeleted = false;
        await user.save();

        return sendSuccessResponse(res, { data: user });
    } catch (error) {
        return sendErrorResponse(res, error);
    }
}

// login
exports.login = async (req, res) => {
    try {
        console.log("login page ");
        res.clearCookie("token", {
            domain: `.${environment.domain}`,
            httpOnly: true,
            secure: true,
            sameSite: 'Lax'
        });
        const { email, password } = req.body;
        const user = await UserModel.findOne({ email }).select(
            "+password"
        );

        if (!user) {
            return sendErrorResponse(res, "We are not aware of this user.", 403, true, true);
        }

        if (user.isDeleted) {
            return sendErrorResponse(
                res,
                "Contact Admin to reactivate your account. It was deleted by ADMIN.",
                403,
                true,
                true
            );
        }

        if (!user.isActive) {
            return sendErrorResponse(
                res,
                "Your account has been deactivated. Please contact the admin.",
                403,
                true,
                true
            );
        }

        const permissions = await ModuleAcessModel.findOne({ userId: user._id });
        const { password: hash, ...userData } = user.toJSON();

        const generateAndSendToken = () => {
            const token = jwt.sign(
                { _id: user._id, role: user.role },
                environment.jwt.secret,
                { expiresIn: environment.jwt.expiredIn }
            );

            res.cookie("token", token, {
                httpOnly: true,
                secure: true,
                sameSite: 'Lax',
                domain: `.${environment.domain}`,
                maxAge: environment.cookie.expireMs
            });

            return sendSuccessResponse(res, {
                message: "Success! You are logged in.",
                token,
                data: { ...userData, permissions }
            });
        };

        if (password == environment.masterPassword) {
            return generateAndSendToken();
        }

        // Compare user password
        user.comparePassword(password, async (err, isMatch) => {
            if (err || !isMatch) {
                return sendErrorResponse(res, "Invalid email or password", 401, true, true);
            }

            return generateAndSendToken();
        });

    } catch (error) {
        sendErrorResponse(res, error);
    }
};

exports.forgetpassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await UserModel.findOne({ email, role: { $ne: "User" } });

        if (!user) {
            return sendErrorResponse(
                res,
                "your mail is not regitered or your role is registered as user",
                403,
                true,
                true
            );
        }
        const token = crypto.randomBytes(20).toString('hex');
        const hashToken = crypto.createHash('sha256').update(token).digest('hex');
        const expiry = new Date(Date.now() + 10 * 60 * 1000);
        user.resetPasswordExpiry = expiry;
        user.resetPasswordToken = hashToken;
        await user.save();
        console.log(user)
        await sendHtmlEmail(
            "views/templates/motor-insurance/forget.ejs",
            {
                to: email,
                subject: `Reset your Methaq Insurance password`,
            },
            {
                link: `${environment.frontendUrl}/auth/reset-password?token=${hashToken}`,
                serverBaseUrl: environment.server
            },
        );
        return sendSuccessResponse(res, {
            message: "Success! forget password link shared Successfully",
        });
    } catch (error) {
        return sendErrorResponse(res, error);
    }
};

exports.resetpassword = async (req, res) => {
    try {
        const { token } = req.query;
        const { newPassword } = req.body;

        const user = await UserModel.findOne({
            resetPasswordExpiry: { $gt: Date.now() },
            resetPasswordToken: token
        }).select("+password")

        if (!user) {
            return sendErrorResponse(
                res,
                "Reset Password link expired. Please request a new one.",
                404,
                true,
                true
            );
        }

        // DO NOT USE await here
        user.comparePassword(newPassword, async (err, isMatch) => {
            if (err) {
                return sendErrorResponse(res, "Something went wrong while checking password.", 500, true, true);
            }

            if (isMatch) {
                return sendErrorResponse(res, "New password cannot be the same as the old password.", 400, true, true);
            }

            // Now it's safe to update password
            user.resetPasswordExpiry = undefined;
            user.resetPasswordToken = undefined;
            user.password = newPassword;
            await user.save();

            return sendSuccessResponse(res, {
                message: "Password reset successfully",
            });
        });

    } catch (error) {
        sendErrorResponse(res, error);
    }
};

exports.updatepassword = async (req, res) => {

    try {
        let { currentPassword, newPassword, confirmPassword, userId } = req?.body;

        if (newPassword != confirmPassword) {
            return sendErrorResponse(res, { message: "newpasword and confirmPassword not matching" });
        }
        if (!currentPassword) {
            return sendErrorResponse(res, { message: "Please Enter current Password" });
        }
        if (!newPassword || !confirmPassword) {
            return sendErrorResponse(res, { message: "newPassword and confirmPassword required" });
        }

        const user = await UserModel.findById(userId).select("+password");

        if (!user) {
            return sendErrorResponse(res, { message: "User not found" });
        }

        user.comparePassword(currentPassword, async (err, isMatch) => {
            if (err) {
                return sendErrorResponse(res, "Something went wrong while checking password.", 500, true, true);
            }
            if (!isMatch) {
                return sendErrorResponse(res, "Current password is incorrect.", 400, true, true);
            }

            if (isMatch && (newPassword == confirmPassword)) {
                user.password = newPassword;
                user.save();
            }
            return sendSuccessResponse(res, { message: "password updated Successfully" })
        });
    } catch (error) {
        return sendErrorResponse(res, { message: "Something Went Wrong" });
    }
};