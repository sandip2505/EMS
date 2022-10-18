require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const CountrySchema = mongoose.Schema({
  country: {
    type: String,
    // required: true,
  },

  created_at: { type: String, required: true, default: Date() },

  updated_at: {
    type: String,
    default: null,
  },
  deleted_at: {
    type: String,
    default: null,
  },
});
const Role = mongoose.model("country", CountrySchema);
module.exports = Role;
