const project = require("../../model/createProject")
const permission = require("../../model/addpermissions")
const Role = require("../../model/roles")
const task = require("../../model/createTask")
const user = require("../../model/user")
const technology = require("../../model/technology")
const country = require("../../model/city")
const city = require("../../model/country")
const holiday = require("../../model/holiday")
const state = require("../../model/state")
const session = require("express-session");
const express = require("express");
const ejs = require('ejs');
const crypto = require("crypto");
const Holiday = require("../../model/holiday")
const Leaves = require("../../model/leaves")
const timeEntry = require("../../model/timeEntries")
const Permission = require("../../model/addpermissions");
const emailtoken = require("../../model/token");

const rolePermissions = require("../../model/rolePermission");
const userPermissions = require("../../model/userPermission");
const leaves = require("../../model/leaves");
const jwt = require('jsonwebtoken');
const sendEmail = require("../../utils/send_forget_mail")
const BSON = require('bson');
const sendUserEmail = require("../../utils/sendemail")

const bcrypt = require('bcryptjs');

const apicountroller = {};


apicountroller.useradd = async (req, res) => {
    try {
        // console.log("adas", req.body.role_id)
        const emailExist = await user.findOne({ personal_email: req.body.personal_email, })
        if (emailExist) {
            res.json("email already exist")
        } else {
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
            const email = req.body.personal_email
            const name = req.body.user_name
            const firstname = req.body.firstname

            //  console.log(addUser)
            const genrate_token = await addUser.genrateToken();

            const Useradd = await addUser.save();

            const id = Useradd._id
            await sendUserEmail(email, id, name, firstname)
            // console.log(Useradd);
            res.json("created done")
        }
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
            // alert: req.flash('alert'), success: req.flash('success')
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
                // req.flash('alert', 'Old Password not match')
                // res.redirect(`/change_password/${_id}`)


            } else {
                const newsave = await user.findByIdAndUpdate(_id, newpassword);
                // console.log("save", newsave);
                // req.flash('success', 'Password Change Success')
                // res.redirect(`/change_password/${_id}`)
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
// apicountroller.activeuser = async (req, res) => {
//     // res.send("hey")
//     try {
//         const _id = req.params.id;
//         const userActive = {
//             status: "Active",
//             updated_at: Date(),
//         }
//         const updateEmployee = await user.findByIdAndUpdate(_id, userActive);
//         res.json("now you are Active Employee")
//         // res.end(JSON.stringify(userActive));

//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// }
apicountroller.employeelogin = async (req, res) => {
    // try {
    //     const _id = req.params.id
    //     const personal_email = req.body.personal_email;
    //     const password = req.body.password;
    //     const users = await user.findOne({ personal_email: personal_email });

    //     // console.log(users);
    //     if (!users) {
    //         res.json({ status: "Iinvalid Email" })

    //     } else {


    //         const userData = await user.aggregate([


    //             { $match: { deleted_at: "null" } },


    //             { $match: { personal_email: personal_email } },


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


    //         const isMatch = await bcrypt.compare(password, userData[0].password);


    //         if (isMatch) {
    //             sess = req.session;
    //             sess.email = req.body.personal_email;
    //             sess.userData = userData[0];
    //             sess.username = userData[0].user_name
    //             const accessToken = jwt.sign({ userId: userData[0]._id }, process.env.JWT_SECRET, {
    //                 expiresIn: "1d"
    //             });
    //             // console.log(process.env.CONNECTION);
    //             const man = await user.findByIdAndUpdate(users._id, { accessToken })
    //             // console.log(userData);

    //             res.json({ userData, status: "login success" })
    //         }
    //         else {
    //             res.json({ status: "login fail" })

    //         }
    //     }

    //     //   console.log(user_email.name);


    // } catch {
    //     res.json({ status: "somthing went wrong" })

    // }


    try {
        const personal_email = req.body.personal_email;
        const password = req.body.password;
        const users = await user.findOne({ personal_email: personal_email });
        if (!users) {

            res.json({ status: "invalid Email" })
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
            // console.log(isMatch);
            if (isMatch) {
                const token = jwt.sign({ _id: userData[0]._id }, process.env.JWT_SECRET, {
                    expiresIn: "1d"
                });
                users.token = token;
                //  console.log(token)
                const man = await user.findByIdAndUpdate(users._id, { token })

                res.json({ userData, token, status: "login success" })
            }
            else {
                res.json({ status: "login fail" })

            }
            // const isMatch = await bcrypt.compare(password, userData[0].password);


            //         if (isMatch) {
            //             sess = req.session;
            //             sess.email = req.body.personal_email;
            //             sess.userData = userData[0];
            //             sess.username = userData[0].user_name
            //             const accessToken = jwt.sign({ userId: userData[0]._id }, process.env.JWT_SECRET, {
            //                 expiresIn: "1d"
            //             });
            //             // console.log(process.env.CONNECTION);
            //             const man = await user.findByIdAndUpdate(users._id, { accessToken })
            //             // console.log(userData);

            //             res.json({ userData, status: "login success" })
            //         }
            //         else {
            //             res.json({ status: "login fail" })

            //         }
            //     }
        }

    } catch (e) {

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
apicountroller.projectsadd = async (req, res) => {

    try {
        const addProject = new project({
            title: req.body.title,
            short_description: req.body.short_description,
            start_date: req.body.start_date,
            end_date: req.body.end_date,
            status: req.body.status,
            technology: req.body.technology,
            project_type: req.body.project_type,
            user_id: req.body.user_id,
        });
        const Projectadd = await addProject.save();
        res.status(201).redirect("/projectslisting");
    } catch (e) {
        res.status(400).send(e);
    }
};

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
        const deleteProject = {
            deleted_at: Date()
        }
        await project.findByIdAndUpdate(_id, deleteProject);
        res.send("deleted project")
    } catch (e) {
        res.status(400).send(e);
    }
}
apicountroller.viewpermissions = async (req, res) => {
    sess = req.session;
    try {
        const permissionsData = await permission.find({ deleted_at: "null" });

        res.json({ permissionsData });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
apicountroller.addpermissions = async (req, res) => {
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
apicountroller.editpermissions = async (req, res) => {
    try {
        sess = req.session
        const _id = req.params.id;
        const permissionData = await permission.findById(_id);
        res.json({ permissionData })
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
        const permissionDelete = {
            deleted_at: Date(),
        }
        console
        await permission.findByIdAndUpdate(_id, permissionDelete);
        res.send("data deleted")

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
        const roleData = await Role.find({ deleted_at: "null" });
        // res.json({ blogs })
        res.json({ roleData });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

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
    const _id = req.params.id;
    var alreadyRole = await user.find({ role_id: _id })
    var data = (alreadyRole.toString().includes(_id))

    if (data == true) {
        // req.flash('success', `this role is already assigned to user so you can't delete this role`)
        // res.json({ alreadyRole, data })
    } else {
        const deleteRole = {
            deleted_at: Date(),
        }
        const deteledata = await Role.findByIdAndUpdate(_id, deleteRole);
        res.json({ deteledata })
    }
}

apicountroller.getAddTask = async (req, res,) => {
    sess = req.session;
    const user_id = req.body.user_id
    // console.log(user_id)
    try {

        const projectData = await project.find({ user_id: user_id });
        res.json({ projectData })

    } catch (err) {
        res.status(500).json({ error: err.message });
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
    const _id = new BSON.ObjectId(req.params.id);

    const projectData = await project.find();



    const tasksdata = await task.find()

    try {
        const tasks = await task.aggregate([
            { $match: { deleted_at: "null" } },
            { $match: { _id: _id } },
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
        const deleteTask = {
            deleted_at: Date()
        }
        await task.findByIdAndUpdate(_id, deleteTask);
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



};
apicountroller.profile = async (req, res) => {
    sess = req.session;
    const _id = req.params.id;
    try {
        const userData = await user.findById(_id);
        res.json({ userData });
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

apicountroller.UpdateUser = async (req, res) => {
    const new_image = req.body.new_image
    console.log(new_image);
    const _id = req.params.id;
    if (new_image) {
        try {
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
                photo: req.body.new_image,
                status: req.body.status,
                bank_account_no: req.body.bank_account_no,
                bank_name: req.body.bank_name,
                ifsc_code: req.body.ifsc_code,
                updated_at: Date(),
            }

            const updateUser = await user.findByIdAndUpdate(_id, updateuser);
            res.json("update your profile");
            //  res.json({ data: blogs, status: "success" });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    } else {
        try {
            const _id = req.params.id;
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
                photo: req.body.old_image,
                status: req.body.status,
                bank_account_no: req.body.bank_account_no,
                bank_name: req.body.bank_name,
                ifsc_code: req.body.ifsc_code,
                updated_at: Date(),
            }
            console.log("data", updateuser);
            const updateUser = await user.findByIdAndUpdate(_id, updateuser);
            res.json({ updateUser })
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

}
apicountroller.totalcount = async (req, res) => {
    sess = req.session;
    try {
        const userData = await user.find({ deleted_at: "null" })
        const pending = await user.find({ status: "Pending", deleted_at: "null" })
        const active = await user.find({ status: "Active", deleted_at: "null" })
        const InActive = await user.find({ status: "InActive", deleted_at: "null" })
        const projectData = await project.find({ deleted_at: "null" })
        const projecthold = await project.find({ status: "on Hold", deleted_at: "null" })
        const projectinprogress = await project.find({ status: "in Progress", deleted_at: "null" })
        const projectcompleted = await project.find({ status: "Completed", deleted_at: "null" })
        const taskData = await task.find({ deleted_at: "null" })
        const leavesData = await leaves.find({ status: "PENDING", deleted_at: "null" })
        const dataholiday = await holiday.find({ deleted_at: "null" })
        res.json({ userData, pending, active, InActive, projectData, projecthold, dataholiday, projectinprogress, projectcompleted, taskData, leavesData })



    } catch (err) {
        res.status(500).json({ error: err.message });

        // }
    }
}
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
        const holidayData = await Holiday.find({ deleted_at: "null" });
        res.json({ holidayData })
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
    // res.render("holidayListing",{name:sess.name,layout:false});

};

apicountroller.sendforget = async (req, res) => {
    try {
        // console.log("sasa");
        const Email = req.body.personal_email;

        const emailExists = await user.findOne({ personal_email: Email });
        if (emailExists) {
            let token = await emailtoken.findOne({ userId: emailExists._id });
            if (!token) {
                token = await new emailtoken({
                    userId: emailExists._id,
                    token: crypto.randomBytes(32).toString("hex"),
                }).save();
            }
            const link = `${process.env.BASE_URL}/change_pwd/${emailExists._id}/${token.token}`;

            await sendEmail(
                emailExists.personal_email,
                emailExists.firstname,
                emailExists._id,
                link
            );
            res.json({ status: "Email Sent Successfully" });
        } else {
            res.json({ status: "User Not found" });
        }
    } catch {
        res.send("noooo");
    }
};
apicountroller.change = async (req, res) => {
    const _id = req.params.id;
    const tokenid = req.params.token;
    const password = req.body.password;
    const cpassword = req.body.cpassword;

    const users = await user.findById(req.params.id);

    if (!user) return res.status(400).send("invalid link or expired");

    const token = await emailtoken.findOne({
        userId: users._id,
        token: req.params.token,
    });
    if (!token) return res.status(400).send("Invalid link or expired");

    if (!(password == cpassword)) {
        req.flash("success", `Password and confirm password does not match`);
        res.render("forget_change_pwd", { success: req.flash("success") });
    } else {
        const passswords = await bcrypt.hash(password, 10);

        await token.delete();
        req.flash("success", `password updated`);
        res.redirect(`/change_pwd/${_id}/${tokenid}`);

    }
}
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
        const holidayData = await Holiday.findById(_id);
        res.json({ holidayData })
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
        });
        const leavesadd = await addLeaves.save();
        res.json("leaves add done")
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
    try {
        const emplyeeLeaves = await Leaves.aggregate([
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
        };
        const leavescancel = await Leaves.findByIdAndUpdate(_id, cancelLeaves);
        res.json({ leavescancel })
    } catch (e) {
        res.status(400).send(e);
    }
};
apicountroller.rejectLeaves = async (req, res) => {
    try {
        const _id = req.params.id
        const rejectLeaves = {
            status: "REJECT",
            approver_id: req.body.approver_id,
        };
        const leavesReject = await Leaves.findByIdAndUpdate(_id, rejectLeaves);
        res.json({ leavesReject })
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
        const rolePermissiondata = await rolePermissions.find({ role_id: _id })
        var rolepermission = [];
        var roleId = [];
        rolePermissiondata.forEach(element => {
            rolepermission.push(element.permission_id)
        });
        const roles = rolepermission.toString()
        const roleData = await Role.findById(_id);
        const permission = await Permission.find();
        res.json({ permission, roleData, roles })
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
