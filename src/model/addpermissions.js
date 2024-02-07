require("dotenv").config();
const mongoose = require("mongoose");

const PermissionSchema = mongoose.Schema({
  permission_name: {
    type: String,
    required: [true, 'Name is required']
  },
  // created_at
  permission_description: {
    type: String,
    required: [true, 'Description is required']
  },
  created_at: {
    type: String,
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
const Permission = mongoose.model("Permission", PermissionSchema);
module.exports = Permission;