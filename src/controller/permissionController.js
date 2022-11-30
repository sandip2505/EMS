const axios = require("axios");
require("dotenv").config();


const permissionController = {};

permissionController.permissions = (req, res) => {
  sess = req.session;
  res.render("addpermissions", { username: sess.username, layout: false });
};

permissionController.addpermissions = async (req, res) => {
  try {
    axios
      .post(process.env.BASE_URL+ "/newpermissions/", {
        permission_name: req.body.permission_name,
        permission_description: req.body.permission_description,
      })
      .then(function (response) {
        res.redirect("/viewpermissions");
      })
      .catch(function (response) {
        console.log(response);
      });
  } catch (e) {

  }
};

permissionController.viewpermissions = async (req, res) => {
  try{
  axios({
    method: "get",
    url: process.env.BASE_URL+ "/permissions/",
  })
    .then(function (response) {
      sess = req.session;
      res.render("permissionsListing", {
        permissionData: response.data.permissionsData,
        username: sess.username,
        users: sess.userData,
      });
    })
    .catch(function (response) {
      console.log(response);
    });
  }catch(e){
    
  }
};

permissionController.editpermissions = async (req, res) => {
  const _id = req.params.id;
  axios({
    method: "get",
    url: process.env.BASE_URL+ "/permissionsedit/" + _id,
  })
    .then(function (response) {
      sess = req.session;
      res.render("editpermission", {
        permissionData: response.data.permissionData,
        username: sess.username,
        users: sess.userData,
      });
    })
    .catch(function (response) {});
};

permissionController.updatepermission = async (req, res) => {
 try{
  const _id = req.params.id;
  axios({
    method: "post",
    url: process.env.BASE_URL+ "permissionsedit/" + _id,
    data: {
      permission_name: req.body.permission_name,
      permission_description: req.body.permission_description,
      updated_at: Date(),
    },
  })
    .then(function (response) {
      res.redirect("/viewpermissions");
    })
    .catch(function (response) {});
  }catch(e){

  }
};

permissionController.deletepermissions = async (req, res) => {  
try{
  const _id = req.params.id;
  axios({
    method: "post",
    url: process.env.BASE_URL+ "/permissionsdelete/" + _id,
  })
    .then(function (response) {
      sess = req.session;
      res.redirect("/viewpermissions");
    })
    .catch(function (response) {});
  }catch(e){
    
  }
  };

module.exports = permissionController;
