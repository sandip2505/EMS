
// const userPermission = require("../model/userPermission");
const getPermission = require("../model/addpermissions");
const Role = require("../model/roles");
const userPermission = require("../model/userPermission");

const permissionController = {}

permissionController.getpermission = async (req, res) => {
        sess = req.session;
        const _id = req.params.id;
        const roleData = await Role.findById(_id);

        const blogs = await getPermission.find();
        // const roleData = await Role.find();

        res.render("userPermission", { data: blogs, roledata: roleData, name: sess.name, role: sess.role, layout: false });
};
permissionController.addpermission = async (req, res) => {

        try {

                const addpermission = new userPermission({
                        role_id: req.body.role_id,
                        permission_id: req.body.permission_id,
                });

                const permissionadd = await addpermission.save();
                res.status(201).redirect("/index");

        } catch (e) {
                res.status(400).send(e);
        }

}
permissionController.viewrolepermission = async (req, res) => {

        sess = req.session;
        try {
                const role_per_data = await userPermission.find();
                // const Role = await Role.find();
                // console.log(Role)
                // const getPermission = await getPermission.find();
                res.render('role_permissionslisting', {
                        data: role_per_data, name: sess.name, role: sess.role, layout: false
                });
        } catch (err) {
                res.status(500).json({ error: err.message });
        }

};


module.exports = permissionController;