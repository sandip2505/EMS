
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
// const express = require("express");
const session = require("express-session");
const FileStore = require('session-file-store')(session);
const fileStoreOptions = {};
const app = express();
Apirouter.use('/api',Apirouter);
// app.use('/api', routes)
Apirouter.use(sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized: true,
    resave: false
}));


Apirouter.post('/login', users_api.employeelogin);
Apirouter.post('/logout', users_api.logout);
Apirouter.get('/projectsget', users_api.getProject);
Apirouter.get('/projects', auth, users_api.projectslisting);
Apirouter.post('/projectsadd', users_api.projectsadd);
Apirouter.get('/projectEdit/:id', users_api.projectEdit);
Apirouter.post('/projectEdit/:id', users_api.projectUpdate);
Apirouter.post('/projectdelete/:id', users_api.projectdelete);


Apirouter.get('/viewpermissions', users_api.viewpermissions);
Apirouter.post('/addpermissions', users_api.addpermissions);
Apirouter.get('/editpermissions/:id', users_api.editpermissions);
Apirouter.post('/editpermissions/:id', users_api.permissionsUpdate);
Apirouter.post('/deletepermissions/:id', users_api.permissionsdelete);


Apirouter.get('/roles', users_api.roles);
Apirouter.post('/Roleadd', users_api.Roleadd);
Apirouter.get('/Roleedit/:id', users_api.Roleedit);
Apirouter.post('/Roleedit/:id', users_api.Roleupdate);
Apirouter.post('/Roledelete/:id', users_api.Roledelete);
Apirouter.get('/getAddTask', users_api.getAddTask);
Apirouter.post('/taskadd', users_api.taskadd);
Apirouter.get('/listTasks', users_api.listTasks);
Apirouter.get('/taskedit/:id', users_api.taskedit);
Apirouter.post('/taskedit/:id', users_api.taskupdate);
Apirouter.post('/TaskDelete/:id', users_api.taskdelete);
Apirouter.get('/getAddUser',users_api.getAddUser); // API
Apirouter.post('/useradd', users_api.useradd);
Apirouter.get('/change_password/:id', users_api.change_password);
Apirouter.post('/change_password/:id', users_api.save_password);
Apirouter.get('/emloyeeprofile/:id', users_api.profile);
Apirouter.post('/activeuser/:id', users_api.activeuser);
Apirouter.get('/listuser', users_api.listuser);
Apirouter.get('/details/:id', users_api.userDetail);
Apirouter.post('/updateProfile/:id', users_api.updateProfile);
Apirouter.post('/updateUSerPhoto/:id', users_api.updateUSerPhoto);
Apirouter.get('/userEdit/:id', users_api.editUser);
Apirouter.post('/userEdit/:id', users_api.UpdateUser);
Apirouter.post('/Userdelete/:id', users_api.deleteUser);
Apirouter.get('/totalcount', users_api.totalcount);

//Holiday Api routes 

Apirouter.get('/holidayListing',auth, users_api.holidaylist);
Apirouter.post('/addHoliday', users_api.Holidayadd);
Apirouter.get('/editHoliday/:id', users_api.Holidayedit);
Apirouter.post('/editHoliday/:id', users_api.Holidayupdate);
Apirouter.post('/deleteHoliday/:id', users_api.deleteHoliday);

//Leaves Api routes 

Apirouter.post('/addLeaves', users_api.addleaves);
Apirouter.get('/viewleaves', users_api.leavesList);
Apirouter.get('/employeeLeavesList', users_api.employeeLavesList);
Apirouter.post('/cancelLeaves/:id', users_api.cancelLeaves);
Apirouter.post('/rejectLeaves/:id', users_api.rejectLeaves);
Apirouter.post('/approveLeaves/:id', users_api.approveLeaves);


Apirouter.get('/getTimeEntry', users_api.getTimeEntry);
Apirouter.post('/addTimeEntry', users_api.addTimeEntry);
Apirouter.get('/timeEntryListing', users_api.timeEntryListing);


Apirouter.get('/rolepermission/:id', users_api.getRolePermission);
Apirouter.post('/rolepermission/:id', users_api.addRolePermission);


Apirouter.get('/userpermissions/:id', users_api.getUserPermission);
Apirouter.post('/userpermissions/:id', users_api.addUserPermission);



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
