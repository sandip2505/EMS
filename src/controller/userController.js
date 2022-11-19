const express = require("express");
const session = require("express-session");
let auth = require("../middleware/auth");
const user = require("../model/user");
const roles = require("../model/roles");
const city = require("../model/country");
const country = require("../model/city");
const state = require("../model/state");
const project = require("../model/createProject");
const task = require("../model/createTask");
const holiday = require("../model/holiday");
const axios = require('axios');

const leaves = require("../model/leaves");
const jwt = require("jsonwebtoken");
let cookieParser = require('cookie-parser');
const router = new express.Router();
const app = express();
const FileStore = require('session-file-store')(session);
router.use(cookieParser())
const fileStoreOptions = {};
const sendEmail = require("../utils/send_mail")
const crypto = require("crypto");
const { db } = require("../db/conn");
// const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");
const algorithm = "aes-256-cbc"; 

// generate 16 bytes of random data
const initVector = crypto.randomBytes(16);

// protected data
const message = "This is a secret message";

// secret key generate 32 bytes of random data
const Securitykey = crypto.randomBytes(32);

// the cipher function
const cipher = crypto.createCipheriv(algorithm, Securitykey, initVector);

const decipher = crypto.createDecipheriv(algorithm, Securitykey, initVector);

var options = {
    secret: 'bajhsgdsaj cat',
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
};
router.use(session(options));



const userController = {}


userController.employeelogin = async (req, res) => {
    // axios.post("http://localhost:46000/login/", {
    //     personal_email: req.body.personal_email,
    //     password: req.body.password
    // }
    // ).then(function (response) {
    //     // console.log("sess", response.data.sess.userData);
    //     res.redirect("/index")
    // })
    //     .catch(function (response) {
    //         console.log(response);
    //     });

    try {
        const _id = req.params.id
        const personal_email = req.body.personal_email;
        const password = req.body.password;
        const users = await user.findOne({ personal_email: personal_email });

        // console.log(users);
        if (!users) {
            req.flash("success", "email not found")
            res.redirect('/')
        } else {
            const userData = await user.aggregate([
                { $match: { deleted_at: "null" } },
                { $match: { personal_email: personal_email } },
                {

                    $lookup:
                    {
                        from: "roles",
                        localField: "role_id",
                        foreignField: "_id",
                        as: "test"
                    }
                }
            ]);

            const isMatch = await bcrypt.compare(password, userData[0].password);
            // console.log(isMatch)    

            const genrate_token = await users.genrateToken();
            //   console.log (res.cookie("jwt",genrate_token, { maxAge: 1000 * 60 * 60 * 24 , httpOnly: true }));

            res.cookie("jwt", genrate_token, { maxAge: 1000 * 60 * 60 * 24, httpOnly: true });

            if (isMatch) {
                sess = req.session;
                sess.email = req.body.personal_email;
                sess.userData = userData[0];
                sess.username = userData[0].user_name;
                res.redirect("/index")
            }
            else {
                req.flash("success", "incorrect Password")
                res.redirect('/')
            }
        }

    } catch {
        req.flash('success', ` something went wrong`)
        res.redirect('/')

    }


};

userController.logoutuser = (req, res) => {
    axios({
        method: "get",
        url: "http://localhost:46000/logout/",
    })
        .then(function (response) {
            sess = req.session;
            res.redirect('/')
        })
        .catch(function (response) {
        });

    // req.session.destroy((err) => {
    //     if (err) {
    //         return console.log(err);
    //     }
    //     res.clearCookie(options.name);
    //     res.redirect('/');
    // });
};


