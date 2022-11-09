const task = require('../model/createTask')
const project = require('../model/createProject')
const user = require('../model/user')
const connect = require('../db/conn')

const taskController = {}

taskController.createtask = async (req, res,) => {
    sess = req.session;
    const user_id = sess.userData._id
    // console.log(sandip);
    const projectData = await project.find({ user_id: user_id });

    try {

        const tasks = await project.aggregate([
            { $match: { deleted_at: "null" } },
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


        const userdata = [];

        // console.log(sess.userData._id);




        res.render("createTask", { data: projectData, data2: tasks, Userdata: userdata, users: sess.userData, username: sess.username });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
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
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "test1"
                }
            }

        ]);


        res.render('taskListing', {
            data: tasks, name: sess.name, username: sess.username, users: sess.userData
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

};
taskController.editask = async (req, res) => {
    sess = req.session;
    const _id = req.params.id
    const projectData = await project.find();

    const ID = await task.findById(_id)
    const task_id = ID._id

    const tasksdata = await task.find()

    try {
        const tasks = await task.aggregate([
            { $match: { deleted_at: "null" } },
            { $match: { _id: task_id } },
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
        console.log(tasks[0].project_id)
        // console.log(tasks[0].short_description);

        res.render('editask', {
            data: projectData, data2: tasks, task: ID, tasksdata: tasksdata, name: sess.name, username: sess.username, users: sess.userData
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// taskController.getUserByProject(projectId)=async(req,res)=>{

// }


taskController.deletetask = async (req, res) => {

    const _id = req.params.id;
    const deleteTask = {
        deleted_at: Date(),
    }
    await task.findByIdAndUpdate(_id, deleteTask);
    res.redirect("/taskListing");
}

module.exports = taskController