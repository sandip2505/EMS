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
const timeEntry = require("./src/model/timeEntries")
const user = require('./src/model/user');
const holiday = require('./src/model/holiday');
const timeEntryMail = require("./src/utils/timeEntryMail")
const partial_path = path.join(__dirname, "/src/views/partial");
const fileUpload = require("express-fileupload");
const routes = require("./src/API/router/users_api");
const pdf = require('html-pdf');
const salary = require('./src/model/salary');
const cron = require("node-cron")
const nodemailer = require("nodemailer");
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
var handleReferenceError = require('./src/middleware/handleReferenceError');
// const timeEntry = require("./src/model/timeEntries");
 app.use(handleReferenceError);


app.listen(port, () => {
  console.log(`server is runnig at port http://localhost:${port}`);
});
cron.schedule('00 11 * * 1-6', async () => {
  const today = new Date();
  const twoDaysAgo = new Date(today - 2 * 24 * 60 * 60 * 1000); // Two days ago
  const threeDaysAgo = new Date(today - 3 * 24 * 60 * 60 * 1000); // Three days ago
  var timeEntryLink = `${process.env.BASE_URL}/addtimeEntries/`;
  if (twoDaysAgo.getDay() === 0) {
    var date = threeDaysAgo.toISOString().split('T')[0];
  } else {
    var date = twoDaysAgo.toISOString().split('T')[0];
  }
const recentTimeEntries = await timeEntry.find({date:date ,deleted_at: "null"});
const alluserwithTimeEntry =[]
recentTimeEntries.forEach(userTimeEntries => {
  alluserwithTimeEntry.push(userTimeEntries.user_id)
});
const withoutTimeEntryUsers = await user.aggregate([
  {
    $match: {
      _id: { $nin: alluserwithTimeEntry },
      deleted_at: "null",
    },
  },
  {
    $lookup: {
      from: "leaves",
      localField: "_id",
      foreignField: "user_id",
      as: "leavesData",
    },
  },
  {
    $project: {
      _id: 1,
      company_email: 1,
      firstname: 1,
      leavesData: 1,
    },
  },
]);
const holidayData = await holiday.find({ deleted_at: "null" }).select("holiday_date");
for (const user of withoutTimeEntryUsers) {
  let hasLeaveThatIncludesTwoDaysAgo = false;
  let isHolidayOnTwoDaysAgo = false;
  for (const leave of user.leavesData) {
    const leaveStartDate = new Date(leave.datefrom).toISOString().split('T')[0];
    const leaveEndDate = new Date(leave.dateto).toISOString().split('T')[0];
    if (leaveStartDate <= twoDaysAgo.toISOString().split('T')[0] && leaveEndDate >= twoDaysAgo.toISOString().split('T')[0]) {
      hasLeaveThatIncludesTwoDaysAgo = true;
      break;
    }
  }
  for (const holiday of holidayData) {
    const holidayDate = new Date(holiday.holiday_date).toISOString().split('T')[0];
    if (holidayDate === twoDaysAgo.toISOString().split('T')[0]) {
      console.log(`${twoDaysAgo.toISOString().split('T')[0]} is a holiday`);
      isHolidayOnTwoDaysAgo = true;
      break;
    }
  }

const dateParts = date.split("-");
const year = dateParts[0];
const month = dateParts[1];
const day = dateParts[2];
const formattedDate = `${day}-${month}-${year}`;

  if (!hasLeaveThatIncludesTwoDaysAgo && !isHolidayOnTwoDaysAgo) {
    await timeEntryMail(
      user.firstname,
      user.company_email,
      formattedDate,
      timeEntryLink
    );
  }
}
})

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

// app.get('/api/getDataBymonth', (req, res) => {
//   const page = req.query.page || 1;
//   const pageSize = req.query.pageSize || 10;
//   const skip = (page - 1) * pageSize;

//   // Query the database for paginated data
//   db.collection('mycollection').find().skip(skip).limit(pageSize).toArray(function(err, results) {
//     if (err) throw err;
//     res.json(results);
//   });
// });
// async function getEmployeeDetails(employeeCode) {
//   const employee = await salary.findOne({ user_id:employeeCode });

//   return employee.toJSON(); // Convert the Sequelize model instance to a plain object
// }
// async function generateSalarySlip(employeeCode) {
//   const employee = await getEmployeeDetails(employeeCode);
//   const template = await ejs.renderFile('salary.ejs', { employee });
//   const pdfOptions = { format: 'A4' };
//   const pdfBuffer = await new Promise((resolve, reject) => {
//     pdf.create(template, pdfOptions).toBuffer((err, buffer) => {
//       if (err) reject(err);
//       else resolve(buffer);
//     });
//   });
//   return pdfBuffer;
// }
// app.get('/salary-slip/:employeeCode', async (req, res) => {
//   try {
//     const pdfBuffer = await generateSalarySlip(req.params.employeeCode);
//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader('Content-Disposition', 'attachment; filename=salary_slip.pdf');
//     res.send(pdfBuffer);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Error generating salary slip');
//   }
// });