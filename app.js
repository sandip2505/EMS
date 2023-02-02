const NodeCache = require( "node-cache" ); 
const express = require("express");
const cors = require("cors");
const flash = require("connect-flash");
// const nodemailer = require('nodemailer');
let cookieParser = require("cookie-parser");
const app = express();
app.use(cookieParser());
var fs = require("fs");
require("./src/db/conn");
// const session = require("express-session");
const router = require("./src/router/employee");
const port = process.env.PORT || 44000;
const path = require("path");
const static_path = path.join(__dirname, "/public");
const view_path = path.join(__dirname, "/src/views");
fileUpload = require("express-fileupload");
const session = require("express-session");
const routes = require("./src/API/router/users_api");
const { Promise } = require("mongoose");
app.all("*", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// helpers(app);
app.use(cors());
app.use(fileUpload());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(static_path));
app.use(flash());
app.use(router);
app.use(routes);
app.use("/api", routes);

app.set("view engine", "ejs");
app.set("views", view_path);
app.use("/public/", express.static("./public"));
app.use("/src/controller", express.static("./src/controller"));

app.get("*", (req, res) => {
  res.render("partials/404error", {
    errorMsg: "Oops! Page Not Found",
  });
});

app.listen(port, () => {
  console.log(`server is runnig at port http://localhost:${port}`);
});




