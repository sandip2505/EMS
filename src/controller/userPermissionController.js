
const userPermission = require("../model/userPermission");

const permissionController = {}

permissionController.getpermission = (req, res) => {
        sess = req.session;
        res.render("userPermission", { name: sess.name, role: sess.role, layout: false });
};
permissionController.addpermission = (req, res) => {
        sess = req.session;
        res.render("userPermission", { name: sess.name, role: sess.role, layout: false });
};


module.exports = permissionController;