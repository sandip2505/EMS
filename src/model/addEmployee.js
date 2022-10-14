
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const addemployeeSchema = mongoose.Schema({
    type: {
        type: String
    },
    email: {
        type: mongoose.SchemaTypes.Email,
        required: true,
        unique: true
    },
    password: {
        type: String,
        // required: true
    },
    name: {
        type: String,
        // required: true
    },
    dateOfBirth: {
        type: String,
        // required: true
    },
    contactNumber: {
        type: String,
        // required: true
    },
    department: String,


    designation: String,

    dateAdded: {
        type: Date
    }
});




// create a new  collection
const Employee = mongoose.model("Employee", addemployeeSchema);
module.exports = Employee;
//  module.exports = Message;
