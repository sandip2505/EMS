require("dotenv").config();
const mongoose = require("mongoose");

const workingHourSchema = mongoose.Schema({
 user_id: {
        type: mongoose.ObjectId,
        required: true,
    },
   
    punch_date:{
        type: String,
    },
    punch_in_time:{
        type: String,
    },
    punch_out_time: {
        type: String,
    },
    total_hour:{
        type: String,
    },
    
})
const workingHour = mongoose.model("workingHour", workingHourSchema);
module.exports = workingHour;