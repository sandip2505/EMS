const RolePermission = require('../model/rolePermission');
const UserPermission = require('../model/userPermission');
const Permission = require('../model/addpermissions');



class Helper {
    constructor() {}
    
    checkPermission(role_id, user_id, permission_name) {
       
        return new Promise(
            ( resolve, reject) => {
                UserPermission.find({ user_id: user_id,

                }).then((perm4) => {
                    console.log("perm4",perm4.permission_id);
                    RolePermission.find({ role_id: role_id,
                      
                    }).then((perm) => {
                        console.log("roleperm",perm);
                        const  permission_id =perm[0].permission_id
                        Permission.find({ _id: permission_id
                          
                        }).then((rolePermission ) => {
                        var hasPermision = false;
                        for (var i = 0; i < rolePermission.length; i++) {
                            
                            console.log((rolePermission[i].permission_name.includes(permission_name)));
                            if(rolePermission[i].permission_name.includes(permission_name)) {
                                 hasPermision =true;
                                 
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