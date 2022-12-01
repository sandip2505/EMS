const axios = require("axios");
var helpers = require("../helpers");
require("dotenv").config();

const permissionController = {};

permissionController.permissions = (req, res) => {
  sess = req.session;
  res.render("addpermissions", { username: sess.username, layout: false });
};

permissionController.addpermissions = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    const addPermissionData = {
      permission_name: req.body.permission_name,
      permission_description: req.body.permission_description,
    };
    helpers
      .axiosdata("post","/api/addpermissions", token, addPermissionData)
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
  try {
    const token = req.cookies.jwt;
    helpers
    .axiosdata("get","/api/viewpermissions",token)
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
  } catch (e) {}
};

permissionController.editpermissions = async (req, res) => {
  const _id = req.params.id;
  const token = req.cookies.jwt;
  helpers
  .axiosdata("get","/api/editpermissions/"+_id,token)
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
  try {
    const _id = req.params.id;
    const token = req.cookies.jwt;
    const updateHolidayData={
      permission_name: req.body.permission_name,
      permission_description: req.body.permission_description,
      updated_at: Date(),
    }
    helpers
    .axiosdata("post","/api/editpermissions/"+_id,token,updateHolidayData)
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
    .axiosdata("post","/api/deletepermissions/"+_id,token)
      .then(function (response) {
        sess = req.session;
        res.redirect("/viewpermissions");
      })
      .catch(function (response) {});
  } catch (e) {}
};

module.exports = permissionController;
