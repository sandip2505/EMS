require("dotenv").config();
const mongoose = require("mongoose");

const SettingsSchema = mongoose.Schema({
  settings_key: {
    type: String,
    required: true,
  },
  settings_type: {
    type: String,
    required: true,
  },
  settings_value: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date
  },
  updated_at: {
    type: String,
    default: "null"

  },
  deleted_at: {
    type: String,
    default: "null"
  },
});

const Settings = mongoose.model("setting", SettingsSchema);
module.exports = Settings;