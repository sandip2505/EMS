require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userPermissionSchema = mongoose.Schema({
  user_id: {
    type: String,
  },
  role_id: {
    type: String,
    // required: true,
  },

  permission_id: {
    type: [String],
    // required: true,
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
const userPermission = mongoose.model("userPermission", userPermissionSchema);
module.exports = userPermission;

