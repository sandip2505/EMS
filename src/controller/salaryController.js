const salaryController = {};
require("dotenv").config();

var helpers = require("../helpers");
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

salaryController.getAddSalary = async (req, res) => {
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
          userData:response.data.userData,
          leaves: await helpers.getSettingData("leaves"),
          roleHasPermission : "View Holiday",
          holidayData:response.data.holidayData,
          username: sess.username,
          loggeduserdata: req.user,
        });
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
