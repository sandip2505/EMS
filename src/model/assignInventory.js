const mongoose = require("mongoose");

// Define assigninventorySchema Schema
const assigninventorySchema = new mongoose.Schema({

  user_id: {
    type:[mongoose.Schema.Types.ObjectId],
    ref: 'User',
    required: true
  },
  inventoryItem_id: {
    type:[mongoose.Schema.Types.ObjectId],
    ref: 'InventoryItem',
    required: true 
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

// Create and export the assignInventory model
const assignInventory = mongoose.model("assignInventory", assigninventorySchema);

module.exports = assignInventory;
