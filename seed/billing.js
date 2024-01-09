let Currency = require("../src/model/currencie");
let PaymentMode = require("../src/model/paymentmode");
let Permissions = require("../src/model/addpermissions");
require("dotenv").config();
// const conn = process.env.CONNECTION;

// seeds/currencySeed.js
let mongoose = require("mongoose");
mongoose.Promise = global.Promise;
mongoose.set("strictQuery", false);
mongoose.connect("mongodb://0.0.0.0:27017/newems");
let country = require("../src/model/countries");

const countries = require("./countries.json");
const currencyData = require("./currencyData.json");
const paymentmodeData = require("./paymentmode.json");
const permissionData = require("./permission.json");
async function seedDatabase() {
  try {
    await Currency.deleteMany({});
    await Currency.insertMany(currencyData.currencies);

    await PaymentMode.deleteMany({});
    await PaymentMode.insertMany(paymentmodeData.payment_modes);

    await country.deleteMany({});
    await country.insertMany(countries.countries);

    await Permissions.insertMany(permissionData.permission);
  } catch (err) {
    console.error("Error seeding database:", err);
  } finally {
    mongoose.connection.close();
  }
}

seedDatabase();
