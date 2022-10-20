
const getPermission = require("../model/addpermissions");
const Role = require("../model/roles");
const rolePermission = require("../model/rolePermission");

const permissionController = {}

permissionController.getpermission = async (req, res) => {
        sess = req.session;
        const _id = req.params.id;

<<<<<<< HEAD
        const rolePermissiondata = await rolePermission.find({ role_id: _id })

=======
        const rolePermissiondata= await rolePermission.find({role_id:_id})

        
       
>>>>>>> 91e9f52fd49c566031ddf4eb43aebe962f2e95dc
        var rolepermission = [];
        var roleId = [];

        rolePermissiondata.forEach(element => {
                rolepermission.push(element.permission_id)


        });
        const roles = rolepermission.toString()
        console.log(roles)




        const roleData = await Role.findById(_id);

        const blogs = await getPermission.find();
        // console.log(blogs._id)
        // const roleData = await Role.find(

<<<<<<< HEAD


        res.render("role_permission", { data: blogs, username: sess.username, datas: roles, roles: roleId, users: sess.userData, roledata: roleData, name: sess.name, role: sess.role, layout: false });

=======
 
        res.render("role_permission", { data: blogs,  username:sess.username, datas:roles, roles:roleId,  users:sess.userData, roledata: roleData, name: sess.name, role: sess.role, layout: false });
>>>>>>> 91e9f52fd49c566031ddf4eb43aebe962f2e95dc
};
permissionController.addpermission = async (req, res) => {

        try {
                const _id = req.params.id;
                // console.log(_id)
                const id = await rolePermission.find({ role_id: _id })
                console.log(id)
                if (id) {
                        const deletepermission = await rolePermission.findByIdAndDelete(id);


                        const addpermission = new rolePermission({
                                role_id: req.body.role_id,
                                permission_id: req.body.permission_id,
                        });

                        const permissionadd = await addpermission.save();
                        res.status(201).redirect("/roleListing");
                }
                else {
                        const addpermission = new rolePermission({
                                role_id: req.body.role_id,
                                permission_id: req.body.permission_id,
                        });

                        const permissionadd = await addpermission.save();
                        res.status(201).redirect("/roleListing");
                }


        } catch (e) {
                res.status(400).send(e);
        }

}

module.exports = permissionController;