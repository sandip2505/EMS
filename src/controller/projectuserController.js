const project = require("../model/createProject");
const task = require("../model/createTask");
const user = require("../model/user");
const userproject = require("../model/userproject");

const projectuserController = {}

projectuserController.getprojectuser = async (req, res) => {
    sess = req.session;

    const userData = await user.find();
    const blogs = await project.find();
    const taskdata = await task.find();



    res.render("projectuser", { data: blogs, userData: userData, taskdata: taskdata, username: sess.username, users: sess.userData, name: sess.name, role: sess.role, layout: false });
    // res.render("projectuser", { name: sess.name, users: sess.userData, username: sess.username, role: sess.role, layout: false });
}
projectuserController.addprojectuser = async (req, res) => {

    try {
        const addprojectuser = new userproject({
            project: req.body.project,
            task: req.body.task,
            user: req.body.user,
        });
        const add = await addprojectuser.save();
        res.status(201).redirect("/index");

    } catch (e) {
        res.status(400).send(e);
    }

}
projectuserController.list = async (req, res) => {
    sess = req.session;
    try {
        const blogs = await Role.find();
        res.render('roleListing', {
            data: blogs, name: sess.name, users: sess.userData, username: sess.username, role: sess.role, layout: false
        });
        // res.json({ data: blogs, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
    // res.render("holidayListing",{name:sess.name,layout:false});


};
projectuserController.editRole = async (req, res) => {
    try {
        sess = req.session
        const _id = req.params.id;

        const roleData = await Role.findById(_id);
        res.render('editRole', {
            data: roleData, role: sess.role, users: sess.userData, username: sess.username, name: sess.name, layout: false
        });
        // res.json({ data: blogs, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
projectuserController.updateRole = async (req, res) => {
    try {
        const _id = req.params.id;
        const role = {
            role_name: req.body.role_name,
            role_description: req.body.role_description,
            permission_name: req.body.permission_name,
            updated_at: Date(),
        }

        const updateEmployee = await Role.findByIdAndUpdate(_id, role);
        res.redirect("/roleListing");
    } catch (e) {
        res.status(400).send(e);
    }
}
projectuserController.deleteRole = async (req, res) => {
    try {
        const _id = req.params.id;
        await Role.findByIdAndDelete(_id);
        res.redirect("/roleListing");
    } catch (e) {
        res.status(400).send(e);
    }
}



module.exports = projectuserController;