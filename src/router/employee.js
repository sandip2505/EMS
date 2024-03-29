const express = require("express");
const router = new express.Router();
var helpers = require("../helpers");
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

const app = express();
const auth = require("../middleware/auth");
const sessions = require("../middleware/session");
const { CURSOR_FLAGS } = require("mongodb");
const FileStore = require("session-file-store")(session);
var fileStoreOptions = {};
var options = router.use(
  session({
    store: new FileStore({ logFn: function () { } }),
    secret: "bajhsgdsaj cat",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
  })
);
// router.get("/holidayListing", sessions, auth, holidayController.list);
// router.get("/addHoliday", sessions, auth, holidayController.getHoliday);
// router.post("/addHoliday", sessions, auth, holidayController.addHoliday);
// router.get("/editHoliday/:id", sessions, auth, holidayController.editHoliday);
// router.post("/editHoliday/:id",sessions,auth,holidayController.updateHoliday);
// router.get("/deleteHoliday/:id",sessions,auth,holidayController.deleteHoliday);

// router.get("/addpermissions", sessions, auth, permissionController.permissions);
// router.post("/addpermissions",sessions, auth, permissionController.addpermissions);
// router.get("/viewpermissions",sessions,auth,permissionController.viewpermissions);
// router.post("/viewpermissions",sessions, auth, permissionController.searchPermissions);
// router.get("/editpermissions/:id",sessions,auth,permissionController.editpermissions);
// router.post("/editpermissions/:id",sessions,auth,permissionController.updatepermission);
// router.get("/deletepermissions/:id",sessions,auth, permissionController.deletepermissions);

// router.get("/addRole", auth, sessions, roleController.getRole);
// router.post("/addRole", sessions, auth, roleController.addRole);
// router.get("/roleListing", sessions, auth, roleController.list);
// router.get("/editRole/:id", sessions, auth, roleController.editRole);
// router.post("/editRole/:id", sessions, auth, roleController.updateRole);
// router.get("/deleteRole/:id", sessions, auth, roleController.deleteRole);
// router.get("/rolepermission/:id",sessions,auth, rolePermissionController.getpermission);
// router.post("/rolepermission/:id",sessions,auth,rolePermissionController.addpermission);

// router.get("/addProjects", sessions, auth, projectController.getProject);
// router.post("/addProjects", sessions, auth, projectController.addProject);
// router.get("/projectslisting",sessions,auth,projectController.projectslisting);
// router.get("/editProject/:id", sessions, auth, projectController.editProject);
// router.get("/deleteproject/:id",sessions,auth,projectController.deleteproject);

// router.get("/addtask", sessions, auth, taskController.createtask);
// router.post("/addtask", sessions, auth, taskController.addtask);
// router.get("/taskListing", sessions, auth, taskController.taskListing);
// router.get("/editTask/:id", sessions, auth, taskController.editTask);
// router.post("/editTask/:id", sessions, auth, taskController.updateTask);
// router.get("/deleteTask/:id", sessions, auth, taskController.deletetask);

//Holiday Route done
router.get("/holidayListing", sessions, auth, holidayController.list);
router.get("/addHoliday", sessions, auth, holidayController.getHoliday);
router.post("/addHoliday", sessions, auth, holidayController.addHoliday);
router.get("/editHoliday/:id", sessions, auth, holidayController.editHoliday);
router.post("/editHoliday/:id", sessions, auth, holidayController.updateHoliday);
router.get("/deleteHoliday/:id", sessions, auth, holidayController.deleteHoliday);
router.get("/emailtemp", (req, res) => { res.render('partials/email.ejs') })
//permission route done
router.get("/addpermissions", sessions, auth, permissionController.permissions);
router.post("/addpermissions", sessions, auth, permissionController.addpermissions);
router.get("/viewpermissions", sessions, auth, permissionController.viewpermissions);
router.post("/viewpermissions", sessions, auth, permissionController.searchPermissions);
router.get("/editpermissions/:id", sessions, auth, permissionController.editpermissions);
router.post("/editpermissions/:id", sessions, auth, permissionController.updatepermission);
router.get("/deletepermissions/:id", sessions, auth, permissionController.deletepermissions);

//role route done

router.get("/addRole", sessions, auth, roleController.getRole);
router.post("/addRole", sessions, auth, roleController.addRole);
router.get("/roleListing", sessions, auth, roleController.list);
router.get("/editRole/:id", sessions, auth, roleController.editRole);
router.post("/editRole/:id", sessions, auth, roleController.updateRole);
router.get("/deleteRole/:id", sessions, auth, roleController.deleteRole);

