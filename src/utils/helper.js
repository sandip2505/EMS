const RolePermission = require("../model/rolePermission");
const UserPermission = require("../model/userPermission");
const Permission = require("../model/addpermissions");

class Helper {
  constructor() {}

  checkPermission(role_id, user_id, permission_name) {
    return new Promise((resolve, reject) => {
      UserPermission.find({ user_id: user_id })
        .then(async(userperm) => {
          if (userperm.length > 0) {
            const roleData = await RolePermission.find({ role_id: role_id });
            //  //console.log(roleData)
             const rolepermission = roleData[0].permission_id;
             const rolePerm =  await Permission.find({ _id: rolepermission });
             const permissionId = userperm[0].permission_id
             var rolepermissionName = [];
           for (var i = 0; i < rolePerm.length; i++) {
               rolepermissionName.push(rolePerm[i].permission_name);
             }
            //  const permission_id = userperm[0].permission_id;

            var hasPermision = false;
            var userPermissionName = [];
            Permission.find({ _id: permissionId })
              .then((userPermission) => {
                for (var i = 0; i < userPermission.length; i++) {
                  userPermissionName.push(userPermission[i].permission_name);
                
                const allPerm = rolepermissionName.concat(userPermissionName);
                var Allpermission = [...new Set(allPerm)];
                // //console.log(Allpermission)
                //  //console.log("asd",Allpermission.includes(permission_name))
                if (Allpermission.includes(permission_name)) {
                  hasPermision = true;
                }

                 const totalpermission = userPermission[i].permission_name;
              }
                if (hasPermision) {
                  resolve({ status: true });
                } else {
                  resolve({ status: false });
                }
              })
              .catch((error) => {
                reject("error");
              });
          } else if (userperm.length == 0) {
            RolePermission.find({ role_id: role_id })
              .then((perm) => {
                if (perm.length > 0) {
                  const permission = perm[0].permission_id;
                  
                 
                  Permission.find({ _id: permission })
                    .then((rolePermission) => {
                      var hasPermision = false;
                      for (var i = 0; i < rolePermission.length; i++) {
                        if (
                          rolePermission[i].permission_name == permission_name
                        ) {
                          hasPermision = true;
                        }

                        const totalpermission =
                          rolePermission[i].permission_name;
                      }

                      if (hasPermision) {
                        resolve({ status: true });
                      } else {
                        resolve({ status: false });
                      }
                    })
                    .catch((error) => {
                      reject("error");
                    });
                } else {
                  resolve({ status: false });
                }
              })
              .catch((error) => {
                reject("error2");
              });
          }
        })
        .catch((message) => {
          reject({ message: message });
        });
    });
  }
}

module.exports = Helper;
