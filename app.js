const express = require("express");
const cors = require("cors");
const flash = require('connect-flash');
const jwt = require('jsonwebtoken')
// const nodemailer = require('nodemailer');
let cookieParser = require('cookie-parser');

const app = express();

app.use(cookieParser())
var fs = require('fs');
const { Console, log } = require("console");
require("./src/db/conn");
const Holiday = require("./src/model/holiday");
const Role = require("./src/model/roles");
const User = require("./src/model/user");
const Permission = require("./src/model/addpermissions");
const email = require('./src/utils/sendemail')
// const session = require("express-session");
const router = require("./src/router/employee");
// const Apirouter = require("./src/API/router/users_api");
// const routes = require('/src/router/employee');
const ejs = require("ejs");
const port = process.env.PORT || 46000;
const path = require("path");
const static_path = path.join(__dirname, "/public")
const view_path = path.join(__dirname, "/src/views")
const partial_path = path.join(__dirname, "/src/views/partial")
fileUpload = require('express-fileupload');
const session = require('express-session')
const fileStoreOptions = {};
const FileStore = require('session-file-store')(session);
const routes = require("./src/API/router/users_api")

app.all('*', function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});
app.use(fileUpload());
app.use(express.json());
app.use(express.urlencoded({ extended: false }))
app.use(express.static(static_path));
app.use(flash());
app.use(router);
app.use(routes);
app.use('/api', routes);
app.use(cors());

app.set("view engine", "ejs");
app.set("views", view_path);
app.use('/public/', express.static('./public'));
app.use('/src/controller', express.static('./src/controller'));
app.get("*",(req,res) => {
  res.render("partials/404error",{
  errorMsg:'Oops! Page Not Found'
  })

});

app.listen(port, () => {
  console.log(`server is runnig at port http://localhost:${port}`);
});







