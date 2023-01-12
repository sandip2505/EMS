const getPermission = require("../model/addpermissions");
const user = require("../model/user");
const rolepermisssion = require("../model/rolePermission")
const userP = require("../model/userPermission");
const axios = require("axios");

const userPermisssionController = {}

userPermisssionController.getUserPermission = async (req, res) => {
        const _id = req.params.id;
        // const userData = await user.findById(_id);
        // sess = req.session;
        // const role_id = userData.role_id

        // const rolePermissiondata = await rolepermisssion.find({ role_id: role_id })
        // const userid = userData._id
        // const userPermissiondata= await userP.find({user_id:userid})
        // var userPermission = [];
        // var userId = [];
        // userPermissiondata.forEach(element => {
        //         userPermission.push(element.permission_id)
        //         userId.push(element.user_id)

        // });
        // const permissions = userPermission.toString()
        // var rolePermission = [];
        // var roleId = [];

        // rolePermissiondata.forEach(element => {
        //         rolePermission.push(element.permission_id)
        //         roleId.push(element.role_id)

        // });
        // const roles = rolePermission.toString()
        // const roleData = await user.findById(_id);
        // const blogs = await getPermission.find();

        // const UserId=roleData._id;  
        // const roledatas = await user.aggregate([
               
        //         { $match: { _id: UserId } },
        //         {
    
        //             $lookup:
        //             {
        //                 from: "roles",
        //                 localField: "role_id",
        //                 foreignField: "_id",
        //                 as: "test"

        //         }
        // },
        //     ]);
        //     console.log(roledatas) 


        axios({
                method: "get",
                url: "http://localhost:44000/userpermissions/"+_id,
              })
                .then(function (response) {
           console.log("aman",response)
                  sess = req.session;
                //   res.render("userPermission", { data:response.data.blogs,username:sess.username, datas: response.data.roles, roledata:response.data.roleData,layout: false });
                   res.render("userPermission", { data: response.data.blogs, rol:response.data.roledatas, roledata:response.data.roleData, permissionData:response.data.permissions,roles:response.data.roleId, datas:response.data.roles,username:sess.username, layout: false });
                  // };
                })
                .catch(function (response) {
                  console.log(response);
                });
            
            }


userPermisssionController.addUserPermission = async (req, res) => {
        const _id = req.params.id
        axios({
                method: "post",
                url: "http://localhost:44000/userpermissions/"+_id,
                data:{
                        user_id: req.body.user_id,
                        role_id: req.body.role_id,
                        permission_id: req.body.permission_id,
                }
              })
                .then(function (response) {
        //    console.log("aman",response)
               res.redirect('/userListing')
                })
                .catch(function (response) {
                  console.log(response);
                });
            
            }


module.exports = userPermisssionController;