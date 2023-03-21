require("dotenv").config();
const mongoose = require("mongoose");
const salarySchema = mongoose.Schema({
  user_id: {
    type: mongoose.ObjectId,
  },
  month:{
    type: String, 
  },
  year:{
    type: String, 
  },
  total_days: {
    type: String, 
  },
  working_days: {
    type: String, 
  },
  present_days: {
    type: String,
  },
  absent_days: {
    type: String,
  },
  leave_balance: {
    type: String,
  },
  gross_salary: {
    type: String,

  },
  deduction: {
    type: String,
   
  },
  net_salary: {
    type: String,
   
  },
});

const Salary = mongoose.model("Salary", salarySchema);
module.exports = Salary;
