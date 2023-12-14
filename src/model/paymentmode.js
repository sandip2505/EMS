require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const PaymentModeSchema = mongoose.Schema({
  name: {
    type: String,
  },
  value: {
    type: String,
  }
});
const PaymentMode = mongoose.model("Paymentmode", PaymentModeSchema);
module.exports = PaymentMode;
