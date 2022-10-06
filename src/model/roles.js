require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const RoleSchema = mongoose.Schema({
  role_name: {
    type: String,
    // required: true,
  },
  role_description: {
    type: String,
    // required: true,
  },
  permission_name: {
    type: [String],
    default: null,
  },
  created_at: { type: String, required: true, default: Date() },

  updated_at: {
    type: String,
    default: null,
  },
  deleted_at: {
    type: String,
    default: null,
  },
});
const Role = mongoose.model("Role", RoleSchema);
module.exports = Role;
