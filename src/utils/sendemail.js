const nodemailer = require("nodemailer");
var ejs = require("ejs");
const sendUserEmail = async (email, id, name, firstname) => {
  try {
    console.log()
    const transporter = nodemailer.createTransport({
      host: "mail.codecrewinfotech.com",
      domain: "codecrewinfotech.com",
      // service: "gmail",
      port: 465,
      secure: true,
      auth: {
        user: "aman.shah@codecrewinfotech.com",
        pass: "aNLn?O]}{&ve",
      },
    });

    ejs.renderFile(
      "src/views/partials/email.ejs",
      { name: name, id: id, firstname: firstname },
      (err, data) => {
        if (err) {
          console.log(err);
        } else {
          transporter.sendMail({
            from: "codecrew.aman@gmail.com",
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
