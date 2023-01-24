require("dotenv").config();
const mongoose = require("mongoose");


const RoleSchema = mongoose.Schema({
  role_name: {
    type: String,
    required: true,
  },
  role_description: {
    type: String,
  },

  created_at: { type: String, required: true, default: Date() },

  updated_at: {
    type: String,
    default: "null",
  },
  deleted_at: {
    type: String,
    default: "null",
  },
});
const Role = mongoose.model("Role", RoleSchema);
module.exports = Role;
