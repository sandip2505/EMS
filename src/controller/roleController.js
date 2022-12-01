const axios = require('axios');
var helpers = require("../helpers");


const roleController = {}

roleController.getRole = async (req, res) => {
  sess = req.session;
  res.render("addRole", { username: sess.username, layout: false });
};

roleController.addRole = async (req, res) => {

  try {
    const token = req.cookies.jwt;
    const addroledata = {
      role_name: req.body.role_name,
      role_description: req.body.role_description,
    };
    helpers
      .axiosdata("post", "/api/Roleadd", token, addroledata)
      .then(function (response) {
        res.redirect("/roleListing");
      })
      .catch(function (response) {
        console.log(response);
      });
  } catch (e) {
    res.status(400).send(e);
  }


};

roleController.list = async (req, res) => {
  token = req.cookies.jwt;

  helpers
    .axiosdata("get", "/api/roles", token)
    .then(function (response) {
      sess = req.session;
      res.render("roleListing", {
        roleData: response.data.roleData,
        success: req.flash('success'),
        username: sess.username,
        users: sess.userData,
      });
    })
    .catch(function (response) {
      console.log(response);
    });


};

roleController.editRole = async (req, res) => {

  try {
    const token = req.cookies.jwt;
    const _id = req.params.id;
    helpers
      .axiosdata("get", "/api/Roleedit/" + _id, token)
      .then(function (response) {
        sess = req.session;
        res.render("editRole", {
          roleData: response.data.roleData,
          username: sess.username,
          users: sess.userData,
        });
      })
      .catch(function (response) { });
  } catch (e) {
    res.status(400).send(e);
  }


};

roleController.updateRole = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    const _id = req.params.id;
    const updateroledata = {
      role_name: req.body.role_name,
      role_description: req.body.role_description,
      updated_at: Date()
    };
    helpers
      .axiosdata("post", "/api/Roleedit/" + _id, token, updateroledata)
      .then(function (response) {
        res.redirect("/roleListing");
      })
      .catch(function (response) { });
  } catch (e) {
    res.status(400).send(e);
  }


};

roleController.deleteRole = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    const _id = req.params.id;
    helpers
      .axiosdata("post", "/api/Roledelete/" + _id, token)
      .then(function (response) {
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

      .catch(function (response) { });
  } catch (e) {
    res.status(400).send(e);
  }


}

module.exports = roleController;