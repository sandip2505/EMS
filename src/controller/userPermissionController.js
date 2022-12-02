const getPermission = require("../model/addpermissions");
const user = require("../model/user");
const rolepermisssion = require("../model/rolePermission")
const userP = require("../model/userPermission");
const axios = require("axios");
var helpers = require("../helpers");


const userPermisssionController = {}

userPermisssionController.getUserPermission = async (req, res) => {

  try {
    const token = req.cookies.jwt;
    const _id = req.params.id;
    helpers
      .axiosdata("get", "/api/userpermissions/" + _id, token)
      .then(function (response) {
        sess = req.session;
        res.render("userPermission", {
          data: response.data.permission,
          rol: response.data.roledatas,
          roledata: response.data.roleData,
          permissionData: response.data.permissions,
          roles: response.data.roleId,
          datas: response.data.roles,
          username: sess.username,
          users: sess.userData,
        });
      })
      .catch(function (response) { });
  } catch (e) {
    res.status(400).send(e);
  }


}


userPermisssionController.addUserPermission = async (req, res) => {
  try {

    const _id = req.params.id
    const token = req.cookies.jwt;
    const adduserpermissiondata = {
      user_id: req.body.user_id,
      role_id: req.body.role_id,
      permission_id: req.body.permission_id,
    };
    helpers
      .axiosdata("post", "/api/userpermissions/" + _id, token, adduserpermissiondata)
      .then(function (response) {
        res.redirect("/userListing");
      })
      .catch(function (response) {
        console.log(response);
      });
  } catch (e) {
    res.status(400).send(e);
  }

}


module.exports = userPermisssionController;