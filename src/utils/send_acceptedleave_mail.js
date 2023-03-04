const nodemailer = require("nodemailer");
const user = require("../model/user")
var ejs = require('ejs');
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const sendleaveEmail = async (username, datefrom,dateto, reason,leaveStatus, reportingUsername, email, link) => {
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
            host: "mail.codecrewinfotech.com",
             domain: "codecrewinfotech.com",
            //  service: "gmail",
            port: 465,
            // secure: true,  
            auth: {
              user: "aman.shah@codecrewinfotech.com",
              pass: "aNLn?O]}{&ve",
            },
          });
          


        ejs.renderFile('src/views/partials/leaveEmail.ejs', { username: username, datefrom:datefrom,dateto:dateto,reason:reason,leaveStatus:leaveStatus, reportingUsername:reportingUsername,emaillink: link }, (err, data) => {
            if (err) {
                console.log(err);
            } else {

                transporter.sendMail({
                    from: "codecrew.aman@gmail.com",
                    to: email,
                    subject: "Leave Request",
                    text: "text hiiiii",
                    html: data

                }),
                    console.log("email sent sucessfully");
            }
        });
        // })
    } catch (error) {
        console.log(error, "email not sent");
    }
};

module.exports = sendleaveEmail;