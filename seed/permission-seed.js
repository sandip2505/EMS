var addpermission = require('../src/model/addpermissions');
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://0.0.0.0:27017/ems3');

var holiday = [

     addpermission({
        permission_name: 'View Holiday',
        permission_description: 'a',
    }),
    
     addpermission({
        permission_name: 'Add Holiday',
        permission_description: 'a',
    }),

     addpermission({
        permission_name: 'Update Holiday',
        permission_description: 'a',
    }),
     addpermission({
        permission_name: 'Delete Holiday',
        permission_description: 'a',

    }),
]
var role = [
     addpermission({
        permission_name: 'View Role',
        permission_description: 'a',
    }),
    
     addpermission({
        permission_name: 'Add Role',
        permission_description: 'a',
    }),
     addpermission({
        permission_name: 'Update Role',
        permission_description: 'a',
    }),
     addpermission({
        permission_name: 'Delete Role',
        permission_description: 'a',
    }),
]
// var allPermission =[]
var emsdb = holiday.concat(role);

// new addpermission({
    //     permission_name: 'View Permissions',
    //     permission_description: 'you can View Permissions',
    // }),

    // new addpermission({
    //     permission_name: 'Add Permission',
    //     permission_description: 'you can Add Permission',
    // }),
    // new addpermission({
    //     permission_name: 'Update Permission',
    //     permission_description: 'you can delete role',
    // }),
    // new addpermission({
    //     permission_name: 'Delete Permission',
    //     permission_description: 'you can delete role',
    // }),
    // new addpermission({
    //     permission_name: 'View Projects',
    //     permission_description: 'you can View Projects',
    // }),

    // new addpermission({
    //     permission_name: 'Add Project',
    //     permission_description: 'you can add project',
    // }),
    // new addpermission({
    //     permission_name: 'Edit Project',
    //     permission_description: 'you can Edit Project',
    // }),
    // new addpermission({
    //     permission_name: 'Delete Project',
    //     permission_description: 'you can delete Project',
    // }),

    // new addpermission({
    //     permission_name: 'View Tasks',
    //     permission_description: 'you can View Tasks',
    // }),

    // new addpermission({
    //     permission_name: 'Add Task',
    //     permission_description: 'you can Add Tasks',
    // }),

    // new addpermission({
    //     permission_name: 'Edit Task',
    //     permission_description: 'you can Edit Task',
    // }),
    // new addpermission({
    //     permission_name: 'Delete Task',
    //     permission_description: 'you can Delete Task',
    // }),
    // new addpermission({
    //     permission_name: 'Add User Permission',
    //     permission_description: 'you can Add User Permission',
    // }),
    // new addpermission({
    //     permission_name: 'Add Role Permission',
    //     permission_description: 'you can Add ROle Permission',
    // }),




// ];
//save function is asynchronous
//so we need to ceck all itm    es are saved before we disconnect to db

done = 0;
// getHoliday = async (req, res) => {
for (i = 0; i < emsdb.length; i++){
    emsdb[i].save(function (err, result) {
        done++;
    });
}
// }
function exit() {
    mongoose.disconnect();
}