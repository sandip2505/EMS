
const Holiday = require("../model/holiday");
const holidayController = {};
const axios = require('axios');
const BSON = require('bson');

holidayController.list = async (req, res) => {
  axios({
    method: "get",
    url: "http://localhost:46000/holidaylist/",
  })


    .then(function (response) {
      sess = req.session;
      res.render("holidayListing", {
        data: response.data.blogs, username: sess.username, users: sess.userData,
      });
    })
    .catch(function (response) {
      console.log(response);
    });

}


holidayController.getHoliday = async (req, res) => {
  sess = req.session;

  res.render("addHoliday", { username: sess.username, });
};

holidayController.addHoliday = async (req, res, next) => {
  axios.post("http://localhost:46000/HolidayAdd/", {
    holiday_name: req.body.holiday_name,
    holiday_date: req.body.holiday_date
  }
  ).then(function (response) {
    res.redirect("/holidayListing")
  })
    .catch(function (response) {
      console.log(response);
    });

};


holidayController.editHoliday = async (req, res) => {
  const _id = req.params.id;
  axios({
    method: "get",
    url: "http://localhost:46000/Holidayedit/" + _id,
  })
    .then(function (response) {
      sess = req.session;
      res.render("editHoliday", {
        data: response.data, username: sess.username, users: sess.userData,
      });
    })
    .catch(function (response) {
    });
}



holidayController.updateHoliday = async (req, res) => {
  const _id = req.params.id;
  axios({
    method: "post",
    url: "http://localhost:46000/Holidayedit/" + _id,
    data: {
      holiday_name: req.body.holiday_name,
      holiday_date: req.body.holiday_date,
      updated_at: Date()
    }
  }).then(function (response) {
    res.redirect("/holidayListing");
  })
    .catch(function (response) {

    });
};



holidayController.deleteHoliday = async (req, res) => {

  const _id = req.params.id;
  axios({
    method: "post",
    url: "http://localhost:46000/Holidaydelete/" + _id,
  })
    .then(function (response) {
      res.redirect("/holidayListing");
    })

    .catch(function (response) {
    });
};


module.exports = holidayController;
