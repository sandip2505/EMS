const mongoose = require("mongoose");

// Define companySetting Schema
const companySettingSchema = new mongoose.Schema({
  company_name: {
    type: String,
  },
  company_email: {
    type: String,
  },
  company_telephone: {
    type: Number,
  },
  country_code: {
    type: String,
  },
  state: {
    type: String,
  },
  city: {
    type: String,
  },
  address_street_1: {
    type: String,
  },
  address_street_2: {
    type: String,
  },
  zip: {
    type: Number,
  },
  gstin: {
    type: String,
  },
  ac_holder_name: {
    type: String,
  },
  ac_no: {
    type: Number,
  },
  ifsc_code: {
    type: String,
  },
  swift_code: {
    type: String,
  },
  cgst: {
    type: String,
  },
  sgst: {
    type: String,
  },
  igst: {
    type: String,
  },
  pan_no: {
    type: String,
  },
  cin: {
    type: String,
  },
  bank_name: {
    type: String,
  },
  terms_and_conditions: {
    type: Array,
    default: [],
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: String,
    default: null,
  },
  deleted_at: {
    type: String,
    default: null,
  },
});

// Create and export the companySetting model
const companySetting = mongoose.model("CompanySetting", companySettingSchema);

module.exports = companySetting;
