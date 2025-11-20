const jwt = require("jsonwebtoken");
const environment = require("../utils/environment");
const { sendErrorResponse } = require("../utils/response");


module.exports = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || '';
        const token = (authHeader && authHeader.split(' ')[1]) || (req.cookies['token'] || '');
        if (!token) {
            return sendErrorResponse(res, 'Unauthorized Access', 401, true, true);
        }

        jwt.verify(token, environment.jwt.secret, async (err, verifiedUser) => {
            if (err) {
                return sendErrorResponse(res, 'Session expired or invalid token', 401, true, true);
            }
            req.user = verifiedUser;
            next();
        });
    } catch (error) {
        return sendErrorResponse(res, 'Unauthorized Access', 401, true, true);
    }
}