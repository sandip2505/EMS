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
});
const Currency = mongoose.model("Currencies", CurrencieSchema);
module.exports = Currency;
