const Role = require("../model/roles");
const user = require("../model/user");
const axios = require('axios');
require("dotenv").config();





const roleController = {}

roleController.getRole = async (req, res) => {
  sess = req.session;
  res.render("addRole", { username: sess.username, layout: false });
};

roleController.addRole = async (req, res) => {

  axios.post(process.env.BASE_URL + "/Roleadd/", {
    role_name: req.body.role_name,
    role_description: req.body.role_description,
  }
  ).then(function (response) {
    res.redirect("/roleListing")
  })
    .catch(function (response) {
      console.log(response);
    });

};

roleController.list = async (req, res) => {
  axios({
    method: "get",
    url: process.env.BASE_URL + "/roles/",
  })
    .then(function (response) {
      sess = req.session;
      res.render("roleListing", {
        success: req.flash('success'), roledata: response.data.data, username: sess.username, users: sess.userData,
      });
    })
    .catch(function (response) {
      console.log(response);
    });

};

roleController.editRole = async (req, res) => {
  const _id = req.params.id;
  axios({
    method: "get",
    url: process.env.BASE_URL + "/Roleedit/" + _id,
  })
    .then(function (response) {
      sess = req.session;
      res.render("editRole", {
        roleData: response.data.roleData, username: sess.username, users: sess.userData,
      });
    })
    .catch(function (response) {
    });
};

roleController.updateRole = async (req, res) => {
  const _id = req.params.id;
  axios({
    method: "post",
    url: process.env.BASE_URL + "/Roleedit/" + _id,
    data: {
      role_name: req.body.role_name,
      role_description: req.body.role_description,
      updated_at: Date()
    }
  }).then(function (response) {
    res.redirect("/roleListing");
  })
    .catch(function (response) {
    });

};

roleController.deleteRole = async (req, res) => {
  const _id = req.params.id;
  axios({
    method: "post",
    url: process.env.BASE_URL + "/Roledelete/" + _id,
  })
    .then(function (response) {
      const _id = req.params.id;
      if (response.data.data == true) {
        req.flash('success', `this role is already assigned to user so you can't delete this role`)
        res.redirect('/roleListing')
      } else {
        const deleteRole = {
          deleted_at: Date(),
        }
        res.redirect('/roleListing')
      }

    })
    .catch(function (response) {
    });

}

module.exports = roleController;