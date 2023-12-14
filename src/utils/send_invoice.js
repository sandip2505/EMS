const nodemailer = require("nodemailer");
const user = require("../model/user");
const project = require("../model/createProject");
const task = require("../model/createTask");
const invoice = require("../model/invoice");
const companySetting = require("../model/companySetting");
const path = require("path");
const pdf = require("html-pdf");

var ejs = require("ejs");

// const sendEmail = async (email, subject, name, invoice_id, data) => {
//   try {
//     const transporter = nodemailer.createTransport({
//       host: process.env.EMAIL_HOST,
//       domain: process.env.EMAIL_DOMAIN,

//       port: 465,

//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//     });
//     if (data) {
//       const templatePath = path.join(
//         __dirname.split("\\utils")[0],
//         "/views/partials",
//         "invoice.ejs"
//       );
//       console.log(data,"data");
//       const renderedHtml = await ejs.renderFile(templatePath, { data });
//       pdf.create(renderedHtml, {}).toBuffer((err, buffer) => {
//         if (err) {
//           throw err;
//         } else {
//           ejs.renderFile(
//             "src/views/partials/emailinvoice.ejs",
//             { name: name },
//             (err, data) => {
//               if (err) {
//                 console.log(err.message);
//               } else {
//                 const attachments = [
//                   {
//                     filename: `${data.invoice_number}.pdf`,
//                     content: buffer,
//                     encoding: "base64",
//                   },
//                 ];
//                 transporter.sendMail({
//                   from: process.env.EMAIL_USER,
//                   to: email,
//                   subject: subject,
//                   text: "text hiiiii",
//                   html: data,
//                   attachments: attachments,
//                 });
//                 console.log("email sent sucessfully:😂");
//               }
//             }
//           );
//         }
//       });
//     }
//   } catch (error) {
//     console.log(error);
//     throw error;
//   }
// };
const sendEmail = async (email, subject, name, invoice_id, data) => {
  return new Promise((resolve, reject) => {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        domain: process.env.EMAIL_DOMAIN,
        port: 465,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      if (data) {
        const templatePath = path.join(
          __dirname.split("\\utils")[0],
          "/views/partials",
          "invoice.ejs"
        );

        ejs.renderFile(templatePath, { data }, async (err, renderedHtml) => {
          if (err) {
            reject(err);
          } else {
            try {
              const buffer = await new Promise((pdfResolve, pdfReject) => {
                pdf.create(renderedHtml, {}).toBuffer((pdfErr, pdfBuffer) => {
                  if (pdfErr) {
                    pdfReject(pdfErr);
                  } else {
                    pdfResolve(pdfBuffer);
                  }
                });
              });

              ejs.renderFile(
                "src/views/partials/emailinvoice.ejs",
                { name: name },
                (err, emailTemplate) => {
                  if (err) {
                    reject(err);
                  } else {
                    const attachments = [
                      {
                        filename: "invoice.pdf",
                        content: buffer,
                        encoding: "base64",
                      },
                    ];

                    transporter.sendMail({
                      from: process.env.EMAIL_USER,
                      to: email,
                      subject: subject,
                      text: "text hiiiii",
                      html: emailTemplate,
                      attachments: attachments,
                    });
                    resolve("Email send successfully");
                  }
                }
              );
            } catch (pdfError) {
              reject(pdfError);
            }
          }
        });
      }
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
};
module.exports = sendEmail;
