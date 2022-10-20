const getPermission = require("../model/addpermissions");
const user = require("../model/user");
const Role = require("../model/roles");
const rolepermisssion= require("../model/rolePermission") 
const userP = require("../model/userPermission");

const userPermisssionController = {}

userPermisssionController.getpermission = async (req, res) => {
        const _id = req.params.id;
        const userData = await user.findById(_id);
        // console.log(userData)
        sess = req.session;
        const role_id = userData.role_id
        const userid = userData._id
        const rolePermissiondata= await rolepermisssion.find({role_id:role_id})
        const userPermissiondata= await userP.find({user_id:userid})
        // console.log(userPermissiondata)
        
        var userPermission = [];
        var userId = [];

        userPermissiondata.forEach(element => {
                userPermission.push(element.permission_id)
                userId.push(element.user_id)

        });
        const permissions = userPermission.toString()
        // console.log(permissions)


        var rolePermission = [];
        var roleId = [];

        rolePermissiondata.forEach(element => {
                rolePermission.push(element.permission_id)
                roleId.push(element.role_id)

        });
        const roles = rolePermission.toString()
        const roleData = await user.findById(_id);
        const blogs = await getPermission.find();
        const filterData = await getPermission.find(); 
 res.render("userPermission", { data: blogs, roledata:roleData, permissionData:permissions, users:sess.userData, roles:roleId, datas:roles,username:sess.username, layout: false });
};
userPermisssionController.addpermission = async (req, res) => {

        try {
                const _id = req.params.id;
                // console.log(_id)
                const id =await userP.find({user_id:_id})
               
if(id){
                const deletepermission  =  await userP.findByIdAndDelete(id);

                const addPermission = new userP({
                        user_id: req.body.user_id,
                        role_id: req.body.role_id,
                        permission_id: req.body.permission_id,
                     
                    });
                    const Tasktadd = await addPermission.save();


                
                res.status(201).redirect("/index");
        }
        else{
                const addPermission = new userP({
                        user_id: req.body.user_id,
                        role_id: req.body.role_id,
                        permission_id: req.body.permission_id,
                     
                    });
                    const Tasktadd = await addPermission.save();
        
        }
              
        } catch (e) {
                res.status(400).send(e);
        }

}

module.exports = userPermisssionController;