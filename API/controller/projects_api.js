const project = require("../../src/model/createProject")
const permission = require("../../src/model/addpermissions")


const apicountroller = {};

apicountroller.projectslisting = async (req, res) => {
    sess = req.session;
    try {
        var output;
        const Projects = await project.find();
        // console.log(Projects)
        if (Projects.length > 0) {
            output = { 'success': true, 'message': 'Get all Project List', 'data': Projects };
        } else {
            output = { 'success': false, 'message': 'Something went wrong' };
        }
        res.end(JSON.stringify(output));

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

apicountroller.projectEdit = async (req, res) => {
    try {
        sess = req.session
        const _id = req.params.id;

        const ProjectData = await project.findById(_id);

        res.end(JSON.stringify(ProjectData));


    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

apicountroller.projectUpdate = async (req, res) => {
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
        const updateEmployee = await project.findByIdAndUpdate(_id, updateProject);
        res.end(JSON.stringify(updateProject));
        // res.redirect("/projectslisting");

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
apicountroller.projectdelete = async (req, res) => {
    try {
        const _id = req.params.id;
        await project.findByIdAndDelete(_id);
        res.send("deleted project")
    } catch (e) {
        res.status(400).send(e);
    }
}


apicountroller.permissions = async (req, res) => {
    sess = req.session;
    try {
        const permissionsdata = await permission.find();

        res.json({ permissionsdata });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}


apicountroller.newpermissions = async (req, res) => {
    try {
        const newpermissions = new permission({
            permission_name: req.body.permission_name,
            permission_description: req.body.permission_description
        });

        const permissionsadd = await newpermissions.save();
        res.json({ permissionsadd })
        // res.status(201).redirect("/viewpermissions");


    } catch (e) {
        res.status(400).send(e);
    }

}
apicountroller.permissionsedit = async (req, res) => {
    try {
        sess = req.session
        const _id = req.params.id;
        const permissiondata = await permission.findById(_id);
        res.json({ permissiondata })
        // res.json({ data: blogs, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

apicountroller.permissionsUpdate = async (req, res) => {
    try {
        const _id = req.params.id;
        const permissions = {
            permission_name: req.body.permission_name,
            permission_description: req.body.permission_description,
            updated_at: Date(),
        }
        const updatepermission = await permission.findByIdAndUpdate(_id, permissions);
        res.end(JSON.stringify(updatepermission));
    } catch (e) {
        res.status(400).send(e);
    }
}

apicountroller.permissionsdelete = async (req, res) => {
    try {
        const _id = req.params.id;
        await permission.findByIdAndDelete(_id);
        res.send("data deleted")
        // res.end(JSON.stringify("data deleted"));
        // res.redirect("/viewpermissions");
    } catch (e) {
        res.status(400).send(e);
    }
}



module.exports = apicountroller