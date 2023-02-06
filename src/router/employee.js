const express = require("express");
const router = new express.Router();
const helper = require("../helpers/index")
const session = require("express-session");
const holidayController = require("../controller/holidayController");
const roleController = require("../controller/roleController");
const permissionController = require("../controller/permissionController");
const rolePermissionController = require("../controller/rolePermissionController");
const userPermisssionController = require("../controller/userPermissionController");
const userController = require("../controller/userController");
const projectController = require("../controller/projectController");
const taskController = require("../controller/taskController");
const leavesController = require("../controller/leavesController");
const timeEntryController = require("../controller/timeEntryController");
const NewTimeEntryController = require("../controller/NewTimeEntriescontroller");
const settingController = require("../controller/settingController");
const announcementController = require("../controller/announcementController");
const salaryController = require("../controller/salaryController");
const EmployeeSalaryController = require("../controller/EmployeeSalaryController");
var routeChe = require("route-cache");
const app = express();
const auth = require("../middleware/auth");
const sessions = require("../middleware/session");
const FileStore = require("session-file-store")(session);
var fileStoreOptions = {};
var options = router.use(
  session({
    store: new FileStore({ logFn: function () {} }),
    secret: "bajhsgdsaj cat",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
  })
);

router.get("/holidayListing", sessions, auth, holidayController.list);
router.get("/addHoliday", sessions, auth, holidayController.getHoliday);
router.post("/addHoliday", sessions, auth, holidayController.addHoliday);
router.get("/editHoliday/:id", sessions, auth, holidayController.editHoliday);
router.post(
  "/editHoliday/:id",
  sessions,
  auth,
  holidayController.updateHoliday
);
router.get(
  "/deleteHoliday/:id",
  sessions,
  auth,
  holidayController.deleteHoliday
);

router.get("/addpermissions", sessions, auth, permissionController.permissions);
router.post(
  "/addpermissions",
  sessions,
  auth,
  permissionController.addpermissions
);
router.get(
  "/viewpermissions",
  sessions,
  auth,
  permissionController.viewpermissions
);
router.post(
  "/viewpermissions",
  sessions,
  auth,
  permissionController.searchPermissions
);
router.get(
  "/editpermissions/:id",
  sessions,
  auth,
  permissionController.editpermissions
);
router.post(
  "/editpermissions/:id",
  sessions,
  auth,
  permissionController.updatepermission
);
router.get(
  "/deletepermissions/:id",
  sessions,
  auth,
  permissionController.deletepermissions
);

router.get("/addRole", auth, sessions, roleController.getRole);
router.post("/addRole", sessions, auth, roleController.addRole);
router.get("/roleListing", sessions, auth, roleController.list);
router.get("/editRole/:id", sessions, auth, roleController.editRole);
router.post("/editRole/:id", sessions, auth, roleController.updateRole);
router.get("/deleteRole/:id", sessions, auth, roleController.deleteRole);
router.get(
  "/rolepermission/:id",
  sessions,
  auth,
  rolePermissionController.getpermission
);
router.post(
  "/rolepermission/:id",
  sessions,
  auth,
  rolePermissionController.addpermission
);

router.get("/addProjects", sessions, auth, projectController.getProject);
router.post("/addProjects", sessions, auth, projectController.addProject);
router.get(
  "/projectslisting",
  sessions,
  auth,
  projectController.projectslisting
);
router.get("/editProject/:id", sessions, auth, projectController.editProject);
router.post(
  "/editProject/:id",
  sessions,
  auth,
  projectController.updateProject
);
router.get(
  "/deleteproject/:id",
  sessions,
  auth,
  projectController.deleteproject
);

router.get("/addtask", sessions, auth, taskController.createtask);
router.post("/addtask", sessions, auth, taskController.addtask);
router.get("/taskListing", sessions, auth, taskController.taskListing);
router.get("/editTask/:id", sessions, auth, taskController.editTask);
router.post("/editTask/:id", sessions, auth, taskController.updateTask);
router.get("/deleteTask/:id", sessions, auth, taskController.deletetask);

