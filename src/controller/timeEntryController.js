const Project = require("../model/createProject");
const Task = require("../model/createTask");
const Hours = require("../model/timeEntries");
const BSON = require('bson');


const timeEntryController = {}

timeEntryController.getData = async (req, res) => {
  sess = req.session;
  const user_id = sess.userData._id




  const projectData = await Project.find({ user_id: user_id });
  res.render("AddtimeEntries", { Data: projectData, username: sess.username, layout: false });
};



timeEntryController.getTaskByProject = async (req, res) => {
  const _id = new BSON.ObjectId(req.params.id);
  try {

    const tasks = await Task.aggregate([
      { $match: { project_id: _id } },
      {
        $lookup:
        {
          from: "projects",
          localField: "_id",
          foreignField: "task_id",
          as: "taskData"
        }
      }
    ]);
    return res.status(200).json({ tasks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

timeEntryController.AddHours = async (req, res) => {
  try {
    const AddHours = new Hours({
      project_id: req.body.project_id,
      task_id: req.body.task_id,
      hours: req.body.hours,

    });
    const hoursAdd = await AddHours.save();
    res.status(201).redirect("/index");
  } catch (e) {
    res.status(400).send(e);
  }
};

timeEntryController.timeEntryList = async (req, res) => {
  sess = req.session;
  try {
    const Hoursdata = await Hours.aggregate([
      { $match: { deleted_at: "null" } },
     
      {

        $lookup:
        {
          from: "projects",
          localField: "project_id",
          foreignField: "_id",
          as: "test"
        },

      },
      {
        $lookup:
        {
          from: "tasks",
          localField: "task_id",
          foreignField: "_id",
          as: "test1"
        }
      }

    ]);
    res.render("timeEntryListing", { data: Hoursdata, users: sess.userData, username: sess.username });
    // res.status(201).redirect("/index");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
timeEntryController.checkMonth = async (req, res) => {
    sess = req.session;
    const current_month = new Date().getMonth()
    new Date().getMonth()

     const month = req.body.month


     try {
        const Hoursdata = await Hours.aggregate([
          { $match: { deleted_at: "null" } },
          { $match: { month: month } },
         
         
          {
    
            $lookup:
            {
              from: "projects",
              localField: "project_id",
              foreignField: "_id",
              as: "test"
            },
    
          },
          {
            $lookup:
            {
              from: "tasks",
              localField: "task_id",
              foreignField: "_id",
              as: "test1"
            }
          }
    
        ]);
        // console.log(Hoursdata)
        return res.status(200).json({ Hoursdata });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
}

module.exports = timeEntryController