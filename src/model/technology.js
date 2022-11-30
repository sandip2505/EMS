require("dotenv").config();
const mongoose = require("mongoose");


const TechnologySchema = mongoose.Schema({
  technology: {
    type: String,
  }
});
const Technology = mongoose.model("technology", TechnologySchema);
module.exports = Technology;
