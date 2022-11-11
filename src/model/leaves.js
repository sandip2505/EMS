require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const LeavesSchema = mongoose.Schema({
    user_id: {
        type: mongoose.ObjectId,
        required: true,
    },
    approver_id: {
        type: String,
        default: "",

    },
    datefrom: {
        type: String,
        required: true,
    },
    dateto: {
        type: String,
        required: true,
    },
    reason: {
        type: String,
    },
    status: {
        type: String,
        default: "PENDING",
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
const Leaves = mongoose.model("leaves", LeavesSchema);
module.exports = Leaves;