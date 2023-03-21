require("dotenv").config();
const mongoose = require("mongoose");


const Salary_particularSchema = mongoose.Schema({
  particular_name: {
    type: String,
  },
  order: {
    type: String,
  },
  type: {
    type: String,
  },

});
const Salary_particular = mongoose.model("Salary_particular", Salary_particularSchema);
module.exports = Salary_particular;
