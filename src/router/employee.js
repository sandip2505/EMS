
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
const NewTimeEntryController = require('../controller/NewTimeEntriescontroller')
const settingController = require('../controller/settingController')
const app = express();
const auth = require("../middleware/auth");
const sessions = require("../middleware/session")
const checkuser = require("../controller/userController")
const FileStore = require('session-file-store')(session);

var options = router.use(session({
  store: new FileStore({ logFn: function () { } }),
  secret: 'bajhsgdsaj cat',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 },
}))



router.get("/holidayListing",auth, sessions,holidayController.list);
router.get("/addHoliday",auth, sessions, holidayController.getHoliday);
router.post("/addHoliday",auth,holidayController.addHoliday);
router.get("/editHoliday/:id",auth, sessions, holidayController.editHoliday);
router.post("/editHoliday/:id",auth, holidayController.updateHoliday);
router.get("/deleteHoliday/:id",auth, sessions, holidayController.deleteHoliday);

router.get("/addpermissions",auth, sessions, permissionController.permissions);
router.post("/addpermissions",auth, permissionController.addpermissions);

router.get("/viewpermissions",auth, sessions, permissionController.viewpermissions);
router.post("/viewpermissions",auth, sessions, permissionController.searchPermissions);
router.get("/editpermissions/:id",auth, sessions, permissionController.editpermissions);
router.post("/editpermissions/:id",auth, permissionController.updatepermission);
router.get("/deletepermissions/:id",auth, sessions, permissionController.deletepermissions);

router.get("/addRole",auth, sessions, roleController.getRole);
router.post("/addRole",auth, roleController.addRole);
router.get("/roleListing",auth, sessions, roleController.list);
router.get('/editRole/:id',auth, sessions, roleController.editRole);
router.post('/editRole/:id',auth, roleController.updateRole);
router.get('/deleteRole/:id',auth, sessions, roleController.deleteRole);

router.get('/rolepermission/:id',auth, sessions, rolePermissionController.getpermission);
router.post('/rolepermission/:id',auth, rolePermissionController.addpermission);

router.get('/addProjects',auth, sessions, projectController.getProject);
router.post('/addProjects',auth, projectController.addProject);
router.get('/projectslisting',auth, sessions, projectController.projectslisting);
router.get('/editProject/:id',auth, sessions, projectController.editProject);
router.post('/editProject/:id',auth, projectController.updateProject);
router.get('/deleteproject/:id',auth, sessions, projectController.deleteproject);

router.get('/createtask',auth, sessions, taskController.createtask);
router.post('/createtask',auth, taskController.addtask);
router.get('/taskListing',auth, sessions, taskController.taskListing);
router.get('/editTask/:id',auth, sessions, taskController.editTask);
router.post('/editTask/:id',auth, taskController.updateTask);
router.get('/deleteTask/:id',auth, sessions, taskController.deletetask);
router.post('/getUserByProject/:id',auth, taskController.getUserByProject);
router.post('/getTaskByProject/:id',auth, taskController.getTaskByProject);


router.get('/userPermission/:id',auth, sessions, userPermisssionController.getUserPermission);
router.post('/userPermission/:id',auth, userPermisssionController.addUserPermission);

router.get("/", userController.login);
router.post("/", userController.employeelogin);
//router.get('/addUser',auth, sessions, userController.addUser);
//  router.get("/index",auth, userController.index);
router.get('/addUser',auth, sessions,  userController.addUser); // WEB
router.post('/addUser',auth, userController.createuser);
router.get('/userListing',auth, sessions, userController.list);
router.get('/viewUserDetail/:id',auth, sessions, userController.userDetail);
router.get('/editUser/:id',auth, sessions, userController.editUser);
router.post('/editUser/:id',auth, userController.updateUser);
router.get('/deleteUser/:id',auth, sessions, userController.deleteUser);
router.get('/index',auth, sessions, userController.index);
// router.get('/menulist',auth, sessions, userController.menulist);
router.post('/checkEmail',auth, userController.checkEmail);
router.get("/profile/:id",auth, userController.profile);
router.post("/profile/:id",auth, userController.updateUserprofile);
router.post("/userphoto/:id",auth, userController.updateUserphoto);
router.get("/forget",auth, userController.forget);
router.post("/forget",auth, userController.sendforget);
router.get("/change_pwd/:id/:token", userController.getchange_pwd);
router.post("/change_pwd/:id/:token", userController.change);
// router.post("/",auth, userController.profile);
router.get("/logoutuser",auth, userController.logoutuser);
router.post('/checkEmail',auth, userController.checkEmail);


router.get("/addLeaves",auth, sessions, leavesController.getAddLeaves);
router.post("/addLeaves",auth, leavesController.addleaves);
router.get("/viewleaves",auth, sessions, leavesController.viewleaves);
router.get("/rejectLeaves/:id",auth, sessions, leavesController.rejectLeaves);
router.get("/approveLeaves/:id",auth, sessions, leavesController.approveLeaves);
router.get("/cancelLeaves/:id",auth, sessions, leavesController.cancelLeaves);
router.get("/employeeLeavesList",auth, leavesController.employeeLeavesList);

router.post('/timeEntryList',auth, timeEntryController.AddtimeEntries);
router.get('/timeEntryList',auth, sessions, timeEntryController.getTimeEntries);


router.get('/addTimeEntries',auth, NewTimeEntryController.AddtimeEntries);
router.post('/addTimeEntries',auth, NewTimeEntryController.NewAddtimeEntries);
router.get('/timeEntrieslisting',auth, sessions, NewTimeEntryController.timeEntrieslisting);
router.post('/timeEntrieslisting',auth, sessions, NewTimeEntryController.search);
router.post('/getDataBymonth',auth, sessions, NewTimeEntryController.getDataBymonth);
router.get('/editTimeEntry/:id',auth, sessions, NewTimeEntryController.editTimeEntry);
router.post('/editTimeEntry/:id',auth, sessions, NewTimeEntryController.updateTimeEntry);

router.get('/addsetting/',auth, sessions, settingController.getAddSetting);
router.post('/addsetting/',auth, sessions, settingController.addSetting); 
router.get('/settingListing/',auth, sessions, settingController.list); 
router.get('/editSetting/:id',auth, sessions, settingController.editSetting); 
router.post('/editSetting/:id',auth, sessions, settingController.updateSetting); 

//**************************
router.get('/alluserleaves',auth, sessions, leavesController.alluserLeaves); 


router.get('/forbidden',auth, function(req, res) {
  sess = req.session;
  res.render("forbidden",{username: sess.username,loggeduserdata: req.user})
})




// API Routes



module.exports = router
