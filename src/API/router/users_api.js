const express = require("express");
const Apirouter = new express.Router();
// const = require("express-session");
const users_api = require("../controller/projects_api");
const auth = require("../../middleware/auth");
const session = require("express-session");
const app = express();
const routers = require("../../router/employee");
// const auth = require("../middleware/auth");
const flash = require("connect-flash");
// const multer = require("multer");

//   const storage = multer.diskStorage({
//   destination: function(req, file, cb) {
//     cb(null, 'uploads/');
//   },
//   filename: function(req, file, cb) {
//     const fileName = path.basename(file.originalname);
//     cb(null, fileName);
//   }
// });

// const upload = ({ storage: storage });


//Project Api routes

Apirouter.get("/addProjects", auth, users_api.getProject);
Apirouter.get("/projectslisting", auth, users_api.projectslisting);
Apirouter.get("/dashbordprojects", auth, users_api.projectHashTask);
Apirouter.post("/addProjects", auth, users_api.projectsadd);
Apirouter.get("/editProject/:id", auth, users_api.projectEdit);
Apirouter.post("/editProject/:id", auth, users_api.projectUpdate);
Apirouter.post("/deleteProject/:id", auth, users_api.projectdelete);
Apirouter.post("/projectslisting/:searchValue", users_api.searchProject);

//Permission Api routes`

Apirouter.get("/viewpermissions", auth, users_api.viewpermissions);
Apirouter.post("/viewpermissions/:searchValue", users_api.searchPermissions);
Apirouter.post("/searchUserPermissions/:searchValue", users_api.searchUserPermissions);
Apirouter.post("/searchRolePermissions/:searchValue", users_api.searchRolePermissions);
Apirouter.get("/addpermissions", auth, users_api.permissionspage);
Apirouter.post("/addpermissions", auth, users_api.addpermissions);
Apirouter.get("/editpermissions/:id", auth, users_api.editpermissions);
Apirouter.post("/editpermissions/:id", auth, users_api.permissionsUpdate);
Apirouter.post("/deletepermissions/:id", auth, users_api.permissionsdelete);

//Role Api Route

Apirouter.get("/roleListing", auth, users_api.roles);
Apirouter.get("/addRole", auth, users_api.Roleadd);
Apirouter.post("/addRole", auth, users_api.Roleadd);
Apirouter.get("/editRole/:id", auth, users_api.Roleedit);
Apirouter.post("/editRole/:id", auth, users_api.Roleupdate);
Apirouter.post("/deleteRole/:id", auth, users_api.Roledelete);
Apirouter.post("/roleListing/:searchValue", users_api.searchRole);

//Task Api Route

Apirouter.get("/addtask", auth, users_api.getAddTask);
Apirouter.post("/addtask", auth, users_api.taskadd);
Apirouter.post("/taskListing/:searchValue", users_api.searchTask);
Apirouter.get("/taskListing", auth, users_api.listTasks); ///////change
Apirouter.get("/editTask/:id", auth, users_api.taskedit);////////change
Apirouter.post("/editTask/:id", auth, users_api.taskupdate);
Apirouter.post("/task_status_update/:id", auth, users_api.task_status_update);
Apirouter.post("/deleteTask/:id", auth, users_api.taskdelete);
Apirouter.post("/getUserByProject/:id", auth, users_api.getUserByProject);

//User Api Route


Apirouter.post("/", users_api.employeelogin);
Apirouter.post("/logout", users_api.logout);
Apirouter.get("/addUser", auth, users_api.getAddUser);
Apirouter.post("/addUser", auth, users_api.useradd);
Apirouter.post("/existusername", auth, users_api.existusername);
Apirouter.post("/existemail", auth, users_api.existpersonal_email);
Apirouter.get("/change_password/:id", auth, users_api.change_password);
Apirouter.post("/change_password/:id",auth, users_api.save_password);
Apirouter.get("/profile/:id",auth, users_api.profile);
Apirouter.post("/activeuser/:id", users_api.activeuser);

Apirouter.post("/checkLoginEmail", users_api.checkLoginEmail);
Apirouter.post("/checkLoginPassword", users_api.checkLoginPassword);
Apirouter.get("/userListing", auth, users_api.listuser);////change
Apirouter.get("/deleteduser", auth, users_api.deleteduser);
Apirouter.post("/deleteMany", auth, users_api.deletedMany);
Apirouter.post("/restoreuser/:id", auth, users_api.restoreuser);
Apirouter.get("/viewUserDetail/:id", auth, users_api.userDetail);
Apirouter.post("/profile/:id", users_api.updateProfile);
Apirouter.post("/userphoto/:id",  users_api.updateUserPhoto);
Apirouter.post("/userprofilephoto/:id",   users_api.userprofilephoto);
Apirouter.get("/editUser/:id", auth, users_api.editUser);
Apirouter.post("/editUser/:id", auth, users_api.UpdateUser);
Apirouter.post("/deleteUser/:id", auth, users_api.deleteUser);
Apirouter.get("/index", auth, users_api.index);
Apirouter.post("/forget", users_api.sendforget);
Apirouter.post("/change_pwd/:id/:token", users_api.change);
Apirouter.post("/getSettingData", users_api.getSettingData);
Apirouter.post("/checkEmplyeeCode", auth, users_api.checkEmplyeeCode);
Apirouter.post("/userListing/:searchValue", users_api.searchUser);

//Holiday Api routes

