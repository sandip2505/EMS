
const express = require("express");
const Employee = require("../model/employee");
const Holiday = require("../model/holiday");
const router =  new express.Router();
const sessions = require("express-session");
const employeeController = require('../controller/employeeController')
const holidayController = require('../controller/holidayController')
const permissionController = require('../controller/permissionController')

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
router.get("/addpermissions", permissionController.permissions);
router.post("/addpermissions", permissionController.addpermissions);
router.get("/logout", employeeController.logout);
router.get("/addEmlpoyee", employeeController.addEmlpoyeeform);
router.post("/addEmlpoyee", employeeController.addEmlpoyee);
router.get("/employeelisting", employeeController.employeelisting);
router.get('/editEmployee/:id', employeeController.editEmployee);
router.post('/editEmployee/:id',  employeeController.updateEmployee);
router.get('/deleteEmployee/:id', employeeController.deleteEmployee);
  
 



 





  module.exports=router