const fs = require("fs");
const AWS = require("aws-sdk");
const path = require("path");
const environment = require("../utils/environment");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3")
const { PassThrough } = require('stream');
const s3bucket = new AWS.S3({
    accessKeyId: environment.s3bucket.iamUserKey,
    secretAccessKey: environment.s3bucket.iamUserSecret,
    region: environment.s3bucket.region,
});

const s3ClientObj = new S3Client({
    region: environment.s3bucket.region,
    credentials: {
        accessKeyId: environment.s3bucket.iamUserKey,
        secretAccessKey: environment.s3bucket.iamUserSecret,
    },
});

const s3 = {
    uploadPrivate: (file, fileName, folder = "folderName") => {
        return new Promise((resolve, reject) => {
            try {
                const readStream = fs.createReadStream(file);

                const params = {
                    Bucket: environment.s3bucket.private,
                    Key: `${folder}/${fileName}`,
                    Body: readStream,
                    ACL: "bucket-owner-full-control",
                };

                s3bucket.upload(params, (err, data) => {
                    readStream.destroy();
                    if (err) {
                        reject(err);
                    } else {
                        resolve(data.Location);
                        // Delete file asynchronously with error handling
                        if (fs.existsSync(file)) {
                            fs.unlink(file, (deleteErr) => {
                                if (deleteErr) {
                                    console.log("Warning: Could not delete local file:", file, deleteErr.message);
                                }
                            });
                        }
                    }
                });
            } catch (error) {
                reject(error);
            }
        });
    },
    uploadPublic: (file, fileName, folder = "folderName") => {
        return new Promise((resolve, reject) => {
            try {
                const readStream = fs.createReadStream(file);

                const params = {
                    Bucket: environment.s3bucket.public,
                    Key: `${folder}/${fileName}`,
                    Body: readStream,
                    ACL: "bucket-owner-full-control",
                };

                s3bucket.upload(params, (err, data) => {
                    readStream.destroy();
                    if (err) {
                        console.log("S3 Error===>", err);
                        reject(err);
                    } else {
                        resolve(data.Location);
                        // Delete file asynchronously with error handling
                        if (fs.existsSync(file)) {
                            fs.unlink(file, (deleteErr) => {
                                if (deleteErr) {
                                    console.log("Warning: Could not delete local file:", file, deleteErr.message);
                                }
                            });
                        }
                    }
                });
            } catch (error) {
                reject(error);
            }
        });
    },

    // Generate a presigned URL for uploading to S3
    generatePresignedUploadUrl: (fileName, folder = "folderName", isPrivate = false, expiresIn = 300) => {
        return new Promise((resolve, reject) => {
            try {
                const bucket = isPrivate ? environment.s3bucket.private : environment.s3bucket.public;
                const key = `${folder}/${fileName}`;
                const params = {
                    Bucket: bucket,
                    Key: key,
                    Expires: expiresIn,
                    ContentType: 'application/octet-stream',
                };
                s3bucket.getSignedUrl('putObject', params, (err, url) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({
                            uploadUrl: url,
                            key: key,
                            bucket: bucket,
                            publicUrl: isPrivate ? null : `https://${bucket}.s3.${environment.s3bucket.region}.amazonaws.com/${key}`
                        });
                    }
                });
            } catch (error) {
                reject(error);
            }
        });
    },

    // Generate a presigned URL for downloading from S3
    generatePresignedDownloadUrl: (fileUrl, expiresIn = 3600) => {
        return new Promise((resolve, reject) => {
            try {
                // Extract bucket and key from the URL
                const urlObj = new URL(fileUrl);
                const pathParts = urlObj.pathname.split('/').filter(part => part);
                const bucket = urlObj.hostname.split('.')[0];
                const key = pathParts.join('/');
                const params = {
                    Bucket: bucket,
                    Key: key,
                    Expires: expiresIn,
                };
                s3bucket.getSignedUrl('getObject', params, (err, url) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(url);
                    }
                });
            } catch (error) {
                reject(error);
            }
        });
    },

    // Get file metadata using signed URL
    getFileMetadata: (key, bucketName = null) => {
        return new Promise((resolve, reject) => {
            try {
                const bucket = bucketName || environment.s3bucket.public;
                const params = {
                    Bucket: bucket,
                    Key: key,
                };

                s3bucket.headObject(params, (err, data) => {
                    if (err) {
                        console.log("Error getting file metadata:", err);
                        reject(err);
                    } else {
                        resolve({
                            contentType: data.ContentType,
                            contentLength: data.ContentLength,
                            lastModified: data.LastModified,
                            etag: data.ETag,
                            metadata: data.Metadata
                        });
                    }
                });
            } catch (error) {
                console.log("Error in getFileMetadata:", error);
                reject(error);
            }
        });
    },

    deleteFiles: (files) => {
        return new Promise((resolve, reject) => {
            try {
                console.log(files);
                const params = {
                    Bucket: environment.s3bucket.public,
                    Delete: {
                        Objects: files.flat().map((item) => {
                            let key = new URL(item);
                            return { Key: key.pathname.split("/").splice(1).join("/") };
                        }),
                    },
                };
                console.log("param =< ", params.Delete.Objects);
                if (params.Delete.Objects.length > 0) {
                    s3bucket.deleteObjects(params, (err, data) => {
                        if (err) {
                            console.log("error from herre ==> ", err);
                            reject(err);
                        } else {
                            console.log(
                                `Successfully deleted ${params.Delete.Objects.length} objects.`
                            );
                            resolve(data);
                        }
                    });
                }
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    },

    deleteFolder: (bucketName, folderPaths) => {
        return new Promise(async (resolve, reject) => {
            try {
                for (const folderPath of folderPaths) {
                    const listParams = {
                        Bucket: bucketName,
                        Prefix: folderPath,
                    };

                    const listedObjects = await s3bucket
                        .listObjectsV2(listParams)
                        .promise();

                    if (listedObjects.Contents.length === 0) {
                        continue;
                    }

                    const deleteParams = {
                        Bucket: bucketName,
                        Delete: { Objects: [] },
                    };

                    listedObjects.Contents.forEach(({ Key }) => {
                        deleteParams.Delete.Objects.push({ Key });
                    });

                    await s3bucket.deleteObjects(deleteParams).promise();

                    await s3bucket
                        .deleteObject({ Bucket: bucketName, Key: folderPath })
                        .promise();

                    console.log(
                        `Folder ${folderPath} and its contents deleted successfully!`
                    );
                }

                resolve("All folders and their contents deleted successfully!");
            } catch (err) {
                reject(err);
            }
        });
    },

    copyFile: (type, url, folder = "posts", fromPrivate, toPrivate) => {
        return new Promise(async (resolve, reject) => {
            try {
                if (type == "image") {
                    console.log(url);
                    let keyValue = new URL(url);
                    const m3u8Key = keyValue.pathname.split("/").splice(1).join("/");
                    const destination_m3u8Key =
                        folder + "/" + keyValue.pathname.split("/").splice(2).join("/");

                    const fromBucket = fromPrivate
                        ? environment.s3bucket.private
                        : environment.s3bucket.public;
                    const toBucket = toPrivate
                        ? environment.s3bucket.private
                        : environment.s3bucket.public;

                    const params = {
                        Bucket: toBucket,
                        CopySource: `${fromBucket}/${m3u8Key}`,
                        Key: `${destination_m3u8Key}`,
                    };

                    s3bucket.copyObject(params, function (copyErr, copyData) {
                        if (copyErr) {
                            reject(copyErr);
                        }
                        if (copyData) {
                            const bucketName = toBucket;
                            const region = environment.s3bucket.region;

                            attachmentsUrl = `https://${bucketName}${region}.s3.amazonaws.com/${destination_m3u8Key}`;
                            resolve(attachmentsUrl);
                        }
                    });
                } else {
                    const videoAttachment = [];
                    let keyValue = new URL(url);
                    var m3u8Key = keyValue.pathname.split("/").splice(1);
                    const endPoint = m3u8Key.pop();
                    var resolveURL = "";
                    m3u8Key = m3u8Key.join("/");
                    const destination_m3u8Key =
                        folder + "/" + m3u8Key.split("/").splice(1).join("/");
                    m3u8Key = m3u8Key + "/";

                    const fromBucket = fromPrivate
                        ? environment.s3bucket.private
                        : environment.s3bucket.public;
                    const toBucket = toPrivate
                        ? environment.s3bucket.private
                        : environment.s3bucket.public;

                    const listObjectsResponse = await s3bucket
                        .listObjects({
                            Bucket: fromBucket,
                            Prefix: m3u8Key,
                            Delimiter: destination_m3u8Key,
                        })
                        .promise();

                    const folderContentInfo = listObjectsResponse.Contents;
                    const folderPrefix = listObjectsResponse.Prefix;

                    await Promise.all([
                        await folderContentInfo.map(async (fileInfo) => {
                            await s3bucket.copyObject(
                                {
                                    Bucket: toBucket,
                                    CopySource: `${fromBucket}/${fileInfo.Key}`, // old file Key
                                    Key: `${destination_m3u8Key}/${fileInfo.Key.replace(
                                        folderPrefix,
                                        ""
                                    )}`,
                                },
                                function (copyErr, copyData) {
                                    if (copyErr) {
                                        reject(copyErr);
                                    }
                                    if (copyData) {
                                        const bucketName = toBucket;
                                        const region = environment.s3bucket.region;

                                        const attachmentsUrl = `https://${bucketName}${region}.s3.amazonaws.com/${destination_m3u8Key}/${fileInfo.Key.split(
                                            "/"
                                        ).splice(-1)}`;

                                        if (path.extname(attachmentsUrl) == ".m3u8") {
                                            resolve(attachmentsUrl);
                                        }
                                    }
                                }
                            );
                        }),
                    ])
                        .then(() => { })
                        .catch((e) => reject(e));
                }
            } catch (error) {
                console.log(error?.message);
            }
        });
    },

    getPrivateFiles: (key) => {
        return new Promise((resolve, reject) => {
            try {
                // console.log("key ", key);
                let keyValue = new URL(key);
                const params = {
                    Bucket: environment.s3bucket.private,
                    Key: keyValue.pathname.split("/").splice(1).join("/"),
                    Expires: 5000,
                };

                s3bucket.getSignedUrl("getObject", params, (err, url) => {
                    if (err) {
                        console.log(err);
                        reject(err);
                    }
                    resolve(url);
                    return url;
                });
            } catch (error) {
                console.log(error);
                reject(error);
            }
        });
    },

    getFiles: (key, bucketname) => {
        return new Promise((resolve, reject) => {
            try {
                const params = {
                    Bucket: bucketname,
                    Key: key,
                    Expires: 60,
                };

                s3bucket.getSignedUrl("getObject", params, (err, url) => {
                    if (err) {
                        console.log(err);
                        reject(err);
                    }
                    console.log("this is url ==> ", url);
                    resolve(url);
                    return url;
                });
            } catch (error) {
                reject(error);
            }
        });
    },
    streamFile: async (s3Url) => {
        try {
            const Bucket = environment.s3bucket.public;
            function extractS3KeyFromUrl(s3Url) {
                const url = new URL(s3Url);
                return decodeURIComponent(url.pathname.slice(1)); // Remove leading slash
            }
            const Key = extractS3KeyFromUrl(s3Url);

            const command = new GetObjectCommand({ Bucket, Key });
            const s3Response = await s3ClientObj.send(command);
            console.log("s3Response===>", s3Response);
            // res.setHeader('Content-Type', s3Response.ContentType || 'application/octet-stream');
            // res.setHeader('Content-Disposition', `inline; filename="${Key.split('/').pop()}"`);

            // Pipe S3 stream directly to response
            // const passThrough = new PassThrough();
            // s3Response.Body.pipe(passThrough).pipe(res);
            return s3Response;
        } catch (error) {
            console.error("Failed to stream file from S3:", error);
            return error;
            // res.status(500).json({ error: "Failed to stream file from S3" });
        }
    }

}

module.exports = s3;