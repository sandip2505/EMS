require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const CurrencieSchema = mongoose.Schema({
  currency: {
    type: String,
  },
  code: {
    type: String,
  },
  symbol: {
    type: String,
  },
  name: {
    type: String,
  },
  plural: {
    type: String,
    default: function () {
      return this.name;
    },
  },
  is_default: {
    type: Boolean,
    default: false,
  },
});
const Currency = mongoose.model("Currencies", CurrencieSchema);
module.exports = Currency;
