require("dotenv").config();
const mongoose = require("mongoose");


const PermissionModuleSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required']
  }
});
const PermissionModule = mongoose.model("permissionModule", PermissionModuleSchema);
module.exports = PermissionModule;
