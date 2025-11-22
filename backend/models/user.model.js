const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const constants = require("../utils/constants");

const Schema = mongoose.Schema;

const UserSchema = new Schema(
    {
        fullName: { type: String },
        profileImage: {
            type: String,
            default: ""
        },
        gender: {
            type: String,
        },
        email: {
            type: String,
            // required: true,
            // unique: true,
            trim: true, // Removes any leading/trailing spaces
            lowercase: true // Converts to lowercase
        },
        countryCode: { type: String, default: "+91" },
        mobileNumber: {
            type: String,
            // required: true,
            // unique: true,
        },
        password: { type: String, select: false },
        role: {
            type: String,
            enum: constants.user.roles,
            default: constants.roles.user,
        },
        isActive: {
            type: Boolean,
            default: false,
        },
        isDeleted: {
            type: Boolean,
            default: false
        },
        dateOfBirth: {
            type: Date,
        },
        moduleAccessId: {
            type: Schema.Types.ObjectId,
            ref: "module_access",
        },
        age: {
            type: Number
        },
        addedBy: {
            type: Schema.Types.ObjectId,
            ref: "user",
            default: null
        },
        resetPasswordToken: {
            type: String
        },
        resetPasswordExpiry: {
            type: String
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

UserSchema.pre("save", function save(next) {
    const user = this;
    if (!user.isModified("password")) {
        return next();
    }
    bcrypt.genSalt(10, (err, salt) => {
        if (err) {
            return next(err);
        }
        bcrypt.hash(user.password, salt, (err, hash) => {
            if (err) {
                return next(err);
            }
            user.password = hash;
            next();
        });
    });
});

/**
 * Helper method for getting user's gravatar.
 */

UserSchema.methods.gravatar = function gravatar(size) {
    if (!size) {
        size = 200;
    }
    if (!this.email) {
        return `https://gravatar.com/avatar/?s=${size}&d=retro`;
    }
    const md5 = crypto.createHash("md5").update(this.email).digest("hex");
    return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`;
};

UserSchema.methods.comparePassword = function comparePassword(
    plainPassword,
    next
) {
    bcrypt.compare(plainPassword, this.password, (err, isMatch) => {
        next(err, isMatch);
    });
};

const UserModel = mongoose.model("user", UserSchema);

module.exports = UserModel;