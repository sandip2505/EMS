require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const StateSchema = mongoose.Schema({
  state: {
    type: String,
    // required: true,
  }


});
const State = mongoose.model("state", StateSchema);
module.exports = State;
