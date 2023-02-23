const Project = require("../model/createProject");
const Task = require("../model/createTask");
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
  const user_id = req.user._id;
  // const timeEntryData = await timeEntries.find({ user_id: user_id });
  const timeEntryData = await timeEntries.aggregate([
    { $match: { deleted_at: "null" } },
   { $match: { user_id: user_id } },
    {
      $lookup: {
        from: "projects",
        localField: "project_id",
        foreignField: "_id",
        as: "projectData",
      }},{
      $lookup: {
        from: "tasks",
        localField: "task_id",
        foreignField: "_id",
        as: "taskData",
      }
    },
  ]);
  // console.log("data",timeEntryData)
  
  var timeData = [];
  timeEntryData.forEach((key) => {

    var _date = key.date.toISOString().split('T')[0].split("-").join("-")
    var _dates= new Date(_date)
    var day = _dates.getDate();

    timeData.push({
      [key.projectData[0].title]: {
        [key.taskData[0].title]: {
          [day]: {_day: `${day}`, h: key.hours}
        }
      }
    });    

  });

  
  let result = {};

  for (let item of timeData) {
    let key1 = Object.keys(item)[0];
    let key2 = Object.keys(item[key1])[0];
    let value = item[key1][key2];

    if (result[key1] === undefined) {
      result[key1] = {};
    }
    if (result[key1][key2] === undefined) {
      result[key1][key2] = [value];
    } else {
      result[key1][key2].push(value);
    }
  }

  let mergedData = [result];



  res.render("AddtimeEntry", {
   loggeduserdata: req.user,
   timeEntryData: mergedData,
   roleHasPermission: await helpers.getpermission(req.user),
});

};

timeEntryController.AddtimeEntries = async (req, res) => {
  console.log(req.body);
};
// timeEntryController.getTimeEntries = async (req, res) => {
//   // const Timeentry = await timeEntries.find()
// }
module.exports = timeEntryController;

