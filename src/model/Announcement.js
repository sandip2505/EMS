require("dotenv").config();
const mongoose = require("mongoose");

const AnnouncementSchema = mongoose.Schema({
  announcement_title: {
    type: String,
    required: true,
  },
  announcement_description: {
    type: String,
    required: true,
  },
  announcement_date: {
    type: String,
    required: true,
  },
  created_at: {
    type: String,
    default: Date
  },
  updated_at: {
    type: String,
    default: "null"

  },
  deleted_at: {
    type: String,
    default: "null"
  },
});

const Announcement = mongoose.model("announcement", AnnouncementSchema);
module.exports = Announcement;