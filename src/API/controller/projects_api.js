const project = require("../../model/createProject")
const permission = require("../../model/addpermissions")
const Role = require("../../model/roles")
const task = require("../../model/createTask")
const user = require("../../model/user")
const Holiday = require("../../model/holiday")
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


const apicountroller = {};


apicountroller.employeelogin = async (req, res) => {
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
apicountroller.projectslisting = async (req, res) => {
    sess = req.session;
    try {
        var output;
        const Projects = await project.find();
        // console.log(Projects)
        if (Projects.length > 0) {
            output = { 'success': true, 'message': 'Get all Project List', 'data': Projects };
        } else {
            output = { 'success': false, 'message': 'Something went wrong' };
        }
        res.end(JSON.stringify(output));

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
apicountroller.projectEdit = async (req, res) => {
    try {
        sess = req.session
        const _id = req.params.id;

        const ProjectData = await project.findById(_id);

        res.end(JSON.stringify(ProjectData));


    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
apicountroller.projectUpdate = async (req, res) => {
    try {
        const _id = req.params.id;
        const updateProject = {
            title: req.body.title,
            short_description: req.body.short_description,
            start_date: req.body.start_date,
            end_date: req.body.end_date,
            status: req.body.status,
            technology: req.body.technology,
            project_type: req.body.project_type,
            updated_at: Date(),
        }
        const updateEmployee = await project.findByIdAndUpdate(_id, updateProject);
        res.end(JSON.stringify(updateProject));
        // res.redirect("/projectslisting");

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
apicountroller.projectdelete = async (req, res) => {
    try {
        const _id = req.params.id;
        await project.findByIdAndDelete(_id);
        res.send("deleted project")
    } catch (e) {
        res.status(400).send(e);
    }
}
apicountroller.permissions = async (req, res) => {
    sess = req.session;
    try {
        const permissionsdata = await permission.find();

        res.json({ permissionsdata });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
apicountroller.newpermissions = async (req, res) => {
    try {
        const newpermissions = new permission({
            permission_name: req.body.permission_name,
            permission_description: req.body.permission_description
        });

        const permissionsadd = await newpermissions.save();
        res.json({ permissionsadd })
        // res.status(201).redirect("/viewpermissions");


    } catch (e) {
        res.status(400).send(e);
    }

}
apicountroller.permissionsedit = async (req, res) => {
    try {
        sess = req.session
        const _id = req.params.id;
        const permissiondata = await permission.findById(_id);
        res.json({ permissiondata })
        // res.json({ data: blogs, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
apicountroller.permissionsUpdate = async (req, res) => {
    try {
        const _id = req.params.id;
        const permissions = {
            permission_name: req.body.permission_name,
            permission_description: req.body.permission_description,
            updated_at: Date(),
        }
        const updatepermission = await permission.findByIdAndUpdate(_id, permissions);
        res.end(JSON.stringify(updatepermission));
    } catch (e) {
        res.status(400).send(e);
    }
}
apicountroller.permissionsdelete = async (req, res) => {
    try {
        const _id = req.params.id;
        await permission.findByIdAndDelete(_id);
        res.send("data deleted")
        // res.end(JSON.stringify("data deleted"));
        // res.redirect("/viewpermissions");
    } catch (e) {
        res.status(400).send(e);
    }
}
apicountroller.Roleadd = async (req, res) => {

    try {
        const addRole = new Role({
            role_name: req.body.role_name,
            role_description: req.body.role_description,
        });
        const Roleadd = await addRole.save();
        res.status(201).send("role add done");

    } catch (e) {
        res.status(400).send(e);
    }

}
apicountroller.roles = async (req, res) => {
    sess = req.session;
    try {
        const blogs = await Role.find();
        // res.json({ blogs })
        res.json({ data: blogs, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
    // res.render("holidayListing",{name:sess.name,layout:false});


};
apicountroller.Roleedit = async (req, res) => {
    try {
        sess = req.session
        const _id = req.params.id;

        const roleData = await Role.findById(_id);
        res.json({ roleData });
        // res.json({ data: blogs, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
apicountroller.Roleupdate = async (req, res) => {
    try {
        const _id = req.params.id;
        const role = {
            role_name: req.body.role_name,
            role_description: req.body.role_description,
            permission_name: req.body.permission_name,
            updated_at: Date(),
        }

        const updateEmployee = await Role.findByIdAndUpdate(_id, role);
        res.json("roles updeted done");
    } catch (e) {
        res.status(400).send(e);
    }
}
apicountroller.Roledelete = async (req, res) => {
    try {
        const _id = req.params.id;
        await Role.findByIdAndDelete(_id);
        res.json("role deleted");
    } catch (e) {
        res.status(400).send(e);
    }
}
apicountroller.taskadd = async (req, res) => {

    try {
        const addTask = new task({
            project_id: req.body.project_id,
            user_id: req.body.user_id,
            title: req.body.title,
            short_description: req.body.short_description,

        });
        const Tasktadd = await addTask.save();
        res.json("task created done")

    } catch (e) {
        res.status(400).send(e);
    }

}
apicountroller.listTasks = async (req, res) => {

    sess = req.session;
    try {
        const tasks = await task.aggregate([
            {
                $lookup:
                {
                    from: "projects",
                    localField: "project_id",
                    foreignField: "_id",
                    as: "test"
                },

            },
            {

                $lookup:
                {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "test1"
                }
            }

        ]);

        // console.log(user)
        // const datas = { ...tasks, ...user }


        res.json({ tasks })
        // res.json({ data: blogs, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }



};
apicountroller.taskdelete = async (req, res) => {
    try {
        const _id = req.params.id;
        await task.findByIdAndDelete(_id);
        res.json("task deleted")
    } catch (e) {
        res.status(400).send(e);
    }
}
apicountroller.useradd = async (req, res) => {
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
        // console.log(addUser);
        const accessToken = jwt.sign({ userId: addUser._id }, process.env.JWT_SECRET, {
            expiresIn: "1d"
        });
        addUser.accessToken = accessToken;
        const Useradd = await addUser.save();
        console.log(Useradd);
        res.json("user create done")
    } catch (e) {
        res.status(400).send(e);
    }
}
apicountroller.listuser = async (req, res) => {
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
        res.json({ userData });


    } catch (err) {
        res.status(500).json({ error: err.message });
    }

};
apicountroller.userDetail = async (req, res) => {
    sess = req.session;
    const _id = req.params.id;
    try {
        const userData = await user.findById(_id);
        res.render('viewUserDetail', {
            data: userData, name: sess.name, username: sess.username, role: sess.role, layout: false
        });
        // res.json({ data: blogs, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

};
apicountroller.editUser = async (req, res) => {
    sess = req.session;
    const _id = req.params.id;
    try {
        const blogs = await roles.find();
        const userData = await user.findById(_id);
        res.render('editUser', {
            data: userData, roles: blogs, name: sess.name, username: sess.username, role: sess.role, layout: false

        });
        // res.json({ data: blogs, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

};
apicountroller.holidaylist = async (req, res) => {
    sess = req.session;
    try {
        const blogs = await Holiday.find({deleted_at:"null"});
        res.json({ blogs})
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
    // res.render("holidayListing",{name:sess.name,layout:false});


};
apicountroller.Holidayadd = async (req, res) => {

    try {
        const addHoliday = new Holiday({
            holiday_name: req.body.holiday_name ,
            holiday_date: req.body.holiday_date
        });
        const Holidayadd = await addHoliday.save();
        res.json("Holiday add done")

    } catch (e) {
        res.status(400).send(e);
    }

}
apicountroller.Holidayedit = async (req, res) => {
    try {
        sess = req.session
        const _id = req.params.id;
        const studentData = await Holiday.findById(_id);
        res.json(studentData);
        // res.json({ data: blogs, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
apicountroller.Holidayupdate = async (req, res) => {
    try {
        const _id = req.params.id;
        const updateHoliday = {
            holiday_name: req.body.holiday_name,
            holiday_date: req.body.holiday_date,
            updated_at: Date(),
        }
        const updateEmployee = await Holiday.findByIdAndUpdate(_id, updateHoliday);
        res.json({ updateEmployee })
        // res.json({ data: blogs, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

}
apicountroller.deleteHoliday = async (req, res) => {
    try {
        const _id = req.params.id;
        const updateHoliday = {
             deleted_at: Date(),
              };
              const updateEmployee = await Holiday.findByIdAndUpdate(_id, updateHoliday);
        res.redirect("/holidayListing");
    } catch (e) {
        res.status(400).send(e);
    }
}



module.exports = apicountroller