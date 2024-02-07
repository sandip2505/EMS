require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserAuthSchema = mongoose.Schema({
  user_id: {
    type: mongoose.ObjectId,
    ref: "Users",
    required: true,
  },
  otp_secret: {
    type: String,
  },
  otp_auth_url: {
    type: String,
  },
  is_2fa_enabled: {
    type: Boolean,
    required: false,
  },
});
const UserAuth = mongoose.model("User_2fa", UserAuthSchema);
module.exports = UserAuth;
