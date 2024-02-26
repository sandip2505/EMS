require("dotenv").config();
const mongoose = require("mongoose");


const ProjectSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique:true

    },
    short_description: {
        type: String,
    },
    start_date: {
        type: String,
        required: true,
    },
    end_date: {
        type: String,
    },
    status: {
        type: String,
        default: "on Hold",
    },
    technology: {
        type: [String],
        required: true,
    },
    project_type: {
        type: String,
        required: true,
    },
    user_id: {
        type: [mongoose.ObjectId],
        required: true,
        ref: "Users",
    },
    is_assigned: {
        type: Number,
        required: true,
        default: 0,
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
ProjectSchema.path("title").validate(async function (value) {
    const currentDocumentId = this?._conditions?._id; // Access the _id of the current document
    // console.log(currentDocumentId,"currentDocumentId");
    const count = await mongoose.models.Project.countDocuments({
      _id: { $ne: currentDocumentId }, // Exclude the current document
      title: value,
      deleted_at: "null",
    });
    if (count) {
      throw new Error("Project Name Already Taken."); // Custom error message
    }
    return true;
  }, "Project Name must be unique.");
const Project = mongoose.model("Project", ProjectSchema);
module.exports = Project;
