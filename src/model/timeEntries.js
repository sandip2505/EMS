require("dotenv").config();
const mongoose = require("mongoose");

const timeEntrySchema = mongoose.Schema({
    
    task_id: {
        type: mongoose.ObjectId,
        required: true,
    },
   hours: {
        type: String,
        required: true,
    },
    date:{
        type: String,
        required: true, 
    }

    // created_at: { type: String, required: true, default: Date() },

    // updated_at: {
    //     type: String,
    //     default: "null",
    // },
    // deleted_at: {
    //     type: String,
    //     default: "null",
    // },
});
const timeEntry = mongoose.model("timeEntries", 
 timeEntrySchema);
module.exports = timeEntry;
