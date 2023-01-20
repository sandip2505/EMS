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
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600,
},
});

const Announcement = mongoose.model("announcement", AnnouncementSchema);
module.exports = Announcement;