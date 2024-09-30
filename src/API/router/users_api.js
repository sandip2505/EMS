const express = require("express");
const Apirouter = new express.Router();
// const = require("express-session");
const users_api = require("../controller/projects_api");
const holidayController = require("../controller/holidayController")
const technologyController = require("../controller/technologyController.js")
const permissionModuleController = require("../controller/permissionModuleController.js")
const InventoryController = require("../controller/InventoryController");
const auth = require("../../middleware/auth");
const session = require("express-session");
const app = express();
const routers = require("../../router/employee");
// const auth = require("../middleware/auth");
const flash = require("connect-flash");
const roleController = require("../controller/roleController.js");
const permissionController = require("../controller/permissionController.js");
const timeEntryController = require("../controller/timeEntryController.js");
const projectController = require("../controller/projectController.js");
const taskController = require("../controller/taskController.js");
const leavesController = require("../controller/leavesController.js");
const userController = require("../controller/userController.js");
const authController = require("../controller/authController.js");
const punchController = require("../controller/punchController.js");
const apiKey = process.env.API_KEY;
const checkApiKey = (req, res, next) => {
  const apiKeyHeader =
    req.headers['x-api-key'];
  if (!apiKeyHeader || apiKeyHeader !== apiKey) {
    res.redirect("/forbidden");
  } else {
    next();
  }
};


// holiday api routes
Apirouter.get("/holidayListing", checkApiKey, auth, holidayController.holidaylist);
Apirouter.post("/addHoliday", checkApiKey, auth, holidayController.Holidayadd);
Apirouter.get("/editHoliday/:id", checkApiKey, auth, holidayController.Holidayedit);
Apirouter.post("/editHoliday/:id", checkApiKey, auth, holidayController.Holidayupdate);
Apirouter.post("/deleteHoliday/:id", checkApiKey, auth, holidayController.deleteHoliday);

//Project Api routes 


Apirouter.get("/projectslisting", checkApiKey, auth, projectController.projects);
Apirouter.get("/addProjects", checkApiKey, auth, projectController.getAddProject);
Apirouter.post("/addProjects", checkApiKey, auth, projectController.addproject);
Apirouter.get("/editProject/:id", checkApiKey, auth, projectController.getproject);
Apirouter.post("/editProject/:id", checkApiKey, auth, projectController.updateProject);
Apirouter.post("/deleteProject/:id", checkApiKey, auth, projectController.deleteProject);
Apirouter.get("/getTimeEntryDataByProject", users_api.getTimeEntryDataByProject);

//Permission Api routes 

Apirouter.get("/viewpermissions", checkApiKey, auth, permissionController.permissions);
Apirouter.post("/addpermissions", checkApiKey, auth, permissionController.addpermission);
Apirouter.get("/editpermissions/:id", checkApiKey, auth, permissionController.getpermission);
Apirouter.post("/editpermissions/:id", checkApiKey, auth, permissionController.updatepermission);
Apirouter.post("/deletepermissions/:id", checkApiKey, auth, permissionController.deletepermission);

//Role Api routes 

Apirouter.get("/roles", checkApiKey, auth, roleController.roles);
Apirouter.post("/addRole", checkApiKey, auth, roleController.addRole);
Apirouter.get("/editRole/:id", checkApiKey, auth, roleController.getRole);
Apirouter.post("/editRole/:id", checkApiKey, auth, roleController.updateRole);
Apirouter.post("/deleteRole/:id", checkApiKey, auth, roleController.deleteRole);
Apirouter.get("/rolepermission/:id", checkApiKey, auth, roleController.getRolePermission);
Apirouter.post("/rolepermission/:id", checkApiKey, auth, roleController.addRolePermission);

//Task Api routes 

Apirouter.get("/tasks", checkApiKey, auth, taskController.tasks);
Apirouter.get("/addtask", checkApiKey, auth, taskController.getAddTask);
Apirouter.post("/addtask", checkApiKey, auth, taskController.addTask);
Apirouter.post("/getUserByProject/:id", auth, taskController.getUserByProject);
Apirouter.get("/editTask/:id", checkApiKey, auth, taskController.getTask);
Apirouter.post("/editTask/:id", checkApiKey, auth, taskController.updateTask);
Apirouter.post("/deleteTask/:id", checkApiKey, auth, taskController.deleteTask);
Apirouter.post("/task_status_update/:id/", checkApiKey, auth, taskController.task_status_update);

//User Api Routes

