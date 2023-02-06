var addtechnology = require("../src/model/technology");
var roles = require("../src/model/roles");
var addcity = require("../src/model/city");
var addpermission = require("../src/model/addpermissions");
var adduser = require("../src/model/user");
var rolePermission = require("../src/model/rolePermission");
var usersPermission = require("../src/model/userPermission");
var mongoose = require("mongoose");
mongoose.Promise = global.Promise;
mongoose.set("strictQuery", false);
mongoose.connect("mongodb://0.0.0.0:27017/meet");

var technology = [
  new addtechnology({
    technology: "Node js",
  }),
  new addtechnology({
    technology: "React js",
  }),
  new addtechnology({
    technology: "PHP",
  }),
  new addtechnology({
    technology: "Java script",
  }),
  new addtechnology({
    technology: "Java",
  }),
  new addtechnology({
    technology: "Python",
  }),
  new addtechnology({
    technology: "C#",
  }),
  new addtechnology({
    technology: "HTML",
  }),
  new addtechnology({
    technology: "Angular",
  }),
  new addtechnology({
    technology: "Scala",
  }),
  new addtechnology({
    technology: "CSS",
  }),
  new addtechnology({
    technology: "C++",
  }),
  new addtechnology({
    technology: "Ruby",
  }),
  new addtechnology({
    technology: "Swift",
  }),
  new addtechnology({
    technology: "Mongo db",
  }),
  new addtechnology({
    technology: "MY SQL",
  }),
  new addtechnology({
    technology: "TypeScript",
  }),
  new addtechnology({
    technology: "ActionScript",
  }),
  new addtechnology({
    technology: "react native",
  }),
  new addtechnology({
    technology: "Kotlin",
  }),
  new addtechnology({
    technology: "NativeScript",
  }),
];
var permission = [
  new addpermission({
    permission_name: "View Holidays",
    permission_description: "you can View Holidays",
  }),
  new addpermission({
    permission_name: "Add Holiday",
    permission_description: "you can add holiday",
  }),
  new addpermission({
    permission_name: "Update Holiday",
    permission_description: "you can Update  holiday",
  }),
  new addpermission({
    permission_name: "Delete Holiday",
    permission_description: "you can delete holiday",
  }),
  new addpermission({
    permission_name: "View Roles",
    permission_description: "you can View Roles",
  }),
  new addpermission({
    permission_name: "Add Role",
    permission_description: "you can add role",
  }),
  new addpermission({
    permission_name: "Update Role",
    permission_description: "you can Update  role",
  }),
  new addpermission({
    permission_name: "Delete Role",
    permission_description: "you can delete role",
  }),

  new addpermission({
    permission_name: "View Permissions",
    permission_description: "you can View Permissions",
  }),

  new addpermission({
    permission_name: "Add Permission",
    permission_description: "you can Add Permission",
  }),
  new addpermission({
    permission_name: "Update Permission",
    permission_description: "you can delete role",
  }),
  new addpermission({
    permission_name: "Delete Permission",
    permission_description: "you can delete role",
  }),
  new addpermission({
    permission_name: "View Projects",
    permission_description: "you can View Projects",
  }),

  new addpermission({
    permission_name: "Add Project",
    permission_description: "you can add project",
  }),
  new addpermission({
    permission_name: "Update Project",
    permission_description: "you can Update  Project",
  }),
  new addpermission({
    permission_name: "Delete Project",
    permission_description: "you can delete Project",
  }),
  new addpermission({
    permission_name: "View Tasks",
    permission_description: "you can View Tasks",
  }),
  new addpermission({
    permission_name: "Add Task",
    permission_description: "you can Add Tasks",
  }),
  new addpermission({
    permission_name: "Update Task",
    permission_description: "you can Update  Task",
  }),
  new addpermission({
    permission_name: "Delete Task",
    permission_description: "you can Delete Task",
  }),
  new addpermission({
    permission_name: "Add UserPermission",
    permission_description: "you can Add User Permission",
  }),
  new addpermission({
    permission_name: "Add RolePermission",
    permission_description: "you can Add ROle Permission",
  }),
  new addpermission({
    permission_name: "View TimeEntries",
    permission_description: "you can View TimeEntries",
  }),
  new addpermission({
    permission_name: "View Leaves",
    permission_description: "you can   View Leaves",
  }),
  new addpermission({
    permission_name: "View Employees",
    permission_description: "you can   View Employees",
  }),
  new addpermission({
    permission_name: "Update Employee",
    permission_description: "you can    Update Employee",
  }),
  new addpermission({
    permission_name: "Delete Employee",
    permission_description: "you can   Delete Employee",
  }),
  new addpermission({
    permission_name: "Add Employee",
    permission_description: "you can Add ROle Permission",
  }),
  new addpermission({
    permission_name: "View Employees Details",
    permission_description: "you can  View Employees Details",
  }),
  new addpermission({
    permission_name: "Update TimeEntry",
    permission_description: "you can Update  TimeEntry",
  }),
  new addpermission({
    permission_name: "Delete TimeEntry",
    permission_description: "you can Delete  TimeEntry",
  }),
  new addpermission({
    permission_name: "View All UserLeaves",
    permission_description: "you can View All User Leaves",
  }),
  new addpermission({
    permission_name: "View Settings",
    permission_description: "you can View View Settings",
  }),
  new addpermission({
    permission_name: "Add Setting",
    permission_description: "you can View Add Setting",
  }),
  new addpermission({
    permission_name: "Delete Setting",
    permission_description: "you can View Delete Setting",
  }),
  new addpermission({
    permission_name: "Update Setting",
    permission_description: "you can View Update Setting",
  }),
  new addpermission({
    permission_name: "View RolePermissions",
    permission_description: "you can View View Role Permission",
  }),
  new addpermission({
    permission_name: "View UserPermissions",
    permission_description: "you can View View UserPermission",
  }),
  new addpermission({
    permission_name: "Add TimeEntry",
    permission_description: "you can Add Time Entry",
  }),

  new addpermission({
    permission_name: "Add Leaves",
    permission_description: "you can Add Leaves",
  }),
  new addpermission({
    permission_name: "Update Leaves",
    permission_description: "you can Update Leaves",
  }),
  new addpermission({
    permission_name: "Delete Leaves",
    permission_description: "you can Delete Leaves",
  }),
  new addpermission({
    permission_name: "View Leaves Request",
    permission_description: "you can View Leaves Request",
  }),
  new addpermission({
    permission_name: "Accept Or Reject Leaves",
    permission_description: "you can Accept Or Reject Leaves",
  }),
];
var role = [
  new roles({
    role_name: "Admin",
    role_description: "you are admin",
  }),
  new roles({
    role_name: "Software engineer",
    role_description: "you are Software engineer",
  }),
  new roles({
    role_name: "Team leader",
    role_description: "you are team leader",
  }),
  new roles({
    role_name: "Project manager",
    role_description: "you are project manager",
  }),
  new roles({
    role_name: "Tranee",
    role_description: "you are Tranee",
  }),
  new roles({
    role_name: "Software engineer",
    role_description: "you are Software engineer",
  }),
];
var city = [
  new addcity({
    city: "Ahmedabad",
  }),
  new addcity({
    city: "surat",
  }),
  new addcity({
    city: "Vadodara",
  }),
  new addcity({
    city: "Rajkot",
  }),
  new addcity({
    city: "Bhavnagar",
  }),
  new addcity({
    city: "Jamnagar",
  }),
  new addcity({
    city: "Gandhinagar",
  }),
  new addcity({
    city: "Junagadh",
  }),
  new addcity({
    city: "Gandhidham",
  }),
  new addcity({
    city: "Anand",
  }),
  new addcity({
    city: "Navsari",
  }),
  new addcity({
    city: "Morbi",
  }),
  new addcity({
    city: "Nadiad",
  }),
  new addcity({
    city: "Surendranagar",
  }),
  new addcity({
    city: "Bharuch",
  }),
  new addcity({
    city: "Mehsana",
  }),
  new addcity({
    city: "Bhuj",
  }),
  new addcity({
    city: "Porbandar",
  }),
  new addcity({
    city: "Palanpur",
  }),
  new addcity({
    city: "Valsad",
  }),
  new addcity({
    city: "Vapi",
  }),
  new addcity({
    city: "Gondal",
  }),
  new addcity({
    city: "Veraval",
  }),
  new addcity({
    city: "Godhra",
  }),
  new addcity({
    city: "Patan",
  }),
  new addcity({
    city: "Kalol",
  }),
  new addcity({
    city: "Dahod",
  }),
  new addcity({
    city: "Botad",
  }),
  new addcity({
    city: "Amreli",
  }),
  new addcity({
    city: "Deesa",
  }),
  new addcity({
    city: "Jetpur",
  }),
];
var users = [
  new adduser({
    role_id: role[0]._id,
    emp_code: "JSJDUAU6876D",
    reporting_user_id: "6360fd0de33359b3e4b6cf33",
    firstname: "codecrew",
    user_name: "codecrew",
    password: "codecrew@123",
    middle_name: "codecrew",
    last_name: "codecrew",
    gender: "male",
    dob: new Date(05 / 5 / 2001),
    doj: new Date(05 / 5 / 2022),
    personal_email: "codecrew@gmail.com",
    company_email: "test.test@codecrewinfotech.com",
    mo_number: "7984455302",
    pan_number: "ASDAFASA65",
    aadhar_number: "52658459856256",
    add_1: "avadh pride",
    add_2: "CTM",
    city: "ahmdabad",
    state: "gujarat",
    pincode: "382418",
    country: "india",
    photo: "test.jpg",
    bank_account_no: "196670316005",
    bank_name: "bank of codecrew",
    ifsc_code: "GSJKJDISj55",
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MzgxZTkyYWUyYjUzMzdmZTk2ZWQyZWMiLCJpYXQiOjE2NzEyNTEwMjYsImV4cCI6MTY3MTMzNzQyNn0.8vQDThz6h5oiJ_M6mOOqVzIjFotIug9oyAugwOKEsKM",
  }),
];

var permissionid = [];
for (let i = 0; i < permission.length; i++) {
  element = permission[i]._id;
  permissionid.push(element);
}
const perid = permissionid;

var rolepermissions = [
  new rolePermission({
    role_id: role[0]._id,
    permission_id: perid,
  }),
];
var emsdb = technology.concat(permission, role, city, users, rolepermissions);

// save function is asynchronous0
// so we need to ceck all itmes are saved before we disconnect to db

done = 0;
for (i = 0; i < emsdb.length; i++) {
  emsdb[i].save(function (err, result) {
    // console.log("err", err);
    console.log("result", result);
    done++;
    if (done == emsdb.length) {
      exit();
    }
  });
}
function exit() {
  mongoose.disconnect();
}
