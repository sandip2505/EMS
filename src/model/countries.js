require("dotenv").config();
const mongoose = require("mongoose");

const countrySchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
});

const country = mongoose.model("countries", countrySchema);
module.exports = country;
