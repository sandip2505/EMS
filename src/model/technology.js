require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const TechnologySchema = mongoose.Schema({
  technology: {
    type: String,
    // required: true,
  }

});
const Technology = mongoose.model("technology", TechnologySchema);
module.exports = Technology;
