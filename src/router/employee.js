
const express = require("express");
const Employee = require("../model/employee");
const Holiday = require("../model/holiday");
const Role = require("../model/roles")
const router = new express.Router();
const sessions = require("express-session");
const employeeController = require('../controller/employeeController')
const holidayController = require('../controller/holidayController')
const roleController = require('../controller/roleController')
const permissionController = require('../controller/permissionController')
const userPermissionController = require('../controller/userPermissionController')
const userController = require('../controller/userController')
const projectController = require('../controller/projectController')
const taskController = require('../controller/taskController')
const app = express();
router.use(sessions({
  secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
  saveUninitialized: true,
  resave: false
}));

router.get("/holidayListing", holidayController.list);
router.get("/addHoliday", holidayController.getHoliday);
router.post("/addHoliday", holidayController.addHoliday);
router.get("/editHoliday/:id", holidayController.editHoliday);
router.get("/", employeeController.login);
router.post("/", employeeController.employeelogin);
router.get("/index", employeeController.index);
router.get("/addpermissions", permissionController.permissions);
router.post("/addpermissions", permissionController.addpermissions);
router.get("/viewpermissions", permissionController.viewpermissions);
router.get("/editpermissions/:id", permissionController.editpermissions);
router.post("/editpermissions/:id", permissionController.updatepermission);
router.get("/deletepermissions/:id", permissionController.deletepermissions);
router.get("/logout", employeeController.logout);
router.get("/addEmlpoyee", employeeController.addEmlpoyeeform);
router.post("/addEmlpoyee", employeeController.addEmlpoyee);
router.get("/employeelisting", employeeController.employeelisting);
router.get('/editEmployee/:id', employeeController.editEmployee);
router.post('/editEmployee/:id', employeeController.updateEmployee);
router.get('/deleteEmployee/:id', employeeController.deleteEmployee);
router.get("/addRole", roleController.getRole);
router.post("/addRole", roleController.addRole);
router.get("/roleListing", roleController.list);
router.get('/editRole/:id', roleController.editRole);
router.post('/editRole/:id', roleController.updateRole);
router.get('/deleteRole/:id', roleController.deleteRole);
router.get('/userpermission/:id', userPermissionController.getpermission);
router.post('/userpermission/:id', userPermissionController.addpermission);
router.get('/addUser', userController.addUser);
router.post('/addUser', userController.createuser);
router.get('/role_permissions', userPermissionController.viewrolepermission);
router.get('/userListing', userController.list);
router.get('/addProjects', projectController.getProject);
router.post('/addProjects', projectController.addProject);
router.get('/projectslisting', projectController.projectslisting);
router.get('/editProject/:id', projectController.editProject);
router.post('/editProject/:id', projectController.updateProject);
router.get('/deleteproject/:id', projectController.deleteproject);
router.get('/createtask', taskController.createtask);
router.post('/createtask', taskController.addtask);




module.exports = router
