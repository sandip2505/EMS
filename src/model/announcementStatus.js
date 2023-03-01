require("dotenv").config();
const mongoose = require("mongoose");

const AnnouncemntStatusSchema = mongoose.Schema({
    announcement_id: {
        type: mongoose.ObjectId,
        // required: true,
    },
    user_id: {
        type: mongoose.ObjectId,
        // required: true,
    },
    status: {
        type: String,
        default: 0,
    },
    created_at: { type: String, required: true, default: Date() },

    updated_at: {
        type: String,
        default: "null",
    },

});

const AnnouncemntStatus = mongoose.model("announcementstatus", AnnouncemntStatusSchema);
module.exports = AnnouncemntStatus;
