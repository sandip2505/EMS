const project = require("../src/model/createProject")
// var data = require("../src/model/createProject")


const apicountroller = {};

apicountroller.projectslisting = async (req, res) => {
    sess = req.session;
    try {
        var output;
        const Projects = await project.find();
        console.log(Projects)
        if (Projects.length > 0) {
            output = { 'success': true, 'message': 'Get all Project List', 'data': Projects };
        } else {
            output = { 'success': false, 'message': 'Something went wrong' };
        }
        // res.end(JSON.stringify(output));
        res.end(JSON.stringify(output));
        // res.JSON('projectslisting', {
        //     data: Projects, name: sess.name, role: sess.role, layout: false
        // });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = apicountroller