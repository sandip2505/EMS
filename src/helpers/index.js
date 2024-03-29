const axios = require("axios");
const settings = require("../model/settings");
const Permission = require("../model/addpermissions");
var rolepermission = require("../model/rolePermission")
var userPermissions = require("../model//userPermission")
exports.axiosdata = function (method, url, jwt, data) {
  // //console.log("data",data)
  const apiKey = process.env.API_KEY;
  return axios({
    method: method,
    url: process.env.BASE_URL + url,
    headers: {
      "x-access-token": jwt,
      "x-api-key":apiKey
    },
    // responseType: "arraybuffer",
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

 return permissionName;
}


