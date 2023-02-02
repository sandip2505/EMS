const holidayController = {};
var helpers = require("../helpers");
var rolehelper = require("../utilis_new/helper");

const rolePermissions = require("../model/rolePermission");
const Permission = require("../model/addpermissions");
const Holiday = require("../model/holiday");
require("dotenv").config();

holidayController.list = (req, res) => {
  token = req.cookies.jwt;
  helpers
    .axiosdata("get", "/api/holidayListing", token)
    .then(async function (response) {
      sess = req.session;
      if (response.data.status == false) {
        res.redirect("/forbidden");
      } else {
        rolehelper
          .checkPermission(req.user.role_id, req.user.user_id, "Add Holiday")
          .then((addPerm) => {
            rolehelper
              .checkPermission(
                req.user.role_id,
                req.user.user_id,
                "Update Holiday"
              )
              .then((updatePerm) => {
                rolehelper
                  .checkPermission(
                    req.user.role_id,
                    req.user.user_id,
                    "Delete Holiday"
                  )
                  .then((deletePerm) => {
                    res.render("holidayListing", {
                      holidayData: response.data.holidayData,
                      loggeduserdata: req.user,
                      users: sess.userData,
                      addStatus: addPerm.status,
                      updateStatus: updatePerm.status,
                      deleteStatus: deletePerm.status,
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

holidayController.getHoliday = async (req, res) => {
  sess = req.session;
  token = req.cookies.jwt;

  helpers
    .axiosdata("get", "/api/addHoliday", token)
    .then(function (response) {
      sess = req.session;
      if (response.data.status == false) {
        res.redirect("/forbidden");
      } else {
        res.render("addHoliday", {
          username: sess.username,
          loggeduserdata: req.user,
        });
      }
    })
    .catch(function (response) {
      console.log(response);
    });
};

holidayController.addHoliday = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    const AddHolidaydata = {
      holiday_name: req.body.holiday_name,
      holiday_date: req.body.holiday_date,
    };
    helpers
      .axiosdata("post", "/api/addHoliday", token, AddHolidaydata)
      .then(function (response) {
        res.redirect("/holidayListing");
      })
      .catch(function (response) {
        console.log(response);
      });
  } catch (e) {
    res.status(400).send(e);
  }
};

holidayController.editHoliday = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    const _id = req.params.id;
    helpers
      .axiosdata("get", "/api/editHoliday/" + _id, token)
      .then(function (response) {
        sess = req.session;
        if (response.data.status == false) {
          res.redirect("/forbidden");
        } else {
          res.render("editHoliday", {
            holidayData: response.data.holidayData,
            loggeduserdata: req.user,
            users: sess.userData,
          });
        }
      })
      .catch(function (response) {});
  } catch (e) {
    res.status(400).send(e);
  }
};

holidayController.updateHoliday = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    const _id = req.params.id;
    const updateHolidaydata = {
      holiday_name: req.body.holiday_name,
      holiday_date: req.body.holiday_date,
      updated_at: Date(),
    };
    helpers
      .axiosdata("post", "/api/editHoliday/" + _id, token, updateHolidaydata)
      .then(function (response) {
        res.redirect("/holidayListing");
      })
      .catch(function (response) {});
  } catch (e) {
    res.status(400).send(e);
  }
};

holidayController.deleteHoliday = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    const _id = req.params.id;
    helpers
      .axiosdata("post", "/api/deleteHoliday/" + _id, token)
      .then(function (response) {
        if (response.data.status == false) {
          res.redirect("/forbidden");
        } else {
          res.redirect("/holidayListing");
        }
      })
      .catch(function (response) {});
  } catch (e) {
    res.status(400).send(e);
  }
};

module.exports = holidayController;
