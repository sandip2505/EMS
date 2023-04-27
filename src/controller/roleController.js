var helpers = require("../helpers");
var rolehelper = require("../utilis_new/helper");

const roleController = {};

roleController.getRole = async (req, res) => {
  const token = req.cookies.jwt;
  helpers
    .axiosdata("get", "/api/roles", token)
    .then(async function (response) {
      sess = req.session;
      if (response.data.status == false) {
        res.redirect("/forbidden");
      } else {
        res.render("addRole", {
          username: sess.username,
          loggeduserdata: req.user,
         roleHasPermission : await helpers.getpermission(req.user),
          layout: false,
        });
      }
    })
    .catch(function (response) {
      //console.log(response);
    });
};

roleController.addRole = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    const addroledata = {
      role_name: req.body.role_name,
      role_description: req.body.role_description,
    };
    helpers
      .axiosdata("post", "/api/addRole", token, addroledata)
      .then(function (response) {
        sess = req.session;
        if (response.data.status == false) {
          res.redirect("/forbidden");
        } else {
          res.redirect("/roleListing");
        }
      })
      .catch(function (response) {
        //console.log(response);
      });
  } catch (e) {
    res.status(400).send(e);
  }
};

roleController.list = async (req, res) => {
  const token = req.cookies.jwt;
  helpers
    .axiosdata("get", "/api/roleListing", token)
    .then(function (response) {
      sess = req.session;
      if (response.data.status == false) {
        res.redirect("/forbidden");
      } else {
        rolehelper
          .checkPermission(req.user.role_id, req.user.user_id, "Add Role")
          .then((addPerm) => {
            rolehelper
              .checkPermission(
                req.user.role_id,
                req.user.user_id,
                "Update Role"
              )
              .then((updatePerm) => {
                rolehelper
                  .checkPermission(
                    req.user.role_id,
                    req.user.user_id,
                    "Delete Role"
                  )
                  .then((deletePerm) => {
                    rolehelper
                      .checkPermission(
                        req.user.role_id,
                        req.user.user_id,
                        "Add RolePermission"
                      )
                      .then(async(rolePerm) => {
                        res.render("roleListing", {
                          roleData: response.data.roleData,
                          success: req.flash("success"),
                          loggeduserdata: req.user,
                          users: sess.userData,
                          addStatus: addPerm.status,
                         roleHasPermission : await helpers.getpermission(req.user),
                          updateStatus: updatePerm.status,
                          deleteStatus: deletePerm.status,
                          rolePermissionStatus: rolePerm.status,
                        
                        });
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

roleController.editRole = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    const _id = req.params.id;
    helpers
      .axiosdata("get", "/api/editRole/" + _id, token)
      .then(async function (response) {
        sess = req.session;
        if (response.data.status == false) {
          res.redirect("/forbidden");
        } else {
          res.render("editRole", {
            roleData: response.data.roleData,
           roleHasPermission : await helpers.getpermission(req.user),
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

roleController.updateRole = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    const _id = req.params.id;
    const updateroledata = {
      role_name: req.body.role_name,
      role_description: req.body.role_description,
      updated_at: Date(),
    };
    helpers
      .axiosdata("post", "/api/editRole/" + _id, token, updateroledata)
      .then(function (response) {
        sess = req.session;
        if (response.data.status == false) {
          res.redirect("/forbidden");
        } else {
          res.redirect("/roleListing");
        }
      })
      .catch(function (response) {});
  } catch (e) {
    res.status(400).send(e);
  }
};

roleController.deleteRole = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    const _id = req.params.id;
    helpers
      .axiosdata("post", "/api/deleteRole/" + _id, token)
      .then(function (response) {
        //console.log(response)
        sess = req.session;
        if (response.data.status == false) {
          res.redirect("/forbidden");
        } else {
          if (response.data.deleteStatus == false) {
            req.flash(
              "success",
              `this role is already assigned to user so you can't delete this role`
            );
            res.redirect("/roleListing");
          } else {
            res.redirect("/roleListing");
          }
        }
      })

      .catch(function (response) {});
  } catch (e) {
    res.status(400).send(e);
  }
};

module.exports = roleController;
