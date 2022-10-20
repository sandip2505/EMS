require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const ProjectUserSchema = mongoose.Schema({
    project: {
        type: mongoose.ObjectId,
        // required: true,
    },
    task: {
        type: mongoose.ObjectId,
        // required: true,
    },
    user: {
        type: mongoose.ObjectId,
        // required: true,
    },

    created_at: { type: String, required: true, default: Date() },

    updated_at: {
        type: String,
        default: null,
    },
    deleted_at: {
        type: String,
        default: null,
    },
});
const ProjectUser = mongoose.model("ProjectUser", ProjectUserSchema);
module.exports = ProjectUser;
