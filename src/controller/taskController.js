const project = require("../model/createProject");
const Task = require("../model/createTask");
const axios = require("axios");
const BSON = require("bson");
var helpers = require("../helpers");
var rolehelper = require("../utilis_new/helper");

require("dotenv").config();

const taskController = {};

taskController.createtask = async (req, res) => {
  token = req.cookies.jwt;
  sess = req.session;

  helpers
    .axiosdata("get", "/api/addtask", token)
    .then(async function (response) {
      sess = req.session;
      if (response.data.status == false) {
        res.redirect("/forbidden");
      } else {
        // //console.log("response",response)
        res.render("createTask", {
         roleHasPermission : await helpers.getpermission(req.user),
         projectData: response.data.projectData,
         adminProjectData:response.data.adminProjectData,
         users: sess.userData,
        loggeduserdata: req.user,
        });
      }
    })
    .catch(function (response) {
      //console.log(response);
    });
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
      .axiosdata("post", "/api/addtask", token, Addtaskdata)
      .then(function (response) {
        res.redirect("/taskListing");
      })
      .catch(function (response) {
        //console.log(response);
      });
  } catch (e) {
    res.status(400).send(e);
  }
};

taskController.taskListing = async (req, res) => {
  token = req.cookies.jwt;
 
  helpers
    .axiosdata("get", "/api/taskListing", token)
    .then(function (response) {
      sess = req.session;
      if (response.data.status == false) {
        res.redirect("/forbidden");
      } else {
        rolehelper
          .checkPermission(req.user.role_id, req.user.user_id, "Add Task")
          .then((addPerm) => {
            rolehelper
              .checkPermission(
                req.user.role_id,
                req.user.user_id,
                "Update Task"
              )
              .then((updatePerm) => {
                rolehelper
                  .checkPermission(
                    req.user.role_id,
                    req.user.user_id,
                    "Delete Task"
                  )
                  .then(async(deletePerm) => {
                    res.render("taskListing", {
                     roleHasPermission : await helpers.getpermission(req.user),
                      taskData: response.data.tasks,
                      userData:response.data.userData,
                      projectData:response.data.projectData,
                      adminTaskdata: response.data.adminTaskdata,
                      loggeduserdata: req.user,
                      users: sess.userData,
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
taskController.editTask = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    const _id = req.params.id;
    helpers
      .axiosdata("get", "/api/editTask/" + _id, token)
      .then(async function (response) {
        sess = req.session;
        if (response.data.status == false) {
          res.redirect("/forbidden");
        } else {
          res.render("editask", {
           roleHasPermission : await helpers.getpermission(req.user),
            taskData: response.data.tasks,
            adminTaskdata: response.data.adminTaskdata,
            adminProjectData: response.data.adminProjectData,
            projectData: response.data.projectData,
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
      .axiosdata("post", "/api/editTask/" + _id, token, updateTaskdata)
      .then(function (response) {
        res.redirect("/taskListing");
      })
      .catch(function (response) {});
  } catch (e) {
    res.status(400).send(e);
  }
};
taskController.task_status_update = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    const _id = req.params.id;
    helpers
      .axiosdata("post", "/api/task_status_update/" + _id, token)
      .then(function (response) {
        res.redirect("/taskListing");
      })
      .catch(function (response) {});
  } catch (e) {
    res.status(400).send(e);
  }
};

// taskController.getUserByProject = async (req, res) => {
//   const _id = new BSON.ObjectId(req.params.id);
//   try {
//     const tasks = await project.aggregate([
//       { $match: { _id: _id } },
//       {
//         $lookup: {
//           from: "users",
//           localField: "user_id",
//           foreignField: "_id",
//           as: "userData",
//         },
//       },
//     ]);
//     return res.status(200).json({ tasks });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

taskController.deletetask = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    const _id = req.params.id;
    helpers
      .axiosdata("post", "/api/deleteTask/" + _id, token)
      .then(function (response) {
        if (response.data.status == false) {
          res.redirect("/forbidden");
        } else {
          res.redirect("/taskListing");
        }
      })

      .catch(function (response) {});
  } catch (e) {
    res.status(400).send(e);
  }
};

module.exports = taskController;
