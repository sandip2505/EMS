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
          userdata: response.data.UserData,
         roleHasPermission : await helpers.getpermission(req.user),
          TechnologyData: response.data.TechnologyData,
          loggeduserdata: req.user,
          users: sess.userData,
        });
      }
    })
    .catch(function (response) {
      //console.log(response);
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
        //console.log(response);
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
                      Fail: req.flash("Fail"),
                      projectsData: response.data.projectData,
                      adminProjectData: response.data.adminProjectData,
                      userData:response.data.userData,
                      loggeduserdata: req.user,
                      users: sess.userData,
                      roleHasPermission : await helpers.getpermission(req.user),
                      addStatus: addPerm.status,
                      updateStatus: updatePerm.status,
                      deleteStatus: deletePerm.status,
                   
                    });
                  });
              });
          });
      }
    })
    .catch(function (response) {
      //console.log(response);
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
          
            projectData: response.data.ProjectData,
            userData: response.data.UserData,
            technologyData: response.data.TechnologyData,
            loggeduserdata: req.user,
           roleHasPermission : await helpers.getpermission(req.user),
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
          if (response.data.deleteStatus == false) {
            req.flash(
              "Fail",
              `this Project is already assigned to Task so you can't delete this Task`
            );
            res.redirect("/projectslisting");
          } else {
            res.redirect("/projectslisting");
          }


          res.redirect("/projectslisting");
        }
      })

      .catch(function (response) {});
  } catch (e) {
    res.status(400).send(e);
  }
};

module.exports = projectController;
