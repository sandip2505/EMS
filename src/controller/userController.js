const users = require("../model/user");
const roles = require("../model/roles");
const { db } = require("../db/conn");
const userController = {}


userController.addUser = async (req, res) => {
    sess = req.session;
    const blogs = await roles.find();
    res.render("addUser", { data: blogs, name: sess.name, role: sess.role, layout: false });
}
userController.createuser = async (req, res) => {
    try {
        const emailExists = await users.findOne({personal_email: req.body.personal_email});
        console.log(emailExists)
        if (emailExists) return res.status(400).send("Email already taken");

        const addUser = new users({
            role_id: req.body.role_id,
            emp_code: req.body.emp_code,
            reporting_user_id: req.body.reporting_user_id,
            firstname: req.body.firstname,
            user_name:req.body.user_name,
            middle_name: req.body.middle_name,
            password: req.body.password,
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
            city: req.body.city,  
            state: req.body.state,
            country: req.body.country,
            pincode: req.body.pincode,
            photo: req.body.photo,
            bank_account_no: req.body.bank_account_no,
            bank_name: req.body.bank_name,
            ifsc_code: req.body.ifsc_code,
        })
        const Useradd = await addUser.save();
        res.status(201).redirect("/userListing");

    } catch (e) {
        res.status(400).send(e);
    }
}
userController.list = async (req, res) => {
    sess = req.session;
    try {
const userData = await users.aggregate([
  {
    $lookup:
         {
            from: "roles",
            localField: "role_id",
            foreignField: "_id",
            as: "test"
        }
 }
]);
        res.render('userListing', {
            data: userData, name: sess.name, role: sess.role, layout: false
        });
        // res.json({ data: blogs, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
  
};
userController.userDetail = async (req, res) => {
    sess = req.session;
    const _id = req.params.id;
    try {
        const userData = await users.findById(_id);
        res.render('viewUserDetail', {
            data: userData, name: sess.name, role: sess.role, layout: false
        });
        // res.json({ data: blogs, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
  
};

userController.editUser = async (req, res) => {
    sess = req.session;
    const _id = req.params.id;
    try {
        const blogs = await roles.find();
        const userData = await users.findById(_id);
        res.render('editUser', {
            data:userData, roles:blogs, name: sess.name, role: sess.role, layout: false
        });
        // res.json({ data: blogs, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
  
};

module.exports = userController;