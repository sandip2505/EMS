const holidayController = {};
var helpers = require("../helpers");
require("dotenv").config();

holidayController.list = (req, res) => {
  token = req.cookies.jwt;

  helpers
    .axiosdata("get", "/api/holidaylist",token)
    .then(function (response) {
      sess = req.session;
      res.render("holidayListing", {
        holidayData: response.data.holidayData,
        username: sess.username,
        users: sess.userData,
      });
    })
    .catch(function (response) {
      console.log(response);
    });
};

holidayController.getHoliday = async (req, res) => {
  sess = req.session;

  res.render("addHoliday", { username: sess.username });
};

holidayController.addHoliday = async (req, res, next) => {
  try {
   const token = req.cookies.jwt;
    const data = {
      holiday_name: req.body.holiday_name,
      holiday_date: req.body.holiday_date,
    };
    helpers
      .axiosdata("post", "/api/HolidayAdd", token, data)
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
    .axiosdata("get","/api/holidayedit/"+_id,token)
      .then(function (response) {
        sess = req.session;
        res.render("editHoliday", {
          holidayData: response.data.holidayData,
          username: sess.username,
          users: sess.userData,
        });
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
    .axiosdata("post","/api/holidayedit/"+_id,token,updateHolidaydata)
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
    .axiosdata("post","/api/Holidaydelete/"+_id,token)
      .then(function (response) {
        res.redirect("/holidayListing");
      })
      .catch(function (response) {});
  } catch (e) {
    res.status(400).send(e);
  }
};

module.exports = holidayController;
