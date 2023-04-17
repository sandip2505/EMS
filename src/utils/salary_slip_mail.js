const nodemailer = require("nodemailer");
var ejs = require("ejs");
const { response } = require("express");
const sendsalarySlipEmail = async (email,buffer) => {
  try {

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
       domain: process.env.EMAIL_DOMAIN,
      //  service: "gmail",
      port: 465,
      // secure: true,  
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    let message = {
      from: "no-reply@codecrewinfotech.com", 
      to: email,
      subject: 'Your Salary Slip',
      text: 'Please find your salary slip attached as a PDF file.',
      attachments: [
        {
          filename: 'salary_slip.pdf',
          content: buffer
        }
      ]
    };
    try {
      await transporter.sendMail(message);
      console.log('Email sent successfully');
      // res.status(200).send('Salary slip sent to user email address.');
    } catch (error) {
      console.error(error);
      // res.status(500).send('Error sending email');
    }
    // })
  } catch (error) {
    console.log(error, "email not sent");
  }
};

module.exports = sendsalarySlipEmail;
