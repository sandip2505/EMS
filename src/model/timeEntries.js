require("dotenv").config();
const mongoose = require("mongoose");

const timeEntrySchema = mongoose.Schema({
<<<<<<< HEAD
=======
    
    user_id: {
        type: mongoose.ObjectId,
        required: true,
    },
    project_id: {
        type: mongoose.ObjectId,
        required: true,
    },
    task_id: {
        type: mongoose.ObjectId,
        required: true,
    },
   hours: {
        type: String,
        required: true,
    },
    date:{
        type: Date,
        required: true, 
    },
    created_at: {
        type: String,
        default: new Date()
      },
      updated_at: {
        type: String,
        default: "null"
      },
      deleted_at: {
        type: String,
        default: "null"
      },
>>>>>>> 0d75e5932f89600a4648bf91a5dc037a823806aa

  user_id: {
    type: mongoose.ObjectId,
    required: true,
  },
  project_id: {
    type: mongoose.ObjectId,
    required: true,
  },
  task_id: {
    type: mongoose.ObjectId,
    required: true,
  },
  hours: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  created_at: {
    type: String,
    default: new Date()
  },
  updated_at: {
    type: String,
    default: "null"
  },
  deleted_at: {
    type: String,
    default: "null"
  },

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