const RolePermission = require('../model/rolePermission');
const Permission = require('../model/addpermissions');


class Helper {
    constructor() {}

    checkPermission(role_id, permission_name) {
        return new Promise(
            ( resolve, reject) => {
                RolePermission.find({ role_id: role_id,
                // Permission.find({ permission_name: permission_name
                  
                }).then((perm) => {
                    const  permission_id =perm[0].permission_id
                    // console.log("perm",permission_id);
                    Permission.find({ _id: permission_id
                        // permission_id: permission_id
                      
                    }).then((rolePermission ) => {
                        var hasPermision = false;
                        for (var i = 0; i < rolePermission.length; i++) {
                            
                            console.log((rolePermission[i].permission_name.includes(permission_name)));
                            if(rolePermission[i].permission_name.includes(permission_name)) {
                                 hasPermision =true;
                                 
                                // reject({message:"done"});
                            } 

                            console.log("role and permision",rolePermission[i].permission_name);
                        }
                        
                        console.log("hasPermision",hasPermision);
                        if (hasPermision) {
                            resolve({status:true})
                        }else{
                            resolve({status:false});
                        }

                    }).catch((error) => {
                        reject(error);
                    });
                }).catch(() => {
                    reject({message: 'Forbidden2'});
                });
            }
        );
    }
}


module.exports = Helper;