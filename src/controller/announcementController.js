const announcementController = {};
require("dotenv").config();
var helpers = require("../helpers");
var rolehelper = require("../utilis_new/helper"); 
announcementController.list = (req, res) => {
  token = req.cookies.jwt;
  helpers
    .axiosdata("get", "/api/announcementListing", token)
    .then(async function (response) {
      sess = req.session;



      if (response.data.status == false) {
        res.redirect("/forbidden");
      }else{
        rolehelper
          .checkPermission(req.user.role_id, req.user.user_id, "Add Announcement")
          .then((addPerm) => {
            rolehelper
              .checkPermission(
                req.user.role_id,
                req.user.user_id,
                "Update Announcement"
              )
              .then((updatePerm) => {
                rolehelper
                  .checkPermission(
                    req.user.role_id,
                    req.user.user_id,
                    "Delete Announcement"
                  )
                  .then(async(deletePerm) => {
                    res.render("announcementListing", {
                      announcementData: response.data.announcementData,
                      loggeduserdata: req.user,
                       roleHasPermission : await helpers.getpermission(req.user),
                       addStatus: addPerm.status,
                       updateStatus: updatePerm.status,
                       deleteStatus: deletePerm.status,
                      users: sess.userData,
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
         roleHasPermission : await helpers.getpermission(req.user),
          loggeduserdata: req.user,
          
        });
      }
    })
    .catch(function (response) {
      //console.log(response);
    });
};

announcementController.AddAnnouncement= async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    const AddAnnouncementdata = {
      title: req.body.title,
     roleHasPermission : await helpers.getpermission(req.user),
      description: req.body.description,
      date: req.body.date,
    };
    helpers
      .axiosdata("post", "/api/addAnnouncement", token, AddAnnouncementdata)
      .then(function (response) {
        res.redirect("/announcementListing");
      })
      .catch(function (response) {
        //console.log(response);
      });
  } catch (e) {
    res.status(400).send(e);
  }
};
announcementController.viewAnnouncement= async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
      const announcement_id = req.params.announcement_id  
      //  //console.log(announcement_id)
    helpers
      .axiosdata("post", "/api/statusAnnouncements/"+ announcement_id, token)
      .then(function (response) {
        res.redirect("/announcementListing");
      })
      .catch(function (response) {
        //console.log(response);
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

announcementController.deleteAnnouncement= async (req, res) => {
  try {
    const token = req.cookies.jwt;
    const _id = req.params.id;
    helpers
      .axiosdata("post", "/api/deleteAnnouncement/" + _id, token)
      .then(function (response) {
        if (response.data.status == false) {
          res.redirect("/forbidden");
        } else {
          res.redirect("/announcementListing");
        }
      })
      .catch(function (response) {});
  } catch (e) {
    res.status(400).send(e);
  }
};

module.exports = announcementController;
