const express = require("express");
const Employee = require("../model/employee");
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");
const sessions = require("express-session");
const { render } = require("ejs");
const controller = {}

// const { roles } = require('../roles')



controller.login = (req, res) => {
    res.render('login')
};

controller.employeelogin = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const user = await Employee.findOne({ email: email });
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            sess = req.session;
            sess.email = req.body.email;
            sess.userData = user;
            sess.name = user.name
            sess.role = user.role

            const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
                expiresIn: "1d"
            });

            await Employee.findByIdAndUpdate(user._id, { accessToken })

            res.json({ success: true, data: { email: user.email, role: user.role }, accessToken });

        }
        else {
            res.send("invalid user")
        }

    } catch {
        res.send("invalid")
    }
};

controller.index = (req, res) => {
    sess = req.session;

    //  req.flash('info', 'hiii');
    res.render("index", { email: sess.email, role: sess.role, layout: false });

};

controller.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return console.log(err);
        }
        res.redirect('/');
    });
};

controller.addEmlpoyeeform = (req, res) => {
    sess = req.session;
    res.render("addEmployee", { role: sess.role, layout: false });
};

controller.addEmlpoyee = async (req, res) => {
    try {

        const { name, email, DOB, password, number, department, designation, dateAdded, role } = req.body        // console.log(addemployeeSchema);
        // const employees  = await addemployeeSchema.save();
        const newUser = new Employee({ name, email, DOB, password, number, department, designation, dateAdded, role: role || "PM" });
        console.log(newUser);

        const accessToken = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
            expiresIn: "1d"
        });
        newUser.accessToken = accessToken;
        await newUser.save();

        res.redirect("/employeelisting");

    } catch (e) {
        res.status(400).send(e);
    }
};

controller.employeelisting = async (req, res) => {

    sess = req.session;
    try {
        const blogs = await Employee.find();
        res.render('employeelisting', {
            data: blogs, name: sess.name, role: sess.role, layout: false
        });
        // res.json({ data: blogs, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

},
    controller.editEmployee = async (req, res) => {
        try {
            const _id = req.params.id;
            const employeeData = await Employee.findById(_id);
            res.render('editEmployee', { data: employeeData, role: sess.role, layout: false })


            // res.json({ data: blogs, status: "success" });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }


controller.updateEmployee = async (req, res) => {
    try {
        const _id = req.params.id;
        const updateEmployee = await Employee.findByIdAndUpdate(_id, req.body);
        res.redirect("/employeelisting");

    } catch (e) {
        res.status(400).send(e);
    }
}

controller.deleteEmployee = async (req, res) => {
    try {
        const _id = req.params.id;
        await Employee.findByIdAndDelete(_id);
        res.redirect("/employeelisting");
    } catch (e) {
        res.status(400).send(e);
    }
}
module.exports = controller