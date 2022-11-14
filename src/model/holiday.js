require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");


const HolidaySchema = mongoose.Schema({
  holiday_name: {
    type: String,
    required: true,
  },
  holiday_date: {
    type: Date,
    required: true,
  },
  created_at: {
    type: String,
    default: Date
  },
  updated_at: {
    type: String,
    default: "null"

  },
  deleted_at: {
    type: String,
    default: "null"
  },
});

const Holiday = mongoose.model("holiday", HolidaySchema);
module.exports = Holiday;