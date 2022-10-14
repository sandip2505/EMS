const getPermission = require("../model/addpermissions");
const user = require("../model/user");
const Role = require("../model/roles");
const rolepermisssion= require("../model/rolePermission") 
const userP = require("../model/userPermission");

const userPermisssionController = {}

userPermisssionController.getpermission = async (req, res) => {
        sess = req.session;
        const _id = req.params.id;
      console.log(_id)


        const rolePermissiondata= await rolepermisssion.find({role_id:"633acfc4e30b72fe0059c84b"})
        var rolePermission = [];
        rolePermissiondata.forEach(element => {
                rolePermission.push(element.permission_id)
        });
        //   const roless = rolePermissiondata._id;


        const roleData = await user.findById(_id);
        const blogs = await getPermission.find();
        const filterData = await getPermission.find(); 
        const blog = await userP.findById(_id);
        console.log(blog)   
        // const roleData = await Role.find(
        res.render("userPermission", { data: blogs, roledata: roleData, datas:rolePermission, userdata:blog ,  name: sess.name, role: sess.role ,   username:sess.username, layout: false });
};
userPermisssionController.addpermission = async (req, res) => {

        try {
                const _id = req.params.id;
                console.log(_id)

                const id =await userP.find({role_id:_id})
                console.log(id)
if(id){
                const addpermission = new userP({
                        user_id : req.body.user_id,
                        role_id: req.body.role_id,
                        permission_id: req.body.permission_id,
                });

                const permissionadd = await addpermission.save();
                res.status(201).redirect("/index");
        }
        else{
                const _id = req.params.id;
                const updatepermission = await userP.findByIdAndUpdate(_id, req.body);
                res.redirect("/employeelisting");
        
        }
              
        } catch (e) {
                res.status(400).send(e);
        }

}

module.exports = userPermisssionController;