require("dotenv").config();
const mongoose = require("mongoose");


const RolePermissionSchema = mongoose.Schema({
  role_id: {
    type: String,
    // required: true,
  },
  permission_id: {
    type: [String],
    required: true,
  },
  created_at: {
    type: String,
    default: new Date()
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
const RolePermission = mongoose.model("RolePermission", RolePermissionSchema);
module.exports = RolePermission;