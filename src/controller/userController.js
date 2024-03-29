const express = require("express");
const user = require("../model/user");
const emailtoken = require("../model/token")
const Permission = require("../model/addpermissions");
var rolepermission = require("../model/rolePermission");
const axios = require("axios");
let cookieParser = require("cookie-parser");
const router = new express.Router();
router.use(cookieParser());
const options = require("../API/router/users_api");
const excel = require("exceljs");
const fs = require("fs");
const xlsxj = require("xlsx-to-json");
var helpers = require("../helpers");
var rolehelper = require("../utilis_new/helper");
// var permissionHelper = require("../permissionHelper")
const { log, Console } = require("console");
const { CLIENT_RENEG_LIMIT } = require("tls");

const userController = {};

userController.login = (req, res) => {
  sess = req.session;

  if (sess.userData) {
    res.redirect('/')
  } else {
    res.render("login", {
      send: req.flash("send"),
      active: req.flash("active"),
      alreadyActive: req.flash("alreadyActive"),
      done: req.flash("done"),
      succPass: req.flash("succPass"),
      emailSuccess: req.flash("emailSuccess"),
      userFail: req.flash("userFail"),
      fail: req.flash("fail"),
      failPass: req.flash("failPass"),
      success: req.flash("success"),
      PendingUser: req.flash("PendingUser"),
      expireEmail: req.flash("expireEmail")
    });
  }
};

userController.employeelogin = async (req, res) => {
  try {
    const token = req.cookies.jwt;

    const Logindata = {
      company_email: req.body.company_email,
      password: req.body.password,
    };
    helpers
      .axiosdata("post", "/api/", token, Logindata)
      .then(async function (response) {
        console.log("response", response.data.userData[0])
        // //console.log("res",response)
        if (response.data.emailError == "Invalid email") {
          req.flash("fail", `incorrect Email`);

          res.redirect("/login");
          // res.render("login", {
          //   send: req.flash("send"),
          //   done: req.flash("done"),
          //   userFail: req.flash("userFail"),
          //   succPass: req.flash("succPass"),
          //   success: req.flash("success"),
          //   emailSuccess: req.flash("emailSuccess"),
          //   PendingUser: req.flash("PendingUser"),
          // });
        } else if (response.data.activeError == "please Active Your Account") {
          req.flash("PendingUser", `Pelease Active Your Account`);
          res.redirect("/login");
        } else if (response.data.userData) {
          sess = req.session;
          sess.userData = response.data.userData[0];
          // localStorage.setItem('user', sess.userData);
          // //console.log("sess.userData",sess.userData)

          res.cookie("jwt", response.data.userData[0].token, {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true,
          });
          //console.log("sess",sess.redirectUrl)
          if (sess.redirectUrl) {
            //console.log("Asdad")
            res.redirect(sess.redirectUrl)
          } else {
            res.redirect("/");
          }
        } else {
          req.flash("failPass", `incorrect Passsword`);
          res.redirect("/login");
          // res.render("login", {
          //   send: req.flash("send"),
          //   done: req.flash("done"),
          //   userFail: req.flash("userFail"),
          //   succPass: req.flash("succPass"),
          //   success: req.flash("success"),
          //   emailSuccess: req.flash("emailSuccess"),
          //   PendingUser: req.flash("PendingUser"),
          // });
        }
      })
      .catch(function (err) {
        console.log(err);
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
        res.redirect("/login");
      }
    });
  }
};

