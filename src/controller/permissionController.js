var helpers = require("../helpers");
var rolehelper = require("../utilis_new/helper");

require("dotenv").config();

const permissionController = {};

permissionController.permissions = (req, res) => {
  const token = req.cookies.jwt;
  helpers
    .axiosdata("get", "/api/addpermissions", token)
    .then(async function (response) {
      sess = req.session;
      if (response.data.status == false) {
        res.redirect("/forbidden");
      } else {
        res.render("addpermissions", {
          username: sess.username,
          loggeduserdata: req.user,
          layout: false,
          roleHasPermission : await helpers.getpermission(req.user),
        });
      }
    })
    .catch(function (response) {
      console.log(response);
    });
};

permissionController.addpermissions = async (req, res) => {
  const token = req.cookies.jwt;
  const addPermissionData = {
    permission_name: req.body.permission_name,
    permission_description: req.body.permission_description,
  };
  helpers
    .axiosdata("post", "/api/addpermissions", token, addPermissionData)
    .then(function (response) {
      res.redirect("/viewpermissions");
    })
    .catch(function (response) {
      console.log(response);
    });
};

permissionController.viewpermissions = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    helpers
      .axiosdata("get", "/api/viewpermissions", token)
      .then(function (response) {
        sess = req.session;
        if (response.data.status == false) {
          res.redirect("/forbidden");
        } else {
          rolehelper
            .checkPermission(
              req.user.role_id,
              req.user.user_id,
              "Add Permission"
            )
            .then((addPerm) => {
              rolehelper
                .checkPermission(
                  req.user.role_id,
                  req.user.user_id,
                  "Update Permission"
                )
                .then((updatePerm) => {
                  rolehelper
                    .checkPermission(
                      req.user.role_id,
                      req.user.user_id,
                      "Delete Permission"
                    )
                    .then(async(deletePerm) => {
                      res.render("permissionsListing", {
                        roleHasPermission : await helpers.getpermission(req.user),
                        permissionData: response.data.permissionsData,
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
        console.log(response);
      });
  } catch (e) {}
};
permissionController.searchPermissions = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    const data = {
      inputValue: req.body.inputValue,
    };
    helpers
      .axiosdata(
        "post",
        "/api/viewpermissions/" + req.body.inputValue,
        token,
        data
      )
      .then(async function (response) {
        sess = req.session;
        res.render("permissionsListing", {
          permissionData: response.data.searchData,
         roleHasPermission : await helpers.getpermission(req.user),
          loggeduserdata: req.user,
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


permissionController.editpermissions = async (req, res) => {
  const _id = req.params.id;
  const token = req.cookies.jwt;
  helpers
    .axiosdata("get", "/api/editpermissions/" + _id, token)
    .then(async function (response) {
      sess = req.session;
      if (response.data.status == false) {
        res.redirect("/forbidden");
      } else {
        res.render("editpermission", {
          permissionData: response.data.permissionData,
          loggeduserdata: req.user,
         roleHasPermission : await helpers.getpermission(req.user),
          users: sess.userData,
         
        });
      }
    })
    .catch(function (response) {});
};

permissionController.updatepermission = async (req, res) => {
  try {
    const _id = req.params.id;
    const token = req.cookies.jwt;
    const updateHolidayData = {
      permission_name: req.body.permission_name,
     roleHasPermission : await helpers.getpermission(req.user),
      permission_description: req.body.permission_description,
      updated_at: Date(),
    };
    helpers
      .axiosdata(
        "post",
        "/api/editpermissions/" + _id,
        token,
        updateHolidayData
      )
      .then(function (response) {
        res.redirect("/viewpermissions");
      })
      .catch(function (response) {});
  } catch (e) {}
};

permissionController.deletepermissions = async (req, res) => {
  try {
    const _id = req.params.id;
    const token = req.cookies.jwt;
    helpers
      .axiosdata("post", "/api/deletepermissions/" + _id, token)
      .then(function (response) {
        sess = req.session;
        if (response.data.status == false) {
          res.redirect("/forbidden");
        } else {
          res.redirect("/viewpermissions");
        }
      })
      .catch(function (response) {});
  } catch (e) {}
};

module.exports = permissionController;
