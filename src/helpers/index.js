const axios = require("axios");
const settings = require("../model/settings");
const Permission = require("../model/addpermissions");
var rolepermission = require("../model/rolePermission")
var userPermissions = require("../model//userPermission")
exports.axiosdata = function (method, url, jwt, data) {
    // console.log("url", url);
  return axios({
    method: method,
    url: process.env.BASE_URL + url,
    headers: {
      "x-access-token": jwt,
    },
    data: data
  })
};


exports.getSettingData = async function (key) {
   const settingData = await settings.find({ key: key })
   if(settingData.length>0){
    return  settingData[0].value;
   }else{
    return null;
   }

};

exports.getpermission  = async function (user) {
var rolehasPermission = await rolepermission.find({role_id:user.role_id}) 
var permissions =  await Permission.find({_id:rolehasPermission[0].permission_id})

var permissionName = [] 
permissions.forEach(function(allPermmission){
  permissionName.push(allPermmission.permission_name)
})
// const user_id = user._id
// const userPermissiondata = await userPermissions.find({user_id: user_id });
// // console.log(userPermissiondata)
// if (userPermissiondata.length > 0) {
//   const userpermission = userPermissiondata[0].permission_id;
//   const userPerm = await Permission.find({ _id: userpermission });
//   // console.log("holidayuserPerm",holidayuserPerm)
//   var userpermissionName = [];
//   for (var i = 0; i < userPerm.length; i++) {
//     userpermissionName.push(userPerm[i].permission_name);
//   }
// }
// // console.log("roleperm",permissionName)
// // console.log("userperm",userpermissionName)

// var allPerm = permissionName.concat(userpermissionName);

// var Allpermission = [...new Set(allPerm)];
// // console.log("no",Allpermission)
// // console.log(allPerm)
return permissionName;
}