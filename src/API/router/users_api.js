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
const apiKey = process.env.API_KEY;
const checkApiKey = (req, res, next) => {
  const apiKeyHeader =
    // req.headers['x-api-key'];
    // if (!apiKeyHeader || apiKeyHeader !== apiKey) {
    // res.redirect("/forbidden");
    //   } else {
    next();
  // }
};

//Project Api routes 

Apirouter.get("/addProjects", checkApiKey, auth, users_api.getProject);
Apirouter.get("/projectslisting", checkApiKey, auth, users_api.projectslisting);
Apirouter.get("/dashbordprojects", checkApiKey, auth, users_api.projectHashTask);
Apirouter.post("/addProjects", checkApiKey, auth, users_api.projectsadd);
Apirouter.get("/editProject/:id", auth, users_api.projectEdit);
Apirouter.post("/editProject/:id", checkApiKey, auth, users_api.projectUpdate);
Apirouter.post("/deleteProject/:id", checkApiKey, auth, users_api.projectdelete);
Apirouter.post("/projectslisting/:searchValue", auth, users_api.searchProject);//pending

//Permission Api routes`

Apirouter.get("/viewpermissions", checkApiKey, auth, users_api.viewpermissions);
Apirouter.post("/viewpermissions/:searchValue", auth, users_api.searchPermissions);
Apirouter.post("/searchUserPermissions/:searchValue", auth, users_api.searchUserPermissions);//pending
Apirouter.post("/searchRolePermissions/:searchValue", auth, users_api.searchRolePermissions);//pending
Apirouter.get("/addpermissions", checkApiKey, auth, users_api.permissionspage);
Apirouter.post("/addpermissions", checkApiKey, auth, users_api.addpermissions);
Apirouter.get("/editpermissions/:id", checkApiKey, auth, users_api.editpermissions);
Apirouter.post("/editpermissions/:id", checkApiKey, auth, users_api.permissionsUpdate);
Apirouter.post("/deletepermissions/:id", checkApiKey, auth, users_api.permissionsdelete);

//Role Api Route

Apirouter.get("/roleListing", checkApiKey, auth, users_api.roles);
Apirouter.get("/addRole", checkApiKey, auth, users_api.Roleadd);
Apirouter.post("/addRole", checkApiKey, auth, users_api.Roleadd);
Apirouter.get("/editRole/:id", checkApiKey, auth, users_api.Roleedit);
Apirouter.post("/editRole/:id", checkApiKey, auth, users_api.Roleupdate);
Apirouter.post("/deleteRole/:id", checkApiKey, auth, users_api.Roledelete);
Apirouter.post("/roleListing/:searchValue", users_api.searchRole);

//Task Api Route

Apirouter.get("/addtask", checkApiKey, auth, users_api.getAddTask);
Apirouter.post("/addtask", checkApiKey, auth, users_api.taskadd);
Apirouter.post("/taskListing/:searchValue", auth, users_api.searchTask);
Apirouter.get("/taskListing", checkApiKey, auth, users_api.listTasks);
Apirouter.get("/editTask/:id", checkApiKey, auth, users_api.taskedit);
Apirouter.post("/editTask/:id", checkApiKey, auth, users_api.taskupdate);
Apirouter.post("/task_status_update/:id", checkApiKey, auth, users_api.task_status_update);
Apirouter.post("/deleteTask/:id", checkApiKey, auth, users_api.taskdelete);
Apirouter.post("/getUserByProject/:id", auth, users_api.getUserByProject);

//User Api Route

