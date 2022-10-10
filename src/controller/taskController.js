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
        const tasks = await task.find();
        res.render('taskListing', {
            data: tasks, name: sess.name, role: sess.role, layout: false
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }


};
// var MongoClient = require('mongodb').MongoClient;
// var url = "mongodb://127.0.0.1:27017/";

// MongoClient.connect(url, function (err, db) {
//     if (err) throw err;
//     const dbo = db.db("EMS");
//     dbo.collection('orders').aggregate([
//         {
//             $lookup:
//             {
//                 from: 'products',
//                 localField: 'product_id',
//                 foreignField: '_id',
//                 as: 'orderdetails'
//             }
//         }
//     ]).toArray(function (err, res) {
//         if (err) throw err;
//         console.log(JSON.stringify(res));
//         db.close();
//     });
// });
module.exports = taskController