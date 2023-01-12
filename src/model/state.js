const mongoose = require("mongoose");


const StateSchema = mongoose.Schema({
  state: {
    type: String,
  }


});
const State = mongoose.model("state", StateSchema);
module.exports = State;
