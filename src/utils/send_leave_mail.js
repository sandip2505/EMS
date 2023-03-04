const nodemailer = require("nodemailer");
const user = require("../model/user");
var ejs = require("ejs");
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const sendleaveEmail = async (
  username,
  datefrom,
  dateto,
  reason,
  reportingUsername,
  email,
  link
) => {
  try {
    // const transporter = nodemailer.createTransport({
    //     host: "smtp.gmail.com",
    //     domain: 'gmail.com',
    //     service: "gmail",
    //     port: 587,
    //     // secure: true,
    //     auth: {
    //         user: "codecrew.aman@gmail.com",
    //         pass: "gwndwmzqemkmjugk",
    //     },
    // });

    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
         domain: process.env.EMAIL_DOMAIN,
        //  service: "gmail",
        port: 465,
        // secure: true,  
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

    ejs.renderFile(
      "src/views/partials/leaveEmail.ejs",
      {
        username: username,
        datefrom: datefrom,
        dateto: dateto,
        reason: reason,
        reportingUsername: reportingUsername,
        emaillink: link,
      },
      (err, data) => {
        if (err) {
          console.log(err);
        } else {
          transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Leave Request",
            text: "text hiiiii",
            html: data,
          }),
            console.log("email sent sucessfully");
        }
      }
    );
    // })
  } catch (error) {
    console.log(error, "email not sent");
  }
};

module.exports = sendleaveEmail;