userController.addUser = async (req, res) => {
  const token = req.cookies.jwt;

  helpers
    .axiosdata("get", "/api/addUser", token)
    .then(async function (response) {
      sess = req.session;
      if (response.data.status == false) {
        res.redirect("/forbidden");
      } else {
        res.render("addUser", {
          success: req.flash("success"),
          data: response.data.role,
          citydata: response.data.cities,
          userdata: response.data.users,
          name: sess.name,
          loggeduserdata: req.user,
          users: sess.userData[0],
          role: sess.role,
          roleHasPermission: await helpers.getpermission(req.user),
          layout: false,
        });
      }
    })
    .catch(function (response) {
      // //console.log(response);
    });
};
userController.createuser = async (req, res) => {
  const token = req.cookies.jwt;

  // //console.log("req",req.files.photo)


  const userData = {
    role_id: req.body.role_id,
    emp_code: req.body.emp_code,
    password: req.body.password,
    reporting_user_id: req.body.reporting_user_id,
    firstname: req.body.firstname,
    user_name: req.body.user_name,
    middle_name: req.body.middle_name,
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
        //console.log(response);
      });
  } else {
    let file = req.files.photo;
    const image = file.name
    const userData = {
      role_id: req.body.role_id,
      emp_code: req.body.emp_code,
      reporting_user_id: req.body.reporting_user_id,
      password: req.body.password,
      firstname: req.body.firstname,
      user_name: req.body.user_name,
      middle_name: req.body.middle_name,
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
      //  photo: image,
      status: req.body.status,
      bank_account_no: req.body.bank_account_no,
      bank_name: req.body.bank_name,
      ifsc_code: req.body.ifsc_code,
    };
    const formData = new FormData();
    formData.append("photo", new Blob([req.files.photo.data], { type: req.files.photo.mimetype }), req.files.photo.name);
    formData.append("role_id", req.body.role_id);
    formData.append("emp_code", req.body.emp_code);
    formData.append("reporting_user_id", req.body.reporting_user_id);
    formData.append("password", req.body.password);
    formData.append("firstname", req.body.firstname);
    formData.append("user_name", req.body.user_name);
    formData.append("middle_name", req.body.middle_name);
    formData.append("last_name", req.body.last_name);
    formData.append("gender", req.body.gender);
    formData.append("dob", req.body.dob);
    formData.append("doj", req.body.doj);
    formData.append("personal_email", req.body.personal_email);
    formData.append("company_email", req.body.company_email);
    formData.append("mo_number", req.body.mo_number);
    formData.append("pan_number", req.body.pan_number);
    formData.append("aadhar_number", req.body.aadhar_number);
    formData.append("add_1", req.body.add_1);
    formData.append("add_2", req.body.add_2);
    formData.append("city", req.body.city);
    formData.append("state", req.body.state);
    formData.append("country", req.body.country);
    formData.append("pincode", req.body.pincode);
    formData.append("status", req.body.status);
    formData.append("bank_account_no", req.body.bank_account_no);
    formData.append("bank_name", req.body.bank_name);
    formData.append("ifsc_code", req.body.ifsc_code);
    helpers
      .axiosdata("post", "/api/addUser", token, formData)
      .then(function () {
        // var file = req.files.photo;
        // file.mv("public/images/" + file.name);
        res.redirect("/userListing");
      })
      .catch(function (response) {
        //console.log(response);
      });
  }
};

userController.list = async (req, res) => {
  const token = req.cookies.jwt;
  helpers
    .axiosdata("get", "/api/userListing", token)
    .then(function (response) {
      sess = req.session;
      if (response.data.status == false) {
        res.redirect("/forbidden");
      } else {
        rolehelper
          .checkPermission(req.user.role_id, req.user.user_id, "Add Employee")
          .then((addPerm) => {
            rolehelper
              .checkPermission(
                req.user.role_id,
                req.user.user_id,
                "Update Employee"
              )
              .then((updatePerm) => {
                rolehelper
                  .checkPermission(
                    req.user.role_id,
                    req.user.user_id,
                    "Delete Employee"
                  )
                  .then((deletePerm) => {
                    rolehelper
                      .checkPermission(
                        req.user.role_id,
                        req.user.user_id,
                        "View UserPermissions"
                      )
                      .then(async (userPerm) => {
                        res.render("userListing", {
                          data: response.data.userData,
                          loggeduserdata: req.user,
                          users: sess.userData[0],
                          roleHasPermission: await helpers.getpermission(req.user),
                          addStatus: addPerm.status,
                          updateStatus: updatePerm.status,
                          deleteStatus: deletePerm.status,
                          userpermStatus: userPerm.status,
                        });
                      });
                  });
              });
          });
      }
    })
    .catch(function (response) {
      //console.log(response);
    });
};

