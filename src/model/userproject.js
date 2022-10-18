require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const ProjectUserSchema = mongoose.Schema({
    project: {
        type: String,
        // required: true,
    },
    task: {
        type: String,
        // required: true,
    },
    user: {
        type: String,
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
