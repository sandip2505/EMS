const nodemailer = require('nodemailer');
var ejs = require('ejs');


const sendUserEmail = async (email, name, id) => {
    try {
        // let Email = await user.findOne({personal_email:req.body.personal_email});
        console.log("aman", email)

        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            domain: 'gmail.com',
            service: "gmail",
            port: 587,
            // secure: true,
            auth: {
                user: "codecrew.aman@gmail.com",
                pass: "gwndwmzqemkmjugk",
            },
        });

        // fs.readFile('aman.html',function (err, data ) {

        //     const html5= data.toString()
        //     console.log("aman",html5)
        ejs.renderFile('D:/projects/EMS/src/views/partials/email.ejs', { name: name, id: id }, (err, data) => {
            if (err) {
                console.log(err);
            } else {

                transporter.sendMail({
                    from: "codecrew.aman@gmail.com",
                    to: email,
                    subject: "activate  your account",
                    text: "text hiiiii",
                    html: data

                }),
                    console.log("email sent sucessfully");
            }
        });
        // })
    } catch (error) {
        console.log(error, "email not sent");
    }
};

module.exports = sendUserEmail;

