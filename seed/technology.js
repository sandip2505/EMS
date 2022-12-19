var addtechnology = require('../src/model/technology');
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://0.0.0.0:27017/ems');

var technology = [

    new addtechnology({
        technology: 'Node js '
    }),
    new addtechnology({
        technology: 'React js'
    }),
    new addtechnology({
        technology: 'PHP'
    }),
    new addtechnology({
        technology: 'Java script'
    }),
    new addtechnology({
        technology: 'Java'
    }),
    new addtechnology({
        technology: 'Python'
    }),
    new addtechnology({
        technology: 'C#'
    }),
    new addtechnology({
        technology: 'HTML'
    }),
    new addtechnology({
        technology: 'Angular'
    }),
    new addtechnology({
        technology: 'Scala'
    }),
    new addtechnology({
        technology: 'CSS'
    }),
    new addtechnology({
        technology: 'C++'
    }),
    new addtechnology({
        technology: 'Ruby'
    }),
    new addtechnology({
        technology: 'Swift'
    }),
    new addtechnology({
        technology: 'Mongo db'
    }),
    new addtechnology({
        technology: 'MY SQL'
    }),
    new addtechnology({
        technology: 'TypeScript'
    }),
    new addtechnology({
        technology: 'ActionScript'
    }),


];


//save function is asynchronous
//so we need to ceck all itmes are saved before we disconnect to db
done = 0;
for (i = 0; i < technology.length; i++) {
    technology[i].save(function (err, result) {
        done++;
        if (done == technology.length) {
            exit();
        }
    });
}

function exit() {
    mongoose.disconnect();
}