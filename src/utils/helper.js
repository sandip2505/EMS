const RolePermission = require('../model/rolePermission');
const UserPermission = require('../model/userPermission');
const Permission = require('../model/addpermissions');


class Helper {
    constructor() {}
    
    checkPermission(role_id, user_id, permission_name) {
        console.log("role_id",role_id);
        console.log("user_id",user_id);
        console.log("permission_name",permission_name);
      
        
        return new Promise(
            ( resolve, reject) => {
                UserPermission.find({ user_id: user_id,
                }).then((userperm) => {
                     console.log("userperm",userperm);
                    if (!userperm == []) {
                    const permission_id =userperm[0].permission_id
                    console.log("permission_id",permission_id);
                    RolePermission.find({ role_id: role_id,
                        
                    }).then((perm) => {
                        console.log("perm1",perm);
               
                        const  permission =perm[0].permission_id
                        console.log("id",permission);
                      
                     
                        Permission.find({ _id: permission
                          
                        }).then((rolePermission ) => {
                            console.log("rolePermission",rolePermission);
                        var hasPermision = false;
                        for (var i = 0; i < rolePermission.length; i++) {
                            
                            if(rolePermission[i].permission_name.includes(permission_name)) {
                                 hasPermision =true;
                                 
                            } 

                            const totalpermission = rolePermission[i].permission_name
                            
                        }
                        
                        if (hasPermision) {
                            resolve({status:true})
                        }else{
                            resolve({status:false});
                        }

                    }).catch((error) => {
                        reject("error");
                    });
                    }).catch((error) => {
                        reject("error2");
                    });


                    } else {
                       
                        const permission_id =userperm[0].permission_id
                        console.log("permission_id",permission_id);
                        Permission.find({ _id: permission_id,
                        
                    }).then((rolePermission ) => {
                        var hasPermision = false;
                        for (var i = 0; i < rolePermission.length; i++) {
                            
                            if(rolePermission[i].permission_name.includes(permission_name)) {
                                 hasPermision =true;
                                 
                            } 

                            const totalpermission = rolePermission[i].permission_name
                            
                        }
                        
                        if (hasPermision) {
                            resolve({status:true})
                        }else{
                            resolve({status:false});
                        }

                    }).catch((error) => {
                        reject("error");
                    });
                   
                }
                }).catch(() => {
                    reject({message: 'Forbidden2'});
                });
            }
        );
    }

}


module.exports = Helper;