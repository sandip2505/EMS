require("dotenv").config();
const mongoose = require("mongoose");

const CpumasterInventorySchema = mongoose.Schema({
  key: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  created_at: {
    type: String,
    default: Date,
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

const cpumasterInventory = mongoose.model(
  "cpumasterInventory",
  CpumasterInventorySchema
);
module.exports = cpumasterInventory;
