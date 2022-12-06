const Project = require("../model/createProject");
const Task = require("../model/createTask");
const Hours = require("../model/timeEntries");
const axios = require('axios');
const BSON = require('bson');
require("dotenv").config();
var helpers = require("../helpers");



const timeEntryController = {}

timeEntryController.getData = async (req, res) => {

  token = req.cookies.jwt;
  const user_id = sess.userData._id
  const userdata = { user_id: user_id }


  helpers
    .axiosdata("get", "/api/getTimeEntry", token, userdata)

    .then(function (response) {
      sess = req.session;
      res.render("AddtimeEntries", {
        projectData: response.data.projectData,
        username: sess.username,
        users: sess.userData,
      });
    })
    .catch(function (response) {
      console.log(response);
    });

};


timeEntryController.getTaskByProject = async (req, res) => {
  const _id = new BSON.ObjectId(req.params.id);
  try {

    const tasks = await Task.aggregate([
      { $match: { project_id: _id } },
      {
        $lookup:
        {
          from: "projects",
          localField: "_id",
          foreignField: "task_id",
          as: "taskData"
        }
      }
    ]);
    return res.status(200).json({ tasks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

timeEntryController.AddtimeEntries = async (req, res) => {
  try {
    axios({
      method: "post",
      url: process.env.BASE_URL + "/addTimeEntry/",
      data: {
        project_id: req.body.project_id,
        task_id: req.body.task_id,
        hours: req.body.hours,
      }
    }).then(function (response) {
      res.status(201).redirect("/timeEntryListing");
    })
      .catch(function (response) {

      });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

timeEntryController.timeEntryList = async (req, res) => {
  sess = req.session;
  const user_id = sess.userData._id
  try {
    axios({
      method: "get",
      url: process.env.BASE_URL + "/timeEntryListing/",
      data:{
         user_id : sess.userData._id
      }
    }).then(function (response) {
      res.render("timeEntryListing", { data: response.data.timeEntryData,  projectData: response.data.projectData, users: sess.userData, username: sess.username });
    })
      .catch(function (response) {

      });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

timeEntryController.checkMonth = async (req, res) => {
  sess = req.session;
  const current_month = new Date().getMonth()
  new Date().getMonth()
  const month = req.body.month
  try {
    const Hoursdata = await Hours.aggregate([
      { $match: { deleted_at: "null" } },
      { $match: { month: month } },


      {

        $lookup:
        {
          from: "projects",
          localField: "project_id",
          foreignField: "_id",
          as: "test"
        },

      },
      {
        $lookup:
        {
          from: "tasks",
          localField: "task_id",
          foreignField: "_id",
          as: "test1"
        }
      }

    ]);
    return res.status(200).json({ Hoursdata });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = timeEntryController