
const express = require("express");
const Holiday = require("../model/holiday");
const Role = require("../model/roles")
const router = new express.Router();
const session = require("express-session");
const holidayController = require('../controller/holidayController')
const roleController = require('../controller/roleController')
const permissionController = require('../controller/permissionController')
const rolePermissionController = require('../controller/rolePermissionController')
const userPermisssionController = require('../controller/userPermissionController')
const userController = require('../controller/userController')
const projectController = require('../controller/projectController')
const taskController = require('../controller/taskController')
const leavesController = require('../controller/leavesController')
const timeEntryController = require('../controller/timeEntryController')
const app = express();
const FileStore = require('session-file-store')(session);
const auth = require("../middleware/auth");
console.log("sandip", auth);
const sessions = require("../middleware/session")
const checkuser = require("../controller/userController")
const fileStoreOptions = {};
var options = router.use(session({
  store: new FileStore({ logFn: function () { } }),
  secret: 'bajhsgdsaj cat',
  resave: true,
  saveUninitialized: true,
  cookie: { maxAge: 1000 * 60 * 60 * 24 },
}))

router.get("/holidayListing", sessions, holidayController.list);
router.get("/addHoliday", sessions, holidayController.getHoliday);
router.post("/addHoliday", holidayController.addHoliday);
router.get("/editHoliday/:id", sessions, holidayController.editHoliday);
router.post("/editHoliday/:id", holidayController.updateHoliday);
router.get("/deleteHoliday/:id", sessions, holidayController.deleteHoliday);

router.get("/addpermissions", sessions, permissionController.permissions);
router.post("/addpermissions", permissionController.addpermissions);
router.get("/viewpermissions", sessions, permissionController.viewpermissions);
router.get("/editpermissions/:id", sessions, permissionController.editpermissions);
router.post("/editpermissions/:id", permissionController.updatepermission);
router.get("/deletepermissions/:id", sessions, permissionController.deletepermissions);

router.get("/addRole", sessions, roleController.getRole);
router.post("/addRole", roleController.addRole);
router.get("/roleListing", sessions, roleController.list);
router.get('/editRole/:id', sessions, roleController.editRole);
router.post('/editRole/:id', roleController.updateRole);
router.get('/deleteRole/:id', sessions, roleController.deleteRole);

router.get('/rolepermission/:id', sessions, rolePermissionController.getpermission);
router.post('/rolepermission/:id', rolePermissionController.addpermission);

router.get('/addProjects', sessions, projectController.getProject);
router.post('/addProjects', projectController.addProject);
router.get('/projectslisting', sessions, projectController.projectslisting);
router.get('/editProject/:id', sessions, projectController.editProject);
router.post('/editProject/:id', projectController.updateProject);
router.get('/deleteproject/:id', sessions, projectController.deleteproject);

router.get('/createtask', sessions, taskController.createtask);

router.post('/createtask', taskController.addtask);
router.get('/taskListing', sessions, taskController.taskListing);
router.get('/editTask/:id', sessions, taskController.editTask);
router.post('/editTask/:id', taskController.updateTask);
router.get('/deleteTask/:id', sessions, taskController.deletetask);
router.post('/getUserByProject/:id', taskController.getUserByProject);


router.get('/userPermission/:id', sessions, userPermisssionController.getUserPermission);
router.post('/userPermission/:id', userPermisssionController.addUserPermission);

router.get("/", userController.login);
router.post("/", userController.employeelogin);
//router.get('/addUser', sessions, userController.addUser);
//  router.get("/index", userController.index);
router.get('/addUser', sessions,auth, userController.addUser);
router.post('/addUser', userController.createuser);
router.get('/userListing', sessions, userController.list);
router.get('/viewUserDetail/:id', sessions, userController.userDetail);
router.get('/editUser/:id', sessions, userController.editUser);
router.post('/editUser/:id', userController.updateUser);
router.get('/deleteUser/:id', sessions, userController.deleteUser);
router.get('/index', sessions, userController.totalcount);
router.post('/checkEmail', userController.checkEmail);
router.get("/profile/:id", userController.profile);
router.post("/profile/:id", userController.updateUserprofile);
router.post("/userphoto/:id", userController.updateUserphoto);
router.get("/forget", userController.forget);
router.post("/forget", userController.sendforget);
router.get("/change_pwd/:id/:token", userController.getchange_pwd);
router.post("/change_pwd/:id/:token", userController.change);
// router.post("/", userController.profile);


router.get("/logoutuser", userController.logoutuser);
router.get("/leavesreqest", sessions, leavesController.leaves);
router.post("/leavesreqest", leavesController.addleaves);
router.get("/viewleaves", sessions, leavesController.viewleaves);
router.get("/rejectleaves/:id", sessions, leavesController.rejectleaves);
router.get("/approveleaves/:id", sessions, leavesController.approveleaves);
router.get("/cancelleaves/:id", sessions, leavesController.cancelleaves);
router.get("/emlpoleaveslist", leavesController.emlpoleaveslist);
router.post('/checkEmail', userController.checkEmail);
router.get("/AddtimeEntries", sessions, timeEntryController.getData);
router.post('/getTaskByProject/:id', timeEntryController.getTaskByProject);
router.post('/AddtimeEntries', timeEntryController.AddtimeEntries);
router.get('/timeEntryList', sessions, timeEntryController.timeEntryList);
router.post('/checkMonth', timeEntryController.checkMonth);

// API Routes



module.exports = router
