const task = require('../model/createTask')
const project = require('../model/createProject')
const user = require('../model/user')

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
module.exports = taskController