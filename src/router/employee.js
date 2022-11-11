
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
const timeEntryController = require('../controller/timeEntryController')
const app = express();
const FileStore = require('session-file-store')(session);

const fileStoreOptions = {};

var options = router.use(session({
  store: new FileStore(fileStoreOptions),
  secret: 'bajhsgdsaj cat',
  resave: true,
  saveUninitialized: true,
  cookie: { maxAge: 1000 * 60 * 60 * 24 },
  name: 'my.connect.sid'
}))

router.get("/holidayListing", holidayController.list);
router.get("/addHoliday", holidayController.getHoliday);
router.post("/addHoliday", holidayController.addHoliday);
router.get("/editHoliday/:id", holidayController.editHoliday);
router.post("/editHoliday/:id", holidayController.updateHoliday);
router.get("/deleteHoliday/:id", holidayController.deleteHoliday);



router.get("/addpermissions", permissionController.permissions);
router.post("/addpermissions", permissionController.addpermissions);
router.get("/viewpermissions", permissionController.viewpermissions);
router.get("/editpermissions/:id", permissionController.editpermissions);
router.post("/editpermissions/:id", permissionController.updatepermission);
router.get("/deletepermissions/:id", permissionController.deletepermissions);
router.get("/addRole", roleController.getRole);
router.post("/addRole", roleController.addRole);
router.get("/roleListing", roleController.list);
router.get('/editRole/:id', roleController.editRole);
router.post('/editRole/:id', roleController.updateRole);
router.get('/deleteRole/:id', roleController.deleteRole);
router.get('/rolepermission/:id', rolePermissionController.getpermission);
router.post('/rolepermission/:id', rolePermissionController.addpermission);

router.get('/addProjects', projectController.getProject);
router.post('/addProjects', projectController.addProject);
router.get('/projectslisting', projectController.projectslisting);
router.get('/editProject/:id', projectController.editProject);
router.post('/editProject/:id', projectController.updateProject);
router.get('/deleteproject/:id', projectController.deleteproject);
router.get('/createtask', taskController.createtask);
router.post('/createtask', taskController.addtask);
router.get('/taskListing', taskController.taskListing);
router.get('/editask/:id', taskController.editask);
router.get('/deleteTask/:id', taskController.deletetask);
router.post('/getUserByProject/:id', taskController.getUserByProject);

// router.get('/userdata', users_api.projectslisting);
router.get('/userPermission/:id', userPermisssionController.getpermission);
router.post('/userPermission/:id', userPermisssionController.addpermission);

router.get("/", userController.login);
router.post("/", userController.employeelogin);
//  router.get("/index", userController.index);
router.get('/addUser', userController.addUser);
router.post('/addUser', userController.createuser);
router.get('/userListing', userController.list);
router.get('/viewUserDetail/:id', userController.userDetail);
router.get('/editUser/:id', userController.editUser);
router.post('/editUser/:id', userController.updateUser);
router.get('/deleteUser/:id', userController.deleteUser);
router.get('/index', userController.totalcount);
router.post('/checkEmail', userController.checkEmail);

router.post('/checkEmail', userController.checkEmail);
// router.get("/deletepermissions/:id", permissionController.deletepermissions);
router.get("/AddtimeEntries", timeEntryController.getData);
router.post('/getTaskByProject/:id', timeEntryController.getTaskByProject);
router.post('/AddtimeEntries', timeEntryController.AddHours);
module.exports = router
