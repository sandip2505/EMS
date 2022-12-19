const Project = require("../model/createProject");
const Task = require("../model/createTask");
const timeEntries = require("../model/timeEntries");
const axios = require('axios');
const BSON = require('bson');
require("dotenv").config();
var helpers = require("../helpers");
const { find } = require("../model/token");



const timeEntryController = {}



timeEntryController.getTimeEntries = async (req, res) => {
  const user_id = sess.userData._id
  
  // const taskData =  await Task.find({user_id: user_id });
  const taskData =  await Task.find();
  // console.log("taskData",taskData[0].project_id);


  const projects_id = BSON.ObjectId(taskData[0].project_id);
  // console.log("projects_id",projects_id);

  const projectData =  await Project.find({_id:projects_id,status:"in Progress"});
const projects= BSON.ObjectId(projectData[0]._id)

  
// const tasks = await Task.find({user_id: user_id ,project_id:projects});
const tasks = await Task.find({project_id:projects});

  const Timeentry = await timeEntries.find()
// console.log("Timeentry",Timeentry)

// console.log("projectData",tasks)
res.render("timeEntryListing", { data:tasks, Timeentry:Timeentry, users: sess.userData, username: sess.username });
// return res.status(200).json({ tasks });

}


timeEntryController.AddtimeEntries = async (req, res) => {

  // const input = req.body;
  //  console.log(input);

  try {
    // for(var i=0; i<=31; i++){
    const addTimeEntry = new timeEntries({
        task_id: req.body.task,
        hours:req.body.hour,
        date :req.body.date+'-'+req.body.month+'-'+req.body.year
        
    });
    // console.log("addTimeEntry",addTimeEntry)
  // }









    const timeEntryadd = await addTimeEntry.save();
 //    console.log(timeEntryadd)
      

      
  
    // res.status(201).redirect("/projectslisting");
} catch (e) {
    res.status(400).send(e);
}
  //  console.log("hours",hours[])
  // console.log(JON.strinSgify(hours)); 

  // let response =  input.map(name => name.match(/^.*(?=\s)/)[0]);

 //console.log(input);
  // console.log((req.body.hours[0]))
 // console.log(JSON.stringify(req.body[0]))
  // console.log("req",req.body.toString()).yo
//const task_id = req.body.task_id
// hoursdata = hours.push(spi  )
// var answ = hours.split(',');
// console.log("answ",answ)
// 
// console.log("task_id",task_id)
// console.log("hours",hoursdata)

  // try {
  //   axios({
  //     method: "post",
  //     url: process.env.BASE_URL + "/addTimeEntry/",
  //     data: {
  //       project_id: req.body.project_id,
  //       task_id: req.body.task_id,
  //       hours: req.body.hours,
  //     }
  //   }).then(function (response) {
  //     res.status(201).redirect("/timeEntryListing");
  //   })
  //     .catch(function (response) {

  //     });
  // } catch (err) {
  //   res.status(500).json({ error: err.message });
  // }
};
// timeEntryController.getTimeEntries = async (req, res) => {
//   // const Timeentry = await timeEntries.find()
//   // console.log("Timeentry",Timeentry)

// }



module.exports = timeEntryController