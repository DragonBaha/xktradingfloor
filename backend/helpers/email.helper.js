// var email_helper = {};
// const sgMail = require("@sendgrid/mail");
// const fs = require("fs");
// const ejs = require("ejs");
// const environment = require("../utils/environment");

// sgMail.setApiKey(environment.sendgrid.apiKey);

// const templates = [
//     {
//         id: "",
//         name: "Welcome Email",
//     },
// ];

// const senders = {
//     primary: environment.sendgrid.senders.primary.email,
//     cls: environment.sendgrid.senders.cls.email,
// };

// email_helper.send = async (template_name, options, data) => {
//     return new Promise((resolve, reject) => {
//         try {
//             const template = templates.find((t) => t.name === template_name);
//             if (template) {
//                 const msg = {
//                     to: options.to,
//                     from: {
//                         email: environment.sendgrid.senderEmail,
//                         name: environment.sendgrid.senderName,
//                     },
//                     subject: options.subject,
//                     templateId: template.id,
//                     dynamicTemplateData: data,
//                     ...(options.attachments ? { attachments: options.attachments } : {}),
//                 };
//                 sgMail[options.multiple ? "sendMultiple" : "send"](msg).then(
//                     () => {
//                         resolve({ status: 1 });
//                     },
//                     (error) => {
//                         console.error(error);

//                         if (error.response) {
//                             console.error(error.response.body);
//                             reject({
//                                 status: 0,
//                                 error: error.response.body,
//                             });
//                         } else {
//                             reject({
//                                 status: 0,
//                                 error,
//                             });
//                         }
//                     }
//                 );
//             } else {
//                 console.log({
//                     status: 0,
//                     error: "SG Email template not found",
//                 });

//                 reject({
//                     status: 0,
//                     error: "SG Email template not found",
//                 });
//             }
//         } catch (err) {
//             console.log("Catch Error: ", { err });
//             reject({
//                 status: 0,
//                 error: err,
//             });
//         }
//     });
// };

// // // ====== Attachment Example: ==========
// // attachments: [
// //     {
// //       content: fs.readFileSync('path/to/your/attachment.pdf').toString('base64'),
// //       filename: 'attachment.pdf',
// //       type: 'application/pdf',
// //       disposition: 'attachment',
// //     },
// //   ],
// // // ====================================

// email_helper.sendHtmlEmail = async (template_path, options, data) => {
//     return new Promise(async (resolve, reject) => {
//         const template = fs.readFileSync(template_path, "utf8");
//         const msg = {
//             to: options.to,
//             from: options?.from ? options.from : senders.primary,
//             subject: options.subject,
//             html: await ejs.render(template, data),
//             ...(options.replyTo ? { replyTo: options.replyTo } : {}),
//             ...(options.attachments ? { attachments: options.attachments } : {}),
//             ...(options.cc ? { cc: options.cc } : {}),
//             ...(options.bcc ? { bcc: options.bcc } : {}),
//         };
//         sgMail[options?.multiple ? "sendMultiple" : "send"](msg).then(
//             () => {
//                 resolve({ status: 1 });
//             },
//             (error) => {
//                 console.error(error);

//                 if (error.response) {
//                     console.error(error.response.body);
//                     reject({
//                         status: 0,
//                         error: error.response.body,
//                     });
//                 } else {
//                     reject({
//                         status: 0,
//                         error,
//                     });
//                 }
//             }
//         );
//     });
// };
// email_helper.templates = templates;
// email_helper.senders = senders;

// module.exports = email_helper;