Apirouter.post("/", users_api.employeelogin);
Apirouter.post("/logout", users_api.logout);
Apirouter.get("/addUser", checkApiKey, auth, users_api.getAddUser);
Apirouter.post("/addUser", checkApiKey, auth, users_api.useradd);
Apirouter.post("/existusername", checkApiKey, auth, users_api.existusername);
Apirouter.post("/existemail", checkApiKey, auth, users_api.existpersonal_email);
Apirouter.get("/change_password/:id", checkApiKey, auth, users_api.change_password);
Apirouter.post("/change_password/:id", checkApiKey, auth, users_api.save_password);
Apirouter.get("/profile/:id", checkApiKey, auth, users_api.profile);
Apirouter.post("/activeuser/:id", users_api.activeuser);
Apirouter.post("/checkLoginEmail", users_api.checkLoginEmail);
Apirouter.post("/checkLoginPassword", users_api.checkLoginPassword);
Apirouter.get("/userListing", checkApiKey, auth, users_api.listuser);
Apirouter.get("/deleteduser", checkApiKey, auth, users_api.deleteduser);
Apirouter.post("/deleteMany", checkApiKey, auth, users_api.deletedMany);
Apirouter.post("/restoreuser/:id", checkApiKey, auth, users_api.restoreuser);
Apirouter.get("/viewUserDetail/:id", checkApiKey, auth, users_api.userDetail);
Apirouter.post("/profile/:id", users_api.updateProfile);
Apirouter.post("/userphoto/:id", users_api.updateUserPhoto);
Apirouter.post("/userprofilephoto/:id", users_api.userprofilephoto);
Apirouter.get("/editUser/:id", checkApiKey, auth, users_api.editUser);
Apirouter.post("/editUser/:id", checkApiKey, auth, users_api.UpdateUser);
Apirouter.post("/editUserProfile/:id", checkApiKey, auth, users_api.editUserProfile);
Apirouter.post("/addUserimage", users_api.addUserimage);
Apirouter.post("/deleteUser/:id", checkApiKey, auth, users_api.deleteUser);
Apirouter.get("/index", checkApiKey, auth, users_api.index);
Apirouter.post("/indexWorkingHour", checkApiKey, auth, users_api.indexWorkingHour);
Apirouter.post("/forget", users_api.sendforget);
// Apirouter.post("/change_pwd/:id/:token", users_api.change);
Apirouter.post("/forgot-password-change/:id/:token", users_api.change);
Apirouter.post("/password-checkToken/:id/:token", users_api.checktoken);
Apirouter.post("/getSettingData", auth, users_api.getSettingData);
Apirouter.post("/checkEmplyeeCode", checkApiKey, auth, users_api.checkEmplyeeCode);
Apirouter.post("/userListing/:searchValue", users_api.searchUser);

// holiday api routes

Apirouter.get("/holidayListing", checkApiKey, auth, users_api.holidaylist);
Apirouter.get("/addHoliday", checkApiKey, auth, users_api.getHoliday);
Apirouter.post("/addHoliday", checkApiKey, auth, users_api.Holidayadd);
Apirouter.get("/editHoliday/:id", checkApiKey, auth, users_api.Holidayedit);
Apirouter.post("/editHoliday/:id", checkApiKey, auth, users_api.Holidayupdate);
Apirouter.post("/deleteHoliday/:id", checkApiKey, auth, users_api.deleteHoliday);
Apirouter.post("/holidayListing/:searchValue", users_api.searchHoliday);//pending

//Leaves Api routes

Apirouter.get("/addLeaves", checkApiKey, auth, users_api.getaddleaves);
Apirouter.post("/addLeaves", checkApiKey, auth, users_api.addleaves);
Apirouter.get("/viewleaves", checkApiKey, auth, users_api.leavesList); //////change
Apirouter.get("/viewleavesrequest", checkApiKey, auth, users_api.leavesrequest);
Apirouter.get("/employeeLeavesList", checkApiKey, auth, users_api.employeeLavesList);
Apirouter.post("/employeeLeavesList/:searchValue", checkApiKey, auth, users_api.searchEmployeeLeave);//pending
Apirouter.post("/cancelLeaves/:id", checkApiKey, auth, users_api.cancelLeaves);
Apirouter.post("/rejectLeaves/:id", checkApiKey, auth, users_api.rejectLeaves);
Apirouter.post("/approveLeaves/:id", checkApiKey, auth, users_api.approveLeaves);
Apirouter.get("/editLeave/:id/:user_id", auth, users_api.editLeave);
Apirouter.post("/editLeave/:id", checkApiKey, auth, users_api.updateLeave);
Apirouter.post("/deleteLeaves/:id", checkApiKey, auth, users_api.deleteLeave);
Apirouter.post("/viewleavesrequest/:searchValue", users_api.searchLeave);//pending

