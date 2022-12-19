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

Apirouter.get('/projectsget',auth, users_api.getProject);
Apirouter.get('/projects',auth, users_api.projectslisting);
Apirouter.post('/projectsadd',auth, users_api.projectsadd);
Apirouter.get('/projectEdit/:id',auth, users_api.projectEdit);
Apirouter.post('/projectEdit/:id',auth, users_api.projectUpdate);
Apirouter.post('/projectdelete/:id',auth, users_api.projectdelete);

//Permission Api routes

Apirouter.get('/viewpermissions',auth, users_api.viewpermissions);
Apirouter.get('/addpermissions',auth, users_api.permissionspage);
Apirouter.post('/addpermissions',auth, users_api.addpermissions);
Apirouter.get('/editpermissions/:id',auth, users_api.editpermissions);
Apirouter.post('/editpermissions/:id',auth, users_api.permissionsUpdate);
Apirouter.post('/deletepermissions/:id',auth, users_api.permissionsdelete);

//Role Api Route


Apirouter.get('/roles',auth, users_api.roles);
Apirouter.get('/Roleadd',auth, users_api.Roleadd);
Apirouter.post('/Roleadd',auth, users_api.Roleadd);
Apirouter.get('/Roleedit/:id',auth, users_api.Roleedit);
Apirouter.post('/Roleedit/:id',auth, users_api.Roleupdate);
Apirouter.post('/Roledelete/:id',auth, users_api.Roledelete);

//Task Api Route 

Apirouter.get('/getAddTask',auth, users_api.getAddTask);
Apirouter.post('/taskadd',auth, users_api.taskadd);
Apirouter.get('/listTasks',auth, users_api.listTasks);
Apirouter.get('/taskedit/:id',auth, users_api.taskedit);
Apirouter.post('/taskedit/:id',auth , users_api.taskupdate);
Apirouter.post('/TaskDelete/:id',auth, users_api.taskdelete);

//User Api Route

Apirouter.post('/', users_api.employeelogin);
Apirouter.post('/logout', users_api.logout);
Apirouter.get('/addUser',auth, users_api.getAddUser); 
Apirouter.post('/addUser',auth, users_api.useradd);
Apirouter.post('/existusername',auth, users_api.existusername);
Apirouter.post('/existemail',auth, users_api.existpersonal_email);
Apirouter.get('/change_password/:id', users_api.change_password);
Apirouter.post('/change_password/:id', users_api.save_password);
Apirouter.get('/profile/:id', users_api.profile);
Apirouter.post('/activeuser/:id', users_api.activeuser);
Apirouter.get('/userListing',auth, users_api.listuser);
Apirouter.get('/deleteduser',auth, users_api.deleteduser);
Apirouter.post('/restoreuser/:id',auth, users_api.restoreuser);
Apirouter.get('/viewUserDetail/:id',auth, users_api.userDetail);
Apirouter.post('/profile/:id', users_api.updateProfile);
Apirouter.post('/userphoto/:id', users_api.updateUSerPhoto);
Apirouter.get('/editUser/:id',auth, users_api.editUser);
Apirouter.post('/editUser/:id',auth,  users_api.UpdateUser);
Apirouter.post('/deleteUser/:id',auth, users_api.deleteUser);
Apirouter.get('/index',auth, users_api.totalcount);
Apirouter.post("/forget", users_api.sendforget);
Apirouter.post("/change_pwd/:id/:token", users_api.change);





//Holiday Api routes 

Apirouter.get('/holidayListing', auth, users_api.holidaylist);
Apirouter.get('/addHoliday', auth, users_api.getHoliday);
Apirouter.post('/addHoliday', auth, users_api.Holidayadd);
Apirouter.get('/editHoliday/:id',auth, users_api.Holidayedit);
Apirouter.post('/editHoliday/:id',auth, users_api.Holidayupdate);
Apirouter.post('/deleteHoliday/:id',auth, users_api.deleteHoliday);


//Leaves Api routes 

Apirouter.post('/addLeaves', users_api.addleaves);
Apirouter.get('/viewleaves',auth, users_api.leavesList);
Apirouter.get('/employeeLeavesList', users_api.employeeLavesList);
Apirouter.post('/cancelLeaves/:id', users_api.cancelLeaves);
Apirouter.post('/rejectLeaves/:id', users_api.rejectLeaves);
Apirouter.post('/approveLeaves/:id', users_api.approveLeaves);


Apirouter.get('/getTimeEntry', users_api.getTimeEntry);
Apirouter.post('/addTimeEntry', users_api.addTimeEntry);
Apirouter.get('/timeEntryListing', users_api.timeEntryListing);

//RolePermission Api Route

Apirouter.get('/rolepermission/:id',auth, users_api.getRolePermission);
Apirouter.post('/rolepermission/:id',auth, users_api.addRolePermission);

//UserPermission Api Route

Apirouter.get('/userpermissions/:id',auth, users_api.getUserPermission);
Apirouter.post('/userpermissions/:id',auth, users_api.addUserPermission);

//Announcements Api routes 

Apirouter.get('/Announcements', users_api.Announcementslist);
Apirouter.post('/addAnnouncements', users_api.Announcementsadd);
Apirouter.get('/editAnnouncements/:id', users_api.AnnouncementsEdit);
Apirouter.post('/editAnnouncements/:id', users_api.AnnouncementsUpdate);
Apirouter.post('/deleteAnnouncements/:id', users_api.Announcementsdelete);


//Settings Api routes 

Apirouter.get('/SettingsList', users_api.Settingslist);
Apirouter.post('/addSettings', users_api.Settingsadd);
Apirouter.get('/editSettings/:id', users_api.SettingsEdit);
Apirouter.post('/editSettings/:id', users_api.SettingsUpdate);
Apirouter.post('/SettingsDelete/:id', users_api.SettingsDelete);
Apirouter.post('/permissionwise', users_api.permissionwise);

module.exports = Apirouter

