const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const trialSchema = new Schema({
    gender: {
        type: String,
        required: true,
    },
    hobbies: {
        type: Array,
        required: true,
    },
    address: {
        type: String,
    },
    location: {
        type: String,
    },
});

module.exports = mongoose.model("trial", trialSchema);