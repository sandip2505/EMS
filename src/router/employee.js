
const express = require("express");
const Employee = require("../model/employee");
const router =  new express.Router();
const sessions = require("express-session");
const app = express();
 router.use(sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized:true,
    resave: false
}));
router.get("/", (req, res) => {
    res.render("login");
  });
  
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
    // req.flash('info', 'hiii');
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


  module.exports=router