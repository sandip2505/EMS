require("dotenv").config();
const mongoose = require("mongoose");

const timeEntrySchema = mongoose.Schema({
    
    project_id: {
        type: mongoose.ObjectId,
        required: true,
    },
    task_id: {
        type: mongoose.ObjectId,
        required: true,
    },
    hours: {
        type: String,
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
    month: { type: String, required: true, default:new Date().getMonth() },
});
const timeEntry = mongoose.model("timeEntries", timeEntrySchema);
module.exports = timeEntry;
