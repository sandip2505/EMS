const project = require("../model/createProject");
const axios = require("axios");
const BSON = require("bson");
var helpers = require("../helpers");

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
  try {
    const token = req.cookies.jwt;
    const Addtaskdata = {
      project_id: req.body.project_id,
      user_id: req.body.user_id,
      title: req.body.title,
      short_description: req.body.short_description,
    };
    helpers
      .axiosdata("post", "/api/taskadd", token, Addtaskdata)
      .then(function (response) {
        res.redirect("/taskListing");
      })
      .catch(function (response) {
        console.log(response);
      });
  } catch (e) {
    res.status(400).send(e);
  }

};

taskController.taskListing = async (req, res) => {
  token = req.cookies.jwt;

  helpers
    .axiosdata("get", "/api/listTasks", token)
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

  try {
    const token = req.cookies.jwt;
    const _id = req.params.id;
    helpers
      .axiosdata("get", "/api/taskedit/" + _id, token)
      .then(function (response) {
        sess = req.session;
        res.render("editask", {
          taskData: response.data.tasks,
          projectData: response.data.projectData,
          username: sess.username,
          users: sess.userData,
        });
      })
      .catch(function (response) { });
  } catch (e) {
    res.status(400).send(e);
  }


};

taskController.updateTask = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    const _id = req.params.id;
    const updateTaskdata = {
      project_id: req.body.project_id,
      user_id: req.body.user_id,
      title: req.body.title,
      short_description: req.body.short_description,
      updated_at: Date(),
    };
    helpers
      .axiosdata("post", "/api/taskedit/" + _id, token, updateTaskdata)
      .then(function (response) {
        res.redirect("/taskListing");
      })
      .catch(function (response) { });
  } catch (e) {
    res.status(400).send(e);
  }

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
    const token = req.cookies.jwt;
    const _id = req.params.id;
    helpers
      .axiosdata("post", "/api/TaskDelete/" + _id, token)
      .then(function (response) {
        res.redirect("/taskListing");
      })

      .catch(function (response) { });
  } catch (e) {
    res.status(400).send(e);
  }

};

module.exports = taskController;
