const nodemailer = require("nodemailer");
const user = require("../model/user")
var ejs = require('ejs');
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const sendEmail = async (email, name, id, link) => {
    try {
        console.log(link)
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            domain: 'gmail.com',
            service: "gmail",
            port: 587,
            // secure: true,
            auth: {
                user: "codecrew.aman@gmail.com",
                pass: "gwndwmzqemkmjugk",
            },
        });


        ejs.renderFile('D:/projects/EMS/src/views/partials/emailforget.ejs', { name: name, id: id, emaillink: link }, (err, data) => {
            if (err) {
                console.log(err);
            } else {

                transporter.sendMail({
                    from: "codecrew.aman@gmail.com",
                    to: email,
                    subject: "Reset Password",
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

module.exports = sendEmail;