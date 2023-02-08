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
const { log } = require("console");

const userController = {};

userController.login = (req, res) => {
  sess = req.session;
  res.render("login", {
    send: req.flash("send"),
    done: req.flash("done"),
    // message: req.flash('message')
    emailSuccess: req.flash("emailSuccess"),
    userFail: req.flash("userFail"),
    success: req.flash("success"),
    succPass: req.flash("succPass"),
    success: req.flash("success"),
    PendingUser: req.flash("PendingUser"),
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
      .then(async function (response) {
        // console.log("Sf",response.data)
        if (response.data.emailError == "Invalid email") {
          req.flash("success", `incorrect Email`);
          res.render("login", {
            send: req.flash("send"),
            done: req.flash("done"),
            userFail: req.flash("userFail"),
            succPass: req.flash("succPass"),
            success: req.flash("success"),
            emailSuccess: req.flash("emailSuccess"),
            PendingUser: req.flash("PendingUser"),
          });
        } else if (response.data.status == "Pending") {
          req.flash("PendingUser", `Pelease Active Your Account`);
          res.redirect("/");
        } else if (response.data.login_status == "login success") {
          sess = req.session;
          sess.userData = response.data.userData[0];

          var rolehaspermission = await rolepermission.find({
            role_id: sess.userData.role_id,
          });
          var permissions = await Permission.find({
            _id: rolehaspermission[0].permission_id,
          });
          var permissionName = [];
          permissions.forEach(function (allPermmission) {
            permissionName.push(allPermmission.permission_name);
          });
          var permissionName = ["view Holiday","View Employee"];
          // permissions.forEach(function (allPermmission) {
          //   permissionName.push(allPermmission.permission_name);
          // });

          sess.permissionName = permissionName;

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
            userFail: req.flash("userFail"),
            succPass: req.flash("succPass"),
            success: req.flash("success"),
            emailSuccess: req.flash("emailSuccess"),
            PendingUser: req.flash("PendingUser"),
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
            // console.log("addPerm",addPerm.status)
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
                        // console.log(deletePerm.status)
                        res.render("userListing", {
                       
                          data: response.data.userData,
                          loggeduserdata: req.user,
                          users: sess.userData[0],
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
    photo: img,
  };
  helpers
    .axiosdata("post", "/api/userphoto/" + _id, token, profileData)
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
      // console.log("ADas")
      sess = req.session;
      res.render("index", {
        pending: response.data.pending,
        taskUserData: response.data.taskUserData,
        projectUserData: response.data.projectUserData,
        referuserData: response.data.referuserData,
        InActiveUser: response.data.InActiveUser,
        activeUser: response.data.activeUser,
        pendingUser: response.data.pendingUser,
        leavesrequestData: response.data.leavesrequestData,
        projectcompletedUser: response.data.projectcompletedUser,
        projectinprogressUser: response.data.projectinprogressUser,
        projectholdUser: response.data.projectholdUser,
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
        loggeduserdata: req.user,
        allLeavesData: response.data.allLeavesData,
        dataholiday: response.data.dataholiday,
        settingData: response.data.settingData,
        announcementData: response.data.announcementData,
        users: sess.userData[0],
        role: sess.role,
        Permission : await helpers.getpermission(req.user)
      });  })

    .catch(function (response) {});
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
  const file = req.files.file.name;
  const filedata = req.files.file.data;
  fs.appendFile(file, filedata, function (err, result) {
    // console.log("err", err);
    // console.log("result", result);
    // console.log("Saved!");
    xlsxj(
      {
        input: file,
        output: "output.json",
      },
      function (err, result) {
        if (err) {
          console.error(err);
        } else {
          console.log(result);
          const userdataxlsx = UserModel.insertMany(result, (error, res) => {
            console.log("error", error);
            console.log("res", res);
            fs.unlink(file, function (err) {
              if (err) throw err;
              console.log("File deleted!");
            });
          });
        }
      }
    );
  });

  res.json("done");
};
// userController.activeuser = async (req, res) => {
//   helpers
//     .axiosdata(
//       "post",
//       "/api/activeuser/" + _id + "/" + tokenid,
//       token,
//       passswordData
//     )
//     .then(function (response) {
//       if (response.data.status == "please check confirm password") {
//         req.flash("confFail", `please check confirm password`);
//         res.redirect(`/change_pwd/${_id}/${tokenid}`);
//       } else if (response.data.status == "password updated") {
//         req.flash("succPass", `password updated`);
//         res.redirect("/");
//       }
//     })
//     .catch(function (response) {
//       console.log(response);
//     });
// };

module.exports = userController;
