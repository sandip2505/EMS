const express = require("express");
const user = require("../model/user");
const axios = require("axios");
let cookieParser = require("cookie-parser");
const router = new express.Router();
router.use(cookieParser());
const emailtoken = require("../model/token");
const sendEmail = require("../utils/send_forget_mail");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const flash = require("connect-flash");
const options = require("../API/router/users_api");
const { CLIENT_RENEG_LIMIT } = require("tls");
const { log } = require("console");
var helpers = require("../helpers");
const { response } = require("express");

const userController = {};

userController.login = (req, res) => {
    sess = req.session;
    res.render("login", {
        send: req.flash("send"),
        done: req.flash("done"),
        success: req.flash("success"),
    });
};

userController.employeelogin = async (req, res) => {

    try {
        const token = req.cookies.jwt;
        const Logindata = {
            personal_email: req.body.personal_email,
            password: req.body.password,
        };
        helpers
            .axiosdata("post", "/api/", token, Logindata)
            .then(function (response) {
                console.log("response",response.data.userData[0]);
                if (response.data.emailError== "invalid Email") {
                    req.flash("success", `incorrect Email`);
                    res.render("login", {
                        send: req.flash("send"),
                        done: req.flash("done"),
                        success: req.flash("success"),
                    });
                } else if (response.data.login_status == "login success") {
                    sess = req.session;
                    sess.userData = response.data.userData[0];
                    res.cookie("jwt", response.data.token, {
                        maxAge: 1000 * 60 * 60 * 24,
                        httpOnly: true,
                    });
                    res.redirect("/index");
                } else {
                    req.flash("success", `incorrect Passsword`);
                    res.render("login", {
                        send: req.flash("send"),
                        done: req.flash("done"),
                        success: req.flash("success"),
                    });
                }
            })
            .catch(function (response) {
                console.log(response);
            });
    } catch (e) {
        res.status(400).send(e);
    }
};

userController.logoutuser = (req, res) => {
    if (req.session) {
        req.session.destroy((err) => {
            if (err) {
                res.status(400).send(err);
            } else {
                res.clearCookie(options.name);
                res.redirect("/");
            }
        });
    }
};

userController.addUser = async (req, res) => {
    const token = req.cookies.jwt;

    helpers
        .axiosdata("get", "/api/addUser", token)
        .then(function (response) {
            sess = req.session;
            res.render("addUser", {
                success: req.flash("success"),
                data: response.data.blogs,
                countrydata: response.data.countries,
                citydata: response.data.cities,
                statedata: response.data.states,
                userdata: response.data.users,
                name: sess.name,
                username: sess.username,
                users: sess.userData[0],
                role: sess.role,
                layout: false,
            });
            // });
        })
        .catch(function (response) {
            console.log(response);
        });
};
userController.createuser = async (req, res) => {
    const token = req.cookies.jwt;
    const userData = {
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
    };
    if (!req.files) {
        helpers
            .axiosdata("post", "/api/addUser", token, userData)
            .then(function () {
                res.redirect("/userListing");
            })
            .catch(function (response) {
                console.log(response);
            });
    } else {
        const image = req.files.photo;
        const img = image["name"];
        const userData = {
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
        };
        helpers
            .axiosdata("post", "/api/addUser", token, userData)
            .then(function () {
                res.redirect("/userListing");
            })
            .catch(function (response) {
                console.log(response);
            });
    }
};

userController.list = async (req, res) => {
    const token = req.cookies.jwt;
    helpers
        .axiosdata("get", "/api/userListing", token)
        .then(function (response) {
            sess = req.session;
            res.render("userListing", {
                data: response.data.userData,
                username: sess.username,
                users: sess.userData[0],
            });
        })
        .catch(function (response) {
            console.log(response);
        });
};

userController.userDetail = async (req, res) => {
    const _id = req.params.id;
    const token = req.cookies.jwt;
    helpers
        .axiosdata("get", "/api/viewUserDetail/" + _id, token)
        .then(function (response) {
            sess = req.session;
            res.render("viewUserDetail", {
                data: response.data.data,
                username: sess.username,
                users: sess.userData[0],
            });
        })
        .catch(function () { });
};

