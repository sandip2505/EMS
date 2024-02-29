require("dotenv").config();
const mongoose = require("mongoose");

const LeaveHistorySchema = mongoose.Schema({
    user_id: {
        ref: "Users",
        type: mongoose.ObjectId,
        required: true,
    },
    year: {
        type: String,
        default: "",
    },
    total_leaves: {
        type: Number,
        required: true,
    },
    taken_leaves: {
        type: Number,
        required: true,
    },
    remaining_leaves: {
        type: Number,
        required: true,
    },
    unpaid_leaves: {
        type: Number,
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

const LeaveHistory = mongoose.model("LeaveHistory", LeaveHistorySchema);
module.exports = LeaveHistory;
