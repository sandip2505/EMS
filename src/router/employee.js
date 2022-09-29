
const express = require("express");
const Employee = require("../model/employee");
const Holiday = require("../model/holiday");
const router =  new express.Router();
const sessions = require("express-session");
const employeeController = require('../controller/employeeController')
const holidayController = require('../controller/holidayController')

const app = express();
 router.use(sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized:true,
    resave: false
}));

router.get("/holidayListing", holidayController.list);
router.get("/addHoliday", holidayController.getHoliday);
router.post("/addHoliday", holidayController.addHoliday);
router.get("/editHoliday/:id", holidayController.editHoliday);
router.get("/", employeeController.login);
router.post("/", employeeController.employeelogin);
router.get("/index", employeeController.index);
router.get("/logout", employeeController.logout);
router.get("/addEmlpoyee", employeeController.addEmlpoyeeform);
router.post("/addEmlpoyee", employeeController.addEmlpoyee);
router.get("/employeelisting",employeeController.allowIfLoggedin, employeeController.grantAccess('readAny', 'profile'), employeeController.employeelisting);
router.get('/editEmployee/:id',employeeController.allowIfLoggedin, employeeController.editEmployee);
router.post('/editEmployee/:id',employeeController.allowIfLoggedin,employeeController.grantAccess('updateAny', 'profile'), employeeController.updateEmployee);
router.get('/deleteEmployee/:id',employeeController.allowIfLoggedin,employeeController.grantAccess('deleteAny', 'profile'), employeeController.deleteEmployee);
  
 



 





  module.exports=router