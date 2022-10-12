const getPermission = require("../model/addpermissions");
const user = require("../model/user");
const Role = require("../model/roles");
const userPermission = require("../model/userPermission");

const userPermisssionController = {}

userPermisssionController.getpermission = async (req, res) => {
        sess = req.session;
        const _id = req.params.id;
        const roleData = await user.findById(_id);

        const blogs = await getPermission.find();
        // const roleData = await Role.find(


        res.render("userPermission", { data: blogs, roledata: roleData, name: sess.name, role: sess.role, layout: false });
};
userPermisssionController.addpermission = async (req, res) => {

        try {

                const addpermission = new userPermission({
                        user_id: req.body.user_id,
                        role_id: req.body.role_id,
                        permission_id: req.body.permission_id,
                });

                const permissionadd = await addpermission.save();
                res.status(201).redirect("/userListing");

        } catch (e) {
                res.status(400).send(e);
        }

}

module.exports = userPermisssionController;