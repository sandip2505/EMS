
require("dotenv").config();
// const conn = process.env.CONNECTION;

// seeds/currencySeed.js
var mongoose = require("mongoose");
mongoose.Promise = global.Promise;
mongoose.set("strictQuery", false);
mongoose.connect("mongodb://0.0.0.0:27017/newems");
var country = require("../src/model/countries");


const countrieS = require('./countries.json'); 
async function seedDatabase() {
  try {

    console.log('Database seeded successfully');
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    mongoose.connection.close();
  }
}


seedDatabase();
