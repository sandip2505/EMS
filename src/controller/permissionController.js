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
     
        res.render("addpermissions",{role:sess.role,layout:false});
    
};
permissionController.addpermissions = async (req, res) => {
    try {
        const addpermissions = new permissions({
          permission_name: req.body.permission_name,
          permission_description: req.body.permission_description
        });
        console.log(addpermissions)
        const permissionsadd  = await addpermissions.save();
        res.status(201).redirect("/index");
      
    } catch (e) {
      res.status(400).send(e);
    }

}

  
module.exports = permissionController