const nodemailer = require("nodemailer");
const ejs = require("ejs");

const sendUserEmail = async (email, id, name, firstname) => {
  try {
    // Create the transporter object for sending emails
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      domain: process.env.EMAIL_DOMAIN,
      port: 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Render the email template using EJS
    const templateData = await new Promise((resolve, reject) => {
      ejs.renderFile(
        "src/views/partials/email.ejs",
        { name, id, firstname },
        (err, data) => {
          if (err) {
            reject(new Error(`Error rendering email template: ${err.message}`));
          } else {
            resolve(data);
          }
        }
      );
    });

    // Email options
    const emailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Activate your account",
      text: "Please activate your account",  // Fallback text content
      html: templateData,
    };

    // Send the email
    await transporter.sendMail(emailOptions);
    console.log(`Activation email successfully sent to ${email}`);

  } catch (error) {
    console.error("Error sending user activation email:", error.message);
    // Optionally, you can return a response or log the error to a monitoring service
  }
};

module.exports = sendUserEmail;
