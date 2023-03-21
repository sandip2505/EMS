require("dotenv").config();
const mongoose = require("mongoose");

const Salary_structureSchema = mongoose.Schema({
  user_id: {
    type: String,
  },
  Basic_Salary: {
    type: String,
  },
  House_Rent_Allow: {
    type: String,
  },
  Other_Allownces: {
    type: String,
  },
  Performance_Allownces: {
    type: String,
  },
  Bonus: {
    type: String,
  },
  Other: {
    type: String,
  },
  EL_Encash_Amount: {
    type: String,
  },
  Professional_Tax: {
    type: String,
  },
  Income_Tax: {
    type: String,
  },
  Gratuity: {
    type: String,
  },
  Provident_Fund: {
    type: String,
  },
  ESIC: {
    type: String,
  },
  Other_Deduction: {
    type: String,
  },
  status: {
    type: String,
    default: "Active",
  },
  year: {
    type: String,
  },
});
const Salary_structure = mongoose.model(
  "Salary_structure",
  Salary_structureSchema
);
module.exports = Salary_structure;
