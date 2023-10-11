require("dotenv").config();
const mongoose = require("mongoose");

const SettingsSchema = mongoose.Schema({
  key: {
    type: String,
  },
  type: {
    type: String,
  },
  value: {
    type: String,
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

const Settings = mongoose.model("setting", SettingsSchema);
module.exports = Settings;
