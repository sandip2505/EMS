const express = require("express");
const user = require("../model/user");
const axios = require('axios');
let cookieParser = require('cookie-parser');
const router = new express.Router();
router.use(cookieParser())
const emailtoken = require("../model/token");
const sendEmail = require("../utils/send_forget_mail")
const crypto = require("crypto");
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");
const flash = require('connect-flash')
const options = require('../../app');
const { CLIENT_RENEG_LIMIT } = require("tls");
const { log } = require("console");
// new FileStore({
//     path:  require('path').join(require('os').tmpdir(), 'sessions')
//  })



const userController = {}

userController.login = (req, res) => {
    sess = req.session;
    res.render('login',
        { send: req.flash("send"), done: req.flash("done"), success: req.flash("success") }
    )
};


userController.employeelogin = async (req, res) => {
    try {
        const personal_email = req.body.personal_email;
        const password = req.body.password;
        const users = await user.findOne({ personal_email: personal_email });

        if (!users) {
            req.flash('success', `incorrect Email`)
            // res.redirect('/')
            res.render('login', { send: req.flash("send"), done: req.flash("done"), success: req.flash("success") })
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
            // const token = jwt.sign({ _id: this._id.toString() }, process.env.JWT_SECRET);



            if (isMatch) {
                sess = req.session;
                sess.email = req.body.personal_email;
                sess.userData = userData[0];
                sess.username = userData[0].user_name;

                const token = jwt.sign({ _id: userData[0]._id }, process.env.JWT_SECRET, {
                    expiresIn: "1d"
                });
                users.token = token;
                // console.log(token)


                const man = await user.findByIdAndUpdate(users._id, { token })
                // const genrate_token = await users.genrateToken();
                res.cookie("jwt", token, { maxAge: 1000 * 60 * 60 * 24, httpOnly: true });


                res.redirect("/index")
            }
            else {
                req.flash('success', `incorrect Passsword`)
                res.render('login', { send: req.flash("send"), done: req.flash("done"), success: req.flash("success") })
            }
        }

    } catch {
        req.flash('success', ` something went wrong`)
        res.redirect('/')

    }


};

userController.logoutuser = (req, res) => {
    if (req.session) {
        req.session.destroy(err => {
            if (err) {
                res.status(400).send(err)
            } else {
                res.clearCookie(options.name)
                res.redirect('/')
            }
        })
    }
}