userController.addUser = async (req, res) => {
    // axios({
    //     method: "get",
    //     url: "http://localhost:46000/useradd/",
    // })


    //     .then(function (response) {
    //         console.log("userdata", response.data.success);
    //         // sess = req.session;
    //         res.render("addUser", {
    //             userdata: response.data.userdata, success: response.data.success, citydata: response.data.citydata, countrydata: response.data.countrydata, statedata: response.data.statedata, username: sess.username, users: sess.userData,
    //         });
    //     })
    //     .catch(function (response) {
    //         console.log(response);
    //     });


    sess = req.session;
    const blogs = await roles.find();
    const cities = await city.find();
    const countries = await country.find();
    const states = await state.find();
    const users = await user.find();
    // console.log(states);
    res.render("addUser", { success: req.flash('success'), data: blogs, countrydata: countries, citydata: cities, statedata: states, userdata: users, name: sess.name, username: sess.username, users: sess.userData, role: sess.role, layout: false });

}
userController.createuser = async (req, res) => {

    axios.post("http://localhost:46000/useradd/", {
        role_id: req.body.role_id,
        emp_code: req.body.emp_code,
        reporting_user_id: req.body.reporting_user_id,
        firstname: req.body.firstname,
        user_name: req.body.user_name,
        middle_name: req.body.middle_name,
        password: req.body.password,
        last_name: req.body.last_name,
        gender: req.body.gender,
        dob: req.body.dob,
        doj: req.body.doj,
        personal_email: req.body.personal_email,
        company_email: req.body.company_email,
        mo_number: req.body.mo_number,
        pan_number: req.body.pan_number,
        aadhar_number: req.body.aadhar_number,
        add_1: req.body.add_1,
        add_2: req.body.add_2,
        city: req.body.city,
        state: req.body.state,
        country: req.body.country,
        pincode: req.body.pincode,
        photo: img,
        status: req.body.status,
        bank_account_no: req.body.bank_account_no,
        bank_name: req.body.bank_name,
        ifsc_code: req.body.ifsc_code,
    }
    ).then(function (response) {
        res.redirect("/userListing")
    })
        .catch(function (response) {
            console.log(response);
        });

    // try {
    //     const image = req.files.photo
    //     const img = image['name']

    //     const addUser = new user({
    //         role_id: req.body.role_id,
    //         emp_code: req.body.emp_code,
    //         reporting_user_id: req.body.reporting_user_id,
    //         firstname: req.body.firstname,
    //         user_name: req.body.user_name,
    //         middle_name: req.body.middle_name,
    //         password: req.body.password,
    //         last_name: req.body.last_name,
    //         gender: req.body.gender,
    //         dob: req.body.dob,
    //         doj: req.body.doj,
    //         personal_email: req.body.personal_email,
    //         company_email: req.body.company_email,
    //         mo_number: req.body.mo_number,
    //         pan_number: req.body.pan_number,
    //         aadhar_number: req.body.aadhar_number,
    //         add_1: req.body.add_1,
    //         add_2: req.body.add_2,
    //         city: req.body.city,
    //         state: req.body.state,
    //         country: req.body.country,
    //         pincode: req.body.pincode,
    //         photo: img,
    //         status: req.body.status,
    //         bank_account_no: req.body.bank_account_no,
    //         bank_name: req.body.bank_name,
    //         ifsc_code: req.body.ifsc_code,
    //     })
    //     var file = req.files.photo;
    //     // console.log(file);
    //     file.mv('public/images/' + file.name);

    //     const genrate_token = await addUser.genrateToken();

    //     res.cookie("jwt", genrate_token, {
    //         expires: { maxAge: 1000 * 60 * 60 * 24 },
    //         httpOnly: true
    //     })

    //     console.log(addUser)


    //     // addUser.accessToken = accessToken;
    //     const Useradd = await addUser.save();

    //     var file = req.files.photo;
    //     // console.log(file);
    //     file.mv('public/images/' + file.name);
    //     res.status(201).redirect("/userListing");
    // } catch (e) {
    //     res.status(400).send(e);
    // }
}
userController.list = async (req, res) => {
    axios({
        method: "get",
        url: "http://localhost:46000/listuser/",
    })


        .then(function (response) {
            sess = req.session;
            res.render("userListing", {
                data: response.data.userData, username: sess.username, users: sess.userData,
            });
        })
        .catch(function (response) {
            console.log(response);
        });

    // sess = req.session;
    // try {
    //     const userData = await user.aggregate([
    //         { $match: { deleted_at: "null" } },
    //         {

    //             $lookup:
    //             {
    //                 from: "roles",
    //                 localField: "role_id",
    //                 foreignField: "_id",
    //                 as: "test"
    //             }
    //         }
    //     ]);
    //     res.render('userListing', {
    //         data: userData, name: sess.name, username: sess.username, users: sess.userData, role: sess.role, layout: false
    //     });

    // } catch (err) {
    //     res.status(500).json({ error: err.message });
    // }

};
userController.userDetail = async (req, res) => {
    const _id = req.params.id;
    axios({
        method: "get",
        url: "http://localhost:46000/details/" + _id,
    })
        .then(function (response) {
            sess = req.session;
            res.render("viewUserDetail", {
                data: response.data.data, username: sess.username, users: sess.userData,
            });
        })
        .catch(function (response) {
        });

};
userController.profile = async (req, res) => {

    // const _id = req.params.id;
    // axios({
    //     method: "get",
    //     url: "http://localhost:46000/emloyeeprofile/" + _id,
    // })
    //     .then(function (response) {
    //         console.log("profile", response);
    //         sess = req.session;
    //         res.render("viewUserDetail", {
    //             data: response.data.data, username: sess.username, users: sess.userData,
    //         });
    //     })
    //     .catch(function (response) {
    //     });



    sess = req.session;
    const _id = req.params.id;
    try {
        const userData = await user.findById(_id);
        console.log("pro", userData);

        res.render('profile', {
            userData: userData, data: req.user,
            username: sess.username, users: sess.userData, role: sess.role, layout: false
        });
        // res.json({ data: blogs, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

};
userController.updateUserprofile = async (req, res) => {
    try {
        const _id = req.params.id;
        const updateuser = {
            firstname: req.body.firstname,
            middle_name: req.body.middle_name,
            last_name: req.body.last_name,
            gender: req.body.gender,
            dob: req.body.dob,
            doj: req.body.doj,
            personal_email: req.body.personal_email,
            mo_number: req.body.mo_number,
            pan_number: req.body.pan_number,
            aadhar_number: req.body.aadhar_number,
            add_1: req.body.add_1,
            add_2: req.body.add_2,
            city: req.body.city,
            state: req.body.state,
            country: req.body.country,
            pincode: req.body.pincode,
            updated_at: Date(),
        }
        const updateUser = await user.findByIdAndUpdate(_id, updateuser);
        const id = sess.userData._id
        // console.log(id);

        res.redirect(`/profile/${id}`);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

}
userController.updateUserphoto = async (req, res) => {
    sess = req.session;
    try {
        const _id = req.params.id;
        const userData = await user.findById(_id);
        const image = req.files.photo
        const img = image['name']
        console.log(img);
        const addUser = {
            photo: img,
        }

        var file = req.files.photo;
        file.mv('public/images/' + file.name);
        const updateUser = await user.findByIdAndUpdate(_id, addUser);
        const id = sess.userData._id
        res.redirect(`/profile/${id}`);



    } catch (err) {
        res.status(500).json({ error: err.message });
    }

}

userController.editUser = async (req, res) => {
    sess = req.session;
    const _id = req.params.id;
    try {
        const blogs = await roles.find();
        const userData = await user.findById(_id);

        const users = await user.find();
        // console.log(userData)
        const cities = await city.find();
        const countries = await country.find();
        const states = await state.find();

        res.render('editUser', {
            data: userData, roles: blogs, reportingData: users, countrydata: countries, citydata: cities, statedata: states, name: sess.name, users: sess.userData, username: sess.username, role: sess.role, layout: false


        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

};
userController.updateUser = async (req, res) => {
    try {
        const _id = req.params.id;
        const image = req.files.photo;
        const img = image['name']
        const updateuser = {
            role_id: req.body.role_id,
            emp_code: req.body.emp_code,
            reporting_user_id: req.body.reporting_user_id,
            firstname: req.body.firstname,
            user_name: req.body.user_name,
            middle_name: req.body.middle_name,
            password: req.body.password,
            last_name: req.body.last_name,
            gender: req.body.gender,
            dob: req.body.dob,
            doj: req.body.doj,
            personal_email: req.body.personal_email,
            company_email: req.body.company_email,
            mo_number: req.body.mo_number,
            pan_number: req.body.pan_number,
            aadhar_number: req.body.aadhar_number,
            add_1: req.body.add_1,
            add_2: req.body.add_2,
            city: req.body.city,
            state: req.body.state,
            country: req.body.country,
            pincode: req.body.pincode,
            photo: img,
            status: req.body.status,
            bank_account_no: req.body.bank_account_no,
            bank_name: req.body.bank_name,
            ifsc_code: req.body.ifsc_code,
            updated_at: Date(),
        }

        if (req.files) {
            var file = req.files.photo;
            file.mv('public/images/' + file.name);
            const updateUser = await user.findByIdAndUpdate(_id, updateuser);
            res.redirect("/userListing");
        } else {
            var file = req.files.old_image;
        }
        // res.json({ data: blogs, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

}

userController.deleteUser = async (req, res) => {

    const _id = req.params.id;
    const deleteUser = {
        deleted_at: Date(),
    }
    await user.findByIdAndUpdate(_id, deleteUser);
    res.redirect("/userListing");
}
userController.totalcount = async (req, res) => {
    // console.log("user",req.user)
    sess = req.session;
    try {
        const userData = await user.find({ deleted_at: "null" })
        const pending = await user.find({ status: "Pending Employee", deleted_at: "null" })
        const active = await user.find({ status: "Active Employee", deleted_at: "null" })
        const InActive = await user.find({ status: "InActive Employee", deleted_at: "null" })
        const projectData = await project.find({ deleted_at: "null" })
        const projecthold = await project.find({ status: "on Hold", deleted_at: "null" })
        const projectinprogress = await project.find({ status: "in Progress", deleted_at: "null" })
        const projectcompleted = await project.find({ status: "Completed", deleted_at: "null" })
        const taskData = await task.find({ deleted_at: "null" })
        const leavesData = await leaves.find({ status: "PENDING", deleted_at: "null" })

        const dataholiday = await holiday.find({ deleted_at: "null" })


        res.render('index', {
            data: req.user, pending: pending, active: active, InActive: InActive, projectData: projectData, projecthold: projecthold, projectinprogress: projectinprogress, projectcompleted: projectcompleted, taskData: taskData, leavesData: leavesData, name: sess.name, username: sess.username, dataholiday: dataholiday, users: sess.userData, role: sess.role
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

};
userController.checkEmail = async (req, res) => {
    const Email = req.body.UserEmail
    const emailExists = await user.findOne({ personal_email: Email });
    return res.status(200).json({ emailExists });

}

userController.forget = async (req, res) => {
    sess = req.session
    res.render('forget', { success: req.flash('success'), username: sess.username })
    // res.render('forget')
}

userController.sendforget = async (req, res) => {
    try {

        const Email = req.body.personal_email
        const emailExists = await user.findOne({ personal_email: Email });
        const aman = emailExists._id.toString()
        console.log(aman)

        const encryptedData = await bcrypt.hash(aman, 10);
//  const sandip =  crypto(aman); 

//  let encryptedData = cipher.update(aman, "utf-8", "hex");

// encryptedData += cipher.final("hex");

// console.log("Encrypted message: " + encryptedData);
//  console.log("lgh",sandip)
// const passswords = await bcrypt.hash(password, 10);
// console.log(id)

        if (emailExists) {
            await sendEmail(emailExists.personal_email,encryptedData, "Password reset");
            // res.send("password reset link sent to your email account");
            req.flash('done', `Email Sent Successfully`);
            res.render('login', { "send": req.flash("send"), "done": req.flash("done"),"success": req.flash("seccess") })
        } else {
            req.flash('success', `User Not found`);
            res.redirect('/forget');
            
        }
    }
    catch {
        res.send("noooo")
    }

}

userController.getchange_pwd = async (req, res) => {
    res.render('forget_change_pwd', { success: req.flash('success') })
    // res.render('forget')
    // res.render('login', { success: req.flash('success'), username: sess.username })
}



userController.change = async (req, res) => {
    const _id = req.params.id
    console.log(_id)
    let decryptedData = decipher.update(_id, "hex", "utf-8");

decryptedData += decipher.final("utf8");

console.log("Decrypted message: " + decryptedData);
    const password = req.body.password
    const cpassword = req.body.cpassword
    if (!(password == cpassword)) {
        req.flash('success', `Password and confirm password does not match`);
        res.redirect(`/change_pwd/${_id}`);
    }else{
    const passswords = await bcrypt.hash(password, 10);

    console.log("pwd", passswords)

    const updatepassword = {
        password: passswords
    }
    const updateUser = await user.findByIdAndUpdate(decryptedData, updatepassword);
    // console.log(updateUser.password)
    req.flash('success', `password updated`);
    res.redirect(`/change_pwd/${_id}`);

}
}

userController.login = (req, res) => {
    sess = req.session;
    res.render('login', { "send": req.flash("send"), "done": req.flash("done"),"success": req.flash("seccess") })

};



module.exports = userController;