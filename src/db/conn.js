// const mongoose = require("mongoose");
// require("dotenv").config();

// const conn = process.env.CONNECTION;
// async function dbConnect() {
//   mongoose
//     .connect(conn, {
//       //   these are options to ensure that the connection is done properly
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//       useCreateIndex: true,
//     })
//     .then(() => {
//       console.log("Successfully connected to MongoDB Atlas!");
//     })
//     .catch((error) => {
//       console.log("Unable to connect to MongoDB Atlas!");
//       console.error(error);
//     });
// }

// module.exports = dbConnect;

const mongoose = require("mongoose");
require("dotenv").config();

const conn = process.env.CONNECTIONATLAS;
mongoose.set("strictQuery", false);

mongoose
  .connect(conn, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("connection  is successfull");
  })
  .catch((e) => {
    console.log("no connection");
  });
