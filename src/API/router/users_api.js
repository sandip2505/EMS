
const express = require("express");
// const Employee = require("../model/employee");
// const Holiday = require("../model/holiday");
// const Role = require("../model/roles")
const Apirouter = new express.Router();
const sessions = require("express-session");
const users_api = require('../controller/projects_api')
// const employeeController = require('../controller/employeeController')
// const holidayController = require('../controller/holidayController')
// const roleController = require('../controller/roleController')
// const permissionController = require('../controller/permissionController')
// const rolePermissionController = require('../controller/rolePermissionController')
// const userPermisssionController = require('../controller/userPrmisssionController')
// const userController = require('../controller/userController')
// const projectController = require('../controller/projectController')
// const taskController = require('../controller/taskController')
const auth = require('../../middleware/auth')
const app = express();
Apirouter.use(sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized: true,
    resave: false
}));

Apirouter.post('/login', users_api.employeelogin);
Apirouter.get('/projectsget', users_api.getProject);
Apirouter.get('/projects', users_api.projectslisting);
Apirouter.get('/projectEdit/:id', users_api.projectEdit);
Apirouter.post('/projectEdit/:id', users_api.projectUpdate);
Apirouter.post('/projectdelete/:id', users_api.projectdelete);
Apirouter.get('/permissions', users_api.permissions);
Apirouter.post('/newpermissions', users_api.newpermissions);
Apirouter.get('/permissionsedit/:id', users_api.permissionsedit);
Apirouter.post('/permissionsedit/:id', users_api.permissionsUpdate);
Apirouter.post('/permissionsdelete/:id', users_api.permissionsdelete);
Apirouter.get('/roles', users_api.roles);
Apirouter.post('/Roleadd', users_api.Roleadd);
Apirouter.get('/Roleedit/:id', users_api.Roleedit);
Apirouter.post('/Roleedit/:id', users_api.Roleupdate);
Apirouter.post('/Roledelete/:id', users_api.Roledelete);
Apirouter.post('/taskadd', users_api.taskadd);
Apirouter.get('/listTasks', users_api.listTasks);
Apirouter.get('/taskedit/:id', users_api.taskedit);
Apirouter.post('/taskedit/:id', users_api.taskupdate);
Apirouter.post('/TaskDelete/:id', users_api.taskdelete);
Apirouter.post('/useradd', users_api.useradd);
Apirouter.get('/listuser', auth, users_api.listuser);
Apirouter.get('/holidaylist', users_api.holidaylist);
Apirouter.post('/Holidayadd', users_api.Holidayadd);
Apirouter.get('/Holidayedit/:id', users_api.Holidayedit);
Apirouter.post('/Holidayedit/:id', users_api.Holidayupdate);
Apirouter.post('/Holidaydelete/:id', users_api.deleteHoliday);

// router.get("/holidayListing", holidayController.list);
// router.get("/addHoliday", holidayController.getHoliday);
// router.post("/addHoliday", holidayController.addHoliday);
// router.get("/editHoliday/:id", holidayController.editHoliday);
// router.get("/", employeeController.login);
// router.post("/", employeeController.employeelogin);
// router.get("/index", employeeController.index);
// router.get("/addpermissions", permissionController.permissions);
// router.post("/addpermissions", permissionController.addpermissions);
// router.get("/viewpermissions", permissionController.viewpermissions);
// router.get("/editpermissions/:id", permissionController.editpermissions);
// router.post("/editpermissions/:id", permissionController.updatepermission);
// router.get("/deletepermissions/:id", permissionController.deletepermissions);
// router.get("/logout", employeeController.logout);
// router.get("/addEmlpoyee", employeeController.addEmlpoyeeform);
// router.post("/addEmlpoyee", employeeController.addEmlpoyee);
// router.get("/employeelisting", employeeController.employeelisting);
// router.get('/editEmployee/:id', employeeController.editEmployee);
// router.post('/editEmployee/:id', employeeController.updateEmployee);
// router.get('/deleteEmployee/:id', employeeController.deleteEmployee);
// router.get("/addRole", roleController.getRole);
// router.post("/addRole", roleController.addRole);
// router.get("/roleListing", roleController.list);
// router.get('/editRole/:id', roleController.editRole);
// router.post('/editRole/:id', roleController.updateRole);
// router.get('/deleteRole/:id', roleController.deleteRole);
// router.get('/rolepermission/:id', rolePermissionController.getpermission);
// router.post('/rolepermission/:id', rolePermissionController.addpermission);
// router.get('/addUser', userController.addUser);
// router.post('/addUser', userController.createuser);
// router.get('/userListing', userController.list);
// router.get('/viewUserDetail/:id', userController.userDetail);
// router.get('/editUser/:id', userController.editUser);
// router.get('/addProjects', projectController.getProject);
// router.post('/addProjects', projectController.addProject);
// router.get('/projectslisting', projectController.projectslisting);
// router.get('/editProject/:id', projectController.editProject);
// router.post('/editProject/:id', projectController.updateProject);
// router.get('/deleteproject/:id', projectController.deleteproject);
// router.get('/createtask', taskController.createtask);
// router.post('/createtask', taskController.addtask);
// router.get('/taskListing', taskController.taskListing);
// router.get('/TaskDetail/:id', taskController.TaskDetail);
// router.get('/deleteTask/:id', taskController.deletetask);
// router.get('/userPermission/:id', userPermisssionController.getpermission);
// router.post('/userPermission/:id', userPermisssionController.addpermission);


module.exports = Apirouter
