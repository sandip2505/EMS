const announcementController = {};
require("dotenv").config();
var helpers = require("../helpers");
announcementController.list = (req, res) => {
  token = req.cookies.jwt;
  helpers
    .axiosdata("get", "/api/announcementListing", token)
    .then(async function (response) {
      sess = req.session;
      if (response.data.status == false) {
        res.redirect("/forbidden");
      } else {
        res.render("announcementListing", {
             roleHasPermission: sess.permissionName,
          announcementData: response.data.announcementData,
          loggeduserdata: req.user,
          users: sess.userData,
        });
      }
    })
    .catch(function (response) {
      console.log(response);
    });
};

announcementController.getAddAnnouncement = async (req, res) => {
  sess = req.session;
  token = req.cookies.jwt;
  helpers
    .axiosdata("get", "/api/addAnnouncement", token)
    .then(async function (response) {
      sess = req.session;
      if (response.data.status == false) {
        res.redirect("/forbidden");
      } else {
        res.render("addAnnouncement", {
          username: sess.username,
          loggeduserdata: req.user,
             roleHasPermission: sess.permissionName,
        });
      }
    })
    .catch(function (response) {
      console.log(response);
    });
};

announcementController.AddAnnouncement= async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    const AddAnnouncementdata = {
      title: req.body.title,
      description: req.body.description,
      date: req.body.date,
    };
    helpers
      .axiosdata("post", "/api/addAnnouncement", token, AddAnnouncementdata)
      .then(function (response) {
        res.redirect("/announcementListing");
      })
      .catch(function (response) {
        console.log(response);
      });
  } catch (e) {
    res.status(400).send(e);
  }
};

// announcementController.editHoliday = async (req, res) => {
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

// announcementController.updateHoliday = async (req, res) => {
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

// announcementController.deleteHoliday = async (req, res) => {
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

module.exports = announcementController;
