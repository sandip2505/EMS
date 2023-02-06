const nodemailer = require("nodemailer");
var ejs = require("ejs");
const sendUserEmail = async (email, id, name, firstname) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      domain: "gmail.com",
      service: "gmail",
      port: 587,
      // secure: true,
      auth: {
        user: "codecrew.aman@gmail.com",
        pass: "gwndwmzqemkmjugk",
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
