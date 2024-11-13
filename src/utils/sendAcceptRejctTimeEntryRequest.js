const nodemailer = require("nodemailer");
const ejs = require("ejs");

const sendAcceptRejctTimeEntryRequest = async (
  username,
  datefrom,
  dateto,
  requestStatus,
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
        "src/views/partials/sendAcceptRejctTimeEntryRequest.ejs",
        {
          username,
          datefrom,
          dateto,
          requestStatus,
          reportingUsername,
          emaillink: link,
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
      subject: `Time Entry Request ${requestStatus}`,
      text: "Your time entry request status has been updated.",  // Fallback text content
      html: templateData,
    };

    // Send the email
    await transporter.sendMail(emailOptions);
    console.log(`Time Entry Request ${requestStatus} email sent successfully to ${email}`);

  } catch (error) {
    console.error("Error sending Time Entry Request email:", error.message);
    // Optionally, you can log this error to a monitoring system or alert service
  }
};

module.exports = sendAcceptRejctTimeEntryRequest;
