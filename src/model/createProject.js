require("dotenv").config();
const mongoose = require("mongoose");


const ProjectSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
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
const Project = mongoose.model("Project", ProjectSchema);
module.exports = Project;
