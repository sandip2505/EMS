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


projectuserController.addprojectuserlist = async (req, res) => {
    sess = req.session;
    try {
        const userprojects = await userproject.aggregate([
            {
                $lookup:
                {
                    from: "projects",
                    localField: "project",
                    foreignField: "_id",
                    as: "test"
                },

            },
            {

                $lookup:
                {
                    from: "tasks",
                    localField: "task",
                    foreignField: "_id",
                    as: "test1"
                }
            },
            {

                $lookup:
                {
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as: "test2"
                }
            }

        ]);
        // console.log(userprojects);

        res.render('projectuserlist', {
            data: userprojects, name: sess.name, username: sess.username, users: sess.userData, role: sess.role, layout: false
        });
        // res.json({ data: blogs, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

}
projectuserController.editProjectuser = async (req, res) => {
    try {
        const userprojects = await userproject.aggregate([
            {
                "$lookup": {
                    "from": "projects",
                    "let": { "project": "$_id" },
                    "pipeline": [
                        { "$addFields": { "project": { "$toObjectId": "$project" } } },
                        { "$match": { "$expr": { "$eq": ["$project", "$project"] } } }
                    ],
                    "as": "output"
                }
            }
        ])
        db.userproject.aggregate([
            { "$addFields": { "userId": { "$toString": "$_id" } } },
            {
                "$lookup": {
                    "from": "user",
                    "localField": "userId",
                    "foreignField": "userId",
                    "as": "output"
                }
            }
        ])
        console.log(userprojects);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
// projectuserController.updateRole = async (req, res) => {
//     try {
//         const _id = req.params.id;
//         const role = {
//             role_name: req.body.role_name,
//             role_description: req.body.role_description,
//             permission_name: req.body.permission_name,
//             updated_at: Date(),
//         }

//         const updateEmployee = await Role.findByIdAndUpdate(_id, role);
//         res.redirect("/roleListing");
//     } catch (e) {
//         res.status(400).send(e);
//     }
// }
projectuserController.projectdelete = async (req, res) => {
    try {
        const _id = req.params.id;
        await userproject.findByIdAndDelete(_id);
        res.redirect("/projectuserlist");
    } catch (e) {
        res.status(400).send(e);
    }
}



module.exports = projectuserController;