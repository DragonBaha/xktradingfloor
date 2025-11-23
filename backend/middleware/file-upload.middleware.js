const multer = require("multer");
const fs = require("fs");
const path = require("path");
const dayjs = require("dayjs");
const crypto = require("crypto");

const mimeTypes = (mediaType) => {
    switch (mediaType) {
        case "image":
            return [
                "image/bmp",
                "image/gif",
                "image/ief",
                "image/jpeg",
                "image/pipeg",
                "image/tiff",
                "image/svg+xml",
                "image/png",
                "image/ico",
            ];
        case "audio":
            return [
                "audio/basic",
                "audio/mid",
                "audio/mpeg",
                "audio/mp3",
                "audio/x-mpegurl",
                "audio/x-pn-realaudio",
                "audio/x-wav",
                "audio/x-pn-realaudio",
                "audio/x-aiff",
            ];
        case "video":
            return [
                "video/mpeg",
                "video/mp4",
                "video/quicktime",
                "video/x-la-asf",
                "video/x-ms-asf",
                "video/x-msvideo",
                "video/x-sgi-movie",
            ];
        case "pdf":
            return ["application/pdf"];
        case "csv":
            return ["application/vnd.ms-excel", "text/csv", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
        case "text":
            return ["text/plain"];
        case "excel":
            return [
                "application/vnd.ms-excel", // XLS
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // XLSX
            ];
        case "word":
            return [
                "application/msword", // DOC
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX
            ];
        case "eml":
            return [
                "message/rfc822",
                "application/vnd.ms-outlook",
                "text/plain"
            ];

        default:
            return [];
    }
};

const dest = (path) => {
    return multer.diskStorage({
        destination: (req, file, cb) => {
            const dir = `public/images/${path}/${dayjs().format("YYYY-MM")}`;
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            cb(null, dir);
        },
        filename: (req, file, cb) => {
            const timestamp = Date.now();
            const randomStr = crypto.randomBytes(4).toString("hex");
            const safeName = file.originalname.replace(/ +/g, "_");
            cb(null, `${timestamp}-${randomStr}-${safeName}`);
        },
    });
};

const fileFilter = (mimeTypeArray) => {
    const allowedMimes = mimeTypeArray.map((m) => mimeTypes(m));
    return (req, file, cb) => {
        if ([].concat.apply([], allowedMimes).includes(file.mimetype)) {
            cb(null, true);
        } else {
            req.fileValidationError = "invalid mime type";
            cb(null, false, new Error("invalid mime type"));
        }
    };
};

/**
 *
 * Fields
 * @typedef {Object} Fields
 * @property {String} name - request key name
 * @property {Number} maxCount - maximum file count for upload
 *
 */

/**
 *
 * File Upload
 *
 * @param { String } destination - directory name
 * @param { String[] } mimeFilter - mimeFilter Array
 * @param { Fields[] } fields - Multiple Fields
 *
 * @example
 *  fileUpload('profile', ["image"], [{ name: "image", maxCount: 1 }])
 */
exports.fileUpload = (destination, mimeTypesArray, fields) => {
    return multer({
        storage: dest(destination),
        fileFilter: fileFilter(mimeTypesArray),
    }).fields(fields);
};

exports.fileUploadArray = (field, subfield, allowedTypes, maxCount) => {
    return multer({
        storage: dest(field),
        fileFilter: function (req, file, cb) {
            const ext = path.extname(file.originalname).toLowerCase();
            if (!allowedTypes.some(type => ext.includes(type))) {
                return cb(new Error('Only certain file types are allowed!'));
            }
            cb(null, true);
        }
    }).fields([
        { name: `${field}[0].${subfield}`, maxCount: 1 },
        { name: `${field}[1].${subfield}`, maxCount: 1 },
        { name: `${field}[2].${subfield}`, maxCount: 1 },
        { name: `${field}[3].${subfield}`, maxCount: 1 },
        { name: `${field}[4].${subfield}`, maxCount: 1 },
        { name: `${field}[5].${subfield}`, maxCount: 1 },
        { name: `${field}[6].${subfield}`, maxCount: 1 },
        { name: `${field}[7].${subfield}`, maxCount: 1 },
        { name: `${field}[8].${subfield}`, maxCount: 1 },
        { name: `${field}[9].${subfield}`, maxCount: 1 },
        { name: `${field}[10].${subfield}`, maxCount: 1 },
        { name: `${field}[11].${subfield}`, maxCount: 1 },
        { name: `${field}[12].${subfield}`, maxCount: 1 },
        { name: `${field}[13].${subfield}`, maxCount: 1 },
        { name: `${field}[14].${subfield}`, maxCount: 1 }
    ]);
};