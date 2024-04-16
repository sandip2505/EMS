const nodemailer = require("nodemailer");
var ejs = require("ejs");
const { response } = require("express");
const sendUserEmail = async (firstname , email , date ,timeEntryLink) => {
  try {
    console.log("hhahashhhashashuas23",email,date,firstname,timeEntryLink)
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
      "src/views/partials/TimeEtrymail.ejs",
      { firstname: firstname, date:date , timeEntryLink:timeEntryLink },
      (err, data) => {
        if (err) {
          //console.log(err);
        } else {
          transporter.sendMail({
            from:"no-reply@codecrewinfotech.com",
            to: 'aman.shah@codecrewinfotech.com',
            subject: "Time entry pending",
            text: "codecerw",
            html: data,
          })
            console.log("email sent sucessfully");
        }
      }
    );
    // })
  } catch (error) {
    //console.log(error, "email not sent");
  }
};

module.exports = sendUserEmail;
