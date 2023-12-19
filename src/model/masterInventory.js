require("dotenv").config();
const mongoose = require("mongoose");

const masterInventorySchema = mongoose.Schema({
  key: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  is_assigned: {
    type: Number,
    required: true,
    default: 0,
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

const masterInventory = mongoose.model(
  "MasterInventory",
  masterInventorySchema
);
module.exports = masterInventory;
