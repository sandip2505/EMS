const express = require("express");
const user = require("../model/user");
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
  });
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

      console.log("res",response)
             if (response.data.emailError == "Invalid email") {
          req.flash("fail", `incorrect Email`);
          
          res.redirect("/");
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
          res.redirect("/");
        } else if (response.data.login_status == "login success") {
          sess = req.session;
          sess.userData = response.data.userData[0];

          // console.log("sess.userData",sess.userData)

          res.cookie("jwt", response.data.token, {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true,
          });
          res.redirect("/index");
        } else {
          req.flash("failPass", `incorrect Passsword`);
          res.redirect("/");
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
         roleHasPermission : await helpers.getpermission(req.user),
          layout: false,
        });
      }
    })
    .catch(function (response) {
      // console.log(response);
    });
};
userController.createuser = async (req, res) => {
  const token = req.cookies.jwt;
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
        console.log(response);
      });
  } else {
    const image = req.files.photo;
    const img = image["name"];
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
      photo: img,
      status: req.body.status,
      bank_account_no: req.body.bank_account_no,
      bank_name: req.body.bank_name,
      ifsc_code: req.body.ifsc_code,
    };
    helpers
      .axiosdata("post", "/api/addUser", token, userData)
      .then(function () {
        var file = req.files.photo;
        file.mv("public/images/" + file.name);
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
                         roleHasPermission : await helpers.getpermission(req.user),
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
      console.log(response);
    });
};

userController.userDetail = async (req, res) => {
  const _id = req.params.id;
  const token = req.cookies.jwt;
  helpers
    .axiosdata("get", "/api/viewUserDetail/" + _id, token)
    .then(async function (response) {
      sess = req.session;
      if (response.data.status == false) {
        res.redirect("/forbidden");
      } else {
        res.render("viewUserDetail", {
          data: response.data.data,
          loggeduserdata: req.user,
          users: sess.userData[0],
         roleHasPermission : await helpers.getpermission(req.user)
        });
      }
    })
    .catch(function () {});
};

userController.profile = async (req, res) => {
  const _id = req.params.id;
  const token = req.cookies.jwt;
  helpers
    .axiosdata("get", "/api/profile/" + _id, token)
    .then(async function (response) {
      sess = req.session;
      res.render("profile", {
      
        userData: response.data.userData[0],
        loggeduserdata: req.user,
       roleHasPermission : await helpers.getpermission(req.user),
        users: sess.userData[0],
        success: req.flash("success"),
        images: req.flash("images"),
      });
    })
    .catch(function () {});
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
       roleHasPermission : await helpers.getpermission(req.user),
        success: req.flash("success"),
        images: req.flash("images"),
      });
    })
    .catch(function () {});
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
    .catch(function () {});
};

userController.updateUserphoto = async (req, res) => {
  const _id = req.params.id;
  const token = req.cookies.jwt;
  const image = req.files.photo;
  const img = image["name"];
  const profileData = {
    photo: img
  };
  console.log("image",profileData)
  helpers
    .axiosdata("post", "/api/userprofilephoto/" + _id, token, profileData)
    .then(function () {
      var file = req.files.photo;
      file.mv("public/images/" + file.name);
      req.flash("images", "Your profile image Updated Successfull");
      res.redirect(`/profile/${_id}`);
    })
    .catch(function () {});
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
         roleHasPermission : await helpers.getpermission(req.user),
          users: sess.userData[0],
          loggeduserdata: req.user,
          role: sess.role,
        
          layout: false,
        });
      }
    })
    .catch(function () {});
};

