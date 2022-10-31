require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const CountrySchema = mongoose.Schema({
  country: {
    type: String,
    // required: true,
  }


});
const Country = mongoose.model("country", CountrySchema);
module.exports = Country;
