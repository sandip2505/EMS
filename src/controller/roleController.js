const Role = require("../model/roles");
const user = require("../model/user");
const axios = require('axios');




const roleController = {}

roleController.getRole = async (req, res) => {
  sess = req.session;
  res.render("addRole", { username: sess.username, layout: false });
};

roleController.addRole = async (req, res) => {

  axios.post("http://localhost:46000/Roleadd/", {
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
    url: "http://localhost:46000/roles/",
  })
    .then(function (response) {
      sess = req.session;
      res.render("roleListing", {
        success: req.flash('success'), data: response.data.data, username: sess.username, users: sess.userData,
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
    url: "http://localhost:46000/Roleedit/" + _id,
  })
    .then(function (response) {
      // console.log(response.data.roleData)

      sess = req.session;
      res.render("editRole", {
        data: response.data.roleData, username: sess.username, users: sess.userData,
      });
    })
    .catch(function (response) {
    });


};
roleController.updateRole = async (req, res) => {
  const _id = req.params.id;
  axios({
    method: "post",
    url: "http://localhost:46000/Roleedit/" + _id,
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

  // try {
  //   const _id = req.params.id;
  //   const role = {
  //     role_name: req.body.role_name,
  //     role_description: req.body.role_description,
  //     permission_name: req.body.permission_name,
  //     updated_at: Date(),
  //   }
  //   const updateEmployee = await Role.findByIdAndUpdate(_id, role);
  //   res.redirect("/roleListing");
  // } catch (e) {
  //   res.status(400).send(e);
  // }
};
roleController.deleteRole = async (req, res) => {
  const _id = req.params.id;
  axios({
    method: "post",
    url: "http://localhost:46000/Roledelete/" + _id,
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