//Holiday Route done
router.get("/holidayListing", sessions, auth, holidayController.list);
router.get("/addHoliday", sessions, auth, holidayController.getHoliday);
router.post("/addHoliday", sessions, auth, holidayController.addHoliday);
router.get("/editHoliday/:id", sessions, auth, holidayController.editHoliday);
router.post(
  "/editHoliday/:id",
  sessions,
  auth,
  holidayController.updateHoliday
);
router.get(
  "/deleteHoliday/:id",
  sessions,
  auth,
  holidayController.deleteHoliday
);

//permission route done
router.get("/addpermissions", sessions, auth, permissionController.permissions);
router.post(
  "/addpermissions",
  sessions,
  auth,
  permissionController.addpermissions
);
router.get(
  "/viewpermissions",
  sessions,
  auth,
  permissionController.viewpermissions
);
router.post(
  "/viewpermissions",
  sessions,
  auth,
  permissionController.searchPermissions
);
router.get(
  "/editpermissions/:id",
  sessions,
  auth,
  permissionController.editpermissions
);
router.post(
  "/editpermissions/:id",
  sessions,
  auth,
  permissionController.updatepermission
);
router.get(
  "/deletepermissions/:id",
  sessions,
  auth,
  permissionController.deletepermissions
);

//role route done

router.get("/addRole", sessions, auth, roleController.getRole);
router.post("/addRole", sessions, auth, roleController.addRole);
router.get("/roleListing", sessions, auth, roleController.list);
router.get("/editRole/:id", sessions, auth, roleController.editRole);
router.post("/editRole/:id", sessions, auth, roleController.updateRole);
router.get("/deleteRole/:id", sessions, auth, roleController.deleteRole);

//rolepermission route done

router.get(
  "/rolepermission/:id",
  sessions,
  auth,
  rolePermissionController.getpermission
);
router.post(
  "/rolepermission/:id",
  sessions,
  auth,
  rolePermissionController.addpermission
);

//project route done
router.get("/addProjects", sessions, auth, projectController.getProject);
router.post("/addProjects", sessions, auth, projectController.addProject);
router.get(
  "/projectslisting",
  sessions,
  auth,
  projectController.projectslisting
);
router.get("/editProject/:id", sessions, auth, projectController.editProject);
router.post(
  "/editProject/:id",
  sessions,
  auth,
  projectController.updateProject
);
router.get(
  "/deleteproject/:id",
  sessions,
  auth,
  projectController.deleteproject
);

//task route done
router.get("/addtask", sessions, auth, taskController.createtask);
router.post("/addtask", sessions, auth, taskController.addtask);
router.get("/taskListing", sessions, auth, taskController.taskListing);
router.get("/editTask/:id", sessions, auth, taskController.editTask);
router.post("/editTask/:id", sessions, auth, taskController.updateTask);
router.get("/deleteTask/:id", sessions, auth, taskController.deletetask);
// router.post('/getUserByProject/:id',auth, taskController.getUserByProject);

router.get(
  "/userPermission/:id",
  sessions,
  auth,
  userPermisssionController.getUserPermission
);
router.post(
  "/userPermission/:id",
  sessions,
  auth,
  userPermisssionController.addUserPermission
);

//userpermission route done
router.get(
  "/userPermission/:id",
  sessions,
  auth,
  userPermisssionController.getUserPermission
);
router.post(
  "/userPermission/:id",
  sessions,
  auth,
  userPermisssionController.addUserPermission
);

//employee route done
router.get("/", userController.login);
router.post("/", userController.employeelogin);

