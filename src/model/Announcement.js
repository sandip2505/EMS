require("dotenv").config();
const mongoose = require("mongoose");

const AnnouncementSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
description: {
    type: String,
    required: true,
  },
date: {
    type: Date,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
    expires: 600,
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
// console.log(AnnouncementSchema.date)

const Announcement = mongoose.model("announcement", AnnouncementSchema);
module.exports = Announcement;