const express = require("express");
const permissions = require("../model/addpermissions");
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");
const sessions = require("express-session");
const { render } = require("ejs");
const permissionController = {}

// const { roles } = require('../roles')


permissionController.permissions = (req, res) => {
  sess = req.session;

  res.render("addpermissions", { role: sess.role,  username:sess.username,  users:sess.userData, layout: false });

};
permissionController.addpermissions = async (req, res) => {
  try {
    const addpermissions = new permissions({ username:sess.username,
      permission_name: req.body.permission_name,
      permission_description: req.body.permission_description
    });
    // console.log(addpermissions)
    const permissionsadd = await addpermissions.save();
    res.status(201).redirect("/viewpermissions");


  } catch (e) {
    res.status(400).send(e);
  }

}
permissionController.viewpermissions = async (req, res) => {
  sess = req.session;
  try {
    const blogs = await permissions.find({deleted_at:"null"});
    // res.status(200).json(blogs);

    res.render('permissionsListing', {
      data: blogs, name: sess.name, role: sess.role, username:sess.username ,  users:sess.userData, layout: false
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

permissionController.editpermissions = async (req, res) => {
  try {
    sess = req.session
    const _id = req.params.id;
    const permissiondata = await permissions.findById(_id);
    res.render('editpermission', {
      data: permissiondata, name: sess.name, role: sess.role, username:sess.username,  users:sess.userData, layout: false
    });
    // res.json({ data: blogs, status: "success" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

permissionController.updatepermission = async (req, res) => {
  try {
    const _id = req.params.id;
    const permission = {
      permission_name: req.body.permission_name,
      permission_description: req.body.permission_description,
      updated_at: Date(),
    }
    const updatepermission = await permissions.findByIdAndUpdate(_id, permission);
    res.redirect("/viewpermissions");

  } catch (e) {
    res.status(400).send(e);
  }
}



permissionController.deletepermissions = async (req, res) => {
 
const _id = req.params.id;
const deletePermission = {
  deleted_at: Date(),
}
 await permissions.findByIdAndUpdate(_id,deletePermission);
res.redirect("/roleListing");
}


module.exports = permissionController