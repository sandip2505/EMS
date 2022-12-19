var adduser = require('../src/model/user');
var mongoose = require('mongoose');
const { Logger } = require('mongodb');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://0.0.0.0:27017/ems');

var city = [

    new adduser({
        role_id: "role[0]._id",
        emp_code: 'JSJDUAU6876D',
        reporting_user_id: '6360fd0de33359b3e4b6cf33',
        firstname: "test",
        user_name: 'test_05',
        password: 'test@123',
        middle_name: 'test',
        last_name: 'test',
        gender: 'male',
        dob: '25/5/2001',
        doj: '13/7/2022',
        personal_email: 'test123@gmail.com',
        company_email: 'test.test@codecrewinfotech.com',
        mo_number: '7984455302',
        pan_number: 'ASDAFASA65',
        aadhar_number: '52658459856256',
        add_1: 'vastral',
        add_2: 'CTM',
        city: 'ahmdabad',
        state: 'gujarat',
        pincode: '382418',
        country: 'india',
        photo: 'test.jpg',
        bank_account_no: '196670316005',
        bank_name: 'bank of codecrew',
        ifsc_code: 'GSJKJDISj55',
        token: 'GSJKJDISj55',
    }),
    


];
// console.log("user",city);
//save function is asynchronous
//so we need to ceck all itmes are saved before we disconnect to db

done = 0;
for (i = 0; i < city.length; i++) {
    console.log("user",city[i]);
    city[i].save(function (err, result) {
        console.log(err);
        console.log(result);
        done++;
        if (done == city.length) {
            exit();
        }
    });
}

function exit() {
    mongoose.disconnect();
}