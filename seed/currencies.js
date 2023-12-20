var Currency = require("../src/model/currencie");
var PaymentMode = require("../src/model/paymentmode");
var Permissions = require("../src/model/addpermissions");
require("dotenv").config();
// const conn = process.env.CONNECTION;


// seeds/currencySeed.js
var mongoose = require("mongoose");
mongoose.Promise = global.Promise;
mongoose.set("strictQuery", false);
mongoose.connect("mongodb://0.0.0.0:27017/ems");


const currencyData = require('./currencyData.json'); 
const paymentmodeData = require('./paymentmode'); 
const permissionData = require('./permission.json'); 
async function seedDatabase() {
  try {
    await Currency.deleteMany({});
    await Currency.insertMany(currencyData.currencies);currencyData
    
    await PaymentMode.deleteMany({});
    await PaymentMode.insertMany(paymentmodeData.payment_modes);

    // await Permissions.deleteMany({});
    await Permissions.insertMany(permissionData.permission);

    console.log('Database seeded successfully');
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    mongoose.connection.close();
  }
}


seedDatabase();
