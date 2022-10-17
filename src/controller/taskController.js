const task = require('../model/createTask')
const project = require('../model/createProject')
const user = require('../model/user')
const connect = require('../db/conn')

const taskController = {}

taskController.createtask = async (req, res,) => {
    sess = req.session;
    const projectData = await project.find();

    const userdata = await user.find();

    res.render("createTask", { data: projectData, Userdata: userdata,  users:sess.userData, username:sess.username, name: sess.name, role: sess.role, layout: false });
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
        res.status(201).redirect("/taskListing");

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

            },
            {

                $lookup:
                {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "test1"
                }
            }

        ]);
        // console.log(user)
        // const datas = { ...tasks, ...user }


        res.render('taskListing', {
            data: tasks, name: sess.name, username:sess.username,  users:sess.userData, role: sess.role, layout: false
        });
        // res.json({ data: blogs, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }



};

taskController.TaskDetail = async (req, res) => {
    sess = req.session;
    const _id = req.params.id;
    try {
        const taskData = await task.aggregate([
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
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "test1"
                }
            }

        ]);

        // const taskData = await task.findById(_id);
        res.render('viewTaskDetail', {
            data: taskData, role: sess.role,  users:sess.userData, name: sess.name, username:sess.username, layout: false
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }

}

taskController.deletetask = async (req, res) => {
    try {
        const _id = req.params.id;
        await task.findByIdAndDelete(_id);
        res.redirect("/taskListing");
    } catch (e) {
        res.status(400).send(e);
    }
}

module.exports = taskController