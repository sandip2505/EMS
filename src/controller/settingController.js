const axios = require('axios');
var helpers = require("../helpers");

const settingController = {}

settingController.getAddSetting = async (req, res) => {
  const token = req.cookies.jwt;
  helpers
    .axiosdata("get", "/api/addsetting", token)
    .then(function (response) {
      sess = req.session;
      if (response.data.status == false) {
        res.redirect("/forbidden")
      } else {
        res.render("settings", { username: sess.username,   loggeduserdata: req.user,  layout: false });
      }
    })
    .catch(function (response) {
      console.log(response);
    });
 
};
settingController.addSetting = async (req, res) => {
    const token = req.cookies.jwt;
    const addsettingdata = {
        key: req.body.key,
        type: req.body.type,
        value: req.files.value.name,
      };
    helpers
      .axiosdata("post", "/api/addsetting", token,addsettingdata)
      .then(function (response) {
        sess = req.session;
        if (response.data.status == false) {
          res.redirect("/forbidden")
        } else {
          var file =  req.files.value;
          file.mv('public/images/' + file.name);
            res.redirect("/settingListing");
        }
      })
      .catch(function (response) {
        console.log(response);
      });
   
  };
  
  settingController.list = async (req, res) => {
    const token = req.cookies.jwt;
    helpers
      .axiosdata("get", "/api/settingListing", token)
      .then(function (response) {
        sess = req.session;
        if (response.data.status == false) {
          res.redirect("/forbidden")
        } else {
          res.render("settings_listing", {
            settingData: response.data.settingData,
            loggeduserdata: req.user,
            users: sess.userData,
          });
        }
      })
      .catch(function (response) {
        console.log(response);
      });
  
  
  };

  settingController.editSetting = async (req, res) => {
    try {
      const token = req.cookies.jwt;
      const _id = req.params.id;
      helpers
        .axiosdata("get", "/api/editSetting/" + _id, token)
        .then(function (response) {
            // console.log("response",response)
          sess = req.session;
          if (response.data.status == false) {
            res.redirect("/forbidden")
          } else {
            res.render("editSettings", {
              settingData: response.data.settingData,
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

  settingController.updateSetting = async (req, res) => {
    try {
      const token = req.cookies.jwt;
      const _id = req.params.id;

      const updatesettingdata = {
        key: req.body.key,
        type: req.body.type,
        value: req.body.value,
      };
      helpers
        .axiosdata("post", "/api/editSetting/" + _id, token, updatesettingdata)
        .then(function (response) {
          sess = req.session;
          if (response.data.status == false) {
            res.redirect("/forbidden")
          } else {
            res.redirect("/settingListing");
          }
        })
        .catch(function (response) { });
    } catch (e) {
      res.status(400).send(e);
    }
  
  
  };
  


module.exports = settingController;