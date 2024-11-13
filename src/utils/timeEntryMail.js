const nodemailer = require("nodemailer");
const ejs = require("ejs");

const sendUserEmail = async (firstname, email, date, timeEntryLink) => {
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
        "src/views/partials/TimeEtrymail.ejs",
        { firstname, date, timeEntryLink },
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
      from: "no-reply@codecrewinfotech.com",
      to: email,
      subject: "Time entry pending",
      text: "You have a pending time entry to complete.",
      html: templateData,
    };

    // Send the email
    await transporter.sendMail(emailOptions);
    console.log(`Time entry pending email successfully sent to ${email}`);

  } catch (error) {
    console.error("Error sending time entry pending email:", error.message);
    // Optionally, you can log this error to a monitoring system or alert service
  }
};

module.exports = sendUserEmail;
