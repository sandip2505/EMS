require("dotenv").config();
const mongoose = require("mongoose");

const timeEntryRequestSchema = mongoose.Schema({
  user_id: {
    type: mongoose.ObjectId,
   
  },
  approver_id: {
    type:String,
   
  },
  reason: {
    type: String,
  },
  start_date: {
    type: Date,
    
  },
  end_date: {
    type: Date,

  },
  status: {
    type: String,
    default: "0",
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400,
},
});
const timeEntryRequest = mongoose.model("timeEntryRequest", timeEntryRequestSchema);
module.exports = timeEntryRequest;
