require("dotenv").config();
const mongoose = require("mongoose");

const LeavesSchema = mongoose.Schema({
    user_id: {
        type: mongoose.ObjectId,
        required: true,
    },
    approver_id: {
        type: mongoose.ObjectId,
        default: null,

    },
    datefrom: {
        type: Date,
        required: true,
    },
    dateto: {
        type: Date,
        required: true,
    },
    total_days: {
        type: String,
        required: true,
    },
    reason: {
        type: String,
        required:true
    },
    status: {
        type: String,
        default: "PENDING",
    },
    paid_status: {
        type: String,
        default:"PAID"
    },
    unpaid_leaves: {
        type: Number,
        default: 0,
    },
    paid_leaves: {
        type: Number,
        default: 0,
    },
    is_adhoc:{
        type: String,
         default: 0 
    },
    half_day:{
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

const Leaves = mongoose.model("leaves", LeavesSchema);
module.exports = Leaves;