Apirouter.get("/userListing", checkApiKey, auth, userController.users);
Apirouter.get("/addUser", checkApiKey, auth, userController.getAddUser);
Apirouter.post("/addUser", checkApiKey, auth, userController.addUser);
Apirouter.get("/editUser/:id", checkApiKey, auth, userController.getUser);
Apirouter.post("/editUser/:id", checkApiKey, auth, userController.updateUser);
Apirouter.post("/deleteUser/:id", checkApiKey, auth, userController.deleteUser);
Apirouter.post("/restoreuser/:id", checkApiKey, auth, userController.restoreuser);
Apirouter.get("/viewUserDetail/:id", checkApiKey, auth, userController.userDetail);
Apirouter.post("/profile/:id", userController.updateProfile);
Apirouter.post("/userphoto/:id", userController.updateUserPhoto);
Apirouter.post("/userprofilephoto/:id", userController.userprofilephoto);
Apirouter.post("/editUserProfile/:id", checkApiKey, auth, userController.editUserProfile);
Apirouter.post("/addUserimage", userController.addUserimage);
Apirouter.get("/deleteduser", checkApiKey, auth, userController.deleteduser);
Apirouter.post("/deleteMany", checkApiKey, auth, userController.deletedMany);
Apirouter.get("/profile/:id", checkApiKey, auth, userController.profile);
Apirouter.post("/checkEmplyeeCode", checkApiKey, auth, userController.checkEmplyeeCode);
Apirouter.post("/existusername", checkApiKey, auth, userController.existusername);
Apirouter.post("/existemail", checkApiKey, auth, userController.existpersonal_email);

//Auth Api Routes

Apirouter.post("/", authController.employeelogin);
Apirouter.post("/logout", authController.logout);
Apirouter.get("/change_password/:id", checkApiKey, auth, authController.change_password);
Apirouter.post("/change_password/:id", checkApiKey, auth, authController.save_password);
Apirouter.post("/checkLoginEmail", authController.checkLoginEmail)
Apirouter.post("/checkLoginPassword", authController.checkLoginPassword);
Apirouter.post("/activeuser/:id", authController.activeuser);
Apirouter.post("/forgot-password-change/:id/:token", authController.change);
Apirouter.post("/password-checkToken/:id/:token", authController.checktoken);
Apirouter.post("/forget", authController.sendforget);
Apirouter.post("/active-account/:id", authController.activeuserAccount);



// Apirouter.get("/addProjects", checkApiKey, auth, users_api.getProject);
// Apirouter.get("/projectslisting", checkApiKey, auth, users_api.projectslisting);
// Apirouter.get("/dashbordprojects", checkApiKey, auth, users_api.projectHashTask);
// Apirouter.post("/addProjects", checkApiKey, auth, users_api.projectsadd);
// Apirouter.get("/editProject/:id", auth, users_api.projectEdit);
// Apirouter.post("/editProject/:id", checkApiKey, auth, users_api.projectUpdate);
// Apirouter.post("/deleteProject/:id", checkApiKey, auth, users_api.projectdelete);
// Apirouter.post("/projectslisting/:searchValue", auth, users_api.searchProject);//pending
// Apirouter.get("/addProjects", checkApiKey, auth, users_api.getProject);
// Apirouter.get("/dashbordprojects", checkApiKey, auth, users_api.projectHashTask);
// Apirouter.post("/addProjects", checkApiKey, auth, users_api.projectsadd);
// Apirouter.get("/editProject/:id", auth, users_api.projectEdit);
// Apirouter.post("/deleteProject/:id", checkApiKey, auth, users_api.projectdelete);
// Apirouter.post("/projectslisting/:searchValue", auth, users_api.searchProject);//pending
// Apirouter.get("/getTimeEntryDataByProject", users_api.getTimeEntryDataByProject);
//Permission Api routes`
// Apirouter.post("/viewpermissions/:searchValue", auth, permissionController.searchPermissions);
// Apirouter.post("/searchUserPermissions/:searchValue", auth, permissionController.searchUserPermissions);//pending
// Apirouter.post("/searchRolePermissions/:searchValue", auth, permissionController.searchRolePermissions);//pending
// Apirouter.get("/addpermissions", checkApiKey, auth, permissionController.permissionspage);
//Role Api Route
// Apirouter.post("/roleListing/:searchValue", users_api.searchRole);
// Apirouter.get("/addRole", checkApiKey, auth, users_api.Roleadd);
//Task Api Route
// Apirouter.post("/getUserByProject/:id", auth, users_api.getUserByProject);
// Apirouter.get("/editTask/:id", checkApiKey, auth, users_api.getTask);
// Apirouter.post("/addtask", checkApiKey, auth, taskController.addtask);
// Apirouter.post("/taskListing/:searchValue", auth, users_api.searchTask);
// Apirouter.post("/editTask/:id", checkApiKey, auth, users_api.taskupdate);
// Apirouter.post("/task_status_update/:id", checkApiKey, auth, users_api.task_status_update);
// Apirouter.get("/userListing", checkApiKey, auth, users_api.listuser);
// Apirouter.post("/addUser", checkApiKey, auth, users_api.useradd);
////
// Apirouter.get("/addUser", checkApiKey, auth, users_api.getAddUser);
// Apirouter.get("/editUser/:id", checkApiKey, auth, users_api.editUser);
// Apirouter.post("/editUser/:id", checkApiKey, auth, users_api.UpdateUser);
// Apirouter.post("/deleteUser/:id", checkApiKey, auth, users_api.deleteUser);
Apirouter.get("/index", checkApiKey, auth, users_api.index);
Apirouter.post("/indexWorkingHour", checkApiKey, auth, users_api.indexWorkingHour);
// Apirouter.post("/change_pwd/:id/:token", users_api.change);
Apirouter.post("/getSettingData", auth, users_api.getSettingData);
// Apirouter.post("/userListing/:searchValue", users_api.searchUser);