//rolepermission route done

router.get("/rolepermission/:id", sessions, auth, rolePermissionController.getpermission);
router.post("/rolepermission/:id", sessions, auth, rolePermissionController.addpermission);

//project route done
router.get("/addProjects", sessions, auth, projectController.getProject);
router.post("/addProjects", sessions, auth, projectController.addProject);
router.get("/projectslisting", sessions, auth, projectController.projectslisting);
router.get("/editProject/:id", sessions, auth, projectController.editProject);
router.post("/editProject/:id", sessions, auth, projectController.updateProject);
router.get("/deleteproject/:id", sessions, auth, projectController.deleteproject);

//task route done
router.get("/addtask", sessions, auth, taskController.createtask);
router.post("/addtask", sessions, auth, taskController.addtask);
router.get("/taskListing", sessions, auth, taskController.taskListing);
router.get("/editTask/:id", sessions, auth, taskController.editTask);
router.post("/editTask/:id", sessions, auth, taskController.updateTask);
router.get("/deleteTask/:id", sessions, auth, taskController.deletetask);
router.get("/task_status_update/:id", auth, taskController.task_status_update);
// router.post('/getUserByProject/:id',auth, taskController.getUserByProject);
router.get("/userPermission/:id", sessions, auth, userPermisssionController.getUserPermission);
router.post("/userPermission/:id", sessions, auth, userPermisssionController.addUserPermission);

//userpermission route done
router.get("/userPermission/:id", sessions, auth, userPermisssionController.getUserPermission);
router.post("/userPermission/:id", sessions, auth, userPermisssionController.addUserPermission);

//employee route done
router.get("/login", userController.login);
router.post("/login", userController.employeelogin);
router.get("/addUser", sessions, auth, userController.addUser); // WEB
router.post("/addUser", sessions, auth, userController.createuser);
router.get("/userListing", sessions, auth, userController.list);
router.get("/viewUserDetail/:id", sessions, auth, userController.userDetail);
router.get("/editUser/:id", sessions, auth, userController.editUser);
router.post("/editUser/:id", sessions, auth, userController.updateUser);
router.get("/deleteUser/:id", sessions, auth, userController.deleteUser);
router.get("/", sessions, auth, userController.index);
router.post("/checkEmail", sessions, auth, userController.checkEmail);
router.get("/profile/:id", sessions, auth, userController.profile);
router.post("/profile/:id", sessions, auth, userController.updateprofile);

router.get("/profileEdit/:id", sessions, auth, userController.profileEdit);
router.post("/profileEdit/:id", sessions, auth, userController.updateUserprofile);
// router.post("/userphoto/:id", sessions, auth, userController.updateUserphoto);
router.post("/userprofilephoto/:id", sessions, auth, userController.updateUserphoto);
router.get("/forget", userController.forget);
router.post("/forget", userController.sendforget);
router.get("/change_password/:id", auth, userController.get_change_password);
router.post("/change_password/:id", auth, userController.change_password);

router.get("/change_pwd/:id/:token", userController.getchange_pwd);
router.post("/change_pwd/:id/:token", userController.change);
router.get("/logoutuser", sessions, auth, userController.logoutuser);
router.post("/checkEmail", sessions, auth, userController.checkEmail);
router.get("/getxlsxfile", sessions, auth, userController.getxlsxfile);
// router.get("/addxlsxfile", sessions, auth, userController.addxlsxfile);
router.post("/addxlsxfile", sessions, auth, userController.addxlsxfile);
// router.get("/addxlsxfile", sessions, auth, userController.addxlsxfile);
// router.post("/activeuser/:id" , userController.activeuser);
router.get("/addLeaves", sessions, auth, leavesController.getAddLeaves);
router.post("/addLeaves", sessions, auth, leavesController.addleaves);
router.get("/viewleavesrequest", sessions, auth, leavesController.viewleaves);
router.get("/rejectLeaves/:id", sessions, auth, leavesController.rejectLeaves);
router.get("/approveLeaves/:id", sessions, auth, leavesController.approveLeaves);
router.get("/editLeave/:id", sessions, auth, leavesController.editLeave);
router.post("/editLeave/:id", sessions, auth, leavesController.updateLeave);
router.get("/deleteLeaves/:id", sessions, auth, leavesController.deleteLeave);
router.get("/cancelLeaves/:id", sessions, auth, leavesController.cancelLeaves);
router.get("/employeeLeavesList", sessions, auth, leavesController.employeeLeavesList);

