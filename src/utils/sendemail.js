const nodemailer = require("nodemailer");
var ejs = require("ejs");
const { response } = require("express");
const sendUserEmail = async (email, id, name, firstname) => {
  try {

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
    
    
    // const transporter = nodemailer.createTransport({
    //   host: "codecrewinfotech.com",
    //   domain: 'gmail.com',
    //   service: "gmail",
    //   port: 587,
    //   // secure: true,
    //   auth: {
    //       user: "aman.shah@codecrewinfotech.com",
    //       pass: "aNLn?O]}{&ve",
    //   },
  // });

    ejs.renderFile(
      "src/views/partials/email.ejs",
      { name: name, id: id, firstname: firstname },
      (err, data) => {
        if (err) {
          console.log(err);
        } else {
          transporter.sendMail({
            from:process.env.EMAIL_USER,
            to: email,
            subject: "activate  your account",
            text: "codecerw",
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

module.exports = sendUserEmail;
