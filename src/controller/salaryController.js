const salaryController = {};
var rolehelper = require("../utilis_new/helper");
const salary = require("../model/salary");
const salarustructure = require("../model/salarystructure");
const salary_genrated = require("../model/sal_slip_genrated");
const user = require("../model/user");
const Holiday = require("../model/holiday");
const leaves = require("../model/leaves");
const setting = require("../model/settings");
const customer = require("../model/customer");
const invoice = require("../model/invoice");
const payment = require("../model/payment");
const project = require("../model/createProject");
const task = require("../model/createTask");
const timeEntries = require("../model/timeEntries");
const working_hour = require("../model/working_hour");
const BSON = require("bson");
const pdf = require("html-pdf");
// const pdf = require('pdfkit');
const fs = require("fs");
var ejs = require("ejs");
const path = require("path");
const os = require("os");
const downloadPath = path.join(os.homedir(), "Downloads", "salary_slip.pdf");
require("dotenv").config();
const https = require("https");

// function download(url) {
//   https.get(url, (response) => {
//     const fileStream = fs.createWriteStream(`/C://Users/Shree/Downloads/aman.pdf`);
//     response.pipe(fileStream);
//   });
// }

var helpers = require("../helpers");
const { log } = require("console");
// salaryController.list = (req, res) => {
//   token = req.cookies.jwt;
//   helpers
//     .axiosdata("get", "/api/announcementListing", token)
//     .then(function (response) {
//       sess = req.session;
//       if (response.data.status == false) {
//         res.redirect("/forbidden");
//       } else {
//         res.render("announcementListing", {
//           announcementData: response.data.announcementData,
//           loggeduserdata: req.user,
//           users: sess.userData,
//         });
//       }
//     })
//     .catch(function (response) {
//       //console.log(response);
//     });
// };

salaryController.getAddSalaryStructure = async (req, res) => {
  sess = req.session;
  token = req.cookies.jwt;

  helpers
    .axiosdata("get", "/api/addSalaryStructure", token)
    .then(async function (response) {
      sess = req.session;
      if (response.data.status == false) {
        res.redirect("/forbidden");
      } else {
        res.render("addSalaryStructure", {
          userData: response.data.userData,
          leaves: await helpers.getSettingData("leaves"),
          roleHasPermission: await helpers.getpermission(req.user),
          username: sess.username,
          loggeduserdata: req.user,
        });
      }
    })
    .catch(function (response) {
      //console.log(response);
    });
};
salaryController.editSalaryStructure = async (req, res) => {
  sess = req.session;
  token = req.cookies.jwt;
  const _id = req.params.id;
  helpers
    .axiosdata("get", "/api/editSalaryStructure/" + _id, token)
    .then(async function (response) {
      sess = req.session;
      if (response.data.status == false) {
        res.redirect("/forbidden");
      } else {
        res.render("editSalaryStructure", {
          userData: response.data.userData,
          existuserData: response.data.existuserData,
          salaryStructureData: response.data.salaryStructureData,
          leaves: await helpers.getSettingData("leaves"),
          roleHasPermission: await helpers.getpermission(req.user),
          username: sess.username,
          loggeduserdata: req.user,
        });
      }
    })
    .catch(function (response) {
      //console.log(response);
    });
};