// router.post("/timeEntryList",sessions, auth, timeEntryController.AddtimeEntries);
// router.get( "/timeEntryList",sessions,auth,  timeEntryController.getTimeEntries);
router.get("/addTimeEntries", sessions, auth, NewTimeEntryController.AddtimeEntries);
router.get("/timeEntryRequest", sessions, auth, NewTimeEntryController.timeEntryRequest);
router.post("/timeEntryRequest", sessions, auth, NewTimeEntryController.AddtimeEntryRequest);
router.get("/timeEntryRequestListing", sessions, auth, NewTimeEntryController.timeEntryRequestListing);

router.get("/approveTimeEntryRequest/:id", sessions, auth, NewTimeEntryController.approveTimeEntryRequest);
router.get("/rejectTimeEntryRequest/:id", sessions, auth, NewTimeEntryController.rejectTimeEntryRequest);


router.post("/addTimeEntries", sessions, auth, NewTimeEntryController.NewAddtimeEntries);
router.get("/timeEntryListing", sessions, auth, NewTimeEntryController.timeEntrieslisting);
// router.post("/timeEntrieslisting",sessions,auth,NewTimeEntryController.search);
router.post("/getDataBymonth", sessions, auth, NewTimeEntryController.getDataBymonth);
router.get("/editTimeEntry/:id", sessions, auth, NewTimeEntryController.editTimeEntry);
router.post("/editTimeEntry/:id", sessions, auth, NewTimeEntryController.updateTimeEntry);

router.get("/addWorkingHour", sessions, auth, NewTimeEntryController.getAddWorkingHour);
router.get("/editWorkingHour/:id", sessions, auth, NewTimeEntryController.editWorkingHour);
router.post("/editWorkingHour/:id", sessions, auth, NewTimeEntryController.updateWorkingHour);
router.post("/addWorkingHour", sessions, auth, NewTimeEntryController.AddWorkingHour);
router.get("/showWorkingHour", sessions, auth, NewTimeEntryController.showWorkingHour);


router.get("/addsetting/", sessions, auth, settingController.getAddSetting);
router.post("/addsetting/", sessions, auth, settingController.addSetting);
router.get("/settingListing/", sessions, auth, settingController.list);
router.get("/editSetting/:id", sessions, auth, settingController.editSetting);
router.post("/editSetting/:id", sessions, auth, settingController.updateSetting);
router.get("/deleteSetting/:id", sessions, auth, settingController.SettingsDelete);
//announcement controller
router.get("/addAnnouncement", sessions, auth, announcementController.getAddAnnouncement);
router.post("/addAnnouncement", sessions, auth, announcementController.AddAnnouncement);
router.get("/announcementListing", sessions, auth, announcementController.list);
router.post("/viewAnnouncement/:announcement_id", sessions, auth, announcementController.viewAnnouncement);
router.get("/deleteAnnouncement/:id", sessions, auth, announcementController.deleteAnnouncement);

//salary conttroller
router.get("/addSalaryStructure", sessions, auth, salaryController.getAddSalaryStructure);
router.post("/addSalaryStructure", sessions, auth, salaryController.addSalaryStructure);
router.get("/editSalaryStructure/:id", sessions, auth, salaryController.editSalaryStructure);
router.post("/editSalaryStructure/:id", sessions, auth, salaryController.updateSalaryStructure);
// router.post("/newTimeEntry", auth, timeEntryController.AddtimeEntries);


router.get("/newTimeEntry", auth, timeEntryController.getTimeEntries);
router.get("/activeuserAccount/:id", userController.getactiveuser);
router.post("/setpassword/:id", userController.activeuserAccount);
router.get("/salary-slip/:id/:month/:year", salaryController.genrateSalarySlip);
router.get("/send_salary-slip/:id/:month/:year", salaryController.sendSalarySlip);
router.get("/salaryParticularListing", auth, salaryController.salaryparticulars);
router.get("/salaryStructureListing", auth, salaryController.salaryStructureListing);

router.get("/test", salaryController.test);

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

//
router.get("/alluserleaves", sessions, auth, leavesController.alluserLeaves);
router.get("/salaryListing", sessions, auth, salaryController.salaryListing);
router.get("/forbidden", sessions, auth, userController.forbidden);

// router.get("/forbidden", sessions,auth, async function (req, res) {

// });

// API Routes

module.exports = router;