userController.userDetail = async (req, res) => {
  const _id = req.params.id;
  const token = req.cookies.jwt;
  helpers
    .axiosdata("get", "/api/viewUserDetail/" + _id, token)
    .then(async function (response) {
      sess = req.session;
      //console.log("response",response)
      if (response.data.status == false) {
        res.redirect("/forbidden");
      } else {
        res.render("viewUserDetail", {
          userDetailData: response.data.userDetailData,
          loggeduserdata: req.user,
          users: sess.userData[0],
          roleHasPermission: await helpers.getpermission(req.user)
        });
      }
    })
    .catch(function () { });
};

userController.profile = async (req, res) => {
  const _id = req.params.id;
  const token = req.cookies.jwt;
  // //console.log( sess.userData.roleData[0].role_name=="Admin" )
  helpers
    .axiosdata("get", "/api/profile/" + _id, token)
    .then(async function (response) {
      sess = req.session;
      res.render("profile", {

        userData: response.data.userData[0],
        loggeduserdata: req.user,
        roleHasPermission: await helpers.getpermission(req.user),
        users: sess.userData[0],
        success: req.flash("success"),
        images: req.flash("images"),
        profileupdate: req.flash("profileupdate"),

      });
    })
    .catch(function () { });
};

userController.updateprofile = async (req, res) => {
  const _id = req.params.id;
  const token = req.cookies.jwt;
  if (sess.userData.roleData[0].role_name == "Admin") {
    var updateprofiledata = {
      firstname: req.body.firstname,
      middle_name: req.body.middle_name,
      last_name: req.body.last_name,
      gender: req.body.gender,
      personal_email: req.body.personal_email,
      mo_number: req.body.mo_number,
      add_1: req.body.add_1,
      add_2: req.body.add_2,
      bank_account_no: req.body.bank_account_no,
      bank_name: req.body.bank_name,
      ifsc_code: req.body.ifsc_code,
      company_email: req.body.company_email,
      dob: req.body.dob,
      doj: req.body.doj,
      pincode: req.body.pincode,
      pan_number: req.body.pan_number,
      aadhar_number: req.body.aadhar_number,
      updated_at: Date()
    }
  } else {
    var updateprofiledata = {
      firstname: req.body.firstname,
      middle_name: req.body.middle_name,
      last_name: req.body.last_name,
      gender: req.body.gender,
      personal_email: req.body.personal_email,
      mo_number: req.body.mo_number,
      add_1: req.body.add_1,
      add_2: req.body.add_2,
      pincode: req.body.pincode,
      updated_at: Date(),
    };

  }

  //  //console.log(updateprofiledata)
  helpers
    .axiosdata("post", "/api/profile/" + _id, token, updateprofiledata)
    .then(async function (response) {
      sess = req.session;
      // //console.log(response)
      if (response.data.message == "profile updated") {
        req.flash("profileupdate", `Your Profile Updated Successfully`)
        res.redirect(`/profile/${_id}`);
      }
    })
    .catch(function (response) { });


};


