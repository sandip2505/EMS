const express = require("express");
const Apirouter = new express.Router();
// const = require("express-session");
const users_api = require('../controller/projects_api')
const auth = require('../../middleware/auth')
const session = require("express-session");
const app = express();
const routers = require("../../router/employee")
// const auth = require("../middleware/auth");
const flash = require('connect-flash');




//Project Api routes

Apirouter.get('/projectsget', users_api.getProject);
Apirouter.get('/projects', users_api.projectslisting);
Apirouter.post('/projectsadd', users_api.projectsadd);
Apirouter.get('/projectEdit/:id', users_api.projectEdit);
Apirouter.post('/projectEdit/:id', users_api.projectUpdate);
Apirouter.post('/projectdelete/:id', users_api.projectdelete);

//Permission Api routes

Apirouter.get('/viewpermissions', users_api.viewpermissions);
Apirouter.post('/addpermissions', users_api.addpermissions);
Apirouter.get('/editpermissions/:id', users_api.editpermissions);
Apirouter.post('/editpermissions/:id', users_api.permissionsUpdate);
Apirouter.post('/deletepermissions/:id', users_api.permissionsdelete);

//Role Api Route

Apirouter.get('/roles', users_api.roles);
Apirouter.post('/Roleadd', users_api.Roleadd);
Apirouter.get('/Roleedit/:id', users_api.Roleedit);
Apirouter.post('/Roleedit/:id', users_api.Roleupdate);
Apirouter.post('/Roledelete/:id', users_api.Roledelete);

//Task Api Route

Apirouter.get('/getAddTask', users_api.getAddTask);
Apirouter.post('/taskadd', users_api.taskadd);
Apirouter.get('/listTasks', users_api.listTasks);
Apirouter.get('/taskedit/:id', users_api.taskedit);
Apirouter.post('/taskedit/:id', users_api.taskupdate);
Apirouter.post('/TaskDelete/:id', users_api.taskdelete);

//User Api Route

Apirouter.post('/', users_api.employeelogin);
Apirouter.post('/logout', users_api.logout);
Apirouter.get('/addUser', users_api.getAddUser); 
Apirouter.post('/addUser', users_api.useradd);
Apirouter.post('/existusername', users_api.existusername);
Apirouter.post('/existemail', users_api.existpersonal_email);
Apirouter.get('/change_password/:id', users_api.change_password);
Apirouter.post('/change_password/:id', users_api.save_password);
Apirouter.get('/profile/:id', users_api.profile);
Apirouter.post('/activeuser/:id', users_api.activeuser);
Apirouter.get('/userListing',auth, users_api.listuser);
Apirouter.get('/viewUserDetail/:id', users_api.userDetail);
Apirouter.post('/profile/:id', users_api.updateProfile);
Apirouter.post('/userphoto/:id', users_api.updateUSerPhoto);
Apirouter.get('/editUser/:id', users_api.editUser);
Apirouter.post('/editUser/:id', users_api.UpdateUser);
Apirouter.post('/deleteUser/:id', users_api.deleteUser);
Apirouter.get('/index', users_api.totalcount);
Apirouter.post("/forget", users_api.sendforget);
Apirouter.post("/change_pwd/:id/:token", users_api.change);





//Holiday Api routes 

Apirouter.get('/holidayListing', auth, users_api.holidaylist);
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

//RolePermission Api Route

Apirouter.get('/rolepermission/:id', users_api.getRolePermission);
Apirouter.post('/rolepermission/:id', users_api.addRolePermission);

//UserPermission Api Route

Apirouter.get('/userpermissions/:id', users_api.getUserPermission);
Apirouter.post('/userpermissions/:id', users_api.addUserPermission);

module.exports = Apirouter

