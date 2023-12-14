const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// Define Billing Address Schema
const billingAddressSchema = new mongoose.Schema({
  name: String,
  address_street_1: String,
  address_street_2: String,
  city: String,
  state: String,
  country_id: String,
  zip: String,
  phone: String,
  gstin: String,
});


// Define Customer Schema
const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: String,
  phone: String,
  contact_name: String,
  primary_currency: {
    type: Schema.Types.ObjectId,
    ref: "Currencies",
    required: true,
  },
  prefix: String,
  website: String,
  project_id: {
    type: [mongoose.ObjectId],
    required: true,
  },
  billing: {
    type: billingAddressSchema,
    required: true,
  },

  is_local: {
    type: Boolean,
    required: false,
  },
  created_at: {
    type: String,
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

// Create and export the Customer model
const Customer = mongoose.model("Customer", customerSchema);

module.exports = Customer;
