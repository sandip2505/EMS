const user = require("../model/user");
const roles = require("../model/roles");
const city = require("../model/country");
const country = require("../model/city");
const state = require("../model/state");

const { db } = require("../db/conn");
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");

const userController = {}

userController.login = (req, res) => {
    res.render('login', { success: req.flash('success') })
};

userController.employeelogin = async (req, res) => {
    try {
        const _id = req.params.id
        const personal_email = req.body.personal_email;
        const password = req.body.password;
        const users = await user.findOne({ personal_email: personal_email });

        // console.log(users);


        const userData = await user.aggregate([


            { $match: { deleted_at: "null" } },


            { $match: { personal_email: personal_email } },


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


        const isMatch = await bcrypt.compare(password, userData[0].password);


        if (isMatch) {
            sess = req.session;
            sess.email = req.body.personal_email;
            sess.userData = userData[0];
            sess.username = userData[0].user_name
            const accessToken = jwt.sign({ userId: userData[0]._id }, process.env.JWT_SECRET, {
                expiresIn: "1d"
            });
            // console.log(process.env.CONNECTION);
            const man = await user.findByIdAndUpdate(users._id, { accessToken })
            //    res.status(200).json({
            //     data: { email: user.email, role: user.role },
            //     accessToken
            //    })


            // res.redirect('/index')
            res.json({ userData, status: "login success" })

        }
        else {
            req.flash('success', `incorrect Password`)
            res.redirect('/')

        }

        //   console.log(user_email.name);


    } catch {
        req.flash('success', `Incorrect Email`)
        res.redirect('/')
        console.log(req.flash('success'))

    }


};

userController.index = (req, res) => {
    sess = req.session;
    res.render("index", { name: sess.name, username: sess.username, users: sess.userData, role: sess.role, layout: false });

};

userController.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return console.log(err);
        }
        res.redirect('/');
    });
};



userController.addUser = async (req, res) => {
    sess = req.session;

    const blogs = await roles.find();

    const cities = await city.find();
    const countries = await country.find();
    const states = await state.find();
    const users = await user.find();
    // console.log(states);


    res.render("addUser", {success: req.flash('success'), data: blogs, countrydata: countries, citydata: cities, statedata: states, userdata: users, name: sess.name, username: sess.username, users: sess.userData, role: sess.role, layout: false });

}
userController.createuser = async (req, res) => {
    try {
        const emailExists = await user.findOne({ personal_email: req.body.personal_email });

        if (emailExists) return   req.flash('success', `Email Already Exist`), res.redirect('/addUser')
       
        



        const image = req.files.photo
        const img = image['name']



        const addUser = new user({
            role_id: req.body.role_id,
            emp_code: req.body.emp_code,
            reporting_user_id: req.body.reporting_user_id,
            firstname: req.body.firstname,
            user_name: req.body.user_name,
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
            photo: img,
            bank_account_no: req.body.bank_account_no,
            bank_name: req.body.bank_name,
            ifsc_code: req.body.ifsc_code,
        })
        var file = req.files.photo;
        // console.log(file);
        file.mv('public/images/' + file.name);


        const accessToken = jwt.sign({ userId: addUser._id }, process.env.JWT_SECRET, {
            expiresIn: "1d"
        });
        console.log(addUser)

        addUser.accessToken = accessToken;
        const Useradd = await addUser.save();

        var file = req.files.photo;
        // console.log(file);
        file.mv('public/images/' + file.name);
        res.status(201).redirect("/userListing");
    } catch (e) {
        res.status(400).send(e);
    }
}
userController.list = async (req, res) => {
    sess = req.session;
    try {
        const userData = await user.aggregate([
            { $match: { deleted_at: "null" } },
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

            data: userData, name: sess.name, username: sess.username, users: sess.userData, role: sess.role, layout: false
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }

};
userController.userDetail = async (req, res) => {
    sess = req.session;
    const _id = req.params.id;
    try {
        const userData = await user.findById(_id);
        res.render('viewUserDetail', {
            data: userData, name: sess.name, username: sess.username, users: sess.userData, role: sess.role, layout: false
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
        const userData = await user.findById(_id);

        const users = await user.find();
        // console.log(userData)
        const cities = await city.find();
        const countries = await country.find();
        const states = await state.find();


        res.render('editUser', {
            data: userData, roles: blogs, reportingData: users, countrydata: countries, citydata: cities, statedata: states, name: sess.name, users: sess.userData, username: sess.username, role: sess.role, layout: false


        });
        // res.json({ data: blogs, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

};
userController.updateUser = async (req, res) => {
    try {
        const _id = req.params.id;
        const image = req.files.photo;
        const img = image['name']
        const updateuser = {
            role_id: req.body.role_id,
            emp_code: req.body.emp_code,
            reporting_user_id: req.body.reporting_user_id,
            firstname: req.body.firstname,
            user_name: req.body.user_name,
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
            photo: img,
            bank_account_no: req.body.bank_account_no,
            bank_name: req.body.bank_name,
            ifsc_code: req.body.ifsc_code,
            updated_at: Date(),
        }

        if (req.files) {
            var file = req.files.photo;
            file.mv('public/images/' + file.name);
            const updateUser = await user.findByIdAndUpdate(_id, updateuser);
            res.redirect("/userListing");
        } else {
            var file = req.files.old_image;
        }
        // res.json({ data: blogs, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

}

userController.deleteUser = async (req, res) => {

    const _id = req.params.id;
    const deleteUser = {
        deleted_at: Date(),
    }
    await user.findByIdAndUpdate(_id, deleteUser);
    res.redirect("/userListing");
}


module.exports = userController;