const nodemailer = require("nodemailer");
const ejs = require("ejs");

const sendleaveEmail = async (
  username,
  datefrom,
  dateto,
  reason,
  reportingUsername,
  email,
  link,
  is_adhoc
) => {
  try {
    // Create transporter
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
        "src/views/partials/leaveEmail.ejs",
        {
          username,
          datefrom,
          dateto,
          reason,
          reportingUsername,
          emaillink: link,
          is_adhoc,
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

    // Send email
    const emailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: is_adhoc ? 'Ad-Hoc Leave' : 'Leave Request',
      text: "Leave request details",  // Fallback text content
      html: templateData,
    };

    // Send the email and handle response
    await transporter.sendMail(emailOptions);
    console.log("Email sent successfully to", email);

  } catch (error) {
    console.error("Error sending leave email:", error.message);
    // Optionally, you can send an alert or log the error to a monitoring service here.
  }
};

module.exports = sendleaveEmail;