//router.get('/addUser',auth, , userController.addUser);
//  router.get("/index",auth, userController.index);
// router.get("/addUser", auth, , userController.addUser); // WEB
// router.post("/addUser", auth, userController.createuser);
// router.get("/userListing", auth, , userController.list);
// router.get("/viewUserDetail/:id", auth, , userController.userDetail);
// router.get("/editUser/:id", auth, , userController.editUser);
// router.post("/editUser/:id", auth, userController.updateUser);
// router.get("/deleteUser/:id", auth, , userController.deleteUser);
// router.get("/index", auth, , userController.index);

router.get("/addUser", sessions, auth, userController.addUser); // WEB
router.post("/addUser", sessions, auth, userController.createuser);
router.get("/userListing", sessions, auth, userController.list);
router.get("/viewUserDetail/:id", sessions, auth, userController.userDetail);
router.get("/editUser/:id", sessions, auth, userController.editUser);
router.post("/editUser/:id", sessions, auth, userController.updateUser);
router.get("/deleteUser/:id", sessions, auth, userController.deleteUser);
router.get(
  "/index",
  sessions,
  auth,
  userController.index
);
// router.get('/menulist',auth, , userController.menulist);
router.post("/checkEmail", sessions, auth, userController.checkEmail);
router.get("/profile/:id", sessions, auth, userController.profile);
router.get("/profileEdit/:id", sessions, auth, userController.profileEdit);
router.post(
  "/profileEdit/:id",
  sessions,
  auth,
  userController.updateUserprofile
);
router.post("/userphoto/:id", sessions, auth, userController.updateUserphoto);
router.get("/forget", userController.forget);
router.post("/forget", userController.sendforget);
router.get("/change_pwd/:id/:token", userController.getchange_pwd);
router.post("/change_pwd/:id/:token", userController.change);
// router.post("/",auth, userController.profile);
router.get("/logoutuser", sessions, auth, userController.logoutuser);
router.post("/checkEmail", sessions, auth, userController.checkEmail);
router.get("/getxlsxfile", sessions, auth, userController.getxlsxfile);
// router.get("/addxlsxfile", sessions, auth, userController.addxlsxfile);
router.get("/addxlsxfile", sessions, auth, userController.addxlsxfile);
router.get("/addxlsxfile", sessions, auth, userController.addxlsxfile);
router.get("/activeuser/:id", sessions, auth, userController.activeuser);

router.get("/addLeaves", sessions, auth, leavesController.getAddLeaves);
router.post("/addLeaves", sessions, auth, leavesController.addleaves);
router.get("/viewleavesrequest", sessions, auth, leavesController.viewleaves);
router.get("/rejectLeaves/:id", sessions, auth, leavesController.rejectLeaves);
router.get(
  "/approveLeaves/:id",
  sessions,
  auth,
  leavesController.approveLeaves
);

router.get("/cancelLeaves/:id", sessions, auth, leavesController.cancelLeaves);
router.get(
  "/employeeLeavesList",
  sessions,
  auth,
  leavesController.employeeLeavesList
);

// router.post("/timeEntryList",sessions, auth, timeEntryController.AddtimeEntries);
// router.get( "/timeEntryList",sessions,auth,  timeEntryController.getTimeEntries);
router.get(
  "/addTimeEntries",
  sessions,
  auth,
  NewTimeEntryController.AddtimeEntries
);
router.post(
  "/addTimeEntries",
  sessions,
  auth,
  NewTimeEntryController.NewAddtimeEntries
);
router.get(
  "/timeEntryListing",
  sessions,
  auth,
  NewTimeEntryController.timeEntrieslisting
);
// router.post("/timeEntrieslisting",sessions,auth,NewTimeEntryController.search);
router.post(
  "/getDataBymonth",
  sessions,
  auth,
  NewTimeEntryController.getDataBymonth
);
router.get(
  "/editTimeEntry/:id",
  sessions,
  auth,
  NewTimeEntryController.editTimeEntry
);
router.post(
  "/editTimeEntry/:id",
  sessions,
  auth,
  NewTimeEntryController.updateTimeEntry
);

