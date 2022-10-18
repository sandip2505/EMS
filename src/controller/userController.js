const user = require("../model/user");
const roles = require("../model/roles");
const { db } = require("../db/conn");
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");

const userController = {}

userController.login = (req, res) => {
    res.render('login')
};

userController.employeelogin = async (req, res) => {
    try {
        const personal_email = req.body.personal_email;
        const password = req.body.password;
        const users = await user.findOne({ personal_email: personal_email });

        const isMatch = await bcrypt.compare(password, users.password);
        // console.log(password)

        if (isMatch) {
            sess = req.session;
            sess.email = req.body.personal_email;
            sess.userData = users;
            sess.username = users.user_name
            const accessToken = jwt.sign({ userId: users._id }, process.env.JWT_SECRET, {
                expiresIn: "1d"
            });
            await user.findByIdAndUpdate(users._id, { accessToken })
            //    res.status(200).json({
            //     data: { email: user.email, role: user.role },
            //     accessToken
            //    })

            // res.redirect('/index')
            res.json({ users })

        }
        else {
            res.send("error of login")
        }
        //   console.log(user_email.name);


    } catch {
        res.send("invalid")
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


    res.render("addUser", { data: blogs, name: sess.name, username: sess.username, users: sess.userData, role: sess.role, layout: false });

}
userController.createuser = async (req, res) => {
    try {
        const emailExists = await user.findOne({ personal_email: req.body.personal_email });
        console.log(emailExists)
        if (emailExists) return res.status(400).send("Email already taken");

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
            photo: req.body.photo,
            bank_account_no: req.body.bank_account_no,
            bank_name: req.body.bank_name,
            ifsc_code: req.body.ifsc_code,
        })
        const accessToken = jwt.sign({ userId: addUser._id }, process.env.JWT_SECRET, {
            expiresIn: "1d"
        });

        addUser.accessToken = accessToken;
        const Useradd = await addUser.save();
        console.log(Useradd)
        res.status(201).redirect("/userListing");
    } catch (e) {
        res.status(400).send(e);
    }
}
userController.list = async (req, res) => {
    sess = req.session;
    try {
        const userData = await user.aggregate([
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
    // const roleId = role_id.toStrting()
    // console.log(role_id)
    // const roleId = 'ObjectId'+"('"+role_id+"')"
    // console.log(roleId)
    try {
        //         const edituserData = await user.aggregate([
        //             { $match: { $expr : { $eq: [ '$_id' , { $toObjectId: role_id } ] } } },
        //             {
        //                 $lookup:
        //                 {
        //                     from: "roles",
        //                     localField: "role_id",
        //                     foreignField: "_id",
        //                     as: "test"
        //                 }
        //             }
        //         ]);

        // console.log(edituserData)


        const blogs = await roles.find();
        const userData = await user.findById(_id);

        res.render('editUser', {
            data: userData, roles: blogs, name: sess.name, users: sess.userData, username: sess.username, role: sess.role, layout: false


        });
        // res.json({ data: blogs, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

};
userController.updateUser = async (req, res) => {
    try {
        const _id = req.params.id;
        const updateProject = {
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
            photo: req.body.photo,
            bank_account_no: req.body.bank_account_no,
            bank_name: req.body.bank_name,
            ifsc_code: req.body.ifsc_code,
            updated_at: Date(),
        }
        const updateEmployee = await user.findByIdAndUpdate(_id, updateProject);
        res.redirect("/userListing");

        // res.json({ data: blogs, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

}

userController.deleteUser = async (req, res) => {
    try {
        const _id = req.params.id;
        await user.findByIdAndDelete(_id);
        res.redirect("/userListing");
    } catch (e) {
        res.status(400).send(e);
    }
}



module.exports = userController;