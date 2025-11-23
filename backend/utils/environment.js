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
    // s3bucket: {
    //     iamUserKey: process.env.S3_IAM_USER_KEY,
    //     iamUserSecret: process.env.S3_IAM_USER_SECRET,
    //     region: process.env.S3_REGION,
    //     public: process.env.S3_PUBLIC_BUCKET,
    //     private: process.env.S3_PRIVATE_BUCKET,
    // },

    // Cloudflare R2 Configuration
    r2: {
        accountId: process.env.R2_ACCOUNT_ID || (process.env.R2_ENDPOINT ? process.env.R2_ENDPOINT.match(/https:\/\/([^.]+)\.r2\.cloudflarestorage\.com/)?.[1] : null),
        bucketName: process.env.R2_BUCKET_NAME,
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
        endpoint: process.env.R2_ENDPOINT,
        region: process.env.R2_REGION || "auto",
        publicDomain: process.env.R2_PUBLIC_DOMAIN,
    },
};