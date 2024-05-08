require("dotenv").config();
const mongoose = require("mongoose");

const timeEntrySchema = mongoose.Schema({

  user_id: {
    type: mongoose.ObjectId,
  },
  project_id: {
    ref:'Project',
    type: mongoose.ObjectId,
  },
  task_id: {
    type: mongoose.ObjectId,
  },
  hours: {
    type: Number,
    default:0,
},
  date: {
    type: Date,
  },
  created_at: {
    type: String,
    default: new Date(),
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