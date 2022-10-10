const mongoose = require("mongoose");
const url = "mongodb://0.0.0.0:27017/ems"
mongoose.connect(url, {
  // useCreateIndex: false, 
  // useFindAndModify: false, 
  useNewUrlParser: true,
  useUnifiedTopology: true

}).then(() => {
  console.log("connection is successfull");
  // mongoose.connect("mongodb://0.0.0.0:27017/mongo_test",{useNewUrlParser:true ,useUnifiedTopology:true})
  // .then(()=>console.log("connected"))

}).catch((e) => {
  console.log("no connection");
})