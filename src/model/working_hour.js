require("dotenv").config();
const mongoose = require("mongoose");

const workingHourSchema = mongoose.Schema({
user_id: {
    type: mongoose.ObjectId,
    required: true,
},
date:{
    type: Date,
},
start_time:{
    type: String,
    required: true,
},
end_time:{
    type: String,
    required: true, 
},
total_hour:{
    type: String,
    // required: true,  
},
})
const workingHour = mongoose.model("workingHour", workingHourSchema);
module.exports = workingHour;