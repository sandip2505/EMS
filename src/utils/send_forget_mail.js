const nodemailer = require("nodemailer");
const ejs = require("ejs");

const sendEmail = async (email, name, id, link, token) => {
  try {
    // Check if necessary parameters are provided
    if (!email || !name || !id || !link || !token) {
      throw new Error("Missing required parameters for sending email.");
    }

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
        'src/views/partials/emailforget.ejs',
        { name, id, emaillink: link, token },
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
      subject: "Reset Password",
      text: "Reset your password using the link provided.", // Fallback text content
      html: templateData,
    };

    // Send the email
    await transporter.sendMail(emailOptions);
    console.log(`Password reset email successfully sent to ${email}`);

  } catch (error) {
    console.error("Error sending password reset email:", error.message);
    // Optionally, you can log the error to a monitoring system or send alerts
  }
};

module.exports = sendEmail;
