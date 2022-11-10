const Project = require("../model/createProject");
const user = require("../model/user");
const technology = require("../model/technology");
const projectController = {}

projectController.getProject = async (req, res) => {
    sess = req.session;
    const UserData = await user.find();
    const TechnologyData = await technology.find();
    res.render("createProject", { userdata: UserData, TechnologyData: TechnologyData, username: sess.username, layout: false });
};

projectController.addProject = async (req, res) => {
    try {
        const addProject = new Project({
            title: req.body.title,
            short_description: req.body.short_description,
            start_date: req.body.start_date,
            end_date: req.body.end_date,
            status: req.body.status,
            technology: req.body.technology,
            project_type: req.body.project_type,
            user_id: req.body.user_id,
        });
        const Projectadd = await addProject.save();
        // res.end(JSON.stringify(Projectadd));
        res.status(201).redirect("/projectslisting");
    } catch (e) {
        res.status(400).send(e);
    }
};

projectController.projectslisting = async (req, res) => {
    sess = req.session;
    try {
        var output;
        const Projects = await Project.find({ deleted_at: "null" });
        if (Projects.length > 0) {
            output = { 'success': true, 'message': 'Get all Project List', 'data': Projects };
        } else {
            output = { 'success': false, 'message': 'Something went wrong' };
        }
        // res.end(JSON.stringify(output));
        // res.end(JSON.stringify(Projects[0].title));
        res.render('projectslisting', {
            data: Projects, username: sess.username, layout: false
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

projectController.projectslistingWeb = async (req, res) => {
    sess = req.session;
    try {
        const Projects = await projectController.projectslisting();
        res.render('projectslisting', {
            data: Projects, username: sess.username, layout: false
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

projectController.editProject = async (req, res) => {
    try {
        sess = req.session
        const _id = req.params.id;
        const ProjectData = await Project.findById(_id);
        const UserData = await user.find();
        const technologyData = await technology.find();
        res.render('editProject', {
            data: ProjectData, userdata: UserData, technologyData: technologyData, username: sess.username, layout: false
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

projectController.updateProject = async (req, res) => {
    try {
        const _id = req.params.id;
        const updateProject = {
            title: req.body.title,
            short_description: req.body.short_description,
            start_date: req.body.start_date,
            end_date: req.body.end_date,
            status: req.body.status,
            technology: req.body.technology,
            project_type: req.body.project_type,
            user_id: req.body.user_id,
            updated_at: Date(),
        }
        // console.log(updateProject);
        const updateEmployee = await Project.findByIdAndUpdate(_id, updateProject);
        res.redirect("/projectslisting");
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

projectController.deleteproject = async (req, res) => {
    const _id = req.params.id;
    const deleteProject = {
        deleted_at: Date(),
    }
    await Project.findByIdAndUpdate(_id, deleteProject);
    res.redirect("/projectslisting");
};

module.exports = projectController