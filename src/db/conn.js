const mongoose = require("mongoose");
require("dotenv").config();


const conn = process.env.CONNECTION

mongoose.connect(conn, {
  // useCreateIndex: false, 
  // useFindAndModify: false, 
  useNewUrlParser: true,
  useUnifiedTopology: true

}).then(() => {
  console.log("connection is successfull");


}).catch((e) => {
  console.log("no connection");
})
