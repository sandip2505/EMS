const nodemailer = require('nodemailer');
const useractive = require('../API/controller/projects_api');
const user = require('../model/user');
// console.log("sandip ganava", useractive.useradd);

// const test = async (asyncFunc) => {
//     return await asyncFunc()
// }


// const test = useractive.useradd = async (req, res) => {
//     try {

//         const addUser = new user({
//             role_id: req.body.role_id,
//             emp_code: req.body.emp_code,
//             reporting_user_id: req.body.reporting_user_id,
//             firstname: req.body.firstname,
//             user_name: req.body.user_name,
//             middle_name: req.body.middle_name,
//             password: req.body.password,
//             last_name: req.body.last_name,
//             gender: req.body.gender,
//             dob: req.body.dob,
//             doj: req.body.doj,
//             personal_email: req.body.personal_email,
//             company_email: req.body.company_email,
//             mo_number: req.body.mo_number,
//             pan_number: req.body.pan_number,
//             aadhar_number: req.body.aadhar_number,
//             add_1: req.body.add_1,
//             add_2: req.body.add_2,
//             city: req.body.city,
//             state: req.body.state,
//             country: req.body.country,
//             pincode: req.body.pincode,
//             photo: req.body.photo,
//             bank_account_no: req.body.bank_account_no,
//             bank_name: req.body.bank_name,
//             ifsc_code: req.body.ifsc_code,
//         })
//         console.log(addUser._id);
//         const id = addUser._id

//         const email = req.body.personal_email
//         const name = req.body.user_name
//         const mailConfigurations = {
//             from: 'codecrew04@gmail.com',
//             to: email,
//             subject: 'active your account',
//             text: 'Hi!  ' + name + ' There, You know I am using the NodeJS '
//                 + 'Code along with NodeMailer to send this email.',
//             html: '<form action="`http://localhost:46000/activeuser/`' + id + '" method="post"><button >active</button> </form>',

//         };

//         transporter.sendMail(mailConfigurations, function (error, info) {
//             if (error) {
//                 console.log(error);
//                 return;
//             }
//             console.log('Email Sent Successfully');
//             console.log("send:", info);
//         });


//         const Useradd = await addUser.save();
//         // console.log(Useradd);
//         res.json("created done")
//     } catch (e) {
//         res.json("invalid")
//         // res.status(400).send(e);
//     }
// }

// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: 'codecrew04@gmail.com',
//         pass: 'iuuwqfiufmyvzmkk',
//     }
// });

// const mailConfigurations = {
//     from: 'codecrew04@gmail.com',
//     to: 'codecrew.aman@gmail.com',
//     subject: 'active your account',
//     text: 'Hi! There, You know I am using the NodeJS '
//         + 'Code along with NodeMailer to send this email.'
// };

// transporter.sendMail(mailConfigurations, function (error, info) {
//     if (error) {
//         console.log(error);
//         return;
//     }
//     console.log('Email Sent Successfully');
//     console.log("send:", info);
// });

