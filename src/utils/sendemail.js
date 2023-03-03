const nodemailer = require("nodemailer");
var ejs = require("ejs");
const sendUserEmail = async (email, id, name, firstname) => {
  try {
    // console.log("email",email)
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
    
  //   const transporter = nodemailer.createTransport({
  //     host: "smtp.gmail.com",
  //     domain: 'gmail.com',
  //     service: "gmail",
  //     port: 587,
  //     // secure: true,
  //     auth: {
  //         user: "codecrew.aman@gmail.com",
  //         pass: "qanywczepbiubdzy",
  //     },
  // });

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
