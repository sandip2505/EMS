var addpermission= require('../src/model/addpermissions');
var mongoose= require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://0.0.0.0:27017/ems');

var employee=[


    new addpermission({
        permission_name: 'add Employee',
        permission_description: 'you can add employee',
    }),
    new addpermission({
        permission_name: 'create project ',
        permission_description: 'you can create project',
    }),
    new addpermission({
        permission_name: 'add task ',
        permission_description: 'you can create task',
    }),
    new addpermission({
        permission_name: 'add all',
        permission_description: 'you can do every think',
    }),
   
];
//save function is asynchronous
//so we need to ceck all itmes are saved before we disconnect to db
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