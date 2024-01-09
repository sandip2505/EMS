require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const PaymentSchema = mongoose.Schema({
  date: {
    type: String,
    required: true,
  },
  payment_number: {
    type: String,
    required: true,
  },
  customer_id: {
    type: mongoose.ObjectId,
    required: true,
  },
  invoice_id: {
    type: mongoose.ObjectId,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  exchange_rate: {
    type: Number,
    default: 0,
  },
  amount_in_inr: {
    type: Number,
    required: true,
    default: function () {
      return this.amount;
    },
  },
  adjustable_amount: {
    type: Boolean,
    default: false,
  },
  payment_mode: {
    type: String,
  },
  notes: {
    type: String,
  },
  created_at: {
    type: Date,
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
