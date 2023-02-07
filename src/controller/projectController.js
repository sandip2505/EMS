var helpers = require("../helpers");
var rolehelper = require("../utilis_new/helper");

require("dotenv").config();

const projectController = {};

projectController.getProject = async (req, res) => {
  token = req.cookies.jwt;

  helpers
    .axiosdata("get", "/api/addProjects", token)
    .then(async function (response) {
      sess = req.session;
      if (response.data.status == false) {
        res.redirect("/forbidden");
      } else {
        res.render("createProject", {
             roleHasPermission : permissionName,
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
        res.redirect("/forbidden");
      } else {
        rolehelper
          .checkPermission(req.user.role_id, req.user.user_id, "Add Project")
          .then((addPerm) => {
            rolehelper
              .checkPermission(
                req.user.role_id,
                req.user.user_id,
                "Update Project"
              )
              .then((updatePerm) => {
                rolehelper
                  .checkPermission(
                    req.user.role_id,
                    req.user.user_id,
                    "Delete Project"
                  )
                  .then(async(deletePerm) => {
                    res.render("projectslisting", {
                      projectsData: response.data.projectData,
                      adminProjectData: response.data.adminProjectData,
                      loggeduserdata: req.user,
                      users: sess.userData,
                      addStatus: addPerm.status,
                      updateStatus: updatePerm.status,
                      deleteStatus: deletePerm.status,
                         roleHasPermission : permissionName,
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

projectController.editProject = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    const _id = req.params.id;
    helpers
      .axiosdata("get", "/api/editProject/" + _id, token)
      .then(async function (response) {
        sess = req.session;
        if (response.data.status == false) {
          res.redirect("/forbidden");
        } else {
          res.render("editProject", {
               roleHasPermission : permissionName,
            projectData: response.data.ProjectData,
            userData: response.data.UserData,
            technologyData: response.data.technologyData,
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
      .axiosdata("post", "/api/editProject/" + _id, token, updateProjectdata)
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
    const token = req.cookies.jwt;
    const _id = req.params.id;
    helpers
      .axiosdata("post", "/api/deleteProject/" + _id, token)
      .then(function (response) {
        if (response.data.status == false) {
          res.redirect("/forbidden");
        } else {
          res.redirect("/projectslisting");
        }
      })

      .catch(function (response) {});
  } catch (e) {
    res.status(400).send(e);
  }
};

module.exports = projectController;
