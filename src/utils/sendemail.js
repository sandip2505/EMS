const nodemailer = require("nodemailer");
var ejs = require("ejs");
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const sendUserEmail = async (email, id, name, firstname) => {
  try {
    // let Email = await user.findOne({personal_email:req.body.personal_email});


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
      "D:/projects/EMS1/src/views/partials/email.ejs",
      { name: name, id: id, firstname: firstname },
      (err, data) => {
        if (err) {
          console.log(err);
        } else {
          transporter.sendMail({
            from: "codecrew.aman@gmail.com",
            to: email,
            subject: "activate  your account",
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

module.exports = sendUserEmail;
