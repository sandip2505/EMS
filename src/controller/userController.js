const users = require("../model/user");
const roles = require("../model/roles");
const { db } = require("../model/roles");


const userController = {}

userController.addUser = async (req, res) => {
    sess = req.session;
    const blogs = await roles.find();
    res.render("addUser", { data: blogs, name: sess.name, role: sess.role, layout: false });
}

userController.createuser = async (req, res) => {
    try {
        
        const addUser = new users({
            role_id: req.body.role_id,
            emp_code: req.body.emp_code,
            reporting_user_id: req.body.reporting_user_id,
            firstname: req.body.firstname,
            middle_name: req.body.middle_name,
            last_name: req.body.last_name,
            gender: req.body.gender,
            dob: req.body.dob,
            doj: req.body.doj,
            personal_email: req.body.personal_email,
            company_email: req.body.company_email,
            mo_number: req.body.mo_number,
            pan_number: req.body.pan_number,
            aadhar_number: req.body.aadhar_number,
            add_1: req.body.add_1,
            add_2: req.body.add_2,
            state: req.body.state,
            pincode: req.body.pincode,
            country: req.body.country,
            photo: req.body.photo,
            bank_account_no: req.body.bank_account_no,
            bank_name: req.body.bank_name,
            ifsc_code: req.body.ifsc_code, 
        });
<<<<<<< HEAD

=======
        var file = req.files.photo;
        file.mv('public/images/'+file.name);
        console.log(addUser);
>>>>>>> bc95493d23a0356fc4ccec251f841c14e30b3b0f
        const Useradd = await addUser.save();
        res.status(201).redirect("/index");

    } catch (e) {
        res.status(400).send(e);
    }
}
userController.list = async (req, res) => {
    sess = req.session;
    try {


var dbcourse = [];

// Finding courses of category Database
users.find()
	.then(data => {
		console.log("Database Courses:")
		console.log(data);

		// Putting all course id's in dbcourse array
		data.map((d, k) => {
			dbcourse.push(d._id);
		})

		// Getting students who are enrolled in any
		// database course by filtering students
		// whose courseId matches with any id in
		// dbcourse array
		roles.find({ role_id: { $in: dbcourse } })
			.then(data => {
				console.log("Students in Database Courses:")
				console.log(data);
			})
			.catch(error => {
				console.log(error);
			})
	})
	.catch(error => {
		console.log(error);
	})

            // const userData = await users.find();
            
      res.render('userListing', {
        data: userData, name: sess.name, role: sess.role, layout: false
      });
      // res.json({ data: blogs, status: "success" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
    // res.render("holidayListing",{name:sess.name,layout:false});
  
  
  };



module.exports = userController;