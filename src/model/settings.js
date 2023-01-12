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
 
});

const Settings = mongoose.model("setting", SettingsSchema);
module.exports = Settings;