userController.profileEdit = async (req, res) => {
  const _id = req.params.id;
  const token = req.cookies.jwt;
  helpers
    .axiosdata("get", "/api/profile/" + _id, token)
    .then(async function (response) {
      sess = req.session;
      res.render("profileEdit", {
        userData: response.data.userData[0],

        loggeduserdata: req.user,
        users: sess.userData[0],
        roleHasPermission: await helpers.getpermission(req.user),
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
  };
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
  //console.log("req",req.body)
  if (req.body.photo == "") {
    const profileData = {
      photo: " "
    };
    helpers
      .axiosdata("post", "/api/userprofilephoto/" + _id, token, profileData)
      .then(function () {
        req.flash("images", "Your profile image Updated Successfull");
        res.redirect(`/profile/${_id}`);
      })
  } else {
    const token = req.cookies.jwt;
    const image = req.files.photo;
    const img = image["name"];
    const profileData = {
      photo: img
    };
    //console.log("image",profileData)
    helpers
      .axiosdata("post", "/api/userprofilephoto/" + _id, token, profileData)
      .then(function () {
        var file = req.files.photo;
        file.mv("public/images/" + file.name);
        req.flash("images", "Your profile image Updated Successfull");
        res.redirect(`/profile/${_id}`);
      })
      .catch(function () { });
  }
};

userController.editUser = async (req, res) => {
  const _id = req.params.id;
  const token = req.cookies.jwt;
  helpers
    .axiosdata("get", "/api/editUser/" + _id, token)
    .then(async function (response) {
      sess = req.session;
      if (response.data.status == false) {
        res.redirect("/forbidden");
      } else {
        res.render("editUser", {
          data: response.data.userData,
          roles: response.data.role,
          reportingData: response.data.users,
          citydata: response.data.cities,
          name: sess.name,
          roleHasPermission: await helpers.getpermission(req.user),
          users: sess.userData[0],
          loggeduserdata: req.user,
          role: sess.role,

          layout: false,
        });
      }
    })
    .catch(function () { });
};

userController.updateUser = async (req, res) => {
  const _id = req.params.id;
  const token = req.cookies.jwt;
  const updatedUserData = {
    role_id: req.body.role_id,
    emp_code: req.body.emp_code,
    password: req.body.password,
    reporting_user_id: req.body.reporting_user_id,
    firstname: req.body.firstname,
    user_name: req.body.user_name,
    middle_name: req.body.middle_name,
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
      .axiosdata("post", "/api/editUser/" + _id, token, updatedUserData)
      .then(function () {
        res.redirect("/userListing");
      })
      .catch(function (response) {
        //console.log(response);
      });
  } else {
    let file = req.files.photo;
    const image = file.name
    const formData = new FormData();
    formData.append("photo", new Blob([req.files.photo.data], { type: req.files.photo.mimetype }), req.files.photo.name);
    formData.append("role_id", req.body.role_id);
    formData.append("emp_code", req.body.emp_code);
    formData.append("reporting_user_id", req.body.reporting_user_id);
    formData.append("password", req.body.password);
    formData.append("firstname", req.body.firstname);
    formData.append("user_name", req.body.user_name);
    formData.append("middle_name", req.body.middle_name);
    formData.append("last_name", req.body.last_name);
    formData.append("gender", req.body.gender);
    formData.append("dob", req.body.dob);
    formData.append("doj", req.body.doj);
    formData.append("personal_email", req.body.personal_email);
    formData.append("company_email", req.body.company_email);
    formData.append("mo_number", req.body.mo_number);
    formData.append("pan_number", req.body.pan_number);
    formData.append("aadhar_number", req.body.aadhar_number);
    formData.append("add_1", req.body.add_1);
    formData.append("add_2", req.body.add_2);
    formData.append("city", req.body.city);
    formData.append("state", req.body.state);
    formData.append("country", req.body.country);
    formData.append("pincode", req.body.pincode);
    formData.append("status", req.body.status);
    formData.append("bank_account_no", req.body.bank_account_no);
    formData.append("bank_name", req.body.bank_name);
    formData.append("ifsc_code", req.body.ifsc_code);
    helpers
      .axiosdata("post", "/api/editUser/" + _id, token, formData)
      .then(function () {
        res.redirect("/userListing");
      })
      .catch(function (response) {
        //console.log(response);
      });
  }
};

userController.deleteUser = async (req, res) => {
  const _id = req.params.id;
  const token = req.cookies.jwt;

  helpers
    .axiosdata("post", "/api/deleteUser/" + _id, token)
    .then(function (response) {
      if (response.data.status == false) {
        res.redirect("/forbidden");
      } else {
        res.redirect("/userListing");
      }
    })

    .catch(function () { });
};

userController.index = async (req, res) => {
  const token = req.cookies.jwt;
  helpers
    .axiosdata("get", "/api/index", token).then(async function (response) {
      sess = req.session;
      res.render("index", {
        userLeavesData: response.data.userLeavesData,
        userPending: response.data.userPending,
        taskUserData: response.data.taskUserData,
        projectUserData: response.data.projectUserData,
        referuserData: response.data.referuserData,
        leavesrequestData: response.data.leavesrequestData,
        projectcompletedUser: response.data.projectcompletedUser,
        projectinprogressUser: response.data.projectinprogressUser,
        projectholdUser: response.data.projectholdUser,
        userActive: response.data.userActive,
        userInActive: response.data.userInActive,
        userData: response.data.userData,
        projectData: response.data.projectData,
        projecthold: response.data.projecthold,
        projectinprogress: response.data.projectinprogress,
        projectcompleted: response.data.projectcompleted,
        taskData: response.data.taskData,
        pendingUserTaskData: response.data.pendingUserTaskData,
        pendingTaskData: response.data.pendingTaskData,
        leavesData: response.data.leavesData,
        name: sess.name,
        loggeduserdata: req.user,
        allLeavesData: response.data.allLeavesData,
        holidayData: response.data.holidayData,
        settingData: response.data.settingData,
        announcementData: response.data.announcementData,
        users: sess.userData[0],
        role: sess.role,
        roleHasPermission: await helpers.getpermission(req.user),
      });
    })

    .catch(function (error) {
      //  //console.log("error",error)
    });
};
userController.checkEmail = async (req, res) => {
  const Email = req.body.UserEmail;
  const user_id = req.body.user_id;

  const emailExists = await user.findOne({
    _id: { $ne: user_id },
    personal_email: Email,
  });
  // const existEmail =
  //console.log("emailExists", emailExists);
  return res.status(200).json({ emailExists });
};

userController.forget = async (req, res) => {
  sess = req.session;
  res.render("forget", {
    success: req.flash("userFail"),
    loggeduserdata: req.user,

  });
};

userController.sendforget = async (req, res) => {
  const token = req.cookies.jwt;
  const emailData = {
    company_email: req.body.company_email,
  };
  helpers
    .axiosdata("post", "/api/forget/", token, emailData)
    .then(function (response) {
      //console.log(response.data)
      if (response.data.message == "Email Sent Successfully") {
        // res.redirect("/")
        // req.flash("emailSuccess", `Email Sent Successfully`);
        // req.flash('emailSuccess','Email Sent Successfully');
        req.flash("emailSuccess", `Email Sent Successfully`);
        res.redirect("/login");
        // res.render("login", {
        //   send: req.flash("send"),
        //   done: req.flash("done"),
        //   success: req.flash("success"),
        // });
      } else if (response.data.message == "User Not found") {
        req.flash("userFail", `User Not found`);
        // res.render("login", {
        //   send: req.flash("send"),
        //   done: req.flash("done"),
        //   success: req.flash("success"),
        // });
        res.redirect("/forget");
      }
    })
    .catch(function (response) {
      //console.log(response);
    });
};

userController.get_change_password = async (req, res) => {
  sess = req.session;
  try {
    const _id = req.params.id;
    const userData = await user.findById(_id);
    res.render("change_password", {
      roleHasPermission: await helpers.getpermission(req.user),
      userData: userData,
      loggeduserdata: req.user,
      users: sess.userData,
      role: sess.role,
      layout: false,
      alert: req.flash("alert"),
      success: req.flash("success"),

    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
userController.change_password = async (req, res) => {

  try {
    const token = req.cookies.jwt;
    const _id = req.params.id;
    const updatePassword = {
      oldpassword: req.body.oldpassword,
      newpassword: req.body.newpassword,
      cpassword: req.body.cpassword,
      updated_at: Date(),
    };

    helpers
      .axiosdata("post", "/api/change_password/" + _id, token, updatePassword)
      .then(function (response) {

        if (response.data == "confirm password not matched") {
          // //console.log("confirm password not matched");
          req.flash("alert", `Please Check Confirm Password`)
          // //console.log("please check confirm password");
          res.redirect(`/change_password/${_id}`);
        } else if (response.data == "incorrect current password") {
          // //console.log("incorrect current password");
          req.flash("alert", `incorrect current password`)
          res.redirect(`/change_password/${_id}`);
        } else {
          req.flash("success", `Your Password is Updated`)
          res.redirect(`/change_password/${_id}`);
        }
      })
      .catch(function (response) { });
  } catch (e) {
    res.status(400).send(e);
  }
};

userController.getchange_pwd = async (req, res) => {
  //  const user_id = sess.userData._id
  //console.log(req.params.id)

  const users = await user.findById(req.params.id);

  if (!users) return res.status(200).json("invalid link or expired");
  const token = await emailtoken.findOne({
    userId: users._id,
    token: req.params.token,
  });
  //console.log("token",token)
  if (!token) {
    req.flash("expireEmail", `Invalid link or expired`);
    return res.status(200).redirect('/login');
  } else {
    res.render("forget_change_pwd", { confFail: req.flash("confFail") });
  }

};

userController.change = async (req, res) => {
  // //console.log("response",response)
  const token = req.cookies.jwt;
  const _id = req.params.id;
  const tokenid = req.params.token;
  const passswordData = {
    password: req.body.password,
    cpassword: req.body.cpassword,
  };

  helpers
    .axiosdata(
      "post",
      "/api/change_pwd/" + _id + "/" + tokenid,
      token,
      passswordData
    )
    .then(function (response) {
      ("response", response.data.message)
      if (response.data.status == "please check confirm password") {
        req.flash("confFail", `please check confirm password`);
        res.redirect(`/change_pwd/${_id}/${tokenid}`);
      } else if (response.data.status == "password updated") {
        req.flash("succPass", `password updated`);
        res.redirect("/login");
      } else if (response.data.message == "Invalid link or expired") {
        req.flash("expireEmail", `Invalid link or expired`);
        res.redirect("/login");
      }
    })
    .catch(function (response) {
      //console.log(response);
    });
};

userController.getxlsxfile = async (req, res) => {
  const token = req.cookies.jwt;
  helpers
    .axiosdata("get", "/api/userListing", token)
    .then(function (response) {
      sess = req.session;
      if (response.data.status == false) {
        res.redirect("/forbidden");
      } else {
        let workbook = new excel.Workbook();
        let worksheet = workbook.addWorksheet("sheet1");


        worksheet.columns = [
          { header: "Employee Code", key: "emp_code", width: 25 },
          { header: "First Name", key: "firstname", width: 25 },
          { header: "User Name", key: "user_name", width: 25 },
          { header: "Middle Name", key: "middle_name", width: 26 },
          { header: "Last Name", key: "last_name", width: 26 },
          { header: "Gender", key: "gender", width: 26 },
          { header: "Date Of Birth", key: "dob", width: 26 },
          { header: "Date Of Join", key: "doj", width: 26 },
          { header: "Personal  Email", key: "personal_email", width: 26 },
          { header: "Company Email", key: "company_email", width: 26 },
          { header: "Mo Number", key: "mo_number", width: 26 },
          { header: "Pan Number", key: "pan_number", width: 26 },
          { header: "Aadhar Number", key: "aadhar_number", width: 26 },
          { header: "Employee Status", key: "status", width: 26 },
          { header: "Bank Name", key: "bank_name", width: 26 },
          { header: "Bank Account_no", key: "bank_account_no", width: 26 },
          { header: "Ifsc Code", key: "ifsc_code", width: 26 },
          { header: "Address 1", key: "add_1", width: 26 },
          { header: "Address 2", key: "add_2", width: 26 },
          { header: "City", key: "city", width: 26 },
          { header: "State", key: "state", width: 26 },
          { header: "Pincode", key: "pincode", width: 26 },
          { header: "Country", key: "country", width: 26 },
          { header: "Photo", key: "photo", width: 26 },
          { header: "Status", key: "status", width: 26 },
        ];
        worksheet.addRows(response.data.userData);
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
          "Content-Disposition",
          "attachment; filename=" + "Userasdsads.xlsx"
        );
        return workbook.xlsx
          .write(res)
          .then(function () {
            res.status(200).end();
          })
          .catch((res) => {
            //console.log(res);
          });
      }
    })
    .catch(function (response) {
      //console.log(response);
    });
};
userController.addxlsxfile = async (req, res) => {
  // //console.log(req.files)
  const token = req.cookies.jwt;
  const _id = req.params.id;
  const tokenid = req.params.token;
  const userData = {
    file: req.files

  };
  // //console.log("this",userData.file.file);

  helpers
    .axiosdata(
      "post",
      "/api/addtxlsx/",
      token,
      userData.file
    )
    .then(function (response) {

      res.redirect("/userListing");
    })
    .catch(function (response) {
      //console.log(response);
    });




  // const file = req.files.file.name;
  // const filedata = req.files.file.data;
  // fs.appendFile(file, filedata, function (err, result) {

  //   xlsxj(
  //     {
  //       input: file,
  //       output: "output.json",
  //     },
  //     function (err, result) {
  //       if (err) {
  //         console.error(err);
  //       } else {
  //         //console.log(result);
  //         const userdataxlsx = UserModel.insertMany(result, (error, res) => {
  //           //console.log("error", error);
  //           //console.log("res", res);
  //           fs.unlink(file, function (err) {
  //             if (err) throw err;
  //             //console.log("File deleted!");
  //           });
  //         });
  //       }
  //     }
  //   );
  // });

  // res.json("done");
};
userController.forbidden = async (req, res) => {
  sess = req.session;
  res.render("forbidden", {
    roleHasPermission: await helpers.getpermission(req.user),
    username: sess.username,
    loggeduserdata: req.user,
  });
};
// userController.activeuser = async (req, res) => {

//   //console.log("fasf")
//   const token = req.cookies.jwt;
//   const _id = req.params.id;
//   helpers
//     .axiosdata(
//       "post","/api/activeuser/" + _id ,token,
//     )
//     .then(function (response) {
//       // //console.log(response)
//       if (response.data == "now you are Active Employee") {
//         req.flash("active", `Your Account is Activated!`);
//         res.redirect("/");
//       } else if (response.data == "Your account already Activated") {
//         req.flash("alreadyActive", `Your account is already Activated!`);
//         res.redirect("/");
//       }
//     })
//     .catch(function (response) {
//       //console.log(response);
//     });
// };


userController.getactiveuser = async (req, res) => {
  // const token = req.cookies.jwt;
  // const _id = req.params.id;

  res.render("activeAccount", {
    alert: req.flash("alert")
  });

};

userController.activeuserAccount = async (req, res) => {
  const token = req.cookies.jwt;
  const _id = req.params.id;
  const activeAccountData = {
    password: req.body.password,
    cpassword: req.body.cpassword,
  };

  helpers
    .axiosdata(
      "post", "/api/activeuserAccount/" + _id, token, activeAccountData
    )
    .then(function (response) {
      // //console.log(response)
      if (response.data.message == "please check confirm password") {
        req.flash("alert", `Please Check Confirm Password`)
        res.redirect(`/activeuserAccount/${_id}`);
      }
      else if (response.data.message == "Your account is already activated") {
        req.flash("alreadyActive", `Your account is already Activated!`);
        res.redirect("/login");
      }
      else if (response.data.message == "Now You Are Active Employee") {
        req.flash("active", `Your Account is Activated!`);
        res.redirect("/login");
      }
    })
    .catch(function (response) {
      //console.log(response);
    });
};
module.exports = userController;