require("dotenv").config();
const mongoose = require("mongoose");

const Salary_slip_genratedSchema = mongoose.Schema({
  user_id: {
    type: String,
  },
  month: {
    type: String,
  },
  year: {
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
  leave_balance_cf: {
    type: String,
  },
  file_path:{
    type:String
  }
});
const Salary_slip_genrated = mongoose.model("Salary_slip_genrated",Salary_slip_genratedSchema);
module.exports = Salary_slip_genrated;