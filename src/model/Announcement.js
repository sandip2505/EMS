require("dotenv").config();
const mongoose = require("mongoose");

const AnnouncementSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
description: {
    type: String,
  },

date: {
    type: Date,
    required: true,
  },
  created_at: { type: String, required: true, default: Date() },
  updated_at: {
    type: String,
    default: "null"

  },
  user_id: {
      type: mongoose.ObjectId,
  },

  deleted_at: {
    type: String,
    default: "null"
  },
});
// console.log(AnnouncementSchema.date)

const Announcement = mongoose.model("announcement", AnnouncementSchema);
module.exports = Announcement;