userController.profile = async (req, res) => {
    const _id = req.params.id;
    const token = req.cookies.jwt;
    helpers
        .axiosdata("get", "/api/profile/" + _id, token)
        .then(function (response) {
            sess = req.session;
            res.render("profile", {
                userData: response.data.userData,
                username: sess.username,
                users: sess.userData[0],
                success: req.flash("success"),
                images: req.flash("images"),
            });
        })
        .catch(function () { });
};
userController.updateUserprofile = async (req, res) => {
    const _id = req.params.id;
    const token = req.cookies.jwt;
    const profileData = {
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
    helpers
        .axiosdata("post", "/api/profile/" + _id, token, profileData)
        .then(function () {
            req.flash("success", "Your Profile Updated Successfull");
            res.redirect(`/profile/${_id}`);
        })
        .catch(function () { });
};

userController.updateUserphoto = async (req, res) => {
    const _id = req.params.id;
    const token = req.cookies.jwt;
    const image = req.files.photo;
    const img = image["name"];
    const profileData = {
        photo: img,
    }
    helpers
        .axiosdata("post", "/api/userphoto/" + _id, token, profileData)
        .then(function () {
            var file = req.files.photo;
            file.mv("public/images/" + file.name);
            req.flash("images", "Your profile image Updated Successfull");
            res.redirect(`/profile/${_id}`);
        })
        .catch(function () { });
};

userController.editUser = async (req, res) => {
    const _id = req.params.id;
    const token = req.cookies.jwt;
    helpers
        .axiosdata("get", "/api/editUser/" + _id, token)
        .then(function (response) {
            sess = req.session;
            res.render("editUser", {
                data: response.data.userData,
                roles: response.data.role,
                reportingData: response.data.users,
                countrydata: response.data.countries,
                citydata: response.data.cities,
                statedata: response.data.states,
                name: sess.name,
                users: sess.userData[0],
                username: sess.username,
                role: sess.role,
                layout: false,
            });
        })
        .catch(function () { });
};

userController.updateUser = async (req, res) => {
    const _id = req.params.id;
    const token = req.cookies.jwt;
    if (req.files) {
        const image = req.files.photo;
        const img = image['name']
        const updatedUserData = {
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
            new_image: img,
            status: req.body.status,
            bank_account_no: req.body.bank_account_no,
            bank_name: req.body.bank_name,
            ifsc_code: req.body.ifsc_code,
            updated_at: Date(),
        }
        helpers
            .axiosdata("post", "/api/editUser/" + _id, token, updatedUserData)
            .then(function () {
                var file = req.files.photo;
                file.mv('public/images/' + file.name);
                res.redirect("/userListing");
            })
            .catch(function (response) {
                console.log(response);
            });
    } else {
        const updatedUserData = {
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
            old_image: req.body.old_image,
            status: req.body.status,
            bank_account_no: req.body.bank_account_no,
            bank_name: req.body.bank_name,
            ifsc_code: req.body.ifsc_code,
            updated_at: Date(),
        }
        helpers
            .axiosdata("post", "/api/editUser/" + _id, token, updatedUserData)
            .then(function () {

                res.redirect("/userListing");
            })
            .catch(function (response) {
                console.log(response);
            });
    }
};

userController.deleteUser = async (req, res) => {
    const _id = req.params.id;
    const token = req.cookies.jwt;

    helpers
        .axiosdata("post", "/api/deleteUser/" + _id, token)
        .then(function () {
            res.redirect("/userListing");
        })

        .catch(function () { });
};

userController.index = async (req, res) => {


    const token = req.cookies.jwt;
    helpers
        .axiosdata("get", "/api/index/", token)
        .then(function (response) {
            sess = req.session;
            res.render("index", {
                data: req.user,
                pending: response.data.pending,
                active: response.data.active,
                InActive: response.data.InActive,
                userData: response.data.userData,
                projectData: response.data.projectData,
                projecthold: response.data.projecthold,
                projectinprogress: response.data.projectinprogress,
                projectcompleted: response.data.projectcompleted,
                taskData: response.data.taskData,
                leavesData: response.data.leavesData,
                name: sess.name,
                username: sess.username,
                dataholiday: response.data.dataholiday,
                users: sess.userData[0],
                role: sess.role,
            });
        })
        .catch(function (response) {
            console.log(response);
        });
};
userController.checkEmail = async (req, res) => {
    const Email = req.body.UserEmail;
    const emailExists = await user.findOne({ personal_email: Email });
    return res.status(200).json({ emailExists });
};

userController.forget = async (req, res) => {
    sess = req.session;
    res.render("forget", {
        success: req.flash("success"),
        username: sess.username,
    });
};

userController.sendforget = async (req, res) => {

    const token = req.cookies.jwt;
    const emailData = {
        personal_email: req.body.personal_email
    }
    helpers
        .axiosdata("post", "/api/forget/", token, emailData).then(function (response) {

            if (response.data.status == "Email Sent Successfully") {
                req.flash("success", `Email Sent Successfully`);
                res.render("login", {
                    send: req.flash("send"),
                    done: req.flash("done"),
                    success: req.flash("success"),
                });
            } else if (response.data.status == "User Not found") {
                req.flash("success", `User Not found`);
                res.render("login", {
                    send: req.flash("send"),
                    done: req.flash("done"),
                    success: req.flash("success"),
                });
                res.redirect("/index");
            }
        })
        .catch(function (response) {
            console.log(response);
        });

};

userController.getchange_pwd = async (req, res) => {
    res.render("forget_change_pwd", { success: req.flash("success") });
};

userController.change = async (req, res) => {
    const token = req.cookies.jwt;
    const _id = req.params.id;
    const tokenid = req.params.token;
    const passswordData = {
        password: req.body.password,
        cpassword: req.body.cpassword
    }

    helpers
        .axiosdata("post", "/api/change_pwd/" + _id + '/' + tokenid, token, passswordData).then(function (response) {
            console.log("response.data.status", response);

            if (response.data.status == "please check confirm password") {
                req.flash("success", `please check confirm password`);
                res.render("login", {
                    send: req.flash("send"),
                    done: req.flash("done"),
                    success: req.flash("success"),
                });
            } else if (response.data.status == "password updated") {
                req.flash("success", `password updated`);
                res.render("login", {
                    send: req.flash("send"),
                    done: req.flash("done"),
                    success: req.flash("success"),
                });
            }
        })
        .catch(function (response) {
            console.log(response);
        });

};

module.exports = userController;
