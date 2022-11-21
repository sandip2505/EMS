
const getPermission = require("../model/addpermissions");
const Role = require("../model/roles");
const rolePermission = require("../model/rolePermission");
const axios = require("axios")

const rolePermissionController = {}
rolePermissionController.getpermission = async (req, res) => {
        // sess = req.session;
        const _id = req.params.id;

        // const rolePermissiondata = await rolePermission.find({ role_id: _id })
        // var rolepermission = [];
        // var roleId = [];

        // rolePermissiondata.forEach(element => {
        //         rolepermission.push(element.permission_id)
        // });
        // const roles = rolepermission.toString()
        // const roleData = await Role.findById(_id);
        // const blogs = await getPermission.find();
        // res.render("role_permission", { data: blogs, username: sess.username, datas: roles, roles: roleId, roledata: roleData,layout: false });

        axios({
                method: "get",
                url: "http://localhost:46000/rolepermissions/"+_id,
                data:{
                        _id:req.params.id
                }
              })
                .then(function (response) {
                        // console.log("aman",response)
                  sess = req.session;
                  res.render("role_permission", { data:response.data.blogs,username:sess.username, datas: response.data.roles, roledata:response.data.roleData,layout: false });
                })
                .catch(function (response) {
                  console.log(response);
                });
            
            }

 rolePermissionController.addpermission = async (req, res) => {

        // try {
        //         const _id = req.params.id;
        //         const id = await rolePermission.find({ role_id: _id })

        //         if (id) {
        //                 const deletepermission = await rolePermission.findByIdAndDelete(id);
        //                 const addpermission = new rolePermission({
        //                         role_id: req.body.role_id,
        //                         permission_id: req.body.permission_id,
        //                 });
        //                 const permissionadd = await addpermission.save();
        //                 res.status(201).redirect("/roleListing");
        //         }
        //         else {
        //                 const addpermission = new rolePermission({
        //                         role_id: req.body.role_id,
        //                         permission_id: req.body.permission_id,
        //                 });

        //                 const permissionadd = await addpermission.save();
        //                 res.status(201).redirect("/roleListing");
        //         }
        // } catch (e) {
        //         res.status(400).send(e);
        // }


        const _id = req.params.id;
        axios({
          method: "post",
          url: "http://localhost:46000/rolepermissions/" + _id,
          data: {
                role_id: req.body.role_id,
                permission_id: req.body.permission_id,
          }
        }).then(function (response) {
          res.redirect("/roleListing");
        })
          .catch(function (response) {
        
          });
};



module.exports = rolePermissionController;