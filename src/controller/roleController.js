const axios = require('axios');
var helpers = require("../helpers");


const roleController = {}

roleController.getRole = async (req, res) => {
  const token = req.cookies.jwt;
  helpers
    .axiosdata("get", "/api/roles", token)
    .then(function (response) {
      sess = req.session;
      if (response.data.status == false) {
        res.redirect("/forbidden")
      } else {
        res.render("addRole", { username: sess.username,loggeduserdata: req.user, layout: false });
      }
    })
    .catch(function (response) {
      console.log(response);
    });
 
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
        sess = req.session;
        if (response.data.status == false) {
          res.redirect("/forbidden")
        } else {
          res.redirect("/roleListing");
        }
      })
      .catch(function (response) {
        console.log(response);
      });
  } catch (e) {
    res.status(400).send(e);
  }


};

roleController.list = async (req, res) => {
  const token = req.cookies.jwt;
  helpers
    .axiosdata("get", "/api/roles", token)
    .then(function (response) {
      sess = req.session;
      if (response.data.status == false) {
        res.redirect("/forbidden")
      } else {
        res.render("roleListing", {
          roleData: response.data.roleData,
          success: req.flash('success'),
      loggeduserdata: req.user,
          users: sess.userData,
        });
      }
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
        if (response.data.status == false) {
          res.redirect("/forbidden")
        } else {
          res.render("editRole", {
            roleData: response.data.roleData,
        loggeduserdata: req.user,
            users: sess.userData,
          });
        }
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
        sess = req.session;
        if (response.data.status == false) {
          res.redirect("/forbidden")
        } else {
          res.redirect("/roleListing");
        }
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
      .axiosdata("post", "/api/deleteRole/" + _id, token)
      .then(function (response) {

        // console.log(response.data)
        sess = req.session;
        if (response.data.status == false) {
          res.redirect("/forbidden")
        } else {
          if (response.data.userHasAlreadyRole == true) {
            req.flash('success', `this role is already assigned to user so you can't delete this role`)
            res.redirect('/roleListing')
          } else {
            res.redirect('/roleListing')
          }
        }
      })

      .catch(function (response) { });
  } catch (e) {
    res.status(400).send(e);
  }


}

module.exports = roleController;