const mongoose = require("mongoose");

// Define Invoice Schema
const invoiceSchema = new mongoose.Schema({
  customer_id: {
    type: mongoose.ObjectId,
    ref: "Customer",
    required: true,
  },
  invoice_date: {
    type: Date,
  },
  due_date: {
    type: Date,
  },
  bond_no: {
    type: String,
  },
  description: {
    type: String,
    default: "",
  },
  invoice_number: {
    type: String,
  },
  projects: [
    {
      id: { type: mongoose.ObjectId, ref: "Project" },
      hsa: { type: String },
      amount: { type: Number },
      uom: { type: String },
      quantity: { type: Number },
      discount: { type: Number, default: 0 },
      taxable_value: { type: Number },
      cgst: {
        amount: { type: Number },
        rate: { type: Number },
      },
      sgst: {
        amount: { type: Number },
        rate: { type: Number },
      },
      igst: {
        amount: { type: Number },
        rate: { type: Number },
      },
      rate: { type: Number },
      total: { type: Number },
      assigned_tasks: [
        {
          type: mongoose.ObjectId,
          ref: "Task",
        },
      ],
    },
  ],
  cgst: {
    amount: { type: Number },
    rate: { type: Number },
  },
  sgst: {
    amount: { type: Number },
    rate: { type: Number },
  },
  igst: {
    amount: { type: Number },
    rate: { type: Number },
  },
  status: {
    type: Number,
    default: 1,
  },
  payment_status: {
    type: Number,
    default: 1,
  },
  transaction_fee: {
    type: Number,
    default: 0,
  },
  total_cost: {
    type: Number,
    default: 0,
  },
  total_tax: {
    type: Number,
    default: 0,
  },
  total_discount: {
    type: Number,
    default: 0,
  },
  discount_type: {
    type: String,
  },
  grand_total: {
    type: Number,
    default: 0,
  },
  amount_due: {
    type: Number,
    default: 0,
  },
  created_at: {
    type: Date,
    required: true,
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

// Create and export the Invoice model
const Invoice = mongoose.model("Invoice", invoiceSchema);

module.exports = Invoice;