// Punch-in - Punch-out routes

Apirouter.post("/punch-in", checkApiKey, auth, users_api.punch_in);
Apirouter.post("/punch-out/:id", checkApiKey, auth, users_api.punch_out);
Apirouter.get("/punch_data", checkApiKey, auth, users_api.punch_data);
Apirouter.get("/check_punch", checkApiKey, auth, users_api.check_punch);

// imeEntries api rautes

Apirouter.get("/addTimeEntries", checkApiKey, auth, users_api.getTimeEntry);
Apirouter.get("/addWorkingHour", checkApiKey, auth, users_api.getAddWorkingHour);
Apirouter.post("/deleteWorkingHour/:id", checkApiKey, auth, users_api.DeleteAddWorkingHour);
Apirouter.post("/addWorkingHour", checkApiKey, auth, users_api.addWorkingHour);
Apirouter.get("/editWorkingHour/:id", checkApiKey, auth, users_api.editWorkingHour);
Apirouter.post("/editWorkingHour/:id", checkApiKey, auth, users_api.updateWorkingHour);
Apirouter.get("/showWorkingHour", checkApiKey, auth, users_api.showWorkingHour);
Apirouter.post("/getWorkingHourByday", auth, users_api.getWorkingHourByday);
// Apirouter.get("/getWorkingHourByWeek" ,auth, users_api.getWorkingHourByWeek);
Apirouter.post("/checkHour", auth, users_api.checkHour);
Apirouter.post("/addTimeEntries", checkApiKey, auth, users_api.addTimeEntry);
Apirouter.get("/timeEntryListing", checkApiKey, auth, users_api.timeEntryListing);
Apirouter.post("/deleteTimeEntry/:id", checkApiKey, auth, users_api.deleteTimeEntry);
Apirouter.get("/editTimeEntry/:id", checkApiKey, auth, users_api.editTimeEntry);
Apirouter.post("/editTimeEntry/:id", checkApiKey, auth, users_api.updateTimeEntry);
Apirouter.post("/getDataBymonth", auth, users_api.getDataBymonth);
Apirouter.post("/getTaskByProject/:id", auth, users_api.getTaskByProject);
Apirouter.get("/rolepermission/:id", checkApiKey, auth, users_api.getRolePermission);
Apirouter.post("/rolepermission/:id", checkApiKey, auth, users_api.addRolePermission);
Apirouter.get("/userPermission/:id", checkApiKey, auth, users_api.getUserPermission);
Apirouter.post("/userPermission/:id", checkApiKey, auth, users_api.addUserPermission);
Apirouter.get("/AnnouncementListing", checkApiKey, auth, users_api.Announcementslist);
Apirouter.post("/AnnouncementListing/:searchValue", checkApiKey, auth, users_api.searchAnnouncemnt);
Apirouter.post("/addAnnouncement", checkApiKey, auth, users_api.Announcementsadd);
Apirouter.post("/statusAnnouncements/:announcement_id", checkApiKey, auth, users_api.statusAnnouncements);
Apirouter.get("/AnnouncementsDetails/:id", users_api.AnnouncementsDetail);
Apirouter.post("/viewAnnouncement/:announcement_id", checkApiKey, auth, users_api.viewAnnouncement);
Apirouter.post("/deleteAnnouncement/:id", users_api.Announcementsdelete);
Apirouter.get("/announcements", auth, users_api.Announcements);
Apirouter.get("/settingListing", checkApiKey, auth, users_api.Settingslist);
Apirouter.get("/leavesSettingData", checkApiKey, auth, users_api.leavesSettingData);
Apirouter.get("/addsetting", checkApiKey, auth, users_api.getAddSetting);
Apirouter.post("/addsetting", checkApiKey, auth, users_api.Settingsadd);
Apirouter.get("/editSetting/:id", checkApiKey, auth, users_api.SettingsEdit);
Apirouter.post("/editSetting/:id", checkApiKey, auth, users_api.SettingsUpdate);
Apirouter.post("/deleteSetting/:id", checkApiKey, auth, users_api.SettingsDelete);
// Apirouter.post("/permissionwise", users_api.permissionwise);
Apirouter.get("/alluserleaves", checkApiKey, auth, users_api.alluserleaves);
Apirouter.post("/alluserleaves/:searchValue", users_api.alluserleavesSearch);//pending

