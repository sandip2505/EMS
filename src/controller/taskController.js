const task = require('../model/createTask')
const project = require('../model/createProject')
const user = require('../model/user')
const connect = require('../db/conn')

const taskController = {}

taskController.createtask = async (req, res,) => {
    sess = req.session;
    const projectData = await project.find();

    const userdata = await user.find();

    res.render("createTask", { data: projectData, Userdata: userdata, name: sess.name, role: sess.role, layout: false });
}

taskController.addtask = async (req, res) => {

    try {
        const addTask = new task({
            project_id: req.body.project_id,
            user_id: req.body.user_id,
            title: req.body.title,
            short_description: req.body.short_description,

        });
        const Tasktadd = await addTask.save();
        res.status(201).redirect("/projectslisting");

    } catch (e) {
        res.status(400).send(e);
    }

}

taskController.taskListing = async (req, res) => {

    sess = req.session;
    try {
        const tasks = await task.aggregate([
            {
                $lookup:
                {
                    from: "projects",
                    localField: "project_id",
                    foreignField: "_id",
                    as: "test"
                },

            }
        ]);
        const user = await task.aggregate([
            {

                $lookup:
                {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "test"
                }
            }
        ]);
        const datas = { ...tasks, ...user }



        res.render('taskListing', {
            data: tasks, name: sess.name, role: sess.role, layout: false
        });
        // res.json({ data: blogs, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }



};

taskController.editTask = async (req, res) => {
    try {
        sess = req.session
        const _id = req.params.id;

        const taskData = await task.findById(_id);
        res.render('editRole', {
            data: taskData, role: sess.role, name: sess.name, layout: false
        });
        // res.json({ data: blogs, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = taskController