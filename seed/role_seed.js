var addrole = require('../src/model/roles');
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://0.0.0.0:27017/ems');

var Role = [


    new addrole({
        role_name: 'admin',
        role_description: 'you are admin',
    }),
    new addrole({
        role_name: 'Software engineer',
        role_description: 'you are Software engineer',
    }),
    new addrole({
        role_name: 'team leader',
        role_description: 'you are team leader',
    }),
    new addrole({
        role_name: 'project manager',
        role_description: 'you are project manager',
    }),
    new addrole({
        role_name: 'user',
        role_description: 'you are user',
    }),


];
//save function is asynchronous
//so we need to ceck all itmes are saved before we disconnect to db
done = 0;
for (i = 0; i < Role.length; i++) {
    Role[i].save(function (err, result) {
        done++;
        if (done == Role.length) {
            exit();
        }
    });
}

function exit() {
    mongoose.disconnect();
}