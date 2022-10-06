require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserSchema = mongoose.Schema({
    role_name: {
        type: String,
        // required: true,
    },
    emp_code: {
        type: String,
        required: true,
    },
    reporting_user_id: {
        type: String,
        required: true,
    },
    firstname: {
        type: String,
        required: true,
    },
    middle_name: {
        type: String,
        required: true,
    },
    last_name: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        required: true,
    },
    dob: {
        type: String,
        required: true,
    },
    doj: {
        type: String,
        required: true,
    },
    personal_email: {
        type: String,
        required: true,
    },
    company_email: {
        type: String,
        required: true,
    },
    mo_number: {
        type: String,
        required: true,
    },
    pan_number: {
        type: String,
        required: true,
    },
    aadhar_number: {
        type: String,
        required: true,
    },
    add_1: {
        type: String,
        required: true,
    },
    add_2: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    pincode: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        required: true,
    },
    photo: {
        type: String,
        required: true,
    },
    bank_account_no: {
        type: String,
        required: true,
    },
    bank_name: {
        type: String,
        required: true,
    },
    ifsc_code: {
        type: String,
        required: true,
    },
    created_at: {
        type: String,
        default: new Date()
    },
    updated_at: {
        type: String,
        default: null
    },
    deleted_at: {
        type: String,
        default: null
    },
});
const Users = mongoose.model("Users", UserSchema);
module.exports = Users;