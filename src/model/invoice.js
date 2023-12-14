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
      discount: { type: Number },
      taxable_value: { type: Number },
      cgst: { type: Number },
      sgst: { type: Number },
      igst: { type: Number },
      rate: { type: Number },
      total: { type: Number },
      assigned_tasks:[{
        type: mongoose.ObjectId,
        ref: "Task",
      }],
    },
  ],
  cgst: { type: Number },
  sgst: { type: Number },
  igst: { type: Number },
  status: {
    type: Number,
    default: 1,
  },
  payment_status: {
    type: Number,
    default: 1,
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
