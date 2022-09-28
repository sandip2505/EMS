
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
  
  router.post("/", async (req, res) => {
    try {
       const email = req.body.email;
      const password = req.body.password;
      const user_email = await Employee.findOne({ email: email });
      if (user_email.password == password) {
          sess = req.session;
          sess.email = req.body.email;
          sess.name = user_email.name
        //   console.log(user_email.name);
        res.redirect("/index");
      } else {
        res.send("you are user")
      }
    } catch {
      res.send("invalid")
    }
  });
  router.get("/index",(req, res) => {
    sess = req.session; 
  if(sess.email) {
    //  req.flash('info', 'hiii');
    res.render("index",{name:sess.name,layout:false});
   }else{
     res.redirect("login");
  }
  });
  router.get('/logout',(req,res) => {
    req.session.destroy((err) => {
        if(err) {
            return console.log(err);
        }
        res.redirect('/');
    });
    
  });

  router.get("/addEmlpoyee", (req, res) => {
    sess = req.session; 
    res.render("addEmployee",{name:sess.name,layout:false});
  });
  
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


  router.post("/addEmlpoyee", async (req, res) => {
    try {
      const addemployeeSchema = new Employee({
        name: req.body.name,
        email: req.body.email,
        DOB: req.body.DOB,
        password: req.body.password,
        number: req.body.number,
        department: req.body.department,
        designation: req.body.designation,
        dateAdded: req.body.dateAdded
      });
      console.log(addemployeeSchema);
      const employees  = await addemployeeSchema.save();
      res.status(201).redirect("/viewEmployee");
    
  } catch (e) {
    res.status(400).send(e);
  }

  });

  router.get("/view", async (req, res) => {
    sess = req.session; 
   
    try {
      const blogs =  await Employee.find();
      res.render('viewEmployee', {
        data: blogs,name:sess.name,layout:false
    });
      // res.json({ data: blogs, status: "success" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });





  module.exports=router