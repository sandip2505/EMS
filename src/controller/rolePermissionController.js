const axios = require("axios")
var helpers = require("../helpers");

const rolePermissionController = {}

rolePermissionController.getpermission = async (req, res) => {
  try{
  const _id = req.params.id;
  const token = req.cookies.jwt;
  helpers
  .axiosdata("get","/api/rolepermission/"+_id,token)
    .then(function (response) {
      sess = req.session;
      res.render("role_permission", { permissionData: response.data.permission, username: sess.username, roleData: response.data.roles, roledata: response.data.roleData, layout: false });
    })
    .catch(function (response) {
      console.log(response);
    });
  }catch(e){
    res.status(400).send(e);
  }

}

rolePermissionController.addpermission = async (req, res) => {
  try{
  const _id = req.params.id;
  const token = req.cookies.jwt;
  const addRolePermissionData={
    role_id: req.body.role_id,
    permission_id: req.body.permission_id,
  }

  helpers
  .axiosdata("post","/api/rolepermission/"+_id,token,addRolePermissionData).then(function (response) {
    res.redirect("/roleListing");
  })
    .catch(function (response) {

    });
  }catch(e){
    res.status(400).send(e);
  }
};



module.exports = rolePermissionController;