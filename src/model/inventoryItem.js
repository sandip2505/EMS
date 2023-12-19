const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema({
  inventory_item_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  unique_id: {
    type: String,
    required: true,
  },
  main_key: {
    type: String,
    required: true,
  },
  cpu_data: {
    type: [mongoose.Schema.Types.ObjectId],
    default: [],
  },
  is_userAssigned: {
    type: Boolean,
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

const InventoryItem = mongoose.model('InventoryItem', inventoryItemSchema);

module.exports = InventoryItem;