// Apirouter.get("/addHoliday", checkApiKey, auth, holidayController.getHoliday);
// Apirouter.post("/holidayListing/:searchValue", holidayController.searchHoliday);

//Leaves Api routes

Apirouter.get("/viewleaves", checkApiKey, auth, users_api.leavesList); //////change
Apirouter.get("/leaves", checkApiKey, auth, leavesController.leaves); //////change
Apirouter.get("/addLeaves", checkApiKey, auth, leavesController.getAddLeave);
Apirouter.post("/addLeaves", checkApiKey, auth, leavesController.addLeave);
Apirouter.get("/editLeave/:id/:user_id", auth, leavesController.getLeave);
Apirouter.post("/editLeave/:id", auth, leavesController.updateLeave);
Apirouter.post("/deleteLeaves/:id", checkApiKey, auth, leavesController.deleteLeave);
Apirouter.post("/cancelLeaves/:id", checkApiKey, auth, leavesController.cancelLeaves);
Apirouter.post("/rejectLeaves/:id", checkApiKey, auth, leavesController.rejectLeaves);
Apirouter.post("/approveLeaves/:id", checkApiKey, auth, leavesController.approveLeaves);
Apirouter.get("/userLeaveHistory", leavesController.userLeaveHistory);
// Apirouter.post("/cancelLeaves/:id", checkApiKey, auth, leavesController.cancelLeaves);
// Apirouter.post("/deleteLeaves/:id", auth, leavesController.updateLeave);
// Apirouter.post("/addLeaves", checkApiKey, auth, users_api.addleaves);

// Apirouter.get("/addLeaves", checkApiKey, auth, users_api.getaddleaves);
Apirouter.get("/leaveRequests", checkApiKey, auth, leavesController.leaveRequests);
Apirouter.post("/filterLeaveData", checkApiKey, auth, users_api.filterLeaveData);
Apirouter.post("/updateLeave", users_api.updateLeaveStatus);



// Apirouter.get("/employeeLeavesList", checkApiKey, auth, users_api.employeeLavesList);
// Apirouter.post("/employeeLeavesList/:searchValue", checkApiKey, auth, users_api.searchEmployeeLeave);//pending

// Apirouter.post("/editLeave/:id", checkApiKey, auth, users_api.updateLeave);
// Apirouter.post("/deleteLeaves/:id", checkApiKey, auth, users_api.deleteLeave);
// Apirouter.post("/viewleavesrequest/:searchValue", users_api.searchLeave);//pending
Apirouter.get("/getUserTakenLeaves", users_api.getUserTakenLeaves);
// Punch-in - Punch-out routes

Apirouter.post("/punch-in", checkApiKey, auth, users_api.punch_in);
Apirouter.post("/punch-out/:id", checkApiKey, auth, users_api.punch_out);
Apirouter.get("/punch_data", checkApiKey, auth, users_api.punch_data);
Apirouter.get("/check_punch", checkApiKey, auth, users_api.check_punch);

// imeEntries api rautes


