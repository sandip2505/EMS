require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const CitySchema = mongoose.Schema({
  city: {
    type: String,
    // required: true,
  },
});
const City = mongoose.model("city", CitySchema);
module.exports = City;
