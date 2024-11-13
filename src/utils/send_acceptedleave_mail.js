const nodemailer = require("nodemailer");
const ejs = require("ejs");

const sendAcceptRejectleaveEmail = async (username, datefrom, dateto, reason, leaveStatus, reportingUsername, email, link) => {
  try {
    // Create the transport object for sending emails
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      domain: process.env.EMAIL_DOMAIN,
      port: 465,
      tls: {
        rejectUnauthorized: false,
      },
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Render the email template using EJS
    const templateData = await new Promise((resolve, reject) => {
      ejs.renderFile(
        'src/views/partials/leaveAcceptRejectEmail.ejs',
        {
          username,
          datefrom,
          dateto,
          reason,
          leaveStatus,
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

    // Send the email
    const emailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Leave Request ${leaveStatus}`,
      text: "Leave request update", // Provide fallback text content
      html: templateData,
    };

    await transporter.sendMail(emailOptions);
    console.log(`Leave request ${leaveStatus} email sent successfully to ${email}`);

  } catch (error) {
    console.error("Error sending leave accept/reject email:", error.message);
    // Optionally, you can send an alert or log the error to a monitoring service here.
  }
};

module.exports = sendAcceptRejectleaveEmail;
