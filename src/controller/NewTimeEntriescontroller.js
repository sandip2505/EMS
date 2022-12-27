const NewTimeEntriesController = {};
var helpers = require("../helpers");
require("dotenv").config();
const project = require('../model/createProject')

NewTimeEntriesController.timeEntrieslisting = async (req, res) => {

    sess = req.session;
    token = req.cookies.jwt;
    helpers
    .axiosdata("get","/api/timeEntryListing",token)
    .then(function (response) {
      console.log("data",response.data);
      sess = req.session;
        res.render("NewtimeEntriesListing", { timeEntryData:response.data.timeEntryData, username: sess.username });
      })
      .catch(function (response) {
        console.log("response");
      });
  };

 
NewTimeEntriesController.AddtimeEntries = async (req, res) => {

    sess = req.session;
    token = req.cookies.jwt;
    helpers
    .axiosdata("get","/api/getTimeEntry",token)
    .then(function (response) {
      sess = req.session;
      if (response.data.status == false) {
        res.redirect("/forbidden")
      }else {
        res.render("AddtimeEntries", { projectData:response.data.projectData, username: sess.username });
      }
      })
      .catch(function (response) {
        console.log(response);
      });
  };

  NewTimeEntriesController.NewAddtimeEntries = async (req, res, next) => {
    try {
  
      const token = req.cookies.jwt;
      const data = {
        project_id: req.body.project_id,
        task_id: req.body.task_id,
        hours: req.body.hours,
        date: req.body.date,
      };
      helpers
        .axiosdata("post", "/api/addTimeEntry", token, data)
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

  module.exports = NewTimeEntriesController;