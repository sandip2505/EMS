require("dotenv").config();
const mongoose = require("mongoose");

const Salary_structureSchema = mongoose.Schema({
  user_id: {
    type: String,
    required: true,
  },
  Basic_Salary: {
    type: String,
    required: true,
  },
  House_Rent_Allow: {
    type: String,
    required: true,
  },
  Other_Allownces: {
    type: String,
    required: true,
  },
  Performance_Allownces: {
    type: String,
    required: true,
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
    required: true,

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
Total_Salary:{
  type: String,
  required: true,
},
Gross_Salary:{
  type: String,
  required: true,
},
Total_Deduction:{
  type: String,
  required: true,
},
Net_Salary:{
  type: String,
  required: true,
},
status: {
  type: String,
  default: "Active",
},
year: {
 type: String,
 required: true,
 
},
});
const Salary_structure = mongoose.model(
  "Salary_structure",
  Salary_structureSchema
);
module.exports = Salary_structure;