//TimeEntries Api routes
Apirouter.post("/checkUpdateEmail", checkApiKey, auth, users_api.checkEmail);
Apirouter.post("/checkUpdateUsername", checkApiKey, auth, users_api.checkUsername);
//check userhasPermission
Apirouter.get("/checkUserHasPermission/:id/:role_id", users_api.checkUserHAsPermission);
Apirouter.post("/NewTimeEntryListing", auth, users_api.newTimeEntryData);
// Apirouter.post("/sendmail", users_api.sendmail);
// Apirouter.post("/activeuserAccount/:id", users_api.activeuserAccount);
Apirouter.post("/active-account/:id", users_api.activeuserAccount);
Apirouter.post("/getHolidaybymonth", users_api.getHolidaybymonth);
Apirouter.post("/getLeavebymonth", users_api.getLeavebymonth);
// Apirouter.get('/NewTimeEntryListing', users_api.timeEntryListing);
Apirouter.get("/addSalaryStructure", checkApiKey, auth, users_api.getAddSalary);
Apirouter.post("/addSalaryStructure", checkApiKey, auth, users_api.addSalaryStructure);
Apirouter.get("/editSalaryStructure/:id", checkApiKey, auth, users_api.editSalaryStructure);
Apirouter.post("/editSalaryStructure/:id", checkApiKey, auth, users_api.updateSalaryStructure);
Apirouter.get("/salaryListing", checkApiKey, auth, users_api.salaryListing);
Apirouter.post("/getDataByUser", checkApiKey, auth, users_api.getDataByUser);
Apirouter.post("/getWorkingDay", checkApiKey, auth, users_api.getWorkingDay);
Apirouter.post("/getLeaveBalance", checkApiKey, auth, users_api.getLeaveBalance);
Apirouter.get("/salaryParticularListing", checkApiKey, auth, users_api.salaryParticularList);
Apirouter.get("/salaryStructureListing", checkApiKey, auth, users_api.salaryStructureListing);
Apirouter.post("/getUserData", auth, users_api.getUserData);
Apirouter.post("/getUSerSalaryStructure", checkApiKey, auth, users_api.getUSerSalaryStructure);
// Apirouter.post("/salary-slip/:id", users_api.genrateSalarySlip);
Apirouter.get("/NewUserEmployeeCode", users_api.NewUserEmployeeCode);
Apirouter.post("/salary-slip/:id/:month/:year", users_api.genrateSalarySlip);
Apirouter.post("/send_salary-slip/:id/:month/:year", users_api.sendSalarySlip);
Apirouter.post("/getProjectByUser", auth, users_api.getProjectByUser);
Apirouter.post("/getTaskByUser", auth, users_api.getTaskByUser);
Apirouter.post("/getTaskDataByProject", auth, users_api.getTaskDataByProject);
Apirouter.post("/timeEntryRequest", checkApiKey, auth, users_api.timeEntryRequest);
Apirouter.get("/timeEntryRequestListing", checkApiKey, auth, users_api.timeEntryRequestListing);
Apirouter.post("/approveTimeEntryRequest/:id", checkApiKey, auth, users_api.approveTimeEntryRequest);
Apirouter.post("/rejectTimeEntryRequest/:id", checkApiKey, auth, users_api.rejectTimeEntryRequest);
Apirouter.post("/filterLeaveData", auth, users_api.filterLeaveData);
Apirouter.post("/filterallUserLeaves", auth, users_api.filterallUserLeaves);
Apirouter.post("/filterProjectData", auth, users_api.filterProjectData);
Apirouter.post("/filterTaskData", auth, users_api.filterTaskData);
Apirouter.get("/activity-log", auth, users_api.activityLog);
Apirouter.post("/activity-log-delete", auth, users_api.activityLogDelete);

module.exports = Apirouter;
