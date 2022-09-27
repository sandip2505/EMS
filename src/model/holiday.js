require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const HolidaySchema =  mongoose.Schema({
    holiday_name: {
      type: String,
      required: true,
    },
    holiday_date: {
      type:String,
      required: true,
    },
  });
  const Holiday =  mongoose.model("holiday", HolidaySchema);
  module.exports = Holiday;