const mongoose = require("mongoose");
require("dotenv").config();

const conn = process.env.CONNECTION;
// mongoose.set("strictQuery", false);

// mongoose
//   .connect(conn, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => {
//     console.log("connection  is successfull");
//   })
//   .catch((e) => {
//     console.log("no connection");
//   });

const { MongoClient } = require("mongodb");
mongoose.set("strictQuery", false);
async function connect() {
  const client = await MongoClient.connect(conn, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("connection  is successfull");
  client.close();
}

connect().catch((err) => {
  console.error("Error connecting to MongoDB Atlas", err);
});
