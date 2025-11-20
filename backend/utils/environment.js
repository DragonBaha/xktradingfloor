require("dotenv").config();

module.exports = {
    nodeEnv: process.env.NODE_ENV,
    server: process.env.SERVER,
    domain: process.env.DOMAIN,
    masterPassword: process.env.MASTER_PASSWORD,
    database: {
        uri: process.env.DB_URI,
    },
    jwt: {
        secret: process.env.JWT_SECRET,
        expiredIn: process.env.JWT_EXPIRED_IN,
    },
    cookie: {
        expireMs: parseInt(process.env.COOKIE_EXPIRE_MS, 10) || 24 * 60 * 60 * 1000 // Default to 24 hours if not set
    },
};
