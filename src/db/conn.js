const mongoose = require("mongoose");
// require("dotenv").config();
const conn = process.env.CONNECTION;
mongoose.set("strictQuery", false);

mongoose
  .connect(conn, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000, 
  })
  .then(() => {
    console.log("MongoDB connection is successfull");
  })
  .catch((e) => {
    console.log(e,"no connection");
  });


