const task = require('../model/createTask')
const project = require('../model/createProject')
const axios = require('axios');
const user = require('../model/user')
const connect = require('../db/conn')
const projectController = require('./projectController')
const BSON = require('bson');

const taskController = {}

taskController.createtask = async (req, res,) => {
    sess = req.session;
    const user_id = sess.userData._id

    try {

        const projectData = await project.find({ user_id: user_id });


        res.render("createTask", { data: projectData, users: sess.userData, username: sess.username });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

taskController.addtask = async (req, res) => {
    axios.post("http://localhost:46000/taskadd/", {
        project_id: req.body.project_id,
        user_id: req.body.user_id,
        title: req.body.title,
        short_description: req.body.short_description,
    }
    ).then(function (response) {
        res.redirect("/taskListing")
    })
        .catch(function (response) {
            console.log(response);
        });

}

taskController.taskListing = async (req, res) => {

    axios({
        method: "get",
        url: "http://localhost:46000/listTasks/",
    })
        .then(function (response) {
            sess = req.session;
            res.render("taskListing", {
                data: response.data.tasks, username: sess.username, users: sess.userData,
            });
        })
        .catch(function (response) {
            console.log(response);
        });

};
taskController.editTask = async (req, res) => {
    const _id = req.params.id;
    axios({
        method: "get",
        url: "http://localhost:46000/taskedit/" + _id,
    })
        .then(function (response) {
            console.log(response.data);
            sess = req.session;
            res.render("editask", {
                data2: response.data.tasks, data: response.data.projectData, username: sess.username, users: sess.userData,
            });
        })
        .catch(function (response) {
        });
}
taskController.updateTask = async (req, res) => {
    const _id = req.params.id;
    axios({
        method: "post",
        url: "http://localhost:46000/taskedit/" + _id,
        data: {
            project_id: req.body.project_id,
            user_id: req.body.user_id,
            title: req.body.title,
            short_description: req.body.short_description,
            updated_at: Date()
        }
    }).then(function (response) {
        res.redirect("/taskListing");
    })
        .catch(function (response) {

        });
};

taskController.getUserByProject = async (req, res) => {
    const _id = new BSON.ObjectId(req.params.id);
    try {

        const tasks = await project.aggregate([
            { $match: { _id: _id } },
            {
                $lookup:
                {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "userData"
                }
            }
        ]);
        return res.status(200).json({ tasks });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}




taskController.deletetask = async (req, res) => {
    const _id = req.params.id;
    axios({
        method: "post",
        url: "http://localhost:46000/TaskDelete/" + _id,
    })
        .then(function (response) {
            sess = req.session;
            res.redirect("/taskListing");
        })
        .catch(function (response) {
        });
}

module.exports = taskController