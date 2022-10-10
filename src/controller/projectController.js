const Project = require("../model/createProject");


const projectController = {}

projectController.getProject = async (req, res) => {
    sess = req.session;

    res.render("createProject", { name: sess.name, role: sess.role, layout: false });
}

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
        });
        const Projectadd = await addProject.save();
        res.end(JSON.stringify(Projectadd));

        // res.status(201).redirect("/projectslisting");

    } catch (e) {
        res.status(400).send(e);
    }

}

projectController.projectslisting = async (req, res) => {
    sess = req.session;
    try {
        var output;
        const Projects = await Project.find();
        if (Projects.length > 0) {
            output = { 'success': true, 'message': 'Get all Project List', 'data': Projects };
        } else {
            output = { 'success': false, 'message': 'Something went wrong' };
        }
        // res.end(JSON.stringify(output));
        res.end(JSON.stringify(Projects));
        // res.JSON('projectslisting', {
        //     data: Projects, name: sess.name, role: sess.role, layout: false
        // });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

projectController.projectslistingWeb = async (req, res) => {
    sess = req.session;
    try {
        const Projects = await projectController.projectslisting();
        res.render('projectslisting', {
            data: Projects, name: sess.name, role: sess.role, layout: false
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}


projectController.editProject = async (req, res) => {
    try {
        sess = req.session
        const _id = req.params.id;

        const ProjectData = await Project.findById(_id);
        res.render('editProject', {
            data: ProjectData, role: sess.role, name: sess.name, layout: false
        });
        // res.json({ data: blogs, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

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
            updated_at: Date(),
        }
        const updateEmployee = await Project.findByIdAndUpdate(_id, updateProject);
        res.redirect("/projectslisting");

        // res.json({ data: blogs, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

}

projectController.deleteproject = async (req, res) => {
    try {
        const _id = req.params.id;
        await Project.findByIdAndDelete(_id);
        res.redirect("/projectslisting");
    } catch (e) {
        res.status(400).send(e);
    }
}

module.exports = projectController