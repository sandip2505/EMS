const Project = require("../model/createProject");
const user = require("../model/user");
const technology = require("../model/technology");
const axios = require('axios');
require("dotenv").config();

const projectController = {}

projectController.getProject = async (req, res) => {
    sess = req.session;
    const UserData = await user.find();
    const TechnologyData = await technology.find();
    res.render("createProject", { userdata: UserData, TechnologyData: TechnologyData, username: sess.username, layout: false });
};

projectController.addProject = async (req, res) => {

    axios.post(process.env.BASE_URL + "/projectsadd/", {
        title: req.body.title,
        short_description: req.body.short_description,
        start_date: req.body.start_date,
        end_date: req.body.end_date,
        status: req.body.status,
        technology: req.body.technology,
        project_type: req.body.project_type,
        user_id: req.body.user_id,
    }
    ).then(function (response) {
        res.redirect("/projectslisting")
    })
        .catch(function (response) {
            console.log(response);
        });

};

projectController.projectslisting = async (req, res) => {
    axios({
        method: "get",
        url: process.env.BASE_URL + "/projects/",
    })
        .then(function (response) {
            sess = req.session;
            res.render("projectslisting", {
                projectsdata: response.data.Projects, username: sess.username, users: sess.userData,
            });
        })
        .catch(function (response) {
            console.log(response);
        });
};

projectController.editProject = async (req, res) => {
    const _id = req.params.id;
    axios({
        method: "get",
        url: process.env.BASE_URL + "/projectEdit/" + _id,
    })
        .then(function (response) {
            sess = req.session;
            res.render("editProject", {
                projectsdata: response.data.ProjectData, userdata: response.data.UserData, technologyData: response.data.technologyData, username: sess.username, users: sess.userData,
            });
        })
        .catch(function (response) {
        });
};

projectController.updateProject = async (req, res) => {
    const _id = req.params.id;
    axios({
        method: "post",
        url: process.env.BASE_URL + "/projectEdit/" + _id,
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
        url: process.env.BASE_URL + "/projectdelete/" + _id,
    })
        .then(function (response) {
            sess = req.session;
            res.redirect("/projectslisting");
        })
        .catch(function (response) {
        });
};

module.exports = projectController