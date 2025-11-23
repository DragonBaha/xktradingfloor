require("dotenv").config();

module.exports = {
    nodeEnv: process.env.NODE_ENV,
    server: process.env.SERVER,
    domain: process.env.DOMAIN,
    frontendUrl: process.env.FRONTEND_URL || process.env.SERVER,
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
    s3bucket: {
        public: process.env.S3_PUBLIC_BUCKET,
        iamUserKey: process.env.IAM_USER_KEY,
        iamUserSecret: process.env.IAM_USER_SECRET,
        region: process.env.S3_REGION,
    },
};