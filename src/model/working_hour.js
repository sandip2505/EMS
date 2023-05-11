require("dotenv").config();
const mongoose = require("mongoose");

const workingHourSchema = mongoose.Schema({
    user_id: {
        type: mongoose.ObjectId,
        required: true,
    },
    date:{
        type: String,
    },
    start_time:{
        type: String,
    },
    end_time: {
        type: String,
    },
    total_hour:{
        type: String,
    },
    // start_time end_time date total_hour user_id
    
})
const workingHour = mongoose.model("workingHour", workingHourSchema);
module.exports = workingHour;