require("dotenv").config();
const mongoose = require("mongoose");


const TechnologySchema = mongoose.Schema({
  technology: {
    type: String,
    required: [true, 'Technology Name is required']
  }
});
const Technology = mongoose.model("technology", TechnologySchema);
module.exports = Technology;