Apirouter.get("/addWorkingHour", checkApiKey, auth, users_api.getAddWorkingHour);
Apirouter.post("/deleteWorkingHour/:id", checkApiKey, auth, users_api.DeleteAddWorkingHour);
Apirouter.post("/addWorkingHour", checkApiKey, auth, users_api.addWorkingHour);
Apirouter.get("/editWorkingHour/:id", checkApiKey, auth, users_api.editWorkingHour);
Apirouter.post("/editWorkingHour/:id", checkApiKey, auth, users_api.updateWorkingHour);
Apirouter.get("/showWorkingHour", checkApiKey, auth, users_api.showWorkingHour);
Apirouter.post("/getWorkingHourByday", auth, users_api.getWorkingHourByday);
// Apirouter.get("/getWorkingHourByWeek" ,auth, users_api.getWorkingHourByWeek);
Apirouter.post("/checkHour", auth, users_api.checkHour);


// Apirouter.get("/timeEntryListing", checkApiKey, auth, users_api.timeEntryListing);
Apirouter.get("/timeEntries", checkApiKey, auth, timeEntryController.timeEntries);
Apirouter.get("/addTimeEntries", checkApiKey, auth, timeEntryController.getAddTimeEntry);
Apirouter.post("/addTimeEntries", checkApiKey, auth, timeEntryController.addTimeEntry);
Apirouter.get("/editTimeEntry/:id", checkApiKey, auth, timeEntryController.getTimeEntry);
Apirouter.post("/editTimeEntry/:id", checkApiKey, auth, timeEntryController.updateTimeEntry);
Apirouter.post("/deleteTimeEntry/:id", checkApiKey, auth, timeEntryController.deleteTimeEntry);
Apirouter.post("/getTaskByProject/:id", auth, timeEntryController.getTaskByProject);


// Apirouter.get("/rolepermission/:id", checkApiKey, auth, users_api.getRolePermission);

// Apirouter.post("/rolepermission/:id", checkApiKey, auth, users_api.addRolePermission);

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
Apirouter.post("/filterallUserLeaves", auth, users_api.filterallUserLeaves);
Apirouter.get("/alluserleaveHistory", users_api.alluserleaveHistory);
Apirouter.post("/alluserleaves/:searchValue/:year", users_api.alluserleavesSearch); //pending

//TimeEntries Api routes
Apirouter.post("/checkUpdateEmail", checkApiKey, auth, users_api.checkEmail);
Apirouter.post("/checkUpdateUsername", checkApiKey, auth, users_api.checkUsername);
//check userhasPermission
Apirouter.get("/checkUserHasPermission/:id/:role_id", users_api.checkUserHAsPermission);

Apirouter.post("/NewTimeEntryListing", auth, timeEntryController.newTimeEntryData);

Apirouter.post("/sendmail", users_api.sendmail);


// Apirouter.post("/activeuserAccount/:id", users_api.activeuserAccount);

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
// Apirouter.post("/filterallUserLeaves", auth, users_api.filterallUserLeaves);
Apirouter.post("/filterProjectData", auth, users_api.filterProjectData);
Apirouter.post("/filterTaskData", auth, users_api.filterTaskData);
Apirouter.get("/activity-log", auth, users_api.activityLog);
Apirouter.post("/activity-log-delete", auth, users_api.activityLogDelete);

Apirouter.post("/addExistingUserLeaveHistory", users_api.addExistingUserLeaveHistory);
Apirouter.get("/editLeaveHistory/:id", users_api.editLeaveHistory);
Apirouter.post("/editLeaveHistory/:id", users_api.updateLeaveHistory);
Apirouter.delete("/deleteLeaveHistory/:id", users_api.deleteLeaveHistory);

Apirouter.post('/addLeaveHistoryData', users_api.addLeaveHistoryData);
Apirouter.post('/updateLeaveHistoryData', users_api.updateLeaveHistoryData);
Apirouter.post('/updateCreatedAt', users_api.updateCreatedAt);
Apirouter.post('/addLeaveNewData', users_api.addLeaveNewData);
Apirouter.post('/addLeaveHistoryNewData', users_api.addLeaveHistoryNewData);



//  Masterinvantory Routes
Apirouter.post("/addInventoryMaster", checkApiKey, auth, InventoryController.addInventoryMaster);
Apirouter.get("/inventoryMaster", checkApiKey, auth, InventoryController.getInventoryMaster);
Apirouter.post("/editInventoryMaster/:id", checkApiKey, auth, InventoryController.editInventoryMaster);
Apirouter.get("/editInventoryMaster/:id", checkApiKey, auth, InventoryController.getEditInventoryMaster);
Apirouter.delete("/deleteInventoryMaster/:id", checkApiKey, auth, InventoryController.deleteInventoryMaster);

