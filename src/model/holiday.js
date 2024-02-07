require("dotenv").config();
const { ObjectID } = require("bson");
const mongoose = require("mongoose");

const HolidaySchema = mongoose.Schema({
  holiday_name: {
    type: String,
    required: [true, 'Holiday Name is required']
  },
  holiday_date: {
    type: Date,
    required: [true, 'Holiday Date is required'],
    unique: true
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
HolidaySchema.path('holiday_date').validate(async function (value) {
  const currentDocumentId = this?._conditions?._id; // Access the _id of the current document
  console.log("currentDocumentId", currentDocumentId);

  const count = await mongoose.models.holiday.countDocuments({
    _id: { $ne: currentDocumentId }, // Exclude the current document
    holiday_date: value,
  });
  console.log('Count:', count);

  if (count) {
    throw new Error('Holiday date Already Taken.'); // Custom error message
  }

  // If count is 0, the validation passes
  return true;
}, 'Holiday date must be unique.');


const Holiday = mongoose.model("holiday", HolidaySchema);
module.exports = Holiday;