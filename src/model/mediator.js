require("dotenv").config();
const mongoose = require("mongoose");

const MediatorSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  transfer_fees: {
    type: Number,
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
const Mediator = mongoose.model("Mediator", MediatorSchema);
module.exports = Mediator;