userController.addUser = async (req, res) => {
    axios({
        method: "get",
        url: "http://localhost:46000/getAddUser",
    })
        .then(function (response) {
            sess = req.session;
            var hasPermission = req.user.hasPermission("View Holidays");

            console.log("hasPermission", hasPermission);
            res.render("addUser", { success: req.flash('success'), data: response.data.blogs, countrydata: response.data.countries, citydata: response.data.cities, statedata: response.data.states, userdata: response.data.users, name: sess.name, username: sess.username, users: sess.userData, role: sess.role, layout: false });
            // });
        })
        .catch(function (response) {
            console.log(response);
        });

}
userController.createuser = async (req, res) => {

    if (!req.files) {
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
            status: req.body.status,
            bank_account_no: req.body.bank_account_no,
            bank_name: req.body.bank_name,
            ifsc_code: req.body.ifsc_code,
        }

        ).then(function () {
            res.redirect("/userListing")
        })
            .catch(function (response) {
                console.log(response);
            });

    } else {
        const image = req.files.photo
        const img = image['name']
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

        ).then(function () {
            res.redirect("/userListing")
        })
            .catch(function (response) {
                console.log(response);
            });

    }

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
        .catch(function () {
        });

};
userController.profile = async (req, res) => {

    const _id = req.params.id;
    axios({
        method: "get",
        url: "http://localhost:46000/emloyeeprofile/" + _id,
    })
        .then(function (response) {
            sess = req.session;
            res.render("profile", {
                userData: response.data.userData, username: sess.username, users: sess.userData,
                success: req.flash('success'), images: req.flash('images')
            });
        })
        .catch(function () {
        });


};
userController.updateUserprofile = async (req, res) => {
    const _id = req.params.id;
    axios({
        method: "post",
        url: "http://localhost:46000/updateProfile/" + _id,
        data: {
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
    }).then(function () {
        req.flash('success', 'Your Profile Updated Successfull')
        res.redirect(`/profile/${_id}`);
    })
        .catch(function () {

        });
}
userController.updateUserphoto = async (req, res) => {
    const _id = req.params.id;
    const image = req.files.photo
    const img = image['name']
    axios({
        method: "post",
        url: "http://localhost:46000/updateUserPhoto/" + _id,
        data: {
            photo: img,
        }
    }).then(function () {
        var file = req.files.photo;
        file.mv('public/images/' + file.name);
        req.flash('images', 'Your profile image Updated Successfull')
        res.redirect(`/profile/${_id}`);
    })
        .catch(function () {

        });

}

userController.editUser = async (req, res) => {
    sess = req.session;
    const _id = req.params.id;


    axios({
        method: "get",
        url: "http://localhost:46000/userEdit/" + _id,
    }).then(function (response) {
        // console.log("aman",response)
        sess = req.session;
        res.render('editUser', {
            data: response.data.userData, roles: response.data.blogs, reportingData: response.data.users, countrydata: response.data.countries, citydata: response.data.cities, statedata: response.data.states, name: sess.name, users: sess.userData, username: sess.username, role: sess.role, layout: false
        })
    })
        .catch(function () {
        });


}


userController.updateUser = async (req, res) => {
    const _id = req.params.id;
    axios({
        method: "post",
        url: "http://localhost:46000/userEdit/" + _id,
        data: {
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
    }).then(function () {
        res.redirect("/userListing");
    })
        .catch(function () {

        });

    // const image = req.body.old_image
    // if (!image) {
    //     try {

    //         const _id = req.params.id;
    //         const image = req.files.photo;
    //         const img = image['name']
    //         const updateuser = {
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
    //             photo: img,
    //             status: req.body.status,
    //             bank_account_no: req.body.bank_account_no,
    //             bank_name: req.body.bank_name,
    //             ifsc_code: req.body.ifsc_code,
    //             updated_at: Date(),
    //         }


    //         var file = req.files.photo;
    //         file.mv('public/images/' + file.name);
    //         const updateUser = await user.findByIdAndUpdate(_id, updateuser);
    //         res.redirect("/userListing");

    //         // res.json({ data: blogs, status: "success" });
    //     } catch (err) {
    //         res.status(500).json({ error: err.message });
    //     }
    // } else {
    //     try {
    //         const _id = req.params.id;
    //         const updateuser = {
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
    //             photo: req.body.old_image,
    //             status: req.body.status,
    //             bank_account_no: req.body.bank_account_no,
    //             bank_name: req.body.bank_name,
    //             ifsc_code: req.body.ifsc_code,
    //             updated_at: Date(),
    //         }
    //         const updateUser = await user.findByIdAndUpdate(_id, updateuser);
    //         res.redirect("/userListing");

    //         // res.json({ data: blogs, status: "success" });
    //     } catch (err) {
    //         res.status(500).json({ error: err.message });
    //     }
    // }

}

userController.deleteUser = async (req, res) => {
    const _id = req.params.id;
    axios({
        method: "post",
        url: "http://localhost:46000/Userdelete/" + _id,
    })
        .then(function () {
            res.redirect("/userListing");
        })

        .catch(function () {
        });


}


userController.totalcount = async (req, res) => {

    axios({
        method: "get",
        url: "http://localhost:46000/totalcount/",
    })

        .then(function (response) {
            // console.log("data", response.data.userData);
            sess = req.session;
            res.render('index', {
                data: req.user, pending: response.data.pending, active: response.data.active, InActive: response.data.InActive, userData: response.data.userData, projectData: response.data.projectData, projecthold: response.data.projecthold, projectinprogress: response.data.projectinprogress, projectcompleted: response.data.projectcompleted, taskData: response.data.taskData, leavesData: response.data.leavesData, name: sess.name, username: sess.username, dataholiday: response.data.dataholiday, users: sess.userData, role: sess.role
            });
        })
        .catch(function (response) {
            console.log(response);
        });

};
userController.checkEmail = async (req, res) => {
    const Email = req.body.UserEmail
    const emailExists = await user.findOne({ personal_email: Email });
    return res.status(200).json({ emailExists });

}

userController.forget = async (req, res) => {
    sess = req.session
    res.render('forget', { success: req.flash('success'), username: sess.username })
}

userController.sendforget = async (req, res) => {
    try {
        const Email = req.body.personal_email
        const emailExists = await user.findOne({ personal_email: Email });
        if (emailExists) {
            let token = await emailtoken.findOne({ userId: emailExists._id });
            // console.log("aman", token)
            if (!token) {
                token = await new emailtoken({
                    userId: emailExists._id,
                    token: crypto.randomBytes(32).toString("hex"),
                }).save();
            }
            const link = `${process.env.BASE_URL}/change_pwd/${emailExists._id}/${token.token}`;

            await sendEmail(emailExists.personal_email, emailExists.firstname, emailExists._id, link);
            req.flash('done', `Email Sent Successfully`);
            res.render('login', { send: req.flash("send"), done: req.flash("done"), success: req.flash("seccess") })
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
    // console.log("FLASHHHHHH", req.flash('success'));
    res.render('forget_change_pwd', { success: req.flash('success') })

}

userController.change = async (req, res) => {
    const _id = req.params.id
    const tokenid = req.params.token
    // console.log(_id)
    const password = req.body.password
    const cpassword = req.body.cpassword


    // if (!(password == cpassword)) {
    //     req.flash('success', `Password and confirm password does not match`);
    //     // res.redirect(`/change_pwd/${_id}`);
    //     res.render('forget_change_pwd', { success: req.flash('success') })
    // } else {
    //     const passswords = await bcrypt.hash(password, 10);

    //     // console.log("pwd", passswords)

    //     const updatepassword = {
    //         password: passswords
    //     }
    //     const updateUser = await user.findByIdAndUpdate(_id, updatepassword);
    //     // console.log(updateUser.password)
    //     req.flash('success', `password updated`);
    //     res.redirect(`/change_pwd/${_id}`);


    const users = await user.findById(req.params.id);
    // console.log(users)
    if (!user) return res.status(400).send("invalid link or expired");
    // console.log(_id)
    const token = await emailtoken.findOne({
        userId: users._id,
        token: req.params.token,
    });
    if (!token) return res.status(400).send("Invalid link or expired");

    if (!(password == cpassword)) {
        req.flash('success', `Password and confirm password does not match`);
        // res.redirect(`/change_pwd/${_id}`);
        res.render('forget_change_pwd', { success: req.flash('success') })
    } else {
        const passswords = await bcrypt.hash(password, 10);

        // console.log("pwd", passswords)

        await token.delete();
        req.flash('success', `password updated`);
        res.redirect(`/change_pwd/${_id}/${tokenid}`);
        // const password = req.body.password
        // const cpassword = req.body.cpassword
        //     // console.log(updateUser.password)

    }
}



module.exports = userController;