salaryController.addSalaryStructure = async (req, res) => {
  token = req.cookies.jwt;
  sess = req.session;
  const salaryStructureData = {
    user_id: req.body.user_id,
    Basic_Salary: req.body.Basic_Salary,
    House_Rent_Allow: req.body.House_Rent_Allow,
    Other_Allownces: req.body.Other_Allownces,
    Performance_Allownces: req.body.Performance_Allownces,
    Bonus: req.body.Bonus,
    Other: req.body.Other,
    EL_Encash_Amount: req.body.EL_Encash_Amount,
    Professional_Tax: req.body.Professional_Tax,
    Income_Tax: req.body.Income_Tax,
    Gratuity: req.body.Gratuity,
    Provident_Fund: req.body.Provident_Fund,
    ESIC: req.body.ESIC,
    Total_Salary: req.body.Total_Salary,
    Gross_Salary: req.body.Gross_Salary,
    Total_Deduction: req.body.Total_Deduction,
    Net_Salary: req.body.Net_Salary,
    Other_Deduction: req.body.Other_Deduction,
    year: req.body.year,
  };
  helpers
    .axiosdata("post", "/api/addSalaryStructure", token, salaryStructureData)
    .then(async function (response) {
      sess = req.session;
      if (response.data.status == false) {
        res.redirect("/forbidden");
      } else {
        res.redirect("/salaryStructureListing");
      }
    })
    .catch(function (response) {
      //console.log(response);
    });
};
salaryController.salaryListing = async (req, res) => {
  token = req.cookies.jwt;
  helpers
    .axiosdata("get", "/api/salaryListing", token)
    .then(async function (response) {
      sess = req.session;
      if (response.data.status == false) {
        res.redirect("/forbidden");
      } else {
        rolehelper
          .checkPermission(req.user.role_id, req.user.user_id, "Add Role")
          .then((addPerm) => {
            rolehelper
              .checkPermission(
                req.user.role_id,
                req.user.user_id,
                "Update Role"
              )
              .then(async (updatePerm) => {
                rolehelper.checkPermission(
                  req.user.role_id,
                  req.user.user_id,
                  "Delete Role"
                );

                res.render("Employee_salaryListing", {
                  salaryData: response.data.salaryData,
                  UserData: response.data.UserData,
                  adminSalaryData:response.data.adminSalaryData,
                  roleHasPermission: await helpers.getpermission(req.user),
                  loggeduserdata: req.user,
                  users: sess.userData,
                  addStatus: addPerm.status,
                  updateStatus: updatePerm.status,
                });
              });
          });
      }
    })
    .catch(function (response) {
      //console.log(response);
    });
};
const axios = require("axios");
salaryController.genrateSalarySlip = async (req, res) => {
  const token = req.cookies.jwt;
  const _id = req.params.id;
  const month = parseInt(req.params.month);
  const year = parseInt(req.params.year);
  try {
    const response = await axios({
      method: "POST",
      url:
        process.env.BASE_URL +
        "/api/salary-slip/" +
        _id +
        "/" +
        month +
        "/" +
        year,
      headers: {
        "x-access-token": token,
      },
      responseType: "arraybuffer",
    });
    const buffer = Buffer.from(response.data);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${_id}-${month}-${year}.pdf`
    );
    res.send(buffer);
  } catch (error) {
    //console.log(error);
    res.status(500).send("Error generating PDF file");
  }
};
salaryController.sendSalarySlip = async (req, res) => {
  const token = req.cookies.jwt;
  const _id = req.params.id;
  const month = parseInt(req.params.month);
  const year = parseInt(req.params.year);
  try {
    const response = await axios({
      method: "POST",
      url:
        process.env.BASE_URL +
        "/api/send_salary-slip/" +
        _id +
        "/" +
        month +
        "/" +
        year,
      headers: {
        "x-access-token": token,
      },
    });
    // //console.log("response",response)
    res.redirect("/salaryListing");
  } catch (error) {
    //console.log(error);
    res.status(500).send("Error generating PDF file");
  }
};

salaryController.salaryparticulars = async (req, res) => {
  token = req.cookies.jwt;
  helpers
    .axiosdata("get", "/api/salaryParticularListing", token)
    .then(async function (response) {
      sess = req.session;
      if (response.data.status == false) {
        res.redirect("/forbidden");
      } else {
        res.render("salaryParticularListing", {
          salaryparticularData: response.data.salaryparticularData,
          roleHasPermission: await helpers.getpermission(req.user),
          loggeduserdata: req.user,
          users: sess.userData,
        });
      }
    })
    .catch(function (response) {
      //console.log(response);
    });
};
salaryController.salaryStructureListing = async (req, res) => {
  token = req.cookies.jwt;
  helpers
    .axiosdata("get", "/api/salaryStructureListing", token)
    .then(async function (response) {
      sess = req.session;
      if (response.data.status == false) {
        res.redirect("/forbidden");
      } else {
        rolehelper
          .checkPermission(
            req.user.role_id,
            req.user.user_id,
            "Add SalaryStructure"
          )
          .then((addPerm) => {
            rolehelper
              .checkPermission(
                req.user.role_id,
                req.user.user_id,
                "Update SalaryStructure"
              )
              .then(async (updatePerm) => {
                rolehelper.checkPermission(
                  req.user.role_id,
                  req.user.user_id,
                  "Delete Role"
                );
                res.render("salaryStructureListing", {
                  salaryStructureData: response.data.salaryStructureData,
                  userData: response.data.userData,
                  roleHasPermission: await helpers.getpermission(req.user),
                  loggeduserdata: req.user,
                  users: sess.userData,
                  addStatus: addPerm.status,
                  updateStatus: updatePerm.status,
                });
              });
          });
      }
    })
    .catch(function (response) {
      //console.log(response);
    });
};

salaryController.updateSalaryStructure = async (req, res) => {
  var token = req.cookies.jwt;
  sess = req.session;
  const _id = req.params.id;
  const updatedSalaryStructureData = {
    user_id: req.body.user_id,
    Basic_Salary: req.body.Basic_Salary,
    House_Rent_Allow: req.body.House_Rent_Allow,
    Other_Allownces: req.body.Other_Allownces,
    Performance_Allownces: req.body.Performance_Allownces,
    Bonus: req.body.Bonus,
    Other: req.body.Other,
    EL_Encash_Amount: req.body.EL_Encash_Amount,
    Professional_Tax: req.body.Professional_Tax,
    Income_Tax: req.body.Income_Tax,
    Gratuity: req.body.Gratuity,
    Provident_Fund: req.body.Provident_Fund,
    ESIC: req.body.ESIC,
    Total_Salary: req.body.Total_Salary,
    Gross_Salary: req.body.Gross_Salary,
    Total_Deduction: req.body.Total_Deduction,
    Net_Salary: req.body.Net_Salary,
    Other_Deduction: req.body.Other_Deduction,
    year: req.body.year,
  };
  helpers
    .axiosdata(
      "post",
      "/api/editSalaryStructure/" + _id,
      token,
      updatedSalaryStructureData
    )
    .then(async function (response) {
      sess = req.session;
      if (response.data.status == false) {
        res.redirect("/forbidden");
      } else {
        res.redirect("/salaryStructureListing");
      }
    })
    .catch(function (response) {
      //console.log(response);
    });
};

// salaryController.AddAnnouncement= async (req, res, next) => {
//   try {
//     const token = req.cookies.jwt;
//     const AddAnnouncementdata = {
//       title: req.body.title,
//       description: req.body.description,
//       date: req.body.date,
//     };
//     helpers
//       .axiosdata("post", "/api/addAnnouncement", token, AddAnnouncementdata)
//       .then(function (response) {
//         res.redirect("/announcementListing");
//       })
//       .catch(function (response) {
//         //console.log(response);
//       });
//   } catch (e) {
//     res.status(400).send(e);
//   }
// };

// salaryController.editHoliday = async (req, res) => {
//   try {
//     const token = req.cookies.jwt;
//     const _id = req.params.id;
//     helpers
//       .axiosdata("get", "/api/editHoliday/" + _id, token)
//       .then(function (response) {
//         sess = req.session;
//         if (response.data.status == false) {
//           res.redirect("/forbidden");
//         } else {
//           res.render("editHoliday", {
//             holidayData: response.data.holidayData,
//             loggeduserdata: req.user,
//             users: sess.userData,
//           });
//         }
//       })
//       .catch(function (response) {});
//   } catch (e) {
//     res.status(400).send(e);
//   }
// };

// salaryController.updateHoliday = async (req, res) => {
//   try {
//     const token = req.cookies.jwt;
//     const _id = req.params.id;
//     const updateHolidaydata = {
//       holiday_name: req.body.holiday_name,
//       holiday_date: req.body.holiday_date,
//       updated_at: Date(),
//     };
//     helpers
//       .axiosdata("post", "/api/editHoliday/" + _id, token, updateHolidaydata)
//       .then(function (response) {
//         res.redirect("/holidayListing");
//       })
//       .catch(function (response) {});
//   } catch (e) {
//     res.status(400).send(e);
//   }
// };

// salaryController.deleteHoliday = async (req, res) => {
//   try {
//     const token = req.cookies.jwt;
//     const _id = req.params.id;
//     helpers
//       .axiosdata("post", "/api/deleteHoliday/" + _id, token)
//       .then(function (response) {
//         if (response.data.status == false) {
//           res.redirect("/forbidden");
//         } else {
//           res.redirect("/holidayListing");
//         }
//       })
//       .catch(function (response) {});
//   } catch (e) {
//     res.status(400).send(e);
//   }
// };

salaryController.test = async (req, res) => {
  try {

   const paymentData = await payment.find();
   const invoiceData = await invoice.find();
   const customerData = await customer.find();
   const userData = await user.find();
   const projectData = await project.find();
   const taskData = await task.find();
   const timeEntriesData = await timeEntries.find();
   const working_hourData = await working_hour.find();
   const TestData={paymentData,invoiceData,customerData,userData,projectData,taskData,timeEntriesData,working_hourData};
   res.status(200).json({TestData});
    
  } catch (e) {
    res.status(400).send(e);
  }
}

module.exports = salaryController;
