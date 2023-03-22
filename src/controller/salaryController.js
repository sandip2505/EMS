const salaryController = {};
const salary = require("../model/salary");
const salarustructure = require("../model/salarystructure");
const salary_genrated = require("../model/sal_slip_genrated");
const user = require("../model/user");
const Holiday = require("../model/holiday");
const leaves = require("../model/leaves");
const setting = require("../model/settings");
const BSON = require("bson");
const pdf = require("html-pdf");
// const pdf = require('pdfkit');
const fs = require("fs");
var ejs = require("ejs");
const path = require("path");
const os = require('os');
const downloadPath = path.join(os.homedir(), 'Downloads', 'salary_slip.pdf');
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
//       console.log(response);
//     });
// };

salaryController.getAddSalaryStructure = async (req, res) => {
  sess = req.session;
  token = req.cookies.jwt;

  helpers
    .axiosdata("get", "/api/addSalary", token)
    .then(async function (response) {
      sess = req.session;
      if (response.data.status == false) {
        res.redirect("/forbidden");
      } else {
        res.render("addSalary", {
          userData: response.data.userData,
          salaryparticulars: response.data.salaryparticulars,
          leaves: await helpers.getSettingData("leaves"),
          roleHasPermission: await helpers.getpermission(req.user),
          holidayData: response.data.holidayData,
          username: sess.username,
          loggeduserdata: req.user,
        });
      }
    })
    .catch(function (response) {
      console.log(response);
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
      console.log(response);
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
        res.redirect("/salaryParticularListing");
      }
    })
    .catch(function (response) {
      console.log(response);
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
        res.render("Employee_salaryListing", {
          salaryData: response.data.salaryData,
          UserData: response.data.UserData,
          roleHasPermission: await helpers.getpermission(req.user),
          loggeduserdata: req.user,
          users: sess.userData,
        });
      }
    })
    .catch(function (response) {
      console.log(response);
    });
};

salaryController.genrateSalarySlip = async (req, res) => {
  const this_month = parseInt(req.params.month);
  const this_year = parseInt(req.params.year);
  const user_id = new BSON.ObjectId(req.params.id);
  const daysInMonth = getDaysInMonth(this_year, this_month);
  const sundaysInMonth = getSundaysInMonth(this_year, this_month);
  const holidayData = await Holiday.find({
    $expr: {
      $and: [
        {
          $eq: [
            {
              $month: "$holiday_date",
            },
            this_month,
          ],
        },
        {
          $eq: [
            {
              $year: "$holiday_date",
            },
            this_year,
          ],
        },
      ],
    },
  });
  const holidaysInMonth = holidayData.length;
  const WorkinDayOfTheMonth = daysInMonth - sundaysInMonth - holidaysInMonth;
  // console.log("WorkinDayOfTheMonth", WorkinDayOfTheMonth);
  // const LeavesData = await leaves.find({
  //   user_id: user_id,
  //   status: "APPROVED",
  // });
  // console.log(LeavesData);
  // let totalTakenLeaves = 0;
  // for (let i = 0; i < LeavesData.length; i++) {
  //   const startDate = new Date(LeavesData[i].datefrom);
  //   const endDate = new Date(LeavesData[i].dateto);
  //   const timeDiff = Math.abs(endDate.getTime() - startDate.getTime());
  //   const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24) + 1 );
  //   const oneDay = 24 * 60 * 60 * 1000
  //   let sundayCount = 0;
  //   for (let i = 0; i < diffDays; i++) {
  //       const currentDate = new Date(startDate.getTime() + (i * oneDay));
  //       if (currentDate.getDay() === 0) {
  //           sundayCount++;
  //       }
  //   }
  //    totalTakenLeaves += diffDays - sundayCount
    
  //    // totalTakenLeaves += diffDays;
  //    console.log(totalTakenLeaves)
  // }
  const SettingLeaveData = await setting.findOne({ key: "leaves" });
  const userLeavesData = await leaves.find({
    $expr: {
      $and: [
        {
          $or: [
            {
              $eq: [
                {
                  $month: "$datefrom",
                },
                this_month,
              ],
            },
            {
              $eq: [
                {
                  $year: "$datefrom",
                },
                this_year,
              ],
            },
          ],
        },
        {
          $or: [
            {
              $eq: [
                {
                  $month: "$dateto",
                },
                this_month,
              ],
            },
            {
              $eq: [
                {
                  $year: "$dateto",
                },
                this_year,
              ],
            },
          ],
        },
      ],
    },
    user_id: user_id,
    status: "APPROVED",
  });
  let leave = 0;
  var totaldate = [];
  userLeavesData.forEach(function (val) {
    const DF = new Date(val.datefrom);
    const DT = new Date(val.dateto);
    // match dates in April (4th month)
    console.log(DF)
    var days_difference = 0;

    for (let d = DF; d <= DT; d.setDate(d.getDate() + 1)) {
      // console.log(d)
      if (d.getMonth() + 1 === this_month) {
        days_difference += 1;
      }
    }

    if (days_difference > 0) {
      totaldate.push(days_difference);
    }
  });
  totaldate.forEach((item) => {
    leave += item;
  });
  const absentDaysInMonth = leave;
  const presentDaysInMonth = WorkinDayOfTheMonth - leave;
  function getSundaysInMonth(year, month) {
    const date = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0).getDate();
    let count = 0;
    for (let i = 1; i <= lastDay; i++) {
      date.setDate(i);
      if (date.getDay() === 0) {
        count++;
      }
    }
    return count;
  }
  function getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
  }
  const pipeline = [
    {
      $match: {
        _id: user_id,
      },
    },
    { $addFields: { roleId: { $toObjectId: "$role_id" } } },
    {
      $lookup: {
        from: "roles",
        localField: "roleId",
        foreignField: "_id",
        as: "role",
      },
    },
    {
      $addFields: {
        roleName: "$role.role_name",
      },
    },
  ];
  const userData = await user.aggregate(pipeline);
  const UserData = userData[0];
  const SettingAddressData = await setting.findOne({ key: "address" });
  const SalaryStructureData = await salarustructure.findOne({user_id: user_id,});

  
  // console.log(SalaryStructureData);
  var Balance_cf = await salary_genrated.findOne({month:this_month-1 ,user_id:user_id})
  // console.log("Balance_cf",Balance_cf)

  if(Balance_cf==null){
   var leave_balance = SettingLeaveData.value 
  }else{
    var salary_data = await salary_genrated.findOne({month:this_month-1 ,user_id:user_id})
    var leave_balance = salary_data.leave_balance_cf
  }


