const Project = require("../model/createProject");
const user = require("../model/user");
const technology = require("../model/technology");
const axios = require('axios');

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
    axios({
        method: "get",
        url: "http://localhost:44000/projects/",
    })
        .then(function (response) {
            sess = req.session;
            res.render("projectslisting", {
                data: response.data.Projects, username: sess.username, users: sess.userData,
            });
        })
        .catch(function (response) {
            console.log(response);
        });

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
    const _id = req.params.id;
    axios({
        method: "get",
        url: "http://localhost:44000/projectEdit/" + _id,
    })
        .then(function (response) {
            sess = req.session;
            res.render("editProject", {
                data: response.data.ProjectData, userdata: response.data.UserData, technologyData: response.data.technologyData, username: sess.username, users: sess.userData,
            });
        })
        .catch(function (response) {
        });

};

projectController.updateProject = async (req, res) => {
    const _id = req.params.id;
    axios({
        method: "post",
        url: "http://localhost:44000/projectEdit/" + _id,
        data: {
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
    }).then(function (response) {
        res.redirect("/projectslisting");
    })
        .catch(function (response) {

        });
};

projectController.deleteproject = async (req, res) => {
    const _id = req.params.id;
    axios({
        method: "post",
        url: "http://localhost:44000/projectdelete/" + _id,
    })
        .then(function (response) {
            // console.log("sandip", response);
            sess = req.session;
            res.redirect("/projectslisting");
        })
        .catch(function (response) {
        });
};

module.exports = projectController