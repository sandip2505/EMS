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
const Announcement = require("../../model/Announcement")
const Settings = require("../../model/settings")
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
const Helper = require('../../utils/helper');
const helper = new Helper();

const bcrypt = require('bcryptjs');
const { log } = require("console")
const { find } = require("../../model/createProject")

const apicountroller = {};


apicountroller.useradd = async (req, res) => {
   
    sess = req.session;
    
    const user_id =req.user._id
    const  userid = await user.find({_id:user_id})
    const role_id =userid[0].role_id.toString()

    helper.checkPermission(role_id, 'Add Employee').then(async(rolePerm) => {
        if (rolePerm.status==true) {
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
        
                    const genrate_token = await addUser.genrateToken();
        
                    const Useradd = await addUser.save();
        
                    const id = Useradd._id
                    await sendUserEmail(email, id, name, firstname)
                    res.json("created done")    
                } 
        } else {
            res.json({status:false})
        }
       
    }).catch((error) => {
        res.status(403).send(error);
    });

    // try {
    //     const emailExist = await user.findOne({ personal_email: req.body.personal_email, })
    //     if (emailExist) {
    //         res.json("email already exist")
    //     } else {
    //         const addUser = new user({
    //             role_id: req.body.role_id,
    //             emp_code: req.body.emp_code,
    //             reporting_user_id: req.body.reporting_user_id,
    //             firstname: req.body.firstname,
    //             user_name: req.body.user_name,
    //             middle_name: req.body.middle_name,
    //             password: req.body.password,
    //             last_name: req.body.last_name,
    //             gender: req.body.gender,
    //             dob: req.body.dob,
    //             doj: req.body.doj,
    //             personal_email: req.body.personal_email,
    //             company_email: req.body.company_email,
    //             mo_number: req.body.mo_number,
    //             pan_number: req.body.pan_number,
    //             aadhar_number: req.body.aadhar_number,
    //             add_1: req.body.add_1,
    //             add_2: req.body.add_2,
    //             city: req.body.city,
    //             state: req.body.state,
    //             country: req.body.country,
    //             pincode: req.body.pincode,
    //             photo: req.body.photo,
    //             bank_account_no: req.body.bank_account_no,
    //             bank_name: req.body.bank_name,
    //             ifsc_code: req.body.ifsc_code,
    //         })
    //         // console.log(addUser);
    //         const email = req.body.personal_email


    //         const name = req.body.user_name
    //         const firstname = req.body.firstname

    //         const genrate_token = await addUser.genrateToken();

    //         const Useradd = await addUser.save();

    //         const id = Useradd._id
    //         await sendUserEmail(email, id, name, firstname)
    //         res.json("created done")
    //     }
    // } catch (e) {
    //     res.json("invalid")
    // }
}
apicountroller.existusername = async (req, res) => {
    try {
        const Existuser = await user.findOne({ user_name: req.body.user_name})
        if (Existuser) {
            res.json({status:true})
        } else {
            res.json({status:false})
        }
    } catch (e) {
        res.json("invalid")
    }
}
apicountroller.existpersonal_email = async (req, res) => {
    try {
        const Existuser = await user.findOne({ personal_email: req.body.personal_email })
        if (Existuser) {
            res.json({status:true})
        } else {
            res.json({status:false})
        }
    } catch (e) {
        res.json("invalid")
    }
}
apicountroller.getAddUser = async (req, res) => {

    sess = req.session;
    
    const user_id =req.user._id
    const  userid = await user.find({_id:user_id})
    const role_id =userid[0].role_id.toString()

    helper.checkPermission(role_id, 'Add Employee').then(async(rolePerm) => {
        if (rolePerm.status==true) {
            const role = await Role.find();
            const cities = await city.find();
            const countries = await country.find();
            const states = await state.find();
            const users = await user.find();
          
            res.json({ role, cities, countries, states, users })
        
        } else {
            res.json({status:false})
        }
       
    }).catch((error) => {
        res.status(403).send(error);
    });
  
  
    // sess = req.session;
    // const role = await Role.find();
    // const cities = await city.find();
    // const countries = await country.find();
    // const states = await state.find();
    // const users = await user.find();
  
    // res.json({ role, cities, countries, states, users })


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
        
            if (!isMatch) {
              

            } else {
                const newsave = await user.findByIdAndUpdate(_id, newpassword);
               
            }
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

};
apicountroller.activeuser = async (req, res) => {

    try {
        const _id = req.params.id;
        const userActive = {
            status: "Active",
            updated_at: Date(),
        }
        const updateEmployee = await user.findByIdAndUpdate(_id, userActive);
        res.json("now you are Active Employee")
      

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

apicountroller.employeelogin = async (req, res) => {

    try {
        const personal_email = req.body.personal_email;
        const password = req.body.password;
        const users = await user.findOne({ personal_email: personal_email });
        if (!users) {
            res.json({ emailError: "Invalid email"  })
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
        console.log("isMatch",isMatch);

            if (isMatch) {
                const token = jwt.sign({ _id: userData[0]._id }, process.env.JWT_SECRET, {
                    expiresIn: "1d"                             
                });
                users.token = token;

                const man = await user.findByIdAndUpdate(users._id, { token })

                res.json({ userData, token, login_status: "login success" })
            }
            else {
                res.json({ passwordError: "Incorrect password"  })

            }
           
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
    const user_id =req.user._id
    const  userid = await user.find({_id:user_id})
    const role_id =userid[0].role_id.toString()

    helper.checkPermission(role_id, 'Add Project').then(async(rolePerm) => {
        if (rolePerm.status==true) {
            const UserData = await user.find({deleted_at: "null" });
            const TechnologyData = await technology.find({deleted_at: "null"} );
            res.json({ UserData, TechnologyData })
        } else {
            res.json({status:false})
        }
       
    }).catch((error) => {
        res.status(403).send(error);
    });
   
   
};
apicountroller.projectslisting = async (req, res) => {
    sess = req.session;
    
    const user_id =req.user._id
    const  userid = await user.find({_id:user_id})
    const role_id =userid[0].role_id.toString()

    helper.checkPermission(role_id, 'View Projects').then((rolePerm) => {
        if (rolePerm.status==true) {
            project
            .find({deleted_at: "null"})
            .then((Projects) => res.status(200).json({Projects}))
            .catch((error) => {
                res.status(400).send(error);
            });
        } else {
            res.json({status:false})
        }
       
    }).catch((error) => {
        res.status(403).send(error);
    });
    
   
}
apicountroller.projectsadd = async (req, res) => {
    sess = req.session;

    const user_id =req.user._id
    const  userid = await user.find({_id:user_id})
    const role_id =userid[0].role_id.toString()
    
    helper.checkPermission(role_id, 'Add Project').then((rolePerm) => {
    
           if (rolePerm.status==true) {
            project
               .create({
                        title: req.body.title,
                        short_description: req.body.short_description,
                        start_date: req.body.start_date,
                        end_date: req.body.end_date,
                        status: req.body.status,
                        technology: req.body.technology,
                        project_type: req.body.project_type,
                        user_id: req.body.user_id,
               })
               .then((Projects) => res.status(201).json(Projects))
               .catch((error) => {
                   console.log(error);
                   res.status(400).send(error);
               });
            
           } else {
                res.json({status:false})
            
           }
    }).catch((error) => {
        res.status(403).send(error);
    });
  
  
 
};

apicountroller.projectEdit = async (req, res) => {
 
    sess = req.session;
   
    const user_id =req.user._id
    const  userid = await user.find({_id:user_id})
    const role_id =userid[0].role_id.toString()

    helper.checkPermission(role_id, 'Update Project').then(async(rolePerm) => {
      if (rolePerm.status==true) {
            const _id = req.params.id;
            const ProjectData = await project.findById(_id);
            const UserData = await user.find();
            const technologyData = await technology.find();
            res.json({ ProjectData, UserData, technologyData })
      } else {
        res.json({status:false})
      }
    }).catch((error) => {
        res.status(403).send(error);
    });
 
 
};

apicountroller.projectUpdate = async (req, res) => {
   
    sess = req.session;
   
    const user_id =req.user._id
    const  userid = await user.find({_id:user_id})
    const role_id =userid[0].role_id.toString()
    
    helper.checkPermission(role_id, 'Update Project').then(async(rolePerm) => {
    
           if (rolePerm.status==true) {
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
                    const updateprojectdata = await project.findByIdAndUpdate(_id, updateProject);
                    res.end(JSON.stringify(updateProject));
            
           } else {
                res.json({status:false})
            
           }
    }).catch((error) => {
        res.status(403).send(error);
    });
   
  
}
apicountroller.projectdelete = async (req, res) => {

    sess = req.session;
   
    const user_id =req.user._id
    const  userid = await user.find({_id:user_id})
    const role_id =userid[0].role_id.toString()
    
    helper.checkPermission(role_id, 'Delete Project').then(async(rolePerm) => {
    
           if (rolePerm.status==true) {
            const _id = req.params.id;
            const deleteProject = {
                        deleted_at: Date()
                    }
                    await project.findByIdAndUpdate(_id, deleteProject);
                        res.json({ deleteProject })
            
           } else {
                res.json({status:false})
            
           }
    }).catch((error) => {
        res.status(403).send(error);
    });

}
apicountroller.permissionspage = async (req, res) => {
    sess = req.session;
    const user_id =req.user._id
    const  userid = await user.find({_id:user_id})
    const role_id =userid[0].role_id.toString()

    helper.checkPermission(role_id, 'Add Permission').then(async(rolePerm) => {
        if (rolePerm.status==true) {
           
            res.json({ status:"you can add permission" })
        } else {
            res.json({status:false})
        }
       
    }).catch((error) => {
        res.status(403).send(error);
    });
    
}
apicountroller.viewpermissions = async (req, res) => {
    sess = req.session;
    const user_id =req.user._id
    const  userid = await user.find({_id:user_id})
    const role_id =userid[0].role_id.toString()

    helper.checkPermission(role_id, 'View Permissions').then(async(rolePerm) => {
        if (rolePerm.status==true) {
            const permissionsData = await permission.find({ deleted_at: "null" });
            res.json({ permissionsData });
        } else {
            res.json({status:false})
        }
       
    }).catch((error) => {
        res.status(403).send(error);
    });
  
}
apicountroller.addpermissions = async (req, res) => {
    sess = req.session;
    const user_id =req.user._id
    const  userid = await user.find({_id:user_id})
    const role_id =userid[0].role_id.toString()

    helper.checkPermission(role_id, 'Add Permission').then(async(rolePerm) => {
        if (rolePerm.status==true) {
            const newpermissions = new permission({
                        permission_name: req.body.permission_name,
                        permission_description: req.body.permission_description
                    });
            
                    const permissionsadd = await newpermissions.save();
                    res.json({ permissionsadd })           
        } else {
            res.json({status:false})
        }
       
    }).catch((error) => {
        res.status(403).send(error);
    });
   

}
apicountroller.editpermissions = async (req, res) => {
    sess = req.session;
    const user_id =req.user._id
    const  userid = await user.find({_id:user_id})
    const role_id =userid[0].role_id.toString()

    helper.checkPermission(role_id, 'Edit Permission').then(async(rolePerm) => {
        if (rolePerm.status==true) {
            const _id = req.params.id;
            const permissionData = await permission.findById(_id);
            res.json({ permissionData })
        } else {
            res.json({status:false})
        }
       
    }).catch((error) => {
        res.status(403).send(error);
    });
 
  
}
apicountroller.permissionsUpdate = async (req, res) => {
    sess = req.session;
    const user_id =req.user._id
    const  userid = await user.find({_id:user_id})
    const role_id =userid[0].role_id.toString()

    helper.checkPermission(role_id, 'Update Permission').then(async(rolePerm) => {
        if (rolePerm.status==true) {
            const permissions = {
                        permission_name: req.body.permission_name,
                        permission_description: req.body.permission_description,
                        updated_at: Date(),
                    }
                    const updatepermission = await permission.findByIdAndUpdate(_id, permissions);
                    res.end(JSON.stringify(permissions));
        } else {
            res.json({status:false})
        }
       
    }).catch((error) => {
        res.status(403).send(error);
    });
   
}
apicountroller.permissionsdelete = async (req, res) => {
    sess = req.session;
    const user_id =req.user._id
    const  userid = await user.find({_id:user_id})
    const role_id =userid[0].role_id.toString()

    helper.checkPermission(role_id, 'Edit Permission').then(async(rolePerm) => {
        if (rolePerm.status==true) {
            const _id = req.params.id;
            const permissionDelete = {
                        deleted_at: Date(),
                    }
                    await permission.findByIdAndUpdate(_id, permissionDelete);
                    res.json("data deleted")
        } else {
            res.json({status:false})
        }
       
    }).catch((error) => {
        res.status(403).send(error);
    });
   
}
apicountroller.Roleadd = async (req, res) => {

    sess = req.session;
    
    const user_id =req.user._id
    const  userid = await user.find({_id:user_id})
    const role_id =userid[0].role_id.toString()

    helper.checkPermission(role_id, 'Add Role').then(async(rolePerm) => {
        if (rolePerm.status==true) {
            const addRole = new Role({
                        role_name: req.body.role_name,
                        role_description: req.body.role_description,
                    });
                    const Roleadd = await addRole.save();
                    res.status(201).send("role add done");
        } else {
            res.json({status:false})
        }
       
    }).catch((error) => {
        res.status(403).send(error);
    });
   
  

}
apicountroller.roles = async (req, res) => {
    sess = req.session;
    const user_id =req.user._id
    const  userid = await user.find({_id:user_id})
    const role_id =userid[0].role_id.toString()

    helper.checkPermission(role_id, 'View Roles').then(async(rolePerm) => {
        if (rolePerm.status==true) {
            const roleData = await Role.find({ deleted_at: "null" });
            res.json({ roleData });
           
        } else {
            res.json({status:false})
        }
       
    }).catch((error) => {
        res.status(403).send(error);
    });
   
 

};
apicountroller.Roleedit = async (req, res) => {
    sess = req.session;
    
    const user_id =req.user._id
    const  userid = await user.find({_id:user_id})
    const role_id =userid[0].role_id.toString()

    helper.checkPermission(role_id, 'Update Role').then(async(rolePerm) => {
        if (rolePerm.status==true) {
        const _id = req.params.id;
        const roleData = await Role.findById(_id);
        res.json({ roleData });
        } else {
            res.json({status:false})
        }
       
    }).catch((error) => {
        res.status(403).send(error);
    });
  
   
}
apicountroller.Roleupdate = async (req, res) => {
    sess = req.session;
    
    const user_id =req.user._id
    const  userid = await user.find({_id:user_id})
    const role_id =userid[0].role_id.toString()

    helper.checkPermission(role_id, 'Edit Role').then(async(rolePerm) => {
        if (rolePerm.status==true) {
                const _id = req.params.id;
                const role = {
                    role_name: req.body.role_name,
                    role_description: req.body.role_description,
                    permission_name: req.body.permission_name,
                    updated_at: Date(),
                }
        
                const updateEmployee = await Role.findByIdAndUpdate(_id, role);
                res.json("roles updeted done");
        } else {
            res.json({status:false})
        }
       
    }).catch((error) => {
        res.status(403).send(error);
    });
 

}

apicountroller.Roledelete = async (req, res) => {
    sess = req.session;
    
    const user_id =req.user._id
    const  userid = await user.find({_id:user_id})
    const role_id =userid[0].role_id.toString()

    helper.checkPermission(role_id, 'View Projects').then(async(rolePerm) => {
        if (rolePerm.status==true) {
            const _id = req.params.id;
            var alreadyRole = await user.find({ role_id: _id })
            var data = (alreadyRole.toString().includes(_id))
        
            if (data == true) {
             
            } else {
                const deleteRole = {
                    deleted_at: Date(),
                }
                const deteledata = await Role.findByIdAndUpdate(_id, deleteRole);
                res.json({ deteledata })
            }
        } else {
            res.json({status:false})
        }
       
    }).catch((error) => {
        res.status(403).send(error);
    });
   
    // const _id = req.params.id;
    // var alreadyRole = await user.find({ role_id: _id })
    // var data = (alreadyRole.toString().includes(_id))

    // if (data == true) {
     
    // } else {
    //     const deleteRole = {
    //         deleted_at: Date(),
    //     }
    //     const deteledata = await Role.findByIdAndUpdate(_id, deleteRole);
    //     res.json({ deteledata })
    // }
}

apicountroller.getAddTask = async (req, res,) => {
    sess = req.session;
   
    const user_id =req.user._id
    const  userid = await user.find({_id:user_id})
    const role_id =userid[0].role_id.toString()

    helper.checkPermission(role_id, 'Add Task').then(async(rolePerm) => {
        const user_id = req.user._id
        if (rolePerm.status==true) {
            const projectData = await project.find({ user_id: user_id ,deleted_at: "null"  });
            res.json({ projectData })
        } else {
            res.json({status:false})
        }
       
    }).catch((error) => {
        res.status(403).send(error);
    });
   
    // const user_id = req.body.user_id
   
    // try {

    //     const projectData = await project.find({ user_id: user_id ,deleted_at: "null"  });
    //     res.json({ projectData })

    // } catch (err) {
    //     res.status(500).json({ error: err.message });
    // }
}


apicountroller.taskadd = async (req, res) => {
    sess = req.session;

    const user_id =req.user._id
    const  userid = await user.find({_id:user_id})
    const role_id =userid[0].role_id.toString()
    
    helper.checkPermission(role_id, 'Add Task').then((rolePerm) => {
    
           if (rolePerm.status==true) {
            project
               .create({
                        project_id: req.body.project_id,
                        user_id: req.body.user_id,
                        title: req.body.title,
                        short_description: req.body.short_description,
               })
               .then((Tasks) => res.status(201).json(Tasks))
               .catch((error) => {
                   console.log(error);
                   res.status(400).send(error);
               });
            
           } else {
                res.json({status:false})
            
           }
    }).catch((error) => {
        res.status(403).send(error);
    });
   
   
    // try {
    //     const addTask = new task({
    //         project_id: req.body.project_id,
    //         user_id: req.body.user_id,
    //         title: req.body.title,
    //         short_description: req.body.short_description,

    //     });
    //     const Tasktadd = await addTask.save();
    //     res.json("task created done")

    // } catch (e) {
    //     res.status(400).send(e);
    // }
}
apicountroller.listTasks = async (req, res) => {

    sess = req.session;
    
    const user_id =req.user._id
    const  userid = await user.find({_id:user_id})
    const role_id =userid[0].role_id.toString()

    helper.checkPermission(role_id, 'View Tasks').then(async(rolePerm) => {
        if (rolePerm.status==true) {
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
        } else {
            res.json({status:false})
        }
       
    }).catch((error) => {
        res.status(403).send(error);
    });
    
 

};
apicountroller.taskedit = async (req, res) => {
    sess = req.session;
   
    sess = req.session;
   
    const user_id =req.user._id
    const  userid = await user.find({_id:user_id})
    const role_id =userid[0].role_id.toString()

    helper.checkPermission(role_id, 'Update Task').then(async(rolePerm) => {
      if (rolePerm.status==true) {
        const projectData = await project.find({deleted_at: "null"});
        const _id = new BSON.ObjectId(req.params.id);
        console.log("task id",_id);
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
      } else {
        res.json({status:false})
      }
    }).catch((error) => {
        res.status(403).send(error);
    });
   
}
apicountroller.taskupdate = async (req, res) => {
  
    sess = req.session;
   
    const user_id =req.user._id
    const  userid = await user.find({_id:user_id})
    const role_id =userid[0].role_id.toString()
    
    helper.checkPermission(role_id, 'Update Task').then(async(rolePerm) => {
    
           if (rolePerm.status==true) {
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
            
           } else {
                res.json({status:false})
            
           }
    }).catch((error) => {
        res.status(403).send(error);
    });

}
apicountroller.taskdelete = async (req, res) => {
    sess = req.session;
   
    const user_id =req.user._id
    const  userid = await user.find({_id:user_id})
    const role_id =userid[0].role_id.toString()
    
    helper.checkPermission(role_id, 'Delete Task').then(async(rolePerm) => {
    
           if (rolePerm.status==true) {
            const _id = req.params.id;
            const deleteTask = {
                        deleted_at: Date()
                    }
                    await task.findByIdAndUpdate(_id, deleteTask);
                    res.json("task deleted")
            
           } else {
                res.json({status:false})
            
           }
    }).catch((error) => {
        res.status(403).send(error);
    });
   
  
}
apicountroller.listuser = async (req, res) => {
    sess = req.session;
    
    const user_id =req.user._id
    const  userid = await user.find({_id:user_id})
    const role_id =userid[0].role_id.toString()

    helper.checkPermission(role_id, 'View Employees').then(async(rolePerm) => {
        if (rolePerm.status==true) {
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
        } else {
            res.json({status:false})
        }
       
    }).catch((error) => {
        res.status(403).send(error);
    });
   

};

apicountroller.userDetail = async (req, res) => {
    sess = req.session;
    
    const user_id =req.user._id
    const  userid = await user.find({_id:user_id})
    const role_id =userid[0].role_id.toString()

    helper.checkPermission(role_id, 'View Employees Details').then(async(rolePerm) => {
        if (rolePerm.status==true) {
            const _id = req.params.id;
            const userData = await user.findById(_id);
                res.json({
                    data: userData, name: sess.name, username: sess.username, users: sess.userData, role: sess.role, layout: false
                });
        } else {
            res.json({status:false})
        }
       
    }).catch((error) => {
        res.status(403).send(error);
    });
   
  



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
    
    const user_id =req.user._id
    const  userid = await user.find({_id:user_id})
    const role_id =userid[0].role_id.toString()

    helper.checkPermission(role_id, 'Update Employee').then(async(rolePerm) => {
        if (rolePerm.status==true) {
              const _id = req.params.id;
                const role = await Role.find();
                const userData = await user.findById(_id);
                const users = await user.find();
                const cities = await city.find();
                const countries = await country.find();
                const states = await state.find();
        
                res.json({ role, userData, users, cities, countries, states })
        } else {
            res.json({status:false})
        }
       
    }).catch((error) => {
        res.status(403).send(error);
    });
  
};

apicountroller.UpdateUser = async (req, res) => {
   
    sess = req.session;
    
    const user_id =req.user._id
    const  userid = await user.find({_id:user_id})
    const role_id =userid[0].role_id.toString()

    helper.checkPermission(role_id, 'Update Employee').then(async(rolePerm) => {
        if (rolePerm.status==true) {
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
            res.json({"status":updateUser});
        
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
            res.json({ "status":updateUser })
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }        
        } else {
            res.json({status:false})
        }
       
    }).catch((error) => {
        res.status(403).send(error);
    });
   

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
      
    }
}
apicountroller.deleteUser = async (req, res) => {
    sess = req.session;
    
    const user_id =req.user._id
    const  userid = await user.find({_id:user_id})
    const role_id =userid[0].role_id.toString()

    helper.checkPermission(role_id, 'Delete Employee').then(async(rolePerm) => {
        if (rolePerm.status==true) {
            const _id = req.params.id;
                const updateUser = {
                    deleted_at: Date(),
                };
                const updateEmployee = await user.findByIdAndUpdate(_id, updateUser);
               
                res.json({ status: "user deleted", updateUser })
        } else {
            res.json({status:false})
        }
       
    }).catch((error) => {
        res.status(403).send(error);
    });
   
   
}


apicountroller.sendforget = async (req, res) => {
    try {
      
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
    // console.log(users);
    if (!user) return res.status(400).send("invalid link or expired");
    const token = await emailtoken.findOne({
        userId: users._id,
        token: req.params.token,
    });
    if (!token) return res.status(400).send("Invalid link or expired"
    );
    console.log(token);
    if (!(password == cpassword)) {
        res.json({ success: "please check confirm password" });
    } else {
        const passswords = await bcrypt.hash(req.body.password, 10);
        const updatepassword = {
            password: passswords
        }
        const updatPssword = await user.findByIdAndUpdate(_id, updatepassword);

        await token.delete();
        res.json({ status: "password updated" });
    }
};
apicountroller.holidaylist = async (req, res) => {
     sess = req.session;
    const user_id =req.user._id
    const  userid = await user.find({_id:user_id})
    const role_id =userid[0].role_id.toString()

    helper.checkPermission(role_id, user_id,  'View Holidays').then((rolePerm) => {
        if (rolePerm.status==true) {
            Holiday
            .find({deleted_at: "null" })
            .then((holidayData) => res.status(200).json({holidayData}))
            .catch((error) => {
                res.status(400).send(error);
            });
        } else {
            res.json({status:false})
        }
        
    }).catch((error) => {
        res.status(403).send(error);
    });
    
  
};

apicountroller.getHoliday = async (req, res) => {
    sess = req.session;
    const user_id =req.user._id
    const  userid = await user.find({_id:user_id})
    const role_id =userid[0].role_id.toString()
    
    helper.checkPermission(role_id, 'Add Holiday').then((rolePerm) => {
    
           if (rolePerm.status==true) {
              res.json({status:true})
           } else {
                res.json({status:false})
            
           }
    }).catch((error) => {
        res.status(403).send(error);
    });
}

apicountroller.Holidayadd = async (req, res) => {
    sess = req.session;
   
    const user_id =req.user._id
    const  userid = await user.find({_id:user_id})
    const role_id =userid[0].role_id.toString()
    
    helper.checkPermission(role_id, 'Add Holiday').then((rolePerm) => {
    
           if (rolePerm.status==true) {
               Holiday
               .create({
                   holiday_name: req.body.holiday_name,
                   holiday_date: req.body.holiday_date
               })
               .then((holiday) => res.status(201).send(holiday))
               .catch((error) => {
                   console.log(error);
                   res.status(400).send(error);
               });
            
           } else {
                res.json({status:false})
            
           }
    }).catch((error) => {
        res.status(403).send(error);
    });

  
}

apicountroller.Holidayedit = async (req, res) => {
    sess = req.session;
   
    const user_id =req.user._id
    const  userid = await user.find({_id:user_id})
    const role_id =userid[0].role_id.toString()

    helper.checkPermission(role_id, 'Update Holiday').then(async(rolePerm) => {
      if (rolePerm.status==true) {
        const _id = req.params.id;
            const holidayData = await Holiday.findById(_id);
            res.json({ holidayData })
      } else {
        res.json({status:false})
      }
    }).catch((error) => {
        res.status(403).send(error);
    });


}

apicountroller.Holidayupdate = async (req, res) => {
 
    sess = req.session;
   
    const user_id =req.user._id
    const  userid = await user.find({_id:user_id})
    const role_id =userid[0].role_id.toString()
    
    helper.checkPermission(role_id, 'Update Holiday').then(async(rolePerm) => {
    
           if (rolePerm.status==true) {
            const _id = req.params.id;
            const updateHoliday = {
                        holiday_name: req.body.holiday_name,
                        holiday_date: req.body.holiday_date,
                        updated_at: Date(),
                    }
                    const updateHolidaydata = await Holiday.findByIdAndUpdate(_id, updateHoliday);
                        res.json({ updateHolidaydata })
            
           } else {
                res.json({status:false})
            
           }
    }).catch((error) => {
        res.status(403).send(error);
    });
 
}
apicountroller.deleteHoliday = async (req, res) => {
 
    sess = req.session;
   
    const user_id =req.user._id
    const  userid = await user.find({_id:user_id})
    const role_id =userid[0].role_id.toString()
    
    helper.checkPermission(role_id, 'Delete Holiday').then(async(rolePerm) => {
    
           if (rolePerm.status==true) {
            const _id = req.params.id;
            const deleteHoliday = {
                        deleted_at: Date(),
                    }
                    const deleteHolidaydata = await Holiday.findByIdAndUpdate(_id, deleteHoliday);
                        res.json({ deleteHolidaydata })
            
           } else {
                res.json({status:false})
            
           }
    }).catch((error) => {
        res.status(403).send(error);
    });
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
    sess = req.session;
    const user_id =req.user._id
    const  userid = await user.find({_id:user_id})
    const role_id =userid[0].role_id.toString()

    helper.checkPermission(role_id, 'View Leaves').then(async(rolePerm) => {
        if (rolePerm.status==true) {
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
        } else {
            res.json({status:false})
        }
       
    }).catch((error) => {
        res.status(403).send(error);
    });
  
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
        const user_id = req.body.user_id

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
        const projectData = await project.find({ user_id: user_id });
        // res.json({ projectData })

        res.json({ timeEntryData,projectData })
    } catch (e) {
        res.status(400).send(e);
    }

}
apicountroller.getRolePermission = async (req, res) => {
  
    sess = req.session;
    const user_id =req.user._id
    const  userid = await user.find({_id:user_id})
    const role_id =userid[0].role_id.toString()

    helper.checkPermission(role_id, 'Add Role Permission').then(async(rolePerm) => {
        if (rolePerm.status==true) {
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
        } else {
            res.json({status:false})
        }
       
    }).catch((error) => {
        res.status(403).send(error);
    });
  
};
apicountroller.addRolePermission = async (req, res) => {
    sess = req.session;
    const user_id =req.user._id
    const  userid = await user.find({_id:user_id})
    const role_id =userid[0].role_id.toString()

    helper.checkPermission(role_id, 'View Leaves').then(async(rolePerm) => {
        if (rolePerm.status==true) {
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
        } else {
            res.json({status:false})
        }
       
    }).catch((error) => {
        res.status(403).send(error);
    });
  
};
apicountroller.getUserPermission = async (req, res) => {
   
    sess = req.session;
    const user_id =req.user._id
    const  userid = await user.find({_id:user_id})
    const role_id =userid[0].role_id.toString()

    helper.checkPermission(role_id, 'Add User Permission').then(async(rolePerm) => {
        if (rolePerm.status==true) {
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
            const permission = await Permission.find();
        
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
            
            res.json({ permission, roledatas, roleData, permissions, roleId, roles }) 
        } else {
            res.json({status:false})
        }
       
    }).catch((error) => {
        res.status(403).send(error);
    });


};

apicountroller.addUserPermission = async (req, res) => {

    sess = req.session;
    const user_id =req.user._id
    const  userid = await user.find({_id:user_id})
    const role_id =userid[0].role_id.toString()

    helper.checkPermission(role_id, 'Add User Permission').then(async(rolePerm) => {
        if (rolePerm.status==true) {
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
        } else {
            res.json({status:false})
        }
       
    }).catch((error) => {
        res.status(403).send(error);
    });
   

};

apicountroller.Announcementslist = async (req, res) => {
    sess = req.session;
    try {
        const AnnouncementData = await Announcement.find({ deleted_at: "null" });
        res.json({ AnnouncementData })
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
apicountroller.Announcementsadd = async (req, res) => {
    
    try {
        const addAnnouncement = new Announcement({
            announcement_title: req.body.announcement_title,
            announcement_description: req.body.announcement_description,
            announcement_date: req.body.announcement_date
        });
        const Announcementadd = await addAnnouncement.save();
        res.json({"Announcement add done ":addAnnouncement})

    } catch (e) {
        res.status(400).send(e);
    }
}
apicountroller.AnnouncementsEdit = async (req, res) => {
    try {
        sess = req.session
        const _id = req.params.id;
        const AnnouncementsData = await Announcement.findById(_id);
        res.json({ AnnouncementsData })
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
apicountroller.AnnouncementsUpdate = async (req, res) => {
    try {
        const _id = req.params.id;
        const updateAnnouncement = {
            announcement_title: req.body.announcement_title,
            announcement_description: req.body.announcement_description,
            announcement_date: req.body.announcement_date,
            updated_at: Date(),
        }
        const updatedAnnouncement = await Announcement.findByIdAndUpdate(_id, updateAnnouncement);
        res.json({ updatedAnnouncement })
      
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

}
apicountroller.Announcementsdelete = async (req, res) => {
    try {
        const _id = req.params.id;
        const deleteAnnouncement = {
            deleted_at: Date(),
        };
        const deletedAnnouncement = await Announcement.findByIdAndUpdate(_id, deleteAnnouncement);
        res.json({ delete:deletedAnnouncement })
    } catch (e) {
        res.status(400).send(e);
    }
}


apicountroller.Settingslist = async (req, res) => {
    sess = req.session;
    try {
        const Setting = await Settings.find({ deleted_at: "null" });
        res.json({ Setting })
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
apicountroller.Settingsadd = async (req, res) => {
    
    try {
        const addSettings = new Settings({
            settings_key: req.body.settings_key,
            settings_type: req.body.settings_type,
            settings_value: req.body.settings_value
        });
        const Settingsadd = await addSettings.save();
        res.json({"Settings add done":addSettings})

    } catch (e) {
        res.status(400).send(e);
    }
}
apicountroller.SettingsEdit = async (req, res) => {
    try {
        sess = req.session
        const _id = req.params.id;
        const SettingsData = await Settings.findById(_id);
        res.json({ SettingsData })
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
apicountroller.SettingsUpdate = async (req, res) => {
    try {
        const _id = req.params.id;
        const updatedSettings = {
            settings_key: req.body.settings_key,
            settings_type: req.body.settings_type,
            settings_value: req.body.settings_value,
            updated_at: Date(),
        }
        const updatedSetting = await Settings.findByIdAndUpdate(_id, updatedSettings);
        res.json({ updatedSetting })
      
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

}
apicountroller.SettingsDelete = async (req, res) => {
    try {
        const _id = req.params.id;
        const deleteSettings = {
            deleted_at: Date(),
        };
        const deletedSetting = await Settings.findByIdAndUpdate(_id, deleteSettings);
        res.json({ delete:deletedSetting })
    } catch (e) {
        res.status(400).send(e);
    }
}






apicountroller.permissionwise = async (req, res) => {
    // console.log("hey");

    try {
        const personal_email = req.body.personal_email;
        const password = req.body.password;
        const users = await user.findOne({ personal_email: personal_email });
        if (!users) {
            res.json({ emailError: "Invalid email"  })
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
            const roleid = userData[0].role_id.toString()
            
            console.log("roledata",rolePermissionsdata._id.toString());
            const roledata = await Role.findById({_id:roleid})
            const roleiddata =roledata._id 
            console.log("roleid",roleiddata);
            
            const rolePermissionsdata = await rolePermissions.find({role_id:roleiddata})

            // console.log("rolePermissionsdata",rolePermissionsdata);




            const permissionid = rolePermissionsdata[0].permission_id
            console.log("permissionid",permissionid);

            const permissiondala = await Permission.find({_id:permissionid})
            console.log("permisoin",permissiondala);


 
            const isMatch = await bcrypt.compare(password, userData[0].password);

            if (isMatch) {
                const token = jwt.sign({ _id: userData[0]._id }, process.env.JWT_SECRET, {
                    expiresIn: "1d"                             
                });
                users.token = token;

                const man = await user.findByIdAndUpdate(users._id, { token })

                res.json({permissiondala})
            }
            else {
                res.json({ passwordError: "Incorrect password"  })

            }
           
        }
    } catch (e) {

    }
};

module.exports = apicountroller
