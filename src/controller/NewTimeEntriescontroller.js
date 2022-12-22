const NewTimeEntriesController = {};
var helpers = require("../helpers");
require("dotenv").config();
const project = require('../model/createProject')

NewTimeEntriesController.AddtimeEntries = async (req, res) => {

// const projectdata = await project.find()
   
   
    sess = req.session;
    token = req.cookies.jwt;
    helpers
    .axiosdata("get","/api/getTimeEntry",token)
    .then(function (response) {
        console.log("data",response.data.projectData);
      sess = req.session;
      if (response.data.status == false) {
        res.redirect("/forbidden")
      }else {
        res.render("AddtimeEntries", { projectData:response.data.projectData, username: sess.username });
      }
      })
      .catch(function (response) {
        console.log(response);
      });
  };

  module.exports = NewTimeEntriesController;