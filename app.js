const express = require("express");
const cors = require("cors");
const flash = require("connect-flash");
let cookieParser = require("cookie-parser");
const app = express();
app.use(cookieParser());
require("./src/db/conn");
const router = require("./src/router/employee");
const port = process.env.PORT || 44000;
const path = require("path");
const static_path = path.join(__dirname, "/public");
const view_path = path.join(__dirname, "/src/views");
const Permission = require('./src/model/addpermissions.js')
const RolePermission = require('./src/model/rolePermission');
const UserPermission = require('./src/model/userPermission');
const partial_path = path.join(__dirname, "/src/views/partial");
const fileUpload = require("express-fileupload");
const routes = require("./src/API/router/users_api");


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
var handleReferenceError = require('./src/middleware/handleReferenceError')
 app.use(handleReferenceError);


app.listen(port, () => {
  console.log(`server is runnig at port http://localhost:${port}`);
});

app.locals.checkPermission = function (role_id, user_id, permission_name) {
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
};

app.get('/api/getDataBymonth', (req, res) => {
  const page = req.query.page || 1;
  const pageSize = req.query.pageSize || 10;
  const skip = (page - 1) * pageSize;

  // Query the database for paginated data
  db.collection('mycollection').find().skip(skip).limit(pageSize).toArray(function(err, results) {
    if (err) throw err;
    res.json(results);
  });
});