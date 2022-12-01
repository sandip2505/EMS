const Holiday = require("../model/holiday");
const holidayController = {};
const axios = require("axios");
require("dotenv").config();

holidayController.list = async (req, res) => {
  try {
    axios({
      method: "get",
      url: process.env.BASE_URL + "/holidaylist",
    })
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
  } catch (e) {
    res.status(400).send(e);
  }
};

holidayController.getHoliday = async (req, res) => {
  sess = req.session;

  res.render("addHoliday", { username: sess.username });
};

holidayController.addHoliday = async (req, res, next) => {
  try {
    axios
      .post(process.env.BASE_URL + "/HolidayAdd/", {
        holiday_name: req.body.holiday_name,
        holiday_date: req.body.holiday_date,
      })
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
    const _id = req.params.id;
    axios({
      method: "get",
      url: process.env.BASE_URL + "/Holidayedit/" + _id,
    })
      .then(function (response) {
        sess = req.session;
        res.render("editHoliday", {
          holidayData: response.data.holidayData,
          username: sess.username,
          users: sess.userData,
        });
      })
      .catch(function (response) { });
  } catch (e) {
    res.status(400).send(e);
  }
};

holidayController.updateHoliday = async (req, res) => {
  try {
    const _id = req.params.id;
    axios({
      method: "post",
      url: process.env.BASE_URL + "/Holidayedit/" + _id,
      data: {
        holiday_name: req.body.holiday_name,
        holiday_date: req.body.holiday_date,
        updated_at: Date(),
      },
    })
      .then(function (response) {
        res.redirect("/holidayListing");
      })
      .catch(function (response) { });
  } catch (e) {
    res.status(400).send(e);
  }
};

holidayController.deleteHoliday = async (req, res) => {
  try {
    const _id = req.params.id;
    axios({
      method: "post",
      url: process.env.BASE_URL + "/Holidaydelete/" + _id,
    })
      .then(function (response) {
        res.redirect("/holidayListing");
      })

      .catch(function (response) { });
  } catch (e) {
    res.status(400).send(e);
  }
};

module.exports = holidayController;
