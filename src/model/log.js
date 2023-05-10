const mongoose = require('mongoose');
// const ntpClient = require('ntp-client')
const logSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
  },
  title:{
    type:String,
    require:false
  },
  message: String,
  level: String,
  role: String,
  ref_id:{
    type:[mongoose.Schema.Types.ObjectId],
    default:null
  },
  timestamp: {
    type:Date,
    default:new Date(new Date().toLocaleString('en-IN', {timeZone:'Asia/Kolkata'}))
}
});

const Log = mongoose.model('Log', logSchema);

module.exports = Log;