var helpers = require("../helpers");

const userPermisssionController = {};

userPermisssionController.getUserPermission = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    const _id = req.params.id;
    helpers
      .axiosdata("get", "/api/userPermission/" + _id, token)
      .then(async function (response) {
        sess = req.session;
        if (response.data.status == false) {
          res.redirect("/forbidden");
        } else {
          res.render("userPermission", {
            allPermmission: response.data.allPermmission,
            role: response.data.roledatas,
            roledata: response.data.roleData,
            userHaspermissions: response.data.userHaspermissions,
            roles: response.data.roleId,
            roleHasPermissions: response.data.roleHasPermissions,
            userPermissiondata: response.data.userPermissiondata,
            loggeduserdata: req.user,
            users: sess.userData,
            succUser: req.flash("succUser"),
          });
        }
      })
      .catch(function (response) {});
  } catch (e) {
    res.status(400).send(e);
  }
};

userPermisssionController.addUserPermission = async (req, res) => {
  try {
    const _id = req.params.id;
    const token = req.cookies.jwt;
    const adduserpermissiondata = {
      user_id: req.body.user_id,
      role_id: req.body.role_id,
      permission_id: req.body.permission_id,
    };
    helpers
      .axiosdata(
        "post",
        "/api/userPermission/" + _id,
        token,
        adduserpermissiondata
      )
      .then(function (response) {
        if (response.data.status == false) {
          res.redirect("/forbidden");
        } else {
          // res.redirect("/userListing");
          req.flash("succUser", `User Permission Updated Successfully`);
          res.redirect(`/userpermission/${_id}`);
        }
      })
      .catch(function (response) {
        console.log(response);
      });
  } catch (e) {
    res.status(400).send(e);
  }
};

module.exports = userPermisssionController;
