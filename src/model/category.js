require("dotenv").config();
const mongoose = require("mongoose");

const categorySchema = mongoose.Schema({
  category_name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  recurring: {
    type: Boolean,
    default: false,
  },
  amount: {
    type: Number,
  },
  pay_to: {
    type: String,
  },
  pay_by: {
    type: String,
  },
  note: {
    type: String,
  },
  payment_mode: {
    type: mongoose.ObjectId,
    ref: "Paymentmode",
  },
  undeletable: {
    type: Boolean,
    default: false,
  },
});

const Category = mongoose.model("ExpenseCategory", categorySchema);
module.exports = Category;
