const permissions = require("../model/addpermissions");
const axios = require('axios');

const permissionController = {};

permissionController.permissions = (req, res) => {
  sess = req.session;
  res.render("addpermissions", { username: sess.username, layout: false });
};

permissionController.addpermissions = async (req, res) => {

  axios.post("http://localhost:46000/newpermissions/", {
    permission_name: req.body.permission_name,
    permission_description: req.body.permission_description,
  }
  ).then(function (response) {
    res.redirect("/viewpermissions")
  })
    .catch(function (response) {
      console.log(response);
    });

  // try {
  //   const addpermissions = new permissions({
  //     username: sess.username,
  //     permission_name: req.body.permission_name,
  //     permission_description: req.body.permission_description,
  //   });
  //   const permissionsadd = await addpermissions.save();
  //   res.status(201).redirect("/viewpermissions");
  // } catch (e) {
  //   res.status(400).send(e);
  // }
};

permissionController.viewpermissions = async (req, res) => {
  axios({
    method: "get",
    url: "http://localhost:46000/permissions/",
  })
    .then(function (response) {
      sess = req.session;
      res.render("permissionsListing", {
        data: response.data.permissionsdata, username: sess.username, users: sess.userData,
      });
    })
    .catch(function (response) {
      console.log(response);
    });

};

permissionController.editpermissions = async (req, res) => {
  const _id = req.params.id;
  axios({
    method: "get",
    url: "http://localhost:46000/permissionsedit/" + _id,
  })
    .then(function (response) {
      sess = req.session;
      res.render("editpermission", {
        data: response.data.permissiondata, username: sess.username, users: sess.userData,
      });
    })
    .catch(function (response) {
    });

};

permissionController.updatepermission = async (req, res) => {
  const _id = req.params.id;
  axios({
    method: "post",
    url: "http://localhost:46000/permissionsedit/" + _id,
    data: {
      permission_name: req.body.permission_name,
      permission_description: req.body.permission_description,
      updated_at: Date()
    }
  }).then(function (response) {
    res.redirect("/viewpermissions");
  })
    .catch(function (response) {

    });
  // try {
  //   const _id = req.params.id;
  //   const permission = {
  //     permission_name: req.body.permission_name,
  //     permission_description: req.body.permission_description,
  //     updated_at: Date(),
  //   };
  //   const updatepermission = await permissions.findByIdAndUpdate(
  //     _id,
  //     permission
  //   );
  //   res.redirect("/viewpermissions");
  // } catch (e) {
  //   res.status(400).send(e);
  // }
};

permissionController.deletepermissions = async (req, res) => {
  const _id = req.params.id;
  axios({
    method: "post",
    url: "http://localhost:46000/permissionsdelete/" + _id,
  })
    .then(function (response) {
      sess = req.session;
      res.redirect("/viewpermissions");
    })
    .catch(function (response) {
    });
  // const _id = req.params.id;
  // const deletePermission = {
  //   deleted_at: Date(),
  // };
  // await permissions.findByIdAndUpdate(_id, deletePermission);
  // res.redirect("/viewpermissions");
};

module.exports = permissionController;
