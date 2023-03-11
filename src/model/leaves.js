require("dotenv").config();
const mongoose = require("mongoose");

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
        type: Date,
        required: true,
    },
    dateto: {
        type: Date,
        required: true,
    },
    reason: {
        type: String,
    },
    status: {
        type: String,
        default: "PENDING",
    },
    is_adhoc:{
        type: String,
         default: 0 
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