router.get("/addsetting/", sessions, auth, settingController.getAddSetting);
router.post("/addsetting/", sessions, auth, settingController.addSetting);
router.get("/settingListing/", sessions, auth, settingController.list);
router.get("/editSetting/:id", sessions, auth, settingController.editSetting);
router.post(
  "/editSetting/:id",
  sessions,
  auth,
  settingController.updateSetting
);
router.get(
  "/deleteSetting/:id",
  sessions,
  auth,
  settingController.SettingsDelete
);
//announcement controller
router.get(
  "/addAnnouncement",
  sessions,
  auth,
  announcementController.getAddAnnouncement
);
router.post(
  "/addAnnouncement",
  sessions,
  auth,
  announcementController.AddAnnouncement
);
router.get("/announcementListing", sessions, auth, announcementController.list);

//salary conttroller
router.get("/addSalary", sessions, auth, salaryController.getAddSalary);
//router.get('/addUser',auth, , userController.addUser);
//  router.get("/index",auth, userController.index);

// leaves route done
// router.get("/addLeaves", auth,  leavesController.getAddLeaves);
// router.post("/addLeaves", auth, leavesController.addleaves);
// router.get("/viewleavesrequest", auth,  leavesController.viewleaves);
// router.get("/rejectLeaves/:id", auth,  leavesController.rejectLeaves);
// router.get(
//   "/approveLeaves/:id",
//   auth,

//   leavesController.approveLeaves
// );
// router.get("/cancelLeaves/:id", auth,  leavesController.cancelLeaves);
// router.get("/employeeLeavesList", auth, leavesController.employeeLeavesList);

router.post("/newTimeEntry", auth, timeEntryController.AddtimeEntries);
router.get("/newTimeEntry", auth, timeEntryController.getTimeEntries);

//timeentry route done
// router.get("/addTimeEntries", auth, NewTimeEntryController.AddtimeEntries);
// router.post("/addTimeEntries", auth, NewTimeEntryController.NewAddtimeEntries);
// router.get(
//   "/timeEntryListing",
//   auth,

//   NewTimeEntryController.timeEntrieslisting
// );
// // router.post('/timeEntrieslisting',auth, , NewTimeEntryController.search);
// router.get(
//   "/editTimeEntry/:id",
//   auth,

//   NewTimeEntryController.editTimeEntry
// );
// router.post(
//   "/editTimeEntry/:id",
//   auth,

//   NewTimeEntryController.updateTimeEntry
// );

// Apirouter.get('/settingListing',auth, users_api.Settingslist);

// Apirouter.get('/addsetting',auth, users_api.getAddSetting);
// Apirouter.post('/addsetting',auth, users_api.Settingsadd);

// Apirouter.get('/editSetting/:id',auth, users_api.SettingsEdit);

// Apirouter.post('/editSetting/:id',auth, users_api.SettingsUpdate);
// Apirouter.post('/SettingsDelete/:id',auth, users_api.SettingsDelete);
//setting route
// router.get("/addsetting/", auth, settingController.getAddSetting);
// router.post("/addsetting/", auth,  settingController.addSetting);
// router.get("/settingListing/", auth,  settingController.list);
// router.get("/editSetting/:id", auth, settingController.editSetting);
// router.post(
//   "/editSetting/:id",
//   auth,

//   settingController.updateSetting
// );

//**************************
router.get("/alluserleaves", sessions, auth, leavesController.alluserLeaves);
router.get(
  "/Employee_salaryListing",
  sessions,
  auth,
  EmployeeSalaryController.EmployeeSalaryListing
);

router.get("/forbidden", auth, async function (req, res) {
  sess = req.session;
  res.render("forbidden", {
    Permission: await helper.getpermission(req.user),
    username: sess.username,
    loggeduserdata: req.user,
  });
});

// API Routes

module.exports = router;
