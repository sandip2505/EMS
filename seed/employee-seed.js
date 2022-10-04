var addemployee= require('../src/model/employee');
var mongoose= require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://0.0.0.0:27017/ems');

var employee=[

  
  
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