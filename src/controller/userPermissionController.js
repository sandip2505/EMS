
// const userPermission = require("../model/userPermission");
const getPermission = require("../model/addpermissions");
const Role = require("../model/roles");

const permissionController = {}

permissionController.getpermission = async (req, res) => {
        sess = req.session;
        const blogs = await getPermission.find();
        res.render("userPermission", { data: blogs, name: sess.name, role: sess.role, layout: false });
};
permissionController.addpermission = async (req, res) => {
        try {
                const _id = req.params.id;
                const addpermission = {
                        // role_name: req.body.role_name,
                        permission_name: req.body.permission_name,
                };
                console.log(addpermission)


                const Rolepermission = await Role.findByIdAndUpdate(_id, addpermission)
                res.status(201).redirect("/roleListing");

        } catch (e) {
                res.status(400).send(e);
        }
};


module.exports = permissionController;