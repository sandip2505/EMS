const Project = require("../model/createProject");
const User = require("../model/user");
const timeEntries = require("../model/timeEntries");
const axios = require("axios");
const BSON = require("bson");
require("dotenv").config();
var helpers = require("../helpers");

const timeEntryController = {};

// timeEntryController.getTimeEntries = async (req, res) => {
//   const user_id = sess.userData._id;
//   const taskData = await Task.find({ user_id: user_id });
//   if (taskData.length > 0) {
//     var project_id = [];
//     for (let i = 0; i < taskData.length; i++) {
//       element = taskData[i].project_id;
//       project_id.push(element);
//     }
//     const projectData = await Project.find({
//       _id: project_id,
//       status: "in Progress",
//     });
//     var projects_id = [];
//     for (let i = 0; i < projectData.length; i++) {
//       element = projectData[i]._id;
//       projects_id.push(element);
//     }

//     const tasks = await Task.find({ project_id: projects_id });

//     res.render("timeEntryListing", {
//       data: tasks,
//       users: sess.userData,
//       loggeduserdata: req.user,
//       username: sess.username,
//     });
//     // return res.status(200).json({ tasks });
//   } else {
//     res.render("timeEntryListing", {
//       data: [],
//       users: sess.userData,
//       loggeduserdata: req.user,
//       username: sess.username,
//     });
//   }
// };

timeEntryController.getTimeEntries = async (req, res) => {
sess= req.session
  const users= await User.find({deleted_at:"null"})
   res.render("AddtimeEntry", {
   loggeduserdata: req.user,
   userData : users,
   users: sess.userData,
  //  timeEntryData: mergedData,
   roleHasPermission: await helpers.getpermission(req.user),
 });

};

timeEntryController.AddtimeEntries = async (req, res) => {
  // console.log(req.body);
};
// timeEntryController.getTimeEntries = async (req, res) => {
//   // const Timeentry = await timeEntries.find()
// }
module.exports = timeEntryController;

