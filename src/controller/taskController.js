const project = require("../model/createProject");
const axios = require("axios");
const BSON = require("bson");
require("dotenv").config();

const taskController = {};

taskController.createtask = async (req, res) => {
  sess = req.session;
  try {
    axios({
      method: "get",
      url: process.env.BASE_URL + "/getAddTAsk/",
      data: {
        user_id: sess.userData._id,
      },
    })
      .then(function (response) {
        sess = req.session;
        res.render("createTask", {
          data: response.data.projectData,
          users: sess.userData,
          username: sess.username,
        });
      })
      .catch(function (response) {
        console.log(response);
      });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

taskController.addtask = async (req, res) => {
  axios
    .post(process.env.BASE_URL + "/taskadd/", {
      project_id: req.body.project_id,
      user_id: req.body.user_id,
      title: req.body.title,
      short_description: req.body.short_description,
    })
    .then(function (response) {
      res.redirect("/taskListing");
    })
    .catch(function (response) {
      console.log(response);
    });
};

taskController.taskListing = async (req, res) => {
  axios({
    method: "get",
    url: process.env.BASE_URL + "/listTasks/",
  })
    .then(function (response) {
      sess = req.session;
      res.render("taskListing", {
        taskData: response.data.tasks,
        username: sess.username,
        users: sess.userData,
      });
    })
    .catch(function (response) {
      console.log(response);
    });
};
taskController.editTask = async (req, res) => {
  const _id = req.params.id;
  axios({
    method: "get",
    url: process.env.BASE_URL + "/taskedit/" + _id,
  })
    .then(function (response) {
      sess = req.session;
      res.render("editask", {
        taskData: response.data.tasks,
        projectData: response.data.projectData,
        username: sess.username,
        users: sess.userData,
      });
    })
    .catch(function (response) {});
};

taskController.updateTask = async (req, res) => {
  const _id = req.params.id;
  axios({
    method: "post",
    url: process.env.BASE_URL + "/taskedit/" + _id,
    data: {
      project_id: req.body.project_id,
      user_id: req.body.user_id,
      title: req.body.title,
      short_description: req.body.short_description,
      updated_at: Date(),
    },
  })
    .then(function (response) {
      res.redirect("/taskListing");
    })
    .catch(function (response) {});
};

taskController.getUserByProject = async (req, res) => {
  const _id = new BSON.ObjectId(req.params.id);
  try {
    const tasks = await project.aggregate([
      { $match: { _id: _id } },
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "userData",
        },
      },
    ]);
    return res.status(200).json({ tasks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

taskController.deletetask = async (req, res) => {
  try {
    const _id = req.params.id;
    axios({
      method: "post",
      url: process.env.BASE_URL + "/TaskDelete/" + _id,
    })
      .then(function (response) {
        sess = req.session;
        res.redirect("/taskListing");
      })
      .catch(function (response) {});
  } catch (e) {
    res.status(400).send(e);
  }
};

module.exports = taskController;
