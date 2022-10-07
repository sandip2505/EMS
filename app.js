const express = require("express");
const app = express();
const { Console } = require("console");
require("./src/db/conn");
const Employee = require("./src/model/employee");
const Holiday = require("./src/model/holiday");
const Role = require("./src/model/roles");
const Permission = require("./src/model/addpermissions");
// const session = require("express-session");
const router = require("./src/router/employee");
// const routes = require('/src/router/employee');
const ejs = require("ejs");
const port = process.env.PORT || 46000;
const path = require("path");
const static_path = path.join(__dirname, "/public")
const view_path = path.join(__dirname, "/src/views")
const partial_path = path.join(__dirname, "/src/views/partial")
fileUpload = require('express-fileupload');
app.use(fileUpload());
app.use(express.json());
app.use(express.urlencoded({ extended: false }))
app.use(express.static(static_path));
app.use(router);
// app.use(session({ secret: "ssshhhhh", saveUninitialized: true, resave: true }));

app.set("view engine", "ejs");
app.set("views", view_path);
app.use('/public/', express.static('./public'));

app.listen(port, () => {
  console.log(`server is runnig at port no ${port}`);
});







