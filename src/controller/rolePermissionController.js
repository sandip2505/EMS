const axios = require("axios")

const rolePermissionController = {}

rolePermissionController.getpermission = async (req, res) => {
  try{
  const _id = req.params.id;
  axios({
    method: "get",
    url: process.env.BASE_URL + "/rolepermissions/" + _id,
    data: {
      _id: req.params.id
    }
  })
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
  axios({
    method: "post",
    url: process.env.BASE_URL + "/rolepermissions/" + _id,
    data: {
      role_id: req.body.role_id,
      permission_id: req.body.permission_id,
    }
  }).then(function (response) {
    res.redirect("/roleListing");
  })
    .catch(function (response) {

    });
  }catch(e){
    res.status(400).send(e);
  }
};



module.exports = rolePermissionController;