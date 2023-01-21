require("dotenv").config();
const mongoose = require("mongoose");
const salarySchema = mongoose.Schema({
    user_id : {
        type: mongoose.ObjectId,
        required: true,
      },

    month: {
        type: String,
        required: true,
      },
      year: {
        type: Date,
        required: true,
      },
      date: {
        type: String,
        required: true,
      },
      working_days: {
        type: String,
        required: true,
      },
      present_days: {
        type: String,
        required: true,
      },
      absent_days: {
        type: String,
        required: true,
      },
      leave_balance: {
        type: String,
        required: true,
      },
      gross_salary: {
        type: String,
        required: true,
      },
      deduction: {
        type: String,
        required: true,
      },
      net_salary: {
        type: String,
        required: true,
      },
      bank_account_no: {
        type: String,
        required: true,
      },
      bank_name: {
        type: String,
        required: true,
      },


});




const Salary = mongoose.model("Users", salarySchema);
module.exports = Salary;