// CPU Masterinvantory Routes
Apirouter.post("/cpuMasterInventory", checkApiKey, auth, InventoryController.AddcpuMasterInventory);
Apirouter.get("/cpuMasterInventory", checkApiKey, auth, InventoryController.getcpuMasterInventory);
Apirouter.get("/getcpuData", checkApiKey, auth, InventoryController.getcpuData);
Apirouter.get("/editcpuMasterInventory/:id", checkApiKey, auth, InventoryController.geteditcpuMasterInventory);
Apirouter.post("/editcpuMasterInventory/:id", checkApiKey, auth, InventoryController.editcpuMasterInventory);
Apirouter.delete("/deletecpuMasterInventory/:id", checkApiKey, auth, InventoryController.deletecpuMasterInventory);

// inventoryItem Routes
Apirouter.post("/addInventoryItem", checkApiKey, auth, InventoryController.addInventoryItem);
Apirouter.get("/inventoryItem", checkApiKey, auth, InventoryController.getInventoryItem);
Apirouter.get("/editInventoryItem/:id", checkApiKey, auth, InventoryController.getEditInventoryItem);
Apirouter.get("/getInventoryItem/", checkApiKey, auth, InventoryController.getInventoryItemData);
Apirouter.post("/editInventoryItem/:id", checkApiKey, auth, InventoryController.editInventoryItem);
Apirouter.delete("/deleteInventoryItem/:id", checkApiKey, auth, InventoryController.deleteInventoryItem);
Apirouter.get("/mainInventoryItem", checkApiKey, auth, InventoryController.mainInventoryItem);

// Assign invantory Routes
Apirouter.post("/addAssignInventory", checkApiKey, auth, InventoryController.addAssignInventory);
Apirouter.get("/assignInventory", checkApiKey, auth, InventoryController.getAssignInventory);
Apirouter.post("/editAssignInventory/:id", checkApiKey, auth, InventoryController.editAssignInventory);
Apirouter.get("/editAssignInventory/:id", checkApiKey, auth, InventoryController.getEditAssignInventory);
Apirouter.delete("/deleteAssignInventory/:id", checkApiKey, auth, InventoryController.deleteAssignInventory);
Apirouter.get("/users_list", checkApiKey, auth, InventoryController.users_list);


Apirouter.get("/technologies", checkApiKey, auth, technologyController.technologies);
Apirouter.post("/technology", checkApiKey, auth, technologyController.addTechnology);
Apirouter.get("/technology/:id", checkApiKey, auth, technologyController.editTechnology);
Apirouter.post("/technology/:id", checkApiKey, auth, technologyController.updateTechnology);
Apirouter.post("/deleteTechnology/:id", checkApiKey, auth, technologyController.deleteTechnology);

Apirouter.get("/permissionModules", checkApiKey, auth, permissionModuleController.permissionModules);
Apirouter.post("/permissionModule", checkApiKey, auth, permissionModuleController.addPermissionModule);
Apirouter.get("/permissionModule/:id", checkApiKey, auth, permissionModuleController.editPermissionModule);
Apirouter.post("/permissionModule/:id", checkApiKey, auth, permissionModuleController.updatePermissionModule);
Apirouter.delete("/permissionModule/:id", checkApiKey, auth, permissionModuleController.deletePermissionModule);


Apirouter.get("/exampleListing", holidayController.exampleListing);
Apirouter.post("/exampleListing", holidayController.examplepost);




Apirouter.get("/empdata", checkApiKey, auth, punchController.empdata);
Apirouter.get("/punches/:id", checkApiKey, auth, punchController.getPunchesByEmployee);
Apirouter.get("/editPunches/:id", checkApiKey, auth, punchController.editPunchedata);
Apirouter.put("/updatePunches/:id", checkApiKey, auth, punchController.updatePunchedata);
Apirouter.get("/getPunches/:id", checkApiKey, auth, punchController.getPunches);
Apirouter.delete("/deletePunch/:id", checkApiKey, auth, punchController.deletePunch);
Apirouter.get("/punchEmployee", checkApiKey, auth, punchController.punchEmployee);
Apirouter.get("/averageHours/:id", checkApiKey, auth, punchController.averageHours);


module.exports = Apirouter;