Apirouter.get("/holidayListing", auth, users_api.holidaylist);
Apirouter.get("/addHoliday", auth, users_api.getHoliday);
Apirouter.post("/addHoliday", auth, users_api.Holidayadd);
Apirouter.get("/editHoliday/:id", auth, users_api.Holidayedit);
Apirouter.post("/editHoliday/:id", auth, users_api.Holidayupdate);
Apirouter.post("/deleteHoliday/:id", auth, users_api.deleteHoliday);
Apirouter.post("/holidayListing/:searchValue", users_api.searchHoliday);

//Leaves Api routes
Apirouter.get("/addLeaves", auth, users_api.getaddleaves);
Apirouter.post("/addLeaves", auth, users_api.addleaves);
Apirouter.get("/viewleaves", auth, users_api.leavesList);//////change
Apirouter.get("/viewleavesrequest", auth, users_api.leavesrequest);
Apirouter.get("/employeeLeavesList", auth, users_api.employeeLavesList);
Apirouter.post("/employeeLeavesList/:searchValue", auth, users_api.searchEmployeeLeave);
Apirouter.post("/cancelLeaves/:id", auth, users_api.cancelLeaves);
Apirouter.post("/rejectLeaves/:id", auth, users_api.rejectLeaves);
Apirouter.post("/approveLeaves/:id", auth, users_api.approveLeaves);
Apirouter.get("/editLeave/:id", auth, users_api.editLeave);
Apirouter.post("/editLeave/:id", auth, users_api.updateLeave);
Apirouter.post("/deleteLeaves/:id", auth, users_api.deleteLeave);
Apirouter.post("/viewleavesrequest/:searchValue", users_api.searchLeave);

Apirouter.get("/addTimeEntries", auth, users_api.getTimeEntry);
Apirouter.post("/addTimeEntries", auth, users_api.addTimeEntry);
Apirouter.get("/timeEntryListing", auth, users_api.timeEntryListing);/////////////change
// Apirouter.post('/timeEntryListing',auth, users_api.searchTimeEntry);//////////change
Apirouter.post("/deleteTimeEntry/:id", auth, users_api.deleteTimeEntry);
Apirouter.get("/editTimeEntry/:id", auth, users_api.editTimeEntry);
Apirouter.post("/editTimeEntry/:id", auth, users_api.updateTimeEntry);
Apirouter.post("/getDataBymonth", auth, users_api.getDataBymonth);
Apirouter.post("/getTaskByProject/:id", auth, users_api.getTaskByProject);

// router.post('/deleteTimeEntry/:id', sessions, NewTimeEntryController.deleteTimeEntry);
//RolePermission Api Route

Apirouter.get("/rolepermission/:id", auth, users_api.getRolePermission);
Apirouter.post("/rolepermission/:id", auth, users_api.addRolePermission);

//UserPermission Api Route

Apirouter.get("/userPermission/:id", auth, users_api.getUserPermission);
Apirouter.post("/userPermission/:id", auth, users_api.addUserPermission);

//Announcements Api routes

Apirouter.get("/AnnouncementListing", auth, users_api.Announcementslist);
Apirouter.post("/addAnnouncement", auth, users_api.Announcementsadd);
Apirouter.post("/statusAnnouncements/:announcement_id",auth,users_api.statusAnnouncements
);
Apirouter.get("/AnnouncementsDetails/:id", users_api.AnnouncementsEdit);
Apirouter.post("/viewAnnouncement/:announcement_id",  auth, users_api.viewAnnouncement);

// Apirouter.post('/editAnnouncements/:id', users_api.AnnouncementsUpdate);
Apirouter.post("/deleteAnnouncement/:id", users_api.Announcementsdelete);
Apirouter.get("/announcements", auth, users_api.Announcements);

//Settings Api routes

Apirouter.get("/settingListing", auth, users_api.Settingslist);
Apirouter.get("/leavesSettingData", auth, users_api.leavesSettingData);

Apirouter.get("/addsetting", auth, users_api.getAddSetting);
Apirouter.post("/addsetting", auth, users_api.Settingsadd);
Apirouter.get("/editSetting/:id", auth, users_api.SettingsEdit);
Apirouter.post("/editSetting/:id", auth, users_api.SettingsUpdate);
Apirouter.post("/deleteSetting/:id", auth, users_api.SettingsDelete);
// Apirouter.post("/permissionwise", users_api.permissionwise);
Apirouter.get("/alluserleaves", auth, users_api.alluserleaves);
Apirouter.post("/alluserleaves/:searchValue",  users_api.alluserleavesSearch);

//TimeEntries Api routes
Apirouter.post("/checkUpdateEmail", auth, users_api.checkEmail);

Apirouter.post("/checkUpdateUsername", auth, users_api.checkUsername);
//check userhasPermission

Apirouter.get(
  "/checUserHasPermission/:id/:role_id",
  users_api.checkUserHAsPermission
);
 Apirouter.post('/NewTimeEntryListing',auth, users_api.newTimeEntryData);
 Apirouter.post('/sendmail',users_api.sendmail); 
 Apirouter.post('/activeuserAccount/:id',users_api.activeuserAccount); 


Apirouter.post('/getHolidaybymonth', users_api.getHolidaybymonth);
Apirouter.post('/getLeavebymonth', users_api.getLeavebymonth);
// Apirouter.get('/NewTimeEntryListing', users_api.timeEntryListing);




module.exports = Apirouter;
