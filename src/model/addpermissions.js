require("dotenv").config();
const mongoose = require("mongoose");

const PermissionSchema = mongoose.Schema({
  permission_name: {
    type: String,
    required: [true, 'Name is required'],
    unique: true
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
PermissionSchema.path("permission_name").validate(async function (value) {
  const currentDocumentId = this?._conditions?._id; // Access the _id of the current document
  // console.log(currentDocumentId,"currentDocumentId");
  const count = await mongoose.models.Permission.countDocuments({
    _id: { $ne: currentDocumentId }, // Exclude the current document
    permission_name: value,
    deleted_at: "null",
  });
  if (count) {
    throw new Error("Permission Name Already Taken."); // Custom error message
  }
  return true;
}, "Permission Namemust be unique.");
const Permission = mongoose.model("Permission", PermissionSchema);
module.exports = Permission;