var balanceCF = leave_balance - absentDaysInMonth
if(balanceCF < 0){
  var LeaveWithoutPay = balanceCF
  console.log("LeaveWithoutPay",LeaveWithoutPay)
}else{
  var balanceCF = balanceCF
  console.log("balanceCF",balanceCF)
}

  // const leave_balance_cf = 

  var Balance_cf = await salary_genrated.findOne({month:this_month-1 ,user_id:user_id})
  if(Balance_cf == null){
   var leave_balance_cf = SettingLeaveData.value - absentDaysInMonth
  }else{
    var salary_data = await salary_genrated.findOne({month:this_month-1 ,user_id:user_id})
   var leave_balance_cf = salary_data.leave_balance_cf - absentDaysInMonth
   if(leave_balance_cf < 0){
   var balance_cf = 0
   }else{
   var balance_cf = salary_data.leave_balance_cf - absentDaysInMonth
   }
  }
  const html = await ejs.renderFile("src/views/partials/salary_slip.ejs", {
    salary: SalaryStructureData?SalaryStructureData:"no data found",
    user: UserData,
    month :this_month,
    year:this_year,
    LeaveWithoutPay:LeaveWithoutPay,
    balanceCF:balanceCF,
    leave_balance:leave_balance,
    absentDaysInMonth:absentDaysInMonth,
    settingLeaves: SettingLeaveData,
    settingAddress: SettingAddressData,
    daysInMonth: daysInMonth,
    WorkinDayOfTheMonth: WorkinDayOfTheMonth,
    presentDaysInMonth: presentDaysInMonth,
    absentDaysInMonth: absentDaysInMonth,
  });

  const timestamp = new Date().getTime();
  const downloadPath = path.join(os.homedir(), 'Downloads', `my-pdf-${timestamp}.pdf`);
  
  // Generate the PDF file from HTML and save it to disk
  pdf.create(html).toFile(downloadPath, async function(err, result) {
    if (err) {
      console.error(err);
      return res.status(500).send('Error generating PDF file');
    }
  
    // Send the file data in chunks to the client for download
    const file = fs.createReadStream(downloadPath);
    const stat = fs.statSync(downloadPath);
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=my-pdf.pdf');
    file.pipe(res);


       const Salary_slip_genrated = new salary_genrated({
        user_id:user_id,
        month:this_month,
        year:this_year,
        Basic_Salary:SalaryStructureData.Basic_Salary,
        House_Rent_Allow:SalaryStructureData.House_Rent_Allow,
        Other_Allownces:SalaryStructureData.Other_Allownces,
        Performance_Allownces:SalaryStructureData.Performance_Allownces,
        Bonus:SalaryStructureData.Bonus,
        Other:SalaryStructureData.Other,
        EL_Encash_Amount:SalaryStructureData.EL_Encash_Amount,
        Professional_Tax:SalaryStructureData.Professional_Tax,
        Income_Tax:SalaryStructureData.Income_Tax,
        Gratuity:SalaryStructureData.Gratuity,
        Provident_Fund:SalaryStructureData.Provident_Fund,
        ESIC:SalaryStructureData.ESIC,
        Other_Deduction:SalaryStructureData.Other_Deduction,
        leave_balance_cf:leave_balance_cf,
        file_path:"D:\projects\EMS1"
      });
      
       const salarystructureadd = await Salary_slip_genrated.save();
      console.log("PDF genrated successfully.");
      // res.redirect("/salaryListing");
    });
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
      console.log(response);
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
        res.render("salaryStructureListing", {
          salaryStructureData: response.data.salaryStructureData,
          userData: response.data.userData,
          roleHasPermission: await helpers.getpermission(req.user),
          loggeduserdata: req.user,
          users: sess.userData,
        });
      }
    })
    .catch(function (response) {
      console.log(response);
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
      console.log(response);
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
//         console.log(response);
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

module.exports = salaryController;
