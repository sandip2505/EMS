const Project = require("../model/createProject");
const Task = require("../model/createTask");
const Hours = require("../model/timeEntries");
const BSON = require('bson');


const timeEntryController = {}

timeEntryController.getData = async (req, res) => {
    sess = req.session;
    const projectData = await Project.find();
    res.render("AddtimeEntries", { Data: projectData,username: sess.username, layout: false });
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
    try{
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
module.exports = timeEntryController