const Project = require("../model/createProject");
const user = require("../model/user");
const technology = require("../model/technology");
const axios = require("axios");
var helpers = require("../helpers");
require("dotenv").config();

const projectController = {};

projectController.getProject = async (req, res) => {
  token = req.cookies.jwt;

  helpers
    .axiosdata("get", "/api/projectsget", token)
    .then(function (response) {
      sess = req.session;
      if (response.data.status == false) {
        res.redirect("/forbidden")
      } else {
        res.render("createProject", {
          userdata: response.data.UserData,
          TechnologyData: response.data.TechnologyData,
      loggeduserdata: req.user,
          users: sess.userData,
        });
      }
    })
    .catch(function (response) {
      console.log(response);
    });
 
};

projectController.addProject = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    const addprojectdata = {
      title: req.body.title,
      short_description: req.body.short_description,
      start_date: req.body.start_date,
      end_date: req.body.end_date,
      status: req.body.status,
      technology: req.body.technology,
      project_type: req.body.project_type,
      user_id: req.body.user_id,
    };
    helpers
      .axiosdata("post", "/api/addProjects", token, addprojectdata)
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
  token = req.cookies.jwt;

  helpers
    .axiosdata("get", "/api/projectslisting", token)
    .then(function (response) {
      sess = req.session;
      if (response.data.status == false) {
        res.redirect("/forbidden")
      } else {
        console.log("data",response.data)
        res.render("projectslisting", {
          projectsData: response.data.projectData,
      loggeduserdata: req.user,
          users: sess.userData,
        });
      }
    })
    .catch(function (response) {
      console.log(response);
    });

};

projectController.editProject = async (req, res) => {

  try {
    const token = req.cookies.jwt;
    const _id = req.params.id;
    helpers
      .axiosdata("get", "/api/projectEdit/" + _id, token)
      .then(function (response) {
        sess = req.session;
        if (response.data.status == false) {
          res.redirect("/forbidden")
        } else {
          res.render("editProject", {
            projectData: response.data.ProjectData,
            userData: response.data.UserData,
            technologyData: response.data.technologyData,
        loggeduserdata: req.user,
            users: sess.userData,
          });
        }
      })
      .catch(function (response) { });
  } catch (e) {
    res.status(400).send(e);
  }

};

projectController.updateProject = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    const _id = req.params.id;
    const updateProjectdata = {
      title: req.body.title,
      short_description: req.body.short_description,
      start_date: req.body.start_date,
      end_date: req.body.end_date,
      status: req.body.status,
      technology: req.body.technology,
      project_type: req.body.project_type,
      user_id: req.body.user_id,
      updated_at: Date(),
    };
    helpers
      .axiosdata("post", "/api/projectEdit/" + _id, token, updateProjectdata)
      .then(function (response) {
        res.redirect("/projectslisting");
      })
      .catch(function (response) { });
  } catch (e) {
    res.status(400).send(e);
  }

};

projectController.deleteproject = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    const _id = req.params.id;
    helpers
      .axiosdata("post", "/api/projectdelete/" + _id, token)
      .then(function (response) {
        if (response.data.status == false) {
          res.redirect("/forbidden")
        } else {
          res.redirect("/projectslisting");
        }
      })

      .catch(function (response) { });
  } catch (e) {
    res.status(400).send(e);
  }


};

module.exports = projectController;
