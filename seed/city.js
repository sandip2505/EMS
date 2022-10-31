var addcity = require('../src/model/country');
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://0.0.0.0:27017/ems');

var city = [


    new addcity({
        city: 'Ahmedabad'
    }),
    new addcity({
        city: 'surat'
    }),
    new addcity({
        city: 'Vadodara'
    }),
    new addcity({
        city: 'Rajkot'
    }),
    new addcity({
        city: 'Bhavnagar'
    }),
    new addcity({
        city: 'Jamnagar'
    }),
    new addcity({
        city: 'Gandhinagar'
    }),
    new addcity({
        city: 'Junagadh'
    }),
    new addcity({
        city: 'Gandhidham'
    }),
    new addcity({
        city: 'Anand'
    }),
    new addcity({
        city: 'Navsari'
    }),
    new addcity({
        city: 'Morbi'
    }),
    new addcity({
        city: 'Nadiad'
    }),
    new addcity({
        city: 'Surendranagar'
    }),
    new addcity({
        city: 'Bharuch'
    }),
    new addcity({
        city: 'Mehsana'
    }),
    new addcity({
        city: 'Bhuj'
    }),
    new addcity({
        city: 'Porbandar'
    }),
    new addcity({
        city: 'Palanpur'
    }),
    new addcity({
        city: 'Valsad'
    }),
    new addcity({
        city: 'Vapi'
    }),
    new addcity({
        city: 'Gondal'
    }),
    new addcity({
        city: 'Veraval'
    }),
    new addcity({
        city: 'Godhra'
    }),
    new addcity({
        city: 'Patan'
    }),
    new addcity({
        city: 'Kalol'
    }),
    new addcity({
        city: 'Dahod'
    }),
    new addcity({
        city: 'Botad'
    }),
    new addcity({
        city: 'Amreli'
    }),
    new addcity({
        city: 'Deesa'
    }),
    new addcity({
        city: 'Jetpur'
    }),


];
//save function is asynchronous
//so we need to ceck all itmes are saved before we disconnect to db
done = 0;
for (i = 0; i < city.length; i++) {
    city[i].save(function (err, result) {
        done++;
        if (done == city.length) {
            exit();
        }
    });
}

function exit() {
    mongoose.disconnect();
}