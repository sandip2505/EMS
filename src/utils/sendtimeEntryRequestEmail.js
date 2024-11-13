const nodemailer = require("nodemailer");
const ejs = require("ejs");

const sendtimeEntryRequestEmail = async (
  username,
  datefrom,
  dateto,
  reportingUsername,
  email,
  link
) => {
  try {
    // Create transporter object for email sending
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
        "src/views/partials/timeEntryRequestEmail.ejs",
        {
          username,
          datefrom,
          dateto,
          reason: "reason",  // You can replace this with the actual reason if necessary
          reportingUsername,
          emaillink: link,
          is_adhoc: "is_adhoc",  // Replace with the correct value
        },
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
      subject: "Time Entry Request",
      text: "Your time entry request is awaiting approval.",  // Fallback text content
      html: templateData,
    };

    // Send the email
    await transporter.sendMail(emailOptions);
    console.log(`Time entry request email successfully sent to ${email}`);

  } catch (error) {
    console.error("Error sending time entry request email:", error.message);
    // Optionally, you can log this error to a monitoring system or alert service
  }
};

module.exports = sendtimeEntryRequestEmail;
