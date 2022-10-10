const mongoose = require("mongoose");
try {
  const dbms = mongoose.connect('mongodb://0.0.0.0:27017/ems', {
    // useCreateIndex: false, 
    // useFindAndModify: false, 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
  
  });
  module.exports = dbms;
} catch (error) {
  handleError(error);
}