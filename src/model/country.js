const mongoose = require("mongoose");

const CitySchema = mongoose.Schema({
  city: {
    type: String,
  }
});
const City = mongoose.model("city", CitySchema);
module.exports = City;
