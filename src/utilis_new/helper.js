const RolePermission = require("../model/rolePermission");
const UserPermission = require("../model/userPermission");
const Announcement = require("../model/Announcement");
const Permission = require("../model/addpermissions");
const { login } = require("../controller/userController");


  exports.checkPermission =  function(role_id, user_id, permission_name) {
    // console.log("Asdas")
    return new Promise((resolve, reject) => {
      UserPermission.find({ user_id: user_id })
        .then((userperm) => {
          if (userperm.length > 0) {
            const permission_id = userperm[0].permission_id;
            Permission.find({ _id: permission_id })
              .then((rolePermission) => {
                var hasPermision = false;
                for (var i = 0; i < rolePermission.length; i++) {
                  if (rolePermission[i].permission_name == permission_name) {
                    hasPermision = true;
                  }

                  const totalpermission = rolePermission[i].permission_name;
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
        .catch(() => {
          reject({ message: "Forbidden2" });
        });
    });
  }

 

// module.exports = Helper;