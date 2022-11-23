const project = require("../../model/createProject")
const permission = require("../../model/addpermissions")
const Role = require("../../model/roles")
const task = require("../../model/createTask")
const user = require("../../model/user")
const technology = require("../../model/technology")
const country = require("../../model/city")
const city = require("../../model/country")
const state = require("../../model/state")
const session = require("express-session");
const express = require("express");
const ejs = require('ejs');
const Holiday = require("../../model/holiday")
const Leaves = require("../../model/leaves")
const timeEntry = require("../../model/timeEntries")
const Permission = require("../../model/addpermissions");
// const Role = require("../model/roles");
const rolePermissions = require("../../model/rolePermission");
const userPermissions = require("../../model/userPermission");
const jwt = require('jsonwebtoken');
const BSON = require('bson');
const sendUserEmail = require("../../utils/sendemail")

const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const Apirouter = new express.Router();

const apicountroller = {};
var options = {
    secret: 'bajhsgdsaj cat',
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
};
Apirouter.use(session(options));




apicountroller.useradd = async (req, res) => {
    try {
        // console.log("adas", req.body.role_id)

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

        //  console.log(addUser)
        const genrate_token = await addUser.genrateToken();

        const Useradd = await addUser.save();
        // console.log(Useradd);
        res.json("created done")
    } catch (e) {
        res.json("invalid")
        // res.status(400).send(e);
    }
}
apicountroller.getAddUser = async (req, res) => {


    sess = req.session;
    const blogs = await Role.find();
    const cities = await city.find();
    const countries = await country.find();
    const states = await state.find();
    const users = await user.find();
    // console.log(states);
    res.json({ blogs, cities, countries, states, users })
    // res.json({ success: req.flash('success'), userdata: blogs, countrydata: countries, citydata: cities, statedata: states, userdata: users, name: sess.name, username: sess.username, users: sess.userData, role: sess.role, layout: false });

}
apicountroller.change_password = async (req, res) => {
    sess = req.session;
    try {
        const _id = req.params.id;
        const userData = await user.findById(_id);

        res.render('change_password', {
            userData: userData,
            username: sess.username, users: sess.userData, role: sess.role, layout: false,
            alert: req.flash('alert'), success: req.flash('success')
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

};
apicountroller.save_password = async (req, res) => {
    sess = req.session;
    try {
        const _id = req.params.id;
        const password = req.body.oldpassword;
        const newpwd = req.body.newpassword;
        const cpassword = req.body.cpassword;
        if (!(newpwd == cpassword)) {
            req.flash('alert', 'confirm password not matched')
            res.redirect(`/change_password/${_id}`)
        } else {
            const bcryptpass = await bcrypt.hash(req.body.newpassword, 10);
            const newpassword = ({
                password: bcryptpass,
                updated_at: Date()
            });
            const userData = await user.findById({ _id: _id });
            const isMatch = await bcrypt.compare(password, userData.password);
            // console.log("match", isMatch);
            if (!isMatch) {
                req.flash('alert', 'Old Password not match')
                res.redirect(`/change_password/${_id}`)



            } else {
                const newsave = await user.findByIdAndUpdate(_id, newpassword);
                // console.log("save", newsave);
                req.flash('success', 'Password Change Success')
                res.redirect(`/change_password/${_id}`)
                // res.json({ status: "success to change password" });
            }
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

};
apicountroller.activeuser = async (req, res) => {
    // res.send("hey")
    try {
        const _id = req.params.id;
        const userActive = {
            status: "Active",
            updated_at: Date(),
        }
        const updateEmployee = await user.findByIdAndUpdate(_id, userActive);
        res.json("now you are Active Employee")
        // res.end(JSON.stringify(userActive));

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
apicountroller.employeelogin = async (req, res) => {
    try {
        const _id = req.params.id
        const personal_email = req.body.personal_email;
        const password = req.body.password;
        const users = await user.findOne({ personal_email: personal_email });

        // console.log(users);
        if (!users) {
            res.json({ status: "Iinvalid Email" })

        } else {


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
                // console.log(userData);

                res.json({ userData, status: "login success" })
            }
            else {
                res.json({ status: "login fail" })

            }
        }

        //   console.log(user_email.name);


    } catch {
        res.json({ status: "somthing went wrong" })

    }


};
apicountroller.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return console.log(err);
        }
        res.clearCookie(options.name);
        res.json("logout succuss");
    });
};
apicountroller.getProject = async (req, res) => {
    sess = req.session;
    const UserData = await user.find();
    const TechnologyData = await technology.find();
    res.json({ UserData, TechnologyData })
};
apicountroller.projectslisting = async (req, res) => {
    sess = req.session;
    try {
        var output;
        const Projects = await project.find({ deleted_at: "null" });
        // console.log(Projects)
        if (Projects.length > 0) {
            output = { 'success': true, 'message': 'Get all Project List', 'data': Projects };
        } else {
            output = { 'success': false, 'message': 'Something went wrong' };
        }
        // res.end(JSON.stringify(output));
        res.json({ Projects })

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
apicountroller.projectEdit = async (req, res) => {
    try {
        sess = req.session
        const _id = req.params.id;
        const ProjectData = await project.findById(_id);
        const UserData = await user.find();
        const technologyData = await technology.find();
        res.json({ ProjectData, UserData, technologyData })

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
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
            user_id: req.body.user_id,
            updated_at: Date(),
        }
        const updateEmployee = await project.findByIdAndUpdate(_id, updateProject);
        res.end(JSON.stringify(updateProject));

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
        const blogs = await Role.find({ deleted_at: "null" });
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
apicountroller.Roleddsfelete = async (req, res) => {
    try {
        const _id = req.params.id;
        await Role.findByIdAndDelete(_id);
        res.json("role deleted");
    } catch (e) {
        res.status(400).send(e);
    }
}
apicountroller.Roledelete = async (req, res) => {
    const _id = req.params.id;
    var alreadyRole = await user.find({ role_id: _id })
    var data = (alreadyRole.toString().includes(_id))

    if (data == true) {
        req.flash('success', `this role is already assigned to user so you can't delete this role`)
        res.json({ alreadyRole, data })
    } else {
        const deleteRole = {
            deleted_at: Date(),
        }
        const deteledata = await Role.findByIdAndUpdate(_id, deleteRole);
        res.json({ deteledata })
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
            { $match: { deleted_at: "null" } },
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


        res.json({ tasks })
        // res.json({ data: blogs, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }



};
apicountroller.taskedit = async (req, res) => {
    sess = req.session;
    const _id = req.params.id
    const projectData = await project.find();

    const ID = await task.findById(_id)
    const task_id = ID._id

    const tasksdata = await task.find()

    try {
        const tasks = await task.aggregate([
            { $match: { deleted_at: "null" } },
            { $match: { _id: task_id } },
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

        res.json({ tasks, projectData })
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
apicountroller.taskupdate = async (req, res) => {
    try {
        const _id = req.params.id;
        const role = {
            project_id: req.body.project_id,
            user_id: req.body.user_id,
            title: req.body.title,
            short_description: req.body.short_description,
            updated_at: Date(),
        }

        const updateTask = await task.findByIdAndUpdate(_id, role);
        res.json("Task updeted done");
    } catch (e) {
        res.status(400).send(e);
    }
}
apicountroller.taskdelete = async (req, res) => {
    try {
        const _id = req.params.id;
        await task.findByIdAndDelete(_id);
        res.json("task deleted")
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
        res.json({
            data: userData, name: sess.name, username: sess.username, users: sess.userData, role: sess.role, layout: false
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

    // sess = req.session;
    // const _id = req.params.id;
    // try {
    //     const userData = await user.findById(_id);
    //     console.log("deddy", userData);
    //     res.render('viewUserDetail', {
    //         data: userData, name: sess.name, username: sess.username, role: sess.role, layout: false
    //     });
    // } catch (err) {
    //     res.status(500).json({ error: err.message });
    // }

};
apicountroller.profile = async (req, res) => {
    sess = req.session;
    const _id = req.params.id;
    try {
        const userData = await user.findById(_id);
        res.json({ userData });
        // res.json({ data: blogs, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

};

apicountroller.updateProfile = async (req, res) => {
    const _id = req.params.id;
    try {
        const updateuser = {
            firstname: req.body.firstname,
            middle_name: req.body.middle_name,
            last_name: req.body.last_name,
            gender: req.body.gender,
            dob: req.body.dob,
            doj: req.body.doj,
            personal_email: req.body.personal_email,
            mo_number: req.body.mo_number,
            pan_number: req.body.pan_number,
            aadhar_number: req.body.aadhar_number,
            add_1: req.body.add_1,
            add_2: req.body.add_2,
            city: req.body.city,
            state: req.body.state,
            country: req.body.country,
            pincode: req.body.pincode,
            updated_at: Date(),
        }
        const updateProfile = await user.findByIdAndUpdate(_id, updateuser);
        console.log(updateProfile)
        // const id = sess.userData._id

        res.json({ updateProfile })

    } catch (err) {
        res.status(500).json({ error: err.message });
    }

};

apicountroller.updateUSerPhoto = async (req, res) => {
    const _id = req.params.id;
    try {
        const updateProfilePhoto = {
            photo: req.body.photo,
        }
        const ProfilePhotoUpdate = await user.findByIdAndUpdate(_id, updateProfilePhoto);
        res.json({ ProfilePhotoUpdate });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }


};



apicountroller.editUser = async (req, res) => {
    sess = req.session;
    const _id = req.params.id;
    try {
        const blogs = await Role.find();
        const userData = await user.findById(_id);

        const users = await user.find();
        const cities = await city.find();
        const countries = await country.find();
        const states = await state.find();

        res.json({ blogs, userData, users, cities, countries, states })
        // res.json({ data: blogs, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

};
apicountroller.deleteUser = async (req, res) => {
    try {
        const _id = req.params.id;
        const updateUser = {
            deleted_at: Date(),
        };
        const updateEmployee = await user.findByIdAndUpdate(_id, updateUser);
        // console.log("deleted", updateEmployee);
        res.json({ status: "user deleted", updateUser })
    } catch (e) {
        res.status(400).send(e);
    }
}
apicountroller.holidaylist = async (req, res) => {
    sess = req.session;
    try {
        const blogs = await Holiday.find({ deleted_at: "null" });
        res.json({ blogs })
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
    // res.render("holidayListing",{name:sess.name,layout:false});


};
apicountroller.Holidayadd = async (req, res) => {

    try {
        const addHoliday = new Holiday({
            holiday_name: req.body.holiday_name,
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
        res.json({ updateEmployee })
    } catch (e) {
        res.status(400).send(e);
    }
}
apicountroller.addleaves = async (req, res) => {
    try {
        const addLeaves = new Leaves({
            user_id: req.body.user_id,
            datefrom: req.body.datefrom,
            dateto: req.body.dateto,
            reason: req.body.reason,
            // status: req.body.status,
        });
        // console.log(addLeaves);
        const leavesadd = await addLeaves.save();
        res.json({ leavesadd })
    } catch (e) {
        res.status(400).send(e);
    }
};
apicountroller.leavesList = async (req, res) => {
    try {
        const allLeaves = await Leaves.aggregate([
            { $match: { deleted_at: "null" } },
            { $match: { status: "PENDING" } },
            {

                $lookup:
                {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "test"
                },

            },

        ]);
        res.json({ allLeaves })

    } catch (e) {
        res.status(400).send(e);
    }
};
apicountroller.employeeLavesList = async (req, res) => {
    sess = req.session;

    // console.log(sess)
    // const user_id = new BSON.ObjectId(sess.userData._id);
    // const LeavesData = await Leaves.find({ user_id: user_id });
    // console.log("user", LeavesData);
    try {
        const emplyeeLeaves = await Leaves.aggregate([
            { $match: { status: "PENDING" } },
            // { $match: { user_id: user_id } },

            {

                $lookup:
                {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "test"
                },

            },

        ]);
        res.json({ emplyeeLeaves })
    } catch (e) {
        res.status(400).send(e);
    }
};
apicountroller.cancelLeaves = async (req, res) => {
    try {
        const _id = req.params.id
        const cancelLeaves = {
            status: "CANCELLED",
            approver_id: req.body.approver_id,
            // status: req.body.status,
        };
        // console.log("sds",cancelLeaves)
        const leavescancel = await Leaves.findByIdAndUpdate(_id, cancelLeaves);
        res.json({ leavescancel })
    } catch (e) {
        res.status(400).send(e);
    }
};
apicountroller.rejectLeaves = async (req, res) => {
    try {
        const _id = req.params.id
        const aproover_id = req.body.approver_id

        const rejectLeaves = {
            status: "REJECT",
            approver_id: req.body.approver_id,
            // status: req.body.status,
        };
        const leavesreject = await Leaves.findByIdAndUpdate(_id, rejectLeaves);
        //   console.log(leavescancel)
        res.json({ leavesreject })
    } catch (e) {
        res.status(400).send(e);
    }
};
apicountroller.approveLeaves = async (req, res) => {
    try {
        const _id = req.params.id
        const approveLeaves = {
            status: "APPROVE",
            approver_id: req.body.approver_id,
        };
        const leavesapprove = await Leaves.findByIdAndUpdate(_id, approveLeaves);
        //   console.log(leavesapprove)
        res.json({ leavesapprove })
    } catch (e) {
        res.status(400).send(e);
    }
};
apicountroller.getTimeEntry = async (req, res) => {
    try {

        const user_id = req.body.user_id

        const projectData = await project.find({ user_id: user_id });
        res.json({ projectData })
    } catch (e) {
        res.status(400).send(e);
    }
};
apicountroller.addTimeEntry = async (req, res) => {
    try {
        const addTimeEntry = new timeEntry({
            project_id: req.body.project_id,
            task_id: req.body.task_id,
            hours: req.body.hours,
        });
        const timeEntryadd = await addTimeEntry.save();
        res.json("time entryn add")
    } catch (e) {
        res.status(400).send(e);
    }
};
apicountroller.timeEntryListing = async (req, res) => {
    try {
        const timeEntryData = await timeEntry.aggregate([
            { $match: { deleted_at: "null" } },

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
                    from: "tasks",
                    localField: "task_id",
                    foreignField: "_id",
                    as: "test1"
                }
            }

        ]);

        res.json({ timeEntryData })
    } catch (e) {
        res.status(400).send(e);
    }

}
apicountroller.getRolePermission = async (req, res) => {
    try {
        sess = req.session;
        const _id = req.params.id
        //  console.log("aaa",_id)
        // const _id = req.body._id;
        const rolePermissiondata = await rolePermissions.find({ role_id: _id })
        var rolepermission = [];
        var roleId = [];
        rolePermissiondata.forEach(element => {
            rolepermission.push(element.permission_id)
        });
        const roles = rolepermission.toString()
        const roleData = await Role.findById(_id);
        const blogs = await Permission.find();
        res.json({ blogs, roleData, roles })
    } catch (e) {

    }
};
apicountroller.addRolePermission = async (req, res) => {

    try {
        const _id = req.params.id;
        const id = await rolePermissions.find({ role_id: _id })

        if (id) {
            const deletepermission = await rolePermissions.findByIdAndDelete(id);
            const addpermission = new rolePermissions({
                role_id: req.body.role_id,
                permission_id: req.body.permission_id,
            });
            const permissionadd = await addpermission.save();
            res.status(201).json({ permissionadd });
        }
        else {
            const addpermission = new rolePermissions({
                role_id: req.body.role_id,
                permission_id: req.body.permission_id,
            });

            const permissionadd = await addpermission.save();
            res.status(201).json({ permissionadd });
        }
    } catch (e) {
        res.status(400).send(e);
    }
};
apicountroller.getUserPermission = async (req, res) => {
    const _id = req.params.id;
    sess = req.session;

    const userData = await user.findById(_id);
    const role_id = userData.role_id;

    const rolePermissiondata = await rolePermissions.find({ role_id: role_id })
    const userid = userData._id
    const userPermissiondata = await userPermissions.find({ user_id: userid })
    var userPermission = [];
    var userId = [];
    userPermissiondata.forEach(element => {
        userPermission.push(element.permission_id)
        userId.push(element.user_id)

    });
    const permissions = userPermission.toString()
    var rolePermission = [];
    var roleId = [];

    rolePermissiondata.forEach(element => {
        rolePermission.push(element.permission_id)
        roleId.push(element.role_id)

    });
    const roles = rolePermission.toString()
    const roleData = await user.findById(_id);
    const blogs = await Permission.find();

    const UserId = roleData._id;
    const roledatas = await user.aggregate([

        { $match: { _id: UserId } },
        {

            $lookup:
            {
                from: "roles",
                localField: "role_id",
                foreignField: "_id",
                as: "test"

            }
        },
    ]);
    // console.log(roledatas) 
    res.json({ blogs, roledatas, roleData, permissions, roleId, roles })
    // res.render("userPermission", { data: blogs, rol:roledatas, roledata:roleData, permissionData:permissions,roles:roleId, datas:roles,username:sess.username, layout: false });
};
apicountroller.addUserPermission = async (req, res) => {

    try {
        const _id = req.params.id;
        const id = await userPermissions.find({ user_id: _id })
        if (id) {
            const deletepermission = await userPermissions.findByIdAndDelete(id);
            const addPermission = new userPermissions({
                user_id: req.body.user_id,
                role_id: req.body.role_id,
                permission_id: req.body.permission_id,

            });
            const Permissionadd = await addPermission.save();
            res.status(201).json({ Permissionadd });
        }
        else {
            const addPermission = new userPermissions({
                user_id: req.body.user_id,
                role_id: req.body.role_id,
                permission_id: req.body.permission_id,

            });
            const Permissionadd = await addPermission.save();
            res.status(201).json({ Permissionadd });

        }

    } catch (e) {
        res.status(400).send(e);
    }
};

module.exports = apicountroller