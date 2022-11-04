var addpermission= require('../src/model/addpermissions');
var mongoose= require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://0.0.0.0:27017/ems');

var employee=[


    new addpermission({
        permission_name: 'Add Holiday',
        permission_description: 'you can add holiday',
    }),
    new addpermission({
        permission_name: 'Edit Holiday',
        permission_description: 'you can edit holiday',
    }),
    new addpermission({
        permission_name: 'Delete Holiday',
        permission_description: 'you can delete holiday',
    }),
    new addpermission({
        permission_name: 'Add Role',
        permission_description: 'you can add role',
    }),
    new addpermission({
        permission_name: 'Edit Role',
        permission_description: 'you can edit role',
    }),
    new addpermission({
        permission_name: 'Delete Role',
        permission_description: 'you can delete role',
    }),
    new addpermission({
        permission_name: 'Add Permission',
        permission_description: 'you can Add Permission',
    }),
    new addpermission({
        permission_name: 'Edit Permission',
        permission_description: 'you can delete role',
    }),
    new addpermission({
        permission_name: 'Delete Permission',
        permission_description: 'you can delete role',
    }),
    new addpermission({
        permission_name: 'Delete Role',
        permission_description: 'you can delete role',
    }),
   
];
//save function is asynchronous
//so we need to ceck all itm    es are saved before we disconnect to db

done=0;
for (i=0;i<employee.length;i++){
    employee[i].save(function(err,result){
        done++;
        if(done==employee.length){
            exit();
        }
    });
}

function exit() {
    mongoose.disconnect();
}