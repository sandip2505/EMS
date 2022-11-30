const Project = require("../model/createProject");
const user = require("../model/user");
const technology = require("../model/technology");
const axios = require("axios");
require("dotenv").config();

const projectController = {};

projectController.getProject = async (req, res) => {
  sess = req.session;
  const UserData = await user.find();
  const TechnologyData = await technology.find();
  res.render("createProject", {
    userdata: UserData,
    TechnologyData: TechnologyData,
    username: sess.username,
    layout: false,
  });
};

projectController.addProject = async (req, res) => {
  try {
    axios
      .post(process.env.BASE_URL + "/projectsadd", {
        title: req.body.title,
        short_description: req.body.short_description,
        start_date: req.body.start_date,
        end_date: req.body.end_date,
        status: req.body.status,
        technology: req.body.technology,
        project_type: req.body.project_type,
        user_id: req.body.user_id,
      })
      .then(function (response) {
        res.redirect("/projectslisting");
      })
      .catch(function (response) {
        console.log(response);
      });
  } catch (e) {
    res.status(400).send(e);
  }
};

projectController.projectslisting = async (req, res) => {
  try {
    axios({
      method: "get",
      url: process.env.BASE_URL + "/projects",
    })
      .then(function (response) {
        sess = req.session;
        res.render("projectslisting", {
          projectsData: response.data.Projects,
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

projectController.editProject = async (req, res) => {
  try {
    const _id = req.params.id;
    axios({
      method: "get",
      url: process.env.BASE_URL + "/projectEdit/" + _id,
    })
      .then(function (response) {
        sess = req.session;
        res.render("editProject", {
          projectData: response.data.ProjectData,
          userData: response.data.UserData,
          technologyData: response.data.technologyData,
          username: sess.username,
          users: sess.userData,
        });
      })
      .catch(function (response) {});
  } catch (e) {
    res.status(400).send(e);
  }
};

projectController.updateProject = async (req, res) => {
  try {
    const _id = req.params.id;
    axios({
      method: "post",
      url: process.env.BASE_URL + "/projectEdit/" + _id,
      data: {
        title: req.body.title,
        short_description: req.body.short_description,
        start_date: req.body.start_date,
        end_date: req.body.end_date,
        status: req.body.status,
        technology: req.body.technology,
        project_type: req.body.project_type,
        user_id: req.body.user_id,
        updated_at: Date(),
      },
    })
      .then(function (response) {
        res.redirect("/projectslisting");
      })
      .catch(function (response) {});
  } catch (e) {
    res.status(400).send(e);
  }
};

projectController.deleteproject = async (req, res) => {
  try {
    const _id = req.params.id;
    axios({
      method: "post",
      url: process.env.BASE_URL + "/projectdelete/" + _id,
    })
      .then(function (response) {
        sess = req.session;
        res.redirect("/projectslisting");
      })
      .catch(function (response) {});
  } catch (e) {
    res.status(400).send(e);
  }
};

module.exports = projectController;
