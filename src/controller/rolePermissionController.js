
const getPermission = require("../model/addpermissions");
const Role = require("../model/roles");
const rolePermission = require("../model/rolePermission");

const permissionController = {}

permissionController.getpermission = async (req, res) => {
        sess = req.session;
        const _id = req.params.id;
        const roleData = await Role.findById(_id);

        const blogs = await getPermission.find();
        // const roleData = await Role.find(


        res.render("role_permission", { data: blogs,  username:sess.username, roledata: roleData, name: sess.name, role: sess.role, layout: false });
};
permissionController.addpermission = async (req, res) => {

        try {

                const addpermission = new rolePermission({
                        role_id: req.body.role_id,
                        permission_id: req.body.permission_id,
                });

                const permissionadd = await addpermission.save();
                res.status(201).redirect("/index");

        } catch (e) {
                res.status(400).send(e);
        }

}

module.exports = permissionController;