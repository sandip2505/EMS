require("dotenv").config();
const mongoose = require("mongoose");

const ExpensesSchema = mongoose.Schema({
  category: {
    type: mongoose.ObjectId,
    ref: "ExpenseCategory",
    required: true,
  },
  due_date: {
    type: Date,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  payment_mode: {
    type: mongoose.ObjectId,
    ref: "Paymentmode",
    required: true,
  },
  paid_by: {
    type: String,
    required: true,
  },
  paid_to: {
    type: String,
  },
  note: {
    type: String,
  },
  receipt: {
    type: String,
  },
  created_at: {
    type: Date,
    default: Date,
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

const Expenses = mongoose.model("Expenses", ExpensesSchema);
module.exports = Expenses;
