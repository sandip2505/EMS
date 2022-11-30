const getPermission = require("../model/addpermissions");
const user = require("../model/user");
const rolepermisssion = require("../model/rolePermission")
const userP = require("../model/userPermission");
const axios = require("axios");


const userPermisssionController = {}

userPermisssionController.getUserPermission = async (req, res) => {
  const _id = req.params.id;


  axios({
    method: "get",
    url: process.env.BASE_URL + "/userpermissions/" + _id,
  })
    .then(function (response) {
      console.log("aman", response)
      sess = req.session;
      res.render("userPermission", { data: response.data.blogs, rol: response.data.roledatas, roledata: response.data.roleData, permissionData: response.data.permissions, roles: response.data.roleId, datas: response.data.roles, username: sess.username, layout: false });
    })
    .catch(function (response) {
      console.log(response);
    });

}


userPermisssionController.addUserPermission = async (req, res) => {
  const _id = req.params.id
  axios({
    method: "post",
    url: process.env.BASE_URL + "/userpermissions/" + _id,
    data: {
      user_id: req.body.user_id,
      role_id: req.body.role_id,
      permission_id: req.body.permission_id,
    }
  })
    .then(function (response) {
      res.redirect('/userListing')
    })
    .catch(function (response) {
      console.log(response);
    });

}


module.exports = userPermisssionController;