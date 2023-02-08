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
  const user_id = req.user._id
  
  const taskData =  await Task.find({user_id: user_id });
  // const taskData =  await Task.find();
  // console.log("taskData",taskData);

  if(taskData.length>0){
    
    
    var project_id=[]
    // const projects_id = taskData[0].project_id;

    for (let i = 0; i < taskData.length; i++) {
        
    element = taskData[i].project_id;
    project_id.push(element);
  }
  console.log("projects_id",project_id);
  
  const projectData =  await Project.find({_id:project_id,status:"in Progress"});
  // console.log("projectData",projectData)
  
 var projects_id=[]
  for (let i = 0; i < projectData.length; i++) {
        
    element = projectData[i]._id;
    projects_id.push(element);
  }
  
  // const projects= BSON.ObjectId(projectData[0]._id)
  
  
  // const tasks = await Task.find({user_id: user_id ,project_id:projects});
  const tasks = await Task.find({project_id:projects_id});
  
  
  const timeEntryData = await timeEntries.find()
  console.log("lenght",timeEntryData.length);
  // const TimeEntryData =  await TimeEntryData.find({project_id:projects_id});
  
  
  res.render("AddtimeEntry", { data:tasks,loggeduserdata: req.user, timeEntryData:timeEntryData,     Permission : await helpers.getpermission(req.user),});
  // return res.status(200).json({ tasks });
}else{
  res.render("AddtimeEntry", { data:[],loggeduserdata: req.user, Permission : await helpers.getpermission(req.user),});
}
}

timeEntryController.AddtimeEntries = async (req, res) => {
  console.log(req.body)
};
// timeEntryController.getTimeEntries = async (req, res) => {
//   // const Timeentry = await timeEntries.find()
// }
module.exports = timeEntryController;
