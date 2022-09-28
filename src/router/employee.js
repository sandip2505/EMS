
const express = require("express");
const Employee = require("../model/employee");
const Holiday = require("../model/holiday");
const router =  new express.Router();
const sessions = require("express-session");
const employeeController = require('../controller/employeeController')
const app = express();
 router.use(sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized:true,
    resave: false
}));
router.get("/", employeeController.login);
router.post("/", employeeController.employeelogin);
router.get("/index", employeeController.index);
router.get("/logout", employeeController.logout);
router.get("/addEmlpoyee", employeeController.addEmlpoyeeform);
router.post("/addEmlpoyee", employeeController.addEmlpoyee);
router.get("/employeelisting", employeeController.employeelisting);
  
  router.get("/addHoliday", (req, res) => {
    sess = req.session; 
    res.render("addHoliday",{name:sess.name,layout:false});
  });
  router.post("/addHoliday", async(req, res)=>{
    try {
        const addHoliday = new Holiday({
          holiday_name: req.body.holiday_name,
          holiday_date: req.body.holiday_date
        });
        const Holidayadd  = await addHoliday.save();
        res.status(201).redirect("/holidayListing");
      
    } catch (e) {
      res.status(400).send(e);
    }

  })
  router.get("/holidayListing", async(req, res)=>{
    sess = req.session; 
    try {
      const blogs =  await Holiday.find();
      res.render('holidayListing', {
        data: blogs,name:sess.name,layout:false
    });
      // res.json({ data: blogs, status: "success" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
    // res.render("holidayListing",{name:sess.name,layout:false});

  })


 





  module.exports=router