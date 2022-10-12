require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserSchema = mongoose.Schema({
  role_id: {
    type: mongoose.ObjectId,
  },
  emp_code: {
    type: String,
  },
  reporting_user_id: {
    type: String,
  },
  firstname: {
    type: String,
  },
  middle_name: {
    type: String,
  },
  last_name: {
    type: String,
  },
  gender: {
    type: String,
  },
  dob: {
    type: String,
  },
  doj: {
    type: String,
  },
  personal_email: {
    type: String,
  },
  company_email: {
    type: String,
  },
  mo_number: {
    type: String,
  },
  pan_number: {
    type: String,
  },
  aadhar_number: {
    type: String,
  },
  add_1: {
    type: String,
  },
  add_2: {
    type: String,
  },
  city: {
    type: String,
  },
  state: {
    type: String,
  },
  pincode: {
    type: String,
  },
  country: {
    type: String,
  },
  photo: {
    type: String,
  },
  bank_account_no: {
    type: String,
  },
  bank_name: {
    type: String,
  },
  ifsc_code: {
    type: String,
  },
  created_at: {
    type: String,
    default: new Date(),
  },
  updated_at: {
    type: String,
    default: null,
  },
  deleted_at: {
    type: String,
    default: null,
  },
});
const Users = mongoose.model("Users", UserSchema);
module.exports = Users;