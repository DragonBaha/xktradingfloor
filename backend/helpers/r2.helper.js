const fs = require("fs");
const AWS = require("aws-sdk");
const path = require("path");
const environment = require("../utils/environment");
const { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand, DeleteObjectsCommand, HeadObjectCommand, ListObjectsV2Command, CopyObjectCommand, ListObjectsCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { PassThrough } = require('stream');

// Validate R2 configuration
console.log("R2 Configuration Check:");
console.log("  Bucket Name:", environment.r2.bucketName ? "✓ Set" : "✗ Missing");
console.log("  Access Key ID:", environment.r2.accessKeyId ? "✓ Set" : "✗ Missing");
console.log("  Secret Access Key:", environment.r2.secretAccessKey ? "✓ Set" : "✗ Missing");
console.log("  Endpoint:", environment.r2.endpoint ? "✓ Set" : "✗ Missing");
console.log("  Region:", environment.r2.region || "auto (default)");

if (!environment.r2.bucketName) {
    console.error("ERROR: R2_BUCKET_NAME environment variable is not set!");
    console.error("Please add R2_BUCKET_NAME=okok to your .env file");
}
if (!environment.r2.accessKeyId) {
    console.error("ERROR: R2_ACCESS_KEY_ID environment variable is not set!");
}
if (!environment.r2.secretAccessKey) {
    console.error("ERROR: R2_SECRET_ACCESS_KEY environment variable is not set!");
}
if (!environment.r2.endpoint) {
    console.error("ERROR: R2_ENDPOINT environment variable is not set!");
}

// Cloudflare R2 S3-compatible client configuration
// Note: AWS SDK v2 has strict credential validation that doesn't work well with R2
// We use only AWS SDK v3 (S3Client) which is more flexible with R2 credentials
// const r2Client = new AWS.S3({
//     accessKeyId: environment.r2.accessKeyId,
//     secretAccessKey: environment.r2.secretAccessKey,
//     endpoint: environment.r2.endpoint,
//     region: environment.r2.region,
//     s3ForcePathStyle: true,
//     signatureVersion: 'v4',
// });

// AWS SDK v3 client for R2 (more flexible with R2 credentials)
const r2ClientObj = new S3Client({
    region: environment.r2.region,
    endpoint: environment.r2.endpoint,
    credentials: {
        accessKeyId: environment.r2.accessKeyId,
        secretAccessKey: environment.r2.secretAccessKey,
    },
    forcePathStyle: true, // Required for R2
});

// Helper function to construct R2 public URL
// Note: R2 buckets are private by default. You need either:
// 1. A custom domain configured in Cloudflare R2 for public access
// 2. Use presigned URLs for temporary access
const getR2PublicUrl = async (key, usePresigned = false) => {
    // If custom domain is configured, use it for public access
    if (environment.r2.publicDomain) {
        const domain = environment.r2.publicDomain.replace(/\/$/, ''); // Remove trailing slash
        return `${domain}/${key}`;
    }
    
    // If presigned URL is requested or no custom domain, generate presigned URL
    if (usePresigned || !environment.r2.publicDomain) {
        try {
            const command = new GetObjectCommand({
                Bucket: environment.r2.bucketName,
                Key: key,
            });
            const presignedUrl = await getSignedUrl(r2ClientObj, command, { expiresIn: 31536000 }); // 1 year
            return presignedUrl;
        } catch (error) {
            console.error("Error generating presigned URL:", error);
            // Fallback to account ID URL (won't work without auth, but at least returns something)
            const accountId = environment.r2.accountId || 
                (environment.r2.endpoint ? environment.r2.endpoint.match(/https:\/\/([^.]+)\.r2\.cloudflarestorage\.com/)?.[1] : null);
            if (accountId) {
                return `https://${accountId}.r2.cloudflarestorage.com/${environment.r2.bucketName}/${key}`;
            }
            return `${environment.r2.endpoint}/${environment.r2.bucketName}/${key}`;
        }
    }
    
    // Fallback to account ID URL (won't work without auth)
    const accountId = environment.r2.accountId || 
        (environment.r2.endpoint ? environment.r2.endpoint.match(/https:\/\/([^.]+)\.r2\.cloudflarestorage\.com/)?.[1] : null);
    if (accountId) {
        return `https://${accountId}.r2.cloudflarestorage.com/${environment.r2.bucketName}/${key}`;
    }
    return `${environment.r2.endpoint}/${environment.r2.bucketName}/${key}`;
};

const r2 = {
    uploadPrivate: async (file, fileName, folder = "folderName") => {
        try {
            // Validate bucket name
            if (!environment.r2.bucketName) {
                throw new Error("R2_BUCKET_NAME environment variable is not set. Please check your .env file.");
            }

            const key = `${folder}/${fileName}`;
            const fileContent = fs.readFileSync(file);

            const command = new PutObjectCommand({
                Bucket: environment.r2.bucketName,
                Key: key,
                Body: fileContent,
                // Note: R2 doesn't support ACL in the same way as S3
            });

            await r2ClientObj.send(command);

            // Return R2 public URL (with presigned URL if no custom domain)
            const publicUrl = await getR2PublicUrl(key, true); // Use presigned URL for public access
            
            // Delete file asynchronously with error handling
            if (fs.existsSync(file)) {
                fs.unlink(file, (deleteErr) => {
                    if (deleteErr) {
                        console.log("Warning: Could not delete local file:", file, deleteErr.message);
                    }
                });
            }

            return publicUrl;
        } catch (error) {
            throw error;
        }
    },

    uploadPublic: async (file, fileName, folder = "folderName") => {
        try {
            // Validate bucket name
            if (!environment.r2.bucketName) {
                throw new Error("R2_BUCKET_NAME environment variable is not set. Please check your .env file.");
            }

            const key = `${folder}/${fileName}`;
            const fileContent = fs.readFileSync(file);

            const command = new PutObjectCommand({
                Bucket: environment.r2.bucketName,
                Key: key,
                Body: fileContent,
            });

            await r2ClientObj.send(command);

            // Return R2 public URL (with presigned URL if no custom domain)
            const publicUrl = await getR2PublicUrl(key, true); // Use presigned URL for public access
            
            // Delete file asynchronously with error handling
            if (fs.existsSync(file)) {
                fs.unlink(file, (deleteErr) => {
                    if (deleteErr) {
                        console.log("Warning: Could not delete local file:", file, deleteErr.message);
                    }
                });
            }

            return publicUrl;
        } catch (error) {
            console.log("R2 Error===>", error);
            throw error;
        }
    },

    // Generate a presigned URL for uploading to R2
    generatePresignedUploadUrl: async (fileName, folder = "folderName", isPrivate = false, expiresIn = 300) => {
        try {
            const key = `${folder}/${fileName}`;
            const command = new PutObjectCommand({
                Bucket: environment.r2.bucketName,
                Key: key,
                ContentType: 'application/octet-stream',
            });

            const uploadUrl = await getSignedUrl(r2ClientObj, command, { expiresIn });
            const publicUrl = isPrivate ? null : await getR2PublicUrl(key, true);

            return {
                uploadUrl: uploadUrl,
                key: key,
                bucket: environment.r2.bucketName,
                publicUrl: publicUrl
            };
        } catch (error) {
            throw error;
        }
    },

    // Generate a presigned URL for downloading from R2
    generatePresignedDownloadUrl: async (fileUrl, expiresIn = 3600) => {
        try {
            // Extract key from the URL
            const urlObj = new URL(fileUrl);
            const key = urlObj.pathname.split('/').slice(2).join('/'); // Remove bucket name from path
            
            const command = new GetObjectCommand({
                Bucket: environment.r2.bucketName,
                Key: key,
            });

            const downloadUrl = await getSignedUrl(r2ClientObj, command, { expiresIn });
            return downloadUrl;
        } catch (error) {
            throw error;
        }
    },

    // Get file metadata
    getFileMetadata: async (key, bucketName = null) => {
        try {
            const bucket = bucketName || environment.r2.bucketName;
            const command = new HeadObjectCommand({
                Bucket: bucket,
                Key: key,
            });

            const data = await r2ClientObj.send(command);
            return {
                contentType: data.ContentType,
                contentLength: data.ContentLength,
                lastModified: data.LastModified,
                etag: data.ETag,
                metadata: data.Metadata
            };
        } catch (error) {
            console.log("Error getting file metadata:", error);
            throw error;
        }
    },

    deleteFiles: async (files) => {
        try {
            console.log(files);
            const objects = files.flat().map((item) => {
                try {
                    const url = new URL(item);
                    const key = url.pathname.split("/").slice(2).join("/"); // Remove bucket name
                    return { Key: key };
                } catch (e) {
                    // If it's already a key, use it directly
                    return { Key: item };
                }
            });

            console.log("param =< ", objects);
            
            if (objects.length > 0) {
                const command = new DeleteObjectsCommand({
                    Bucket: environment.r2.bucketName,
                    Delete: {
                        Objects: objects,
                    },
                });

                const data = await r2ClientObj.send(command);
                console.log(`Successfully deleted ${objects.length} objects.`);
                return data;
            }
            return { Deleted: [] };
        } catch (error) {
            console.log("error from here ==> ", error);
            throw error;
        }
    },

    deleteFolder: async (bucketName, folderPaths) => {
        try {
            const bucket = bucketName || environment.r2.bucketName;
            
            for (const folderPath of folderPaths) {
                const listCommand = new ListObjectsV2Command({
                    Bucket: bucket,
                    Prefix: folderPath,
                });

                let listedObjects = await r2ClientObj.send(listCommand);

                if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
                    continue;
                }

                const deleteParams = {
                    Bucket: bucket,
                    Delete: { Objects: [] },
                };

                listedObjects.Contents.forEach(({ Key }) => {
                    deleteParams.Delete.Objects.push({ Key });
                });

                if (deleteParams.Delete.Objects.length > 0) {
                    const deleteCommand = new DeleteObjectsCommand(deleteParams);
                    await r2ClientObj.send(deleteCommand);
                }

                // Try to delete the folder marker if it exists
                try {
                    const deleteFolderCommand = new DeleteObjectCommand({
                        Bucket: bucket,
                        Key: folderPath
                    });
                    await r2ClientObj.send(deleteFolderCommand);
                } catch (e) {
                    // Folder marker might not exist, that's okay
                }

                console.log(`Folder ${folderPath} and its contents deleted successfully!`);
            }

            return "All folders and their contents deleted successfully!";
        } catch (err) {
            throw err;
        }
    },

    copyFile: async (type, url, folder = "posts", fromPrivate, toPrivate) => {
        try {
            if (type == "image") {
                console.log(url);
                let keyValue = new URL(url);
                const sourceKey = keyValue.pathname.split("/").slice(2).join("/"); // Remove bucket name
                const destinationKey = folder + "/" + keyValue.pathname.split("/").slice(2).join("/");

                const copyCommand = new CopyObjectCommand({
                    Bucket: environment.r2.bucketName,
                    CopySource: `${environment.r2.bucketName}/${sourceKey}`,
                    Key: destinationKey,
                });

                const copyData = await r2ClientObj.send(copyCommand);
                const attachmentsUrl = getR2PublicUrl(destinationKey);
                return attachmentsUrl;
            } else {
                const videoAttachment = [];
                let keyValue = new URL(url);
                var m3u8Key = keyValue.pathname.split("/").slice(2); // Remove bucket name
                const endPoint = m3u8Key.pop();
                var resolveURL = "";
                m3u8Key = m3u8Key.join("/");
                const destination_m3u8Key = folder + "/" + m3u8Key.split("/").splice(1).join("/");
                m3u8Key = m3u8Key + "/";

                const listCommand = new ListObjectsCommand({
                    Bucket: environment.r2.bucketName,
                    Prefix: m3u8Key,
                });

                const listObjectsResponse = await r2ClientObj.send(listCommand);
                const folderContentInfo = listObjectsResponse.Contents || [];

                await Promise.all(
                    folderContentInfo.map(async (fileInfo) => {
                        const copyCommand = new CopyObjectCommand({
                            Bucket: environment.r2.bucketName,
                            CopySource: `${environment.r2.bucketName}/${fileInfo.Key}`,
                            Key: `${destination_m3u8Key}/${fileInfo.Key.replace(m3u8Key, "")}`,
                        });

                        const copyData = await r2ClientObj.send(copyCommand);
                        const attachmentsUrl = getR2PublicUrl(`${destination_m3u8Key}/${fileInfo.Key.split("/").splice(-1)}`);

                        if (path.extname(attachmentsUrl) == ".m3u8") {
                            return attachmentsUrl;
                        }
                    })
                );
            }
        } catch (error) {
            console.log(error?.message);
            throw error;
        }
    },

    getPrivateFiles: async (key) => {
        try {
            let keyValue = new URL(key);
            const keyPath = keyValue.pathname.split("/").slice(2).join("/"); // Remove bucket name

            const command = new GetObjectCommand({
                Bucket: environment.r2.bucketName,
                Key: keyPath,
            });

            const url = await getSignedUrl(r2ClientObj, command, { expiresIn: 5000 });
            return url;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    getFiles: async (key, bucketname) => {
        try {
            const bucket = bucketname || environment.r2.bucketName;
            const command = new GetObjectCommand({
                Bucket: bucket,
                Key: key,
            });

            const url = await getSignedUrl(r2ClientObj, command, { expiresIn: 60 });
            console.log("this is url ==> ", url);
            return url;
        } catch (error) {
            throw error;
        }
    },

    streamFile: async (r2Url) => {
        try {
            function extractR2KeyFromUrl(r2Url) {
                const url = new URL(r2Url);
                return decodeURIComponent(url.pathname.split("/").slice(2).join("/")); // Remove bucket name
            }
            const Key = extractR2KeyFromUrl(r2Url);

            const command = new GetObjectCommand({ 
                Bucket: environment.r2.bucketName, 
                Key 
            });
            const r2Response = await r2ClientObj.send(command);
            console.log("r2Response===>", r2Response);
            return r2Response;
        } catch (error) {
            console.error("Failed to stream file from R2:", error);
            throw error;
        }
    }
}

module.exports = r2;

