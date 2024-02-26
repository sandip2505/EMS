require("dotenv").config();
const mongoose = require("mongoose");

const RoleSchema = mongoose.Schema({
  role_name: {
    type: String,
    required: [true, "Role Name is required"],
    unique: true,
  },
  role_description: {
    type: String,
    required: [true, "Role Description is required"],
  },
  created_at: {
    type: String,
    required: true,
    default: Date(),
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
RoleSchema.path("role_name").validate(async function (value) {
  const currentDocumentId = this?._conditions?._id; // Access the _id of the current document
  // console.log(currentDocumentId,"currentDocumentId");
  const count = await mongoose.models.Role.countDocuments({
    _id: { $ne: currentDocumentId }, // Exclude the current document
    role_name: value,
    deleted_at: "null",
  });
  if (count) {
    throw new Error("Role Name Already Taken."); // Custom error message
  }
  return true;
}, "Role Namemust be unique.");

const Role = mongoose.model("Role", RoleSchema);
module.exports = Role;
