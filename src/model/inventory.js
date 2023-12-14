const mongoose = require("mongoose");

// Define inventory Schema
const inventorySchema = new mongoose.Schema({

  company_name: {
    type: String,
  },
  
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: String,
    default: null,
  },
  deleted_at: {
    type: String,
    default: null,
  },
});

// Create and export the companySetting model
const inventory = mongoose.model("Inventory", inventorySchema);

module.exports = inventory;
