const nodemailer = require("nodemailer");
const user= require("../model/user")
var fs = require('fs');

const sendEmail = async (email,id, text) => {
    try {
        // let Email = await user.findOne({personal_email:req.body.personal_email});
        console.log("aman",email)

        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            domain: 'gmail.com',
            service: "gmail",
            port: 587,
            // secure: true,
            auth: {
                user:"codecrew.aman@gmail.com",
                pass: "gwndwmzqemkmjugk",
            },
        });

        // fs.readFile('aman.html',function (err, data ) {
            
        //     const html5= data.toString()
        //     console.log("aman",html5)

         transporter.sendMail({
            from:"codecrew.aman@gmail.com" ,
            to: email ,
            subject: "Reset Password",
            text: "text hiiiii",
            html:'<form action="`http://localhost:46000/change_pwd/`'+ id + '" method="post"> <h1>Change Password</h1><br><input type="password" name ="password"placeholder= "enter New Password"> <button>Change Password </buttton> </form>'
    
            
        }),
        console.log("email sent sucessfully");
    // })
    } catch (error) {
        console.log(error, "email not sent");
    }
};

module.exports = sendEmail;