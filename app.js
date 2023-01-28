const NodeCache = require( "node-cache" ); 
const myCache = new NodeCache({stdTTL:10});
const express = require("express");
const cors = require("cors");
const flash = require("connect-flash");
const jwt = require("jsonwebtoken");
const moment = require("moment");
// const nodemailer = require('nodemailer');
let cookieParser = require("cookie-parser");
const settings = require("./src/model/settings");
const app = express();
const NODE_ENV = process.env.NODE_ENV;
app.use(cookieParser());
var fs = require("fs");
const { Console, log } = require("console");
require("./src/db/conn");
const Holiday = require("./src/model/holiday");
const Role = require("./src/model/roles");
const User = require("./src/model/user");
const Permission = require("./src/model/addpermissions");
const email = require("./src/utils/sendemail");
// const session = require("express-session");
const router = require("./src/router/employee");
const Apirouter = require("./src/API/router/users_api");
// const routes = require('/src/router/employee');
const ejs = require("ejs");
const port = process.env.PORT || 44000;
const path = require("path");
const static_path = path.join(__dirname, "/public");
const view_path = path.join(__dirname, "/src/views");
const partial_path = path.join(__dirname, "/src/views/partial");
fileUpload = require("express-fileupload");
const session = require("express-session");
const fileStoreOptions = {};
const FileStore = require("session-file-store")(session);
const routes = require("./src/API/router/users_api");
const { Promise } = require("mongoose");
const RolePermission = require("./src/model/rolePermission");
const UserPermission = require("./src/model/userPermission");
// const Permission = require('../model/addpermissions');
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


app.locals.checkPermission =  function(role_id, user_id, permission_name) {
  // console.log("Asdas")
  return new Promise((resolve, reject) => {
    UserPermission.find({ user_id: user_id })
      .then((userperm) => {
        if (userperm.length > 0) {
          const permission_id = userperm[0].permission_id;
          Permission.find({ _id: permission_id })
            .then((rolePermission) => {
              var hasPermision = false;
              for (var i = 0; i < rolePermission.length; i++) {
                if (rolePermission[i].permission_name == permission_name) {
                  hasPermision = true;
                }

                const totalpermission = rolePermission[i].permission_name;
              }

              if (hasPermision) {
                resolve({ status: true });
              } else {
                resolve({ status: false });
              }
            })
            .catch((error) => {
              reject("error");
            });
        } else if (userperm.length == 0) {
          RolePermission.find({ role_id: role_id })
            .then((perm) => {
              if (perm.length > 0) {
                const permission = perm[0].permission_id;

                Permission.find({ _id: permission })
                  .then((rolePermission) => {
                    var hasPermision = false;
                    for (var i = 0; i < rolePermission.length; i++) {
                      if (
                        rolePermission[i].permission_name == permission_name
                      ) {
                        hasPermision = true;
                      }

                      const totalpermission =
                        rolePermission[i].permission_name;
                    }

                    if (hasPermision) {
                      resolve({ status: true });
                    } else {
                      resolve({ status: false });
                    }
                  })
                  .catch((error) => {
                    reject("error");
                  });
              } else {
                resolve({ status: false });
              }
            })
            .catch((error) => {
              reject("error2");
            });
        }
      })
      .catch(() => {
        reject({ message: "Forbidden2" });
      });
  });
}
app.locals.getData = function(){
  return new Promise((resolve, reject) => {
      resolve({
          title: "Example Title",
          description: "Example Description"
      })
  })
}
