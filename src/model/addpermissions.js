require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const PermissionSchema = mongoose.Schema({
  permission_name: {
    type: String,
    required: true,
  },
  // created_at
  permission_description: {
    type: String,
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