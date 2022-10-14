

var adduser = require('../src/model/user');
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://0.0.0.0:27017/ems');

var User = [


    new adduser({

        role_id: '6348f17e5990390e9f4a5154',
        emp_code: 'AK47',
        reporting_user_id: '458692',
        firstname: "sandip",
        user_name: 'sandip_05',
        password: 'sandip@123',
        middle_name: 'r',
        last_name: 'ganava',
        gender: 'male',
        dob: '25/5/2001',
        doj: '13/7/2022',
        personal_email: 'sandip@gmail.com',
        company_email: 'sandip.ganava@codecrewinfotech.com',
        mo_number: '7984455302',
        pan_number: 'ASDAFASA65',
        aadhar_number: '52658459856256',
        add_1: 'vastral',
        add_2: 'CTM',
        city: 'ahmdabad',
        state: 'gujarat',
        pincode: '382418',
        country: 'india',
        photo: 'sandip.jpg',
        bank_account_no: '196670316005',
        bank_name: 'bank of codecrew',
        ifsc_code: 'GSJKJDISj55',

    }),



];
//save function is asynchronous
//so we need to ceck all itmes are saved before we disconnect to db
done = 0;
for (i = 0; i < User.length; i++) {
    User[i].save(function (err, result) {
        done++;
        if (done == User.length) {
            exit();
        }
    });
}

function exit() {
    mongoose.disconnect();
}