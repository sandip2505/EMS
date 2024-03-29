require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const TaskSchema = mongoose.Schema({
  project_id: {
    type: mongoose.ObjectId,
    ref: "Project",
    required: true,
  },
  user_id: {
    type: mongoose.ObjectId,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  short_description: {
    type: String,
  },
  task_estimation: { type: Number, require: true, default: 0 },
  task_type: {
    type: String,
  },
  task_status: { type: Number, required: true, default: 0 },
  invoice_created: { type: Number, required: true, default: 0 },
  // created_at: { type: String, required: true, default: Date() },
  created_at: {
    type: Date,
    required: true,
    default: Date.now,
  },

  updated_at: {
    type: String,
    default: "null",
  },
  deleted_at: {
    type: String,
    default: "null",
  },
});
const Task = mongoose.model("Task", TaskSchema);
module.exports = Task;
