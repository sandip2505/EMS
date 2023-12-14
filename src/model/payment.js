require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const PaymentSchema = mongoose.Schema({
  date: {
    type: String,
  },
  payment_number: {
    type: String,
  },
  customer_id: {
    type: mongoose.ObjectId,
  },
  invoice_id: {
    type: mongoose.ObjectId,
  },
  amount: {
    type: Number,
  },
  payment_mode: {
    type: String,
  },
  notes: {
    type: String,
  },
  created_at: {
    type: String,
    default: Date.now,
  },
  updated_at: {
    type: String,
    default: "null",
  },
  deleted_at: {
    type: String,
    default: "null",
  },
});
const Payment = mongoose.model("Payment", PaymentSchema);
module.exports = Payment;