userController.updateUser = async (req, res) => {
  const _id = req.params.id;
  const token = req.cookies.jwt;
  if (req.files) {
    const image = req.files.photo;
    const img = image["name"];
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
    };
    helpers
      .axiosdata("post", "/api/editUser/" + _id, token, updatedUserData)
      .then(function () {
        var file = req.files.photo;
        file.mv("public/images/" + file.name);
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
    };
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
    .then(function (response) {
      if (response.data.status == false) {
        res.redirect("/forbidden");
      } else {
        res.redirect("/userListing");
      }
    })

    .catch(function () {});
};

userController.index = async (req, res) => {
  const token = req.cookies.jwt;
  helpers
    .axiosdata("get", "/api/index", token).then(async function (response) {

      sess = req.session;
      res.render("index", {
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
        leavesData: response.data.leavesData,
        name: sess.name,
        loggeduserdata: req.user,
        allLeavesData: response.data.allLeavesData,
        holidayData: response.data.holidayData,
        settingData: response.data.settingData,
        announcementData: response.data.announcementData,
        users: sess.userData[0],
        role: sess.role,
        roleHasPermission : await helpers.getpermission(req.user),
      });  })

     .catch(function (error) {
      //  console.log("error",error)
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
  console.log("emailExists", emailExists);
  return res.status(200).json({ emailExists });
};

userController.forget = async (req, res) => {
  sess = req.session;
  res.render("forget", {
   roleHasPermission : await helpers.getpermission(req.user),
    success: req.flash("success"),
    loggeduserdata: req.user,
  
  });
};

userController.sendforget = async (req, res) => {
  const token = req.cookies.jwt;
  const emailData = {
    personal_email: req.body.personal_email,
  };
  helpers
    .axiosdata("post", "/api/forget/", token, emailData)
    .then(function (response) {
      if (response.data.status == "Email Sent Successfully") {
        // res.redirect("/")
        // req.flash("emailSuccess", `Email Sent Successfully`);
        // req.flash('emailSuccess','Email Sent Successfully');
        req.flash("emailSuccess", `Email Sent Successfully`);
        res.redirect("/");
        // res.render("login", {
        //   send: req.flash("send"),
        //   done: req.flash("done"),
        //   success: req.flash("success"),
        // });
      } else if (response.data.status == "User Not found") {
        req.flash("userFail", `User Not found`);
        // res.render("login", {
        //   send: req.flash("send"),
        //   done: req.flash("done"),
        //   success: req.flash("success"),
        // });
        res.redirect("/");
      }
    })
    .catch(function (response) {
      console.log(response);
    });
};

userController.get_change_password = async (req, res) => {
  sess = req.session;
  try {
    const _id = req.params.id;
    const userData = await user.findById(_id);
    res.render("change_password", {
      roleHasPermission : await helpers.getpermission(req.user),
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
        if(response.data=="confirm password not matched"){
          console.log("confirm password not matched");
          req.flash("alert", `Please Check Confirm Password`)
          console.log("please check confirm password");
          res.redirect(`/change_password/${_id}`);
        }else if(response.data=="incorrect current password"){
          console.log("incorrect current password");
          req.flash("alert", `incorrect current password`)
          res.redirect(`/change_password/${_id}`);
        }else{
          req.flash("success", `Your Password is Updated`)
          res.redirect(`/change_password/${_id}`);
        }
      })
      .catch(function (response) {});
  } catch (e) {
    res.status(400).send(e);
  }
};

userController.getchange_pwd = async (req, res) => {
  res.render("forget_change_pwd", { confFail: req.flash("confFail") });
};

userController.change = async (req, res) => {
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
      if (response.data.status == "please check confirm password") {
        req.flash("confFail", `please check confirm password`);
        res.redirect(`/change_pwd/${_id}/${tokenid}`);
      } else if (response.data.status == "password updated") {
        req.flash("succPass", `password updated`);
        res.redirect("/");
      }
    })
    .catch(function (response) {
      console.log(response);
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
          { header: "emp_code", key: "emp_code", width: 25 },
          { header: "firstname", key: "firstname", width: 25 },
          { header: "user_name", key: "user_name", width: 25 },
          { header: "password", key: "password", width: 25 },
          { header: "middle_name", key: "middle_name", width: 26 },
          { header: "last_name", key: "last_name", width: 26 },
          { header: "gender", key: "gender", width: 26 },
          { header: "dob", key: "dob", width: 26 },
          { header: "doj", key: "doj", width: 26 },
          { header: "personal_email", key: "personal_email", width: 26 },
          { header: "company_email", key: "company_email", width: 26 },
          { header: "mo_number", key: "mo_number", width: 26 },
          { header: "pan_number", key: "pan_number", width: 26 },
          { header: "aadhar_number", key: "aadhar_number", width: 26 },
          { header: "status", key: "status", width: 26 },
          { header: "bank_name", key: "bank_name", width: 26 },
          { header: "bank_account_no", key: "bank_account_no", width: 26 },
          { header: "ifsc_code", key: "ifsc_code", width: 26 },
          { header: "add_1", key: "add_1", width: 26 },
          { header: "add_2", key: "add_2", width: 26 },
          { header: "city", key: "city", width: 26 },
          { header: "state", key: "state", width: 26 },
          { header: "pincode", key: "pincode", width: 26 },
          { header: "country", key: "country", width: 26 },
          { header: "photo", key: "photo", width: 26 },
          { header: "status", key: "status", width: 26 },
        ];
        worksheet.addRows(response.data.userData);
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
          "Content-Disposition",
          "attachment; filename=" + "Users.xlsx"
        );
        return workbook.xlsx
          .write(res)
          .then(function () {
            res.status(200).end();
          })
          .catch((res) => {
            console.log(res);
          });
      }
    })
    .catch(function (response) {
      console.log(response);
    });
};
userController.addxlsxfile = async (req, res) => {
  // console.log(req.files)
    const token = req.cookies.jwt;
  const _id = req.params.id;
  const tokenid = req.params.token;
  const userData = {
    file : req.files
    
  };
  // console.log("this",userData.file.file);

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
      console.log(response);
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
  //         console.log(result);
  //         const userdataxlsx = UserModel.insertMany(result, (error, res) => {
  //           console.log("error", error);
  //           console.log("res", res);
  //           fs.unlink(file, function (err) {
  //             if (err) throw err;
  //             console.log("File deleted!");
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
   roleHasPermission : await helpers.getpermission(req.user),
    username: sess.username,
    loggeduserdata: req.user,
  });
};
userController.activeuser = async (req, res) => {

  console.log("fasf")
  const token = req.cookies.jwt;
  const _id = req.params.id;
  helpers
    .axiosdata(
      "post","/api/activeuser/" + _id ,token,
    )
    .then(function (response) {
      // console.log(response)
      if (response.data == "now you are Active Employee") {
        req.flash("active", `Your Account is Activated!`);
        res.redirect("/");
      } else if (response.data == "Your account already Activated") {
        req.flash("alreadyActive", `Your account is already Activated!`);
        res.redirect("/");
      }
    })
    .catch(function (response) {
      console.log(response);
    });
};


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
      "post","/api/activeuserAccount/" + _id ,token,activeAccountData
    )
    .then(function (response) { 
      console.log(response)
      if(response.data.message=="please check confirm password"){
        req.flash("alert", `Please Check Confirm Password`)
        res.redirect(`/activeuserAccount/${_id}`);
      }
      else if(response.data.message=="Your account is already activated"){
        req.flash("alreadyActive", `Your account is already Activated!`);
        res.redirect("/");
      }
      else if(response.data.message=="Now You Are Active Employee") {
        req.flash("active", `Your Account is Activated!`);
        res.redirect("/");
      }
    })
    .catch(function (response) {
      console.log(response);
    });
};
module.exports = userController;
