const project = require("../../model/createProject");
const permission = require("../../model/addpermissions");
const Role = require("../../model/roles");
const task = require("../../model/createTask");
const user = require("../../model/user");
const technology = require("../../model/technology");
const country = require("../../model/city");
// const city = require("../../model/country");
const holiday = require("../../model/holiday");
// const state = require("../../model/state");
const session = require("express-session");
const express = require("express");
const ejs = require("ejs");
const crypto = require("crypto");
const Holiday = require("../../model/holiday");
const Announcement = require("../../model/Announcement");
const Settings = require("../../model/settings");
const Leaves = require("../../model/leaves");
const timeEntry = require("../../model/timeEntries");
const Permission = require("../../model/addpermissions");
const emailtoken = require("../../model/token");


const rolePermissions = require("../../model/rolePermission");
const userPermissions = require("../../model/userPermission");
const leaves = require("../../model/leaves");
const jwt = require("jsonwebtoken");
const sendEmail = require("../../utils/send_forget_mail");
const BSON = require("bson");
const sendUserEmail = require("../../utils/sendemail");
const Helper = require("../../utils/helper");
const helper = new Helper();
const bcrypt = require("bcryptjs");
const { log } = require("console");
const { find } = require("../../model/createProject");
const { login } = require("../../controller/userController");
// const { join } = require("path");
const path = require("path");


const apicontroller = {};



apicontroller.useradd = async (req, res) => {
  sess = req.session;

  const user_id = req.user._id;

  const role_id = req.user.role_id.toString();

  helper
    .checkPermission(role_id, user_id, "Add Employee")
    .then(async (rolePerm) => {
      if (rolePerm.status == true) {
        const emailExist = await user.findOne({
          personal_email: req.body.personal_email,
        });
        if (emailExist) {
          res.json("email already exist");
        } else {
          const addUser = new user({
            role_id: req.body.role_id,
            emp_code: `${"CC-" + req.body.emp_code}`,
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
          });
          const email = req.body.personal_email;
          const name = req.body.user_name;
          const firstname = req.body.firstname;

          const genrate_token = await addUser.genrateToken();

          const Useradd = await addUser.save();

          const id = Useradd._id;
          await sendUserEmail(email, id, name, firstname);
          res.json("created done");
        }
      } else {
        res.json({ status: false });
      }
    })
    .catch((error) => {
      res.status(403).send(error);
    });
};
apicontroller.existusername = async (req, res) => {
  try {
    const Existuser = await user.findOne({ user_name: req.body.user_name });
    if (Existuser) {
      res.json({ status: true });
    } else {
      res.json({ status: false });
    }
  } catch (e) {
    res.json("invalid");
  }
};
apicontroller.existpersonal_email = async (req, res) => {
  try {
    const Existuser = await user.findOne({
      personal_email: req.body.personal_email,
    });
    if (Existuser) {
      res.json({ status: true });
    } else {
      res.json({ status: false });
    }
  } catch (e) {
    res.json("invalid");
  }
};
apicontroller.getAddUser = async (req, res) => {
  sess = req.session;

  const user_id = req.user._id;

  const role_id = req.user.role_id.toString();

  helper
    .checkPermission(role_id, user_id, "Add Employee")
    .then(async (rolePerm) => {
      if (rolePerm.status == true) {
        const role = await Role.find();
        const cities = await city.find();
        const countries = await country.find();
        const states = await state.find();
        const users = await user.find();

        res.json({ role, cities, countries, states, users });
      } else {
        res.json({ status: false });
      }
    })
    .catch((error) => {
      res.status(403).send(error);
    });
};
apicontroller.change_password = async (req, res) => {
  sess = req.session;
  try {
    const _id = req.params.id;
    const userData = await user.findById(_id);
    res.render("change_password", {
      userData: userData,
      loggeduserdata: req.user,
      users: sess.userData,
      role: sess.role,
      layout: false,
      alert: req.flash("alert"),
      success: req.flash("success"),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
apicontroller.save_password = async (req, res) => {
  sess = req.session;

  try {
    const _id = req.params.id;
    const oldpassword = req.body.oldpassword;
    const newPassword = req.body.newpassword;

    const bcryptpass = await bcrypt.hash(newPassword, 10);
    const newpassword = {
      password: bcryptpass,
      updated_at: Date(),
    };
    const userData = await user.findById({ _id: _id });
    const isMatch = await bcrypt.compare(oldpassword, userData.password);
    if (!isMatch) {
      res.json({ status: false, Messsage: "old password not match" });
    } else {
      const newsave = await user.findByIdAndUpdate(_id, newpassword);
      res.json({ status: true, Messsage: "Passsowrd Updated successfully" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
apicontroller.activeuser = async (req, res) => {
  try {
    const _id = req.params.id;
    const userActive = {
      status: "Active",
      updated_at: Date(),
    };
    const updateEmployee = await user.findByIdAndUpdate(_id, userActive);
    res.json("now you are Active Employee");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
apicontroller.checkLoginEmail = async (req, res) => {
  try {
    const company_email = req.body.company_email;
      const users = await user.findOne({ company_email: company_email });
    if (!users) {
      res.json({ emailError: "Invalid email" });
    } else {
    res.json({ emailStatus:"valid email" });
    }
  
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
apicontroller.checkLoginPassword = async (req, res) => {
  try {
    const company_email = req.body.company_email;
    const password = req.body.password;
      const userData = await user.aggregate([
        { $match: { deleted_at: "null" } },
        { $match: { company_email: company_email } },
        { $addFields: { roleId: { $toObjectId: "$role_id" } } },
        {
          $lookup: {
            from: "roles",
            localField: "roleId",
            foreignField: "_id",
            as: "roleData",
          },
        },
      ]);
    console.log("userData",userData);
   
     const isMatch = await bcrypt.compare(password, userData[0].password);
    if (!isMatch) {
      res.json({ passwordError: "Invalid password" });
    } else {
    res.json({ passwordStatus:"valid password" });
    }

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
apicontroller.employeelogin = async (req, res) => {
  try {
    const company_email = req.body.company_email;
    const password = req.body.password;
    const users = await user.findOne({ company_email: company_email });
    if (!users) {
      res.json({ emailError: "Invalid email" });
    } else {
      const userData = await user.aggregate([
        { $match: { deleted_at: "null" } },
        { $match: { company_email: company_email } },
        { $addFields: { roleId: { $toObjectId: "$role_id" } } },
        {
          $lookup: {
            from: "roles",
            localField: "roleId",
            foreignField: "_id",
            as: "roleData",
          },
        },
      ]);
      const isMatch = await bcrypt.compare(password, userData[0].password);
      if (isMatch) {
        const token = jwt.sign(
          { _id: userData[0]._id },
          process.env.JWT_SECRET,
          {
            expiresIn: "1d",
          }
        );
        users.token = token;
        var status = userData[0].status
        console.log(status);
        const man = await user.findByIdAndUpdate(users._id, { token });

        if (status != "Active") {
          res.json({activeError: "please Active Your Account"})
        } else {
          res.json({ userData, token, login_status: "login success",status });
          
        }

      } else {
        res.json({ passwordError: "Incorrect password" });
      }
    }
  } catch (e) {}
};
apicontroller.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return console.log(err);
    }
    res.clearCookie(options.name);
    res.json("logout succuss");
  });
};
apicontroller.getProject = async (req, res) => {
  sess = req.session;
  const user_id = req.user._id;

  const role_id = req.user.role_id.toString();
  helper
    .checkPermission(role_id, user_id, "Add Project")
    .then(async (rolePerm) => {
      if (rolePerm.status == true) {
        const UserData = await user.find({ deleted_at: "null" });

        var userName = [];
        UserData.forEach(function (element) {
          userName.push({
            value: element._id,
            label: element.firstname,
          });
        });
      

        const TechnologyData = await technology.find();
        var technologyname = [];
        TechnologyData.forEach(function (element) {
          technologyname.push({
            value: element.technology,
            label: element.technology,
          });
        });
  

        res.json({ UserData, TechnologyData, technologyname, userName });
      } else {
        res.json({ status: false });
      }
    })
    .catch((error) => {
      res.status(403).send(error);
    });
};
apicontroller.projectslisting = async (req, res) => {
  sess = req.session;

  const user_id = new BSON.ObjectId(req.user._id);

  const role_id = req.user.role_id.toString();

  helper
    .checkPermission(role_id, user_id, "View Projects")
    .then(async (rolePerm) => {
      if (rolePerm.status == true) {
        const projectData = await project.aggregate([
          { $match: { deleted_at: "null" } },
          { $match: { user_id: user_id } },
          {
            $lookup: {
              from: "users",
              localField: "user_id",
              foreignField: "_id",
              as: "user",
            },
          },
        ]);

        const adminProjectData = await project.aggregate([
          { $match: { deleted_at: "null" } },
          {
            $lookup: {
              from: "users",
              localField: "user_id",
              foreignField: "_id",
              as: "user",
            },
          },
        ]);
        res.json({ projectData, adminProjectData });
      } else {
        res.json({ status: false });
      }
    })
    .catch((error) => {
      res.status(403).send(error);
    });
};

apicontroller.projectHashTask = async (req, res) => {
  sess = req.session;

  const user_id = new BSON.ObjectId(req.user._id);

  const role_id = req.user.role_id.toString();

  helper
    .checkPermission(role_id, user_id, "View Projects")
    .then(async (rolePerm) => {
      if (rolePerm.status == true) {
      const projectHashTask = await project.aggregate([
       {
         $match: {
           deleted_at: "null"
         },
       
       },
     
      {
        $lookup: {
          from: "tasks",
          localField: "_id",
          foreignField: "project_id",
          as: "taskData",
        },
        },
       {
            $lookup: {
              from: "users",
              localField: "user_id",
              foreignField: "_id",
              as: "user",
            },
          },
      ]);
        console.log(projectHashTask);
        res.json({projectHashTask})
      } else {
        res.json({ status: false });
      }
    })
    .catch((error) => {
      res.status(403).send(error);
    });
};
apicontroller.projectsadd = async (req, res) => {
  sess = req.session;
  const user_id = req.user._id;

  const role_id = req.user.role_id.toString();
  helper
    .checkPermission(role_id, user_id, "Add Project")
    .then((rolePerm) => {
      if (rolePerm.status == true) {
       
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
        res.json({ status: false });
      }
    })
    .catch((error) => {
      res.status(403).send(error);
    });
};
apicontroller.projectEdit = async (req, res) => {
  sess = req.session;
  const user_id = req.user._id;

  const role_id = req.user.role_id.toString();

  helper
    .checkPermission(role_id, user_id, "Update Project")
    .then(async (rolePerm) => {
      if (rolePerm.status == true) {
        const _id = req.params.id;

        const ProjectData = await project.findById(_id);

        // const saddamProjectData = [ProjectData];
        // const UserData = await user.find(_id);

        const existuserData = await user.find({
          _id: { $in: ProjectData.user_id },
        });

        const existTechnologyData = await technology.find({
          technology: { $in: ProjectData.technology },
        });
        // const TechnologyData = await technology.find();
        const TechnologyData = await technology.find();

        var technologyname = [];
        TechnologyData.forEach(function (element) {
          technologyname.push({
            value: element.technology,
            label: element.technology,
          });
        });
        var existTechnologyname = [];
        existTechnologyData.forEach(function (element) {
          existTechnologyname.push({
            value: element.technology,
            label: element.technology,
          });
        });

        const UserData = await user.find();
        var userName = [];
        UserData.forEach(function (element) {
          userName.push({
            value: element._id,
            label: element.firstname,
          });
        });
      
        var existUserName = [];
        existuserData.forEach(function (element) {
          existUserName.push({
            value: element._id,
            label: element.firstname,
          });
        });
      

        res.json({
          ProjectData,
          existuserData,
          technologyname,
          existTechnologyname,
          userName,
          existUserName,
          UserData,
          TechnologyData,
        });
      } else {
        res.json({ status: false });
      }
    })
    .catch((error) => {
      res.status(403).send(error);
    });
};
apicontroller.projectUpdate = async (req, res) => {
  sess = req.session;
  const user_id = req.user._id;

  const role_id = req.user.role_id.toString();
  helper
    .checkPermission(role_id, user_id, "Update Project")
    .then(async (rolePerm) => {
      if (rolePerm.status == true) {
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
        };
        const updateprojectdata = await project.findByIdAndUpdate(
          _id,
          updateProject
        );
        res.json("Project Updated");
      } else {
        res.json({ status: false });
      }
    })
    .catch((error) => {
      res.status(403).send(error);
    });
};
apicontroller.projectdelete = async (req, res) => {
  sess = req.session;

  const user_id = req.user._id;

  const role_id = req.user.role_id.toString();

  helper
    .checkPermission(role_id, user_id, "Delete Project")
    .then(async (rolePerm) => {
      if (rolePerm.status == true) {
        const _id = req.params.id;
        const deleteProject = {
          deleted_at: Date(),
        };
        await project.findByIdAndUpdate(_id, deleteProject);
        res.json({ deleteProject });
      } else {
        res.json({ status: false });
      }
    })
    .catch((error) => {
      res.status(403).send(error);
    });
};
apicontroller.permissionspage = async (req, res) => {
  sess = req.session;
  const user_id = req.user._id;

  const role_id = req.user.role_id.toString();

  helper
    .checkPermission(role_id, user_id, "Add Permission")
    .then(async (rolePerm) => {
      if (rolePerm.status == true) {
        res.json({ status: "you can add permission" });
      } else {
        res.json({ status: false });
      }
    })
    .catch((error) => {
      res.status(403).send(error);
    });
};
apicontroller.viewpermissions = async (req, res) => {
  sess = req.session;
  const user_id = req.user._id;

  const role_id = req.user.role_id.toString();

  helper
    .checkPermission(role_id, user_id, "View Permissions")
    .then(async (rolePerm) => {
      if (rolePerm.status == true) {
        const permissionsData = await permission.find({ deleted_at: "null" });
        res.json({ permissionsData });
      } else {
        res.json({ status: false });
      }
    })
    .catch((error) => {
      res.status(403).send(error);
    });
};
apicontroller.searchPermissions = async (req, res) => {
  sess = req.session;



  const searchData = await permission.find({
    permission_name: {
      $regex: req.params.searchValue,
      $options: "i",
    },
  });

  res.json({ searchData });
};
apicontroller.searchUserPermissions = async (req, res) => {
  sess = req.session;

  const searchData = await permission.find({
    permission_name: {
      $regex: req.params.searchValue,
      $options: "i",
    },
  });

  res.json({ searchData });
};
apicontroller.searchRolePermissions = async (req, res) => {
  sess = req.session;

  const searchData = await permission.find({
    permission_name: {
      $regex: req.params.searchValue,
      $options: "i",
    },
  });

  res.json({ searchData });
};


apicontroller.searchProject = async (req, res) => {
  sess = req.session;
  const searchValue = req.params.searchValue
  const searchData = await project.aggregate([
    {
    
    $match: {
      "title": {
        $regex: searchValue,
        $options: "i",
      }
      },
    // $match: {
    //   "status": {
    //     $regex: searchValue
    //   }
    // }
      },
    {
      $lookup:
         {
           from: "users",
           localField: "user_id",
           foreignField: "_id",
           as: "userData"
         }
    },
 
  ])
  // console.log("searchData",searchData.length)

  if (searchData.length > 0 && searchData !== 'undefined') {
    console.log("haa");
    res.json({ searchData });
  } else {
    console.log("naa");
     const searchData = await project.aggregate([

    {
      $lookup:
         {
           from: "users",
           localField: "user_id",
           foreignField: "_id",
           as: "userData"
         }
    },
   {
      $unwind: "$userData"
   },
   {
      $match: { "userData.firstname": { $regex:searchValue,  $regex: searchValue, } }
   }
     ])
    res.json({ searchData });

  }
 

};
apicontroller.searchUser = async (req, res) => {
  sess = req.session;
  const searchData = await user.find({
    $or: [
      {
        firstname: {
          $regex: req.params.searchValue,
          $options: "i",
        },
      },
      {
        user_name: {
          $regex: req.params.searchValue,
          $options: "i",
        },
      },
      {
        gender: {
          $regex: req.params.searchValue,
          $options: "i",
        },
      },
      // {
      //   personal_email: {
      //     $regex: req.params.searchValue,
      //     $options: "i",
      //   },
      // },
       {
        mo_number: {
          $regex: req.params.searchValue,
          $options: "i",
        },
      },
      // {
      //   dob: {
      //     $regex: req.params.searchValue,
      //     $options: "i",
      //   },
      // },
      // {
      //   doj: {
      //     $regex: req.params.searchValue,
      //     $options: "i",
      //   },
      // },
      // {
      //   aadhar_number: {
      //     $regex: req.params.searchValue,
      //     $options: "i",
      //   },
      // },
      {
        city: {
          $regex: req.params.searchValue,
          $options: "i",
        },
      },
    {
        state: {
          $regex: req.params.searchValue,
          $options: "i",
        },
      },
      {
        country: {
          $regex: req.params.searchValue,
          $options: "i",
        },
      },
      {
        pincode: {
          $regex: req.params.searchValue,
          $options: "i",
        },
      },
    ],
  });
  // console.log("data",searchData)
  res.json({ searchData });
};

apicontroller.searchHoliday = async (req, res) => {
  sess = req.session;



  const holidayData = await Holiday.find({
    $or: [
      {
        holiday_name: {
          $regex: req.params.searchValue,
          $options: "i",
        },
      },
    ],
  });
  res.json({ holidayData });
};
apicontroller.searchRole = async (req, res) => {
  sess = req.session;



  const roleData = await Role.find({
    role_name: {
      $regex: req.params.searchValue,
      $options: "i",
    },
  });
  res.json({ roleData });
};

apicontroller.addpermissions = async (req, res) => {
  sess = req.session;
  const user_id = req.user._id;

  const role_id = req.user.role_id.toString();

  helper
    .checkPermission(role_id, user_id, "Add Permission")
    .then(async (rolePerm) => {
      if (rolePerm.status == true) {
        const newpermissions = new permission({
          permission_name: req.body.permission_name,
          permission_description: req.body.permission_description,
        });

        const permissionsadd = await newpermissions.save();
        res.json({ permissionsadd });
      } else {
        res.json({ status: false });
      }
    })
    .catch((error) => {
      res.status(403).send(error);
    });
};
apicontroller.editpermissions = async (req, res) => {
  sess = req.session;
  const user_id = req.user._id;

  const role_id = req.user.role_id.toString();
  helper
    .checkPermission(role_id, user_id, "Update Permission")
    .then(async (rolePerm) => {
      if (rolePerm.status == true) {
        const _id = req.params.id;
        const permissionData = await permission.findById(_id);
        res.json({ permissionData });
      } else {
        res.json({ status: false });
      }
    })
    .catch((error) => {
      res.status(403).send(error);
    });
};
apicontroller.permissionsUpdate = async (req, res) => {
  sess = req.session;
  const user_id = req.user._id;
  const _id = req.params.id;

  const role_id = req.user.role_id.toString();

  helper
    .checkPermission(role_id, user_id, "Delete Permission")
    .then(async (rolePerm) => {
      if (rolePerm.status == true) {
        const permissions = {
          permission_name: req.body.permission_name,
          permission_description: req.body.permission_description,
          updated_at: Date(),
        };
        const updatepermission = await permission.findByIdAndUpdate(
          _id,
          permissions
        );
        res.json("permission Updated");
      } else {
        res.json({ status: false });
      }
    })
    .catch((error) => {
      res.status(403).send(error);
    });
};
apicontroller.permissionsdelete = async (req, res) => {
  sess = req.session;
  const user_id = req.user._id;

  const role_id = req.user.role_id.toString();
  helper
    .checkPermission(role_id, user_id, "Delete Permission")
    .then(async (rolePerm) => {
      if (rolePerm.status == true) {
        const _id = req.params.id;
        const permissionDelete = {
          deleted_at: Date(),
        };
        await permission.findByIdAndUpdate(_id, permissionDelete);
        res.json("data deleted");
      } else {
        res.json({ status: false });
      }
    })
    .catch((error) => {
      res.status(403).send(error);
    });
};
apicontroller.Roleadd = async (req, res) => {
  sess = req.session;
  const user_id = req.user._id;

  const role_id = req.user.role_id.toString();
  helper
    .checkPermission(role_id, user_id, "Add Role")
    .then(async (rolePerm) => {
      if (rolePerm.status == true) {
        const addRole = new Role({
          role_name: req.body.role_name,
          role_description: req.body.role_description,
        });
        const Roleadd = await addRole.save();
        res.status(201).send("role add done");
      } else {
        res.json({ status: false });
      }
    })
    .catch((error) => {
      res.status(403).send(error);
    });
};
apicontroller.roles = async (req, res) => {
  sess = req.session;
  const user_id = req.user._id;

  const role_id = req.user.role_id.toString();

  helper
    .checkPermission(role_id, user_id, "View Roles")
    .then(async (rolePerm) => {
   
      if (rolePerm.status == true) {
        const roleData = await Role.find({ deleted_at: "null" });
        res.json({ roleData });
      } else {
        res.json({ status: false });
      }
    })
    .catch((error) => {
      res.status(403).send(error);
    });
};
apicontroller.Roleedit = async (req, res) => {
  sess = req.session;

  const user_id = req.user._id;

  const role_id = req.user.role_id.toString();

  helper
    .checkPermission(role_id, user_id, "Update Role")
    .then(async (rolePerm) => {
      if (rolePerm.status == true) {
        const _id = req.params.id;
        const roleData = await Role.findById(_id);
        res.json({ roleData });
      } else {
        res.json({ status: false });
      }
    })
    .catch((error) => {
      res.status(403).send(error);
    });
};
apicontroller.Roleupdate = async (req, res) => {
  sess = req.session;
  const user_id = req.user._id;

  const role_id = req.user.role_id.toString();
  helper
    .checkPermission(role_id, user_id, "Update Role")
    .then(async (rolePerm) => {
      if (rolePerm.status == true) {
        const _id = req.params.id;
        const role = {
          role_name: req.body.role_name,
          role_description: req.body.role_description,
          permission_name: req.body.permission_name,
          updated_at: Date(),
        };
        const updateEmployee = await Role.findByIdAndUpdate(_id, role);
        res.json("roles updeted done");
      } else {
        res.json({ status: false });
      }
    })
    .catch((error) => {
      res.status(403).send(error);
    });
};
apicontroller.Roledelete = async (req, res) => {
  sess = req.session;
  const user_id = req.user._id;

  const role_id = req.user.role_id.toString();
  helper
    .checkPermission(role_id, user_id, "Delete Role")
    .then(async (rolePerm) => {
      if (rolePerm.status == true) {
        const _id = req.params.id;
        var alreadyRole = await user.find({ role_id: _id });
        var userHasAlreadyRole = alreadyRole.toString().includes(_id);

        if (userHasAlreadyRole == true) {
          res.json({ userHasAlreadyRole });
        } else {
          const deleteRole = {
            deleted_at: Date(),
          };
          const deteledata = await Role.findByIdAndUpdate(_id, deleteRole);
          res.json("role Deleted successfully");
        }
      } else {
        res.json({ status: false });
      }
    })
    .catch((error) => {
      res.status(403).send(error);
    });
};
apicontroller.getAddTask = async (req, res) => {
  sess = req.session;
  const user_id = req.user._id;

  const role_id = req.user.role_id.toString();
  helper
    .checkPermission(role_id, user_id, "Add Task")
    .then(async (rolePerm) => {
      const user_id = req.user._id;
      if (rolePerm.status == true) {
        const projectData = await project.find({
          // user_id: user_id,
          deleted_at: "null",
        });
        res.json({ projectData });
      } else {
        res.json({ status: false });
      }
    })
    .catch((error) => {
      res.status(403).send(error);
    });
};
apicontroller.taskadd = async (req, res) => {
  sess = req.session;
  const user_id = req.user._id;

  const role_id = req.user.role_id.toString();
  helper
    .checkPermission(role_id, user_id, "Add Task")
    .then((rolePerm) => {
      if (rolePerm.status == true) {
        task
          .create({
            project_id: req.body.project_id,
            user_id: req.body.user_id,
            title: req.body.title,
            short_description: req.body.short_description,
          })
          .then((Tasks) => res.status(201).json(Tasks))
          .catch((error) => {
            res.status(400).send(error);
          });
      } else {
        res.json({ status: false });
      }
    })
    .catch((error) => {
      res.status(403).send(error);
    });
};
apicontroller.listTasks = async (req, res) => {
  sess = req.session;
  const user_id = new BSON.ObjectId(req.user._id);

  const role_id = req.user.role_id.toString();
  helper
    .checkPermission(role_id, user_id, "View Tasks")
    .then(async (rolePerm) => {
      if (rolePerm.status == true) {
        // const adminTaskdata = await task.find({ deleted_at: "null" });
        const tasks = await task.aggregate([
          { $match: { deleted_at: "null" } },
          { $match: { user_id: user_id } },

          {
            $lookup: {
              from: "projects",
              localField: "project_id",
              foreignField: "_id",
              as: "projectData", //test
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "user_id",
              foreignField: "_id",
              as: "userData",//test1
            },
          },
        ]);
        const adminTaskdata = await task.aggregate([
          { $match: { deleted_at: "null" } },

          {
            $lookup: {
              from: "projects",
              localField: "project_id",
              foreignField: "_id",
              as: "projectData", //test
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "user_id",
              foreignField: "_id",
              as: "userData",//test1
            },
          },
        ]);
        if (tasks == []) {
        } else {
          res.json({ tasks, adminTaskdata });
        }
      } else {
        res.json({ status: false });
      }
    })
    .catch((error) => {
      res.status(403).send(error);
    });
};
apicontroller.taskedit = async (req, res) => {
  sess = req.session;

  sess = req.session;

  const user_id = req.user._id;

  const role_id = req.user.role_id.toString();

  helper
    .checkPermission(role_id, user_id, "Update Task")
    .then(async (rolePerm) => {
      if (rolePerm.status == true) {
        const projectData = await project.find({ deleted_at: "null" , user_id: user_id,   });
        const _id = new BSON.ObjectId(req.params.id);
        const tasks = await task.aggregate([
          { $match: { deleted_at: "null" } },
          { $match: { _id: _id } },
          {
            $lookup: {
              from: "projects",
              localField: "project_id",
              foreignField: "_id",
              as: "projectData", //test
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "user_id",
              foreignField: "_id",
              as: "usertData",//test1
            },
          },
        ]);
        res.json({ tasks, projectData });
      } else {
        res.json({ status: false });
      }
    })
    .catch((error) => {
      res.status(403).send(error);
    });
};
apicontroller.taskupdate = async (req, res) => {
  sess = req.session;

  const user_id = req.user._id;

  const role_id = req.user.role_id.toString();

  helper
    .checkPermission(role_id, user_id, "Update Task")
    .then(async (rolePerm) => {
      if (rolePerm.status == true) {
        const _id = req.params.id;
        const role = {
          project_id: req.body.project_id,
          user_id: req.body.user_id,
          title: req.body.title,
          short_description: req.body.short_description,
          updated_at: Date(),
        };

        const updateTask = await task.findByIdAndUpdate(_id, role);
        res.json("Task updeted done");
      } else {
        res.json({ status: false });
      }
    })
    .catch((error) => {
      res.status(403).send(error);
    });
};
apicontroller.task_status_update = async (req, res) => {
  sess = req.session;

  const user_id = req.user._id;

  const role_id = req.user.role_id.toString();

  helper
    .checkPermission(role_id, user_id, "Update Task")
    .then(async (rolePerm) => {
      if (rolePerm.status == true) {
        const _id = req.params.id;
        const role = {
          status:1,
          updated_at: Date(),
        };

        const updateTask = await task.findByIdAndUpdate(_id, role);
        res.json("Task updeted done");
      } else {
        res.json({ status: false });
      }
    })
    .catch((error) => {
      res.status(403).send(error);
    });
};
apicontroller.taskdelete = async (req, res) => {
  sess = req.session;

  const user_id = req.user._id;

  const role_id = req.user.role_id.toString();

  helper
    .checkPermission(role_id, user_id, "Delete Task")
    .then(async (rolePerm) => {
      if (rolePerm.status == true) {
        const _id = req.params.id;
        const deleteTask = {
          deleted_at: Date(),
        };
        await task.findByIdAndUpdate(_id, deleteTask);
        res.json("task deleted");
      } else {
        res.json({ status: false });
      }
    })
    .catch((error) => {
      res.status(403).send(error);
    });
};
apicontroller.getUserByProject = async (req, res) => {

  const _id = new BSON.ObjectId(req.params.id);
  try {
    const tasks = await project.aggregate([
      { $match: { _id: _id } },
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "userData",
        },
      },
    ]);
    return res.status(200).json({ tasks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

apicontroller.listuser = async (req, res) => {
  sess = req.session;

  const user_id = req.user._id;

  const role_id = req.user.role_id.toString();

  helper
    .checkPermission(role_id, user_id, "View Employees")
    .then(async (rolePerm) => {
      if (rolePerm.status == true) {
        const userData = await user.aggregate([
          { $match: { deleted_at: "null" } },
          {
            $lookup: {
              from: "roles",
              localField: "role_id",
              foreignField: "_id",
              as: "roleData",//test
            },
          },
        ]);
        res.json({ userData });
      } else {
        res.json({ status: false });
      }
    })
    .catch((error) => {
      res.status(403).send(error);
    });
};
apicontroller.deleteduser = async (req, res) => {
  sess = req.session;

  const user_id = req.body;
  const userid = await user.find({
    deleted_at: {
      $ne: "null",
    },
  });
  res.json(userid);
};
apicontroller.deletedMany = async (req, res) => {
  sess = req.session;
  // const user_id = new BSON.ObjectId(req.body.multiDelete);
  const user_id = req.body.multiDelete;

  const updateEmployee = await user.updateMany({_id:{$in:user_id}},{$set:{deleted_at:Date()}});
       res.json({ status: "user deleted" });
  
};
apicontroller.restoreuser = async (req, res) => {
  sess = req.session;

  const user_id = req.user._id;

  const role_id = req.user.role_id.toString();

  helper
    .checkPermission(role_id, user_id, "Delete Employee")
    .then(async (rolePerm) => {
      if (rolePerm.status == true) {
        const _id = req.params.id;
        const updateUser = {
          deleted_at: "null",
        };
        const updateEmployee = await user.findByIdAndUpdate(_id, updateUser);

        res.json({ status: "user Restore", updateUser });
      } else {
        res.json({ status: false });
      }
    })
    .catch((error) => {
      res.status(403).send(error);
    });
};
apicontroller.userDetail = async (req, res) => {
  sess = req.session;
  const user_id = req.user._id;

  const role_id = req.user.role_id.toString();
  helper
    .checkPermission(role_id, user_id, "View Employees Details")
    .then(async (rolePerm) => {
      if (rolePerm.status == true) {
        const _id = req.params.id;
        const userData = await user.findById(_id);
        res.json({
          data: userData,
          name: sess.name,
          loggeduserdata: req.user,
          users: sess.userData,
          role: sess.role,
          layout: false,
        });
      } else {
        res.json({ status: false });
      }
    })
    .catch((error) => {
      res.status(403).send(error);
    });
};
apicontroller.profile = async (req, res) => {
  sess = req.session;
  // const _id = req.params.id;
  const _id = new BSON.ObjectId(req.params.id);

  try {
    const userData = await user.aggregate([
      { $match: { deleted_at: "null" } },
      { $match: { _id: _id } }, 
      {
        $lookup: {
          from: "roles",
          localField: "role_id",
          foreignField: "_id",
          as: "roleData",
        },
      },
    ]);
    res.json({ userData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
apicontroller.updateProfile = async (req, res) => {
  const _id = req.params.id;
  try {
    const updateuser = {
      role_id: req.body.role_id,
      emp_code: req.body.emp_code,
      firstname: req.body.firstname,
      user_name: req.body.user_name,
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
      city: req.body.city,
      state: req.body.state,
      country: req.body.country,
      pincode: req.body.pincode,
      bank_account_no: req.body.bank_account_no,
      bank_name: req.body.bank_name,
      ifsc_code: req.body.ifsc_code,
      updated_at: Date(),
    };
    const updateProfile = await user.findByIdAndUpdate(_id, updateuser);

    res.json({ updateProfile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



apicontroller.updateUserPhoto = async (req, res) => {
  console.log("input",req.files.image) ;
  //  var input = req.body.photo = req.body.photo.replace("C:\\fakepath\\", "");
  const _id = req.params.id;
  try {
    const updateProfilePhoto = {
      photo: req.files.image.name,
    };
    var ProfilePhotoUpdate = await user.findByIdAndUpdate(
      _id,
      updateProfilePhoto
    );
    var file = req.files.image;
    file.mv("public/images/" + file.name);
    var photo = ProfilePhotoUpdate.photo
    console.log(photo);
    res.send({ photo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
 
};
apicontroller.editUser = async (req, res) => {
  sess = req.session;

  const user_id = req.user._id;

  const role_id = req.user.role_id.toString();

  helper
    .checkPermission(role_id, user_id, "Update Employee")
    .then(async (rolePerm) => {
      if (rolePerm.status == true) {
        const _id = req.params.id;
        const role = await Role.find();
        const userData = await user.findById(_id);
        const users = await user.find();
        const cities = await city.find();
        const countries = await country.find();
        const states = await state.find();

        res.json({ role, userData, users, cities, countries, states });
      } else {
        res.json({ status: false });
      }
    })
    .catch((error) => {
      res.status(403).send(error);
    });
};
apicontroller.UpdateUser = async (req, res) => {
  sess = req.session;
  const user_id = req.user._id;

  const role_id = req.user.role_id.toString();
  helper
    .checkPermission(role_id, user_id, "Update Employee")
    .then(async (rolePerm) => {
      if (rolePerm.status == true) {
        const new_image = req.body.new_image;

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
            };

            const updateUser = await user.findByIdAndUpdate(_id, updateuser);
            res.json({ status: updateUser });
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
            };

            const updateUser = await user.findByIdAndUpdate(_id, updateuser);
            res.json({ status: updateUser });
          } catch (err) {
            res.status(500).json({ error: err.message });
          }
        }
      } else {
        res.json({ status: false });
      }
    })
    .catch((error) => {
      res.status(403).send(error);
    });
};
apicontroller.index = async (req, res) => {

   const projectHashTask = await project.aggregate([
       {
         $match: {
           deleted_at: "null"
         }
       },
     
      {
        $lookup: {
          from: "tasks",
          
           pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$status', '0'] },
                ]
              }
            }
          }
        ],
          localField: "_id",
          foreignField: "project_id",
          as: "taskData",
        },
     },
     
        
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "userData",
        },
      },
   ]);
  
  projectHashTask.forEach(element => {
    //  console.log("sa",element.taskData.length);
    
  });
  
  // console.log("projectHashTask",projectHashTask);
  sess = req.session;
  const user_id = req.user._id;
  try {
    const userData = await user.find({ deleted_at: "null" });

    const userPending = await user.find({ status: "Pending", deleted_at: "null" });
    const userActive = await user.find({ status: "Active", deleted_at: "null" });
    const userInActive = await user.find({
      status: "InActive",
      deleted_at: "null",
    });
    console.log("userActive",userActive.length)
    const projectData = await project.find({ deleted_at: "null" });
    const projecthold = await project.find({
      status: "on Hold",
      deleted_at: "null",
    });
    const projectinprogress = await project.find({
      status: "in Progress",
      deleted_at: "null",
    });
    const projectcompleted = await project.find({
      status: "Completed",
      deleted_at: "null",
    });
    const taskData = await task.find({ deleted_at: "null" });

    

    const leavesData = await leaves.find({
      // status: "PENDING",
      deleted_at: "null",
      user_id: user_id,
    });
    let days_difference = 0;

    
      var takenLeaves = 0;
     
    for (let i = 0; i < leavesData.length; i++) {
      const allLeaves = leavesData[i];
       var days = [];
              const DF = new Date(allLeaves.datefrom);
              const DT = new Date(allLeaves.dateto);
              const time_difference = DT.getTime() - DF.getTime();
            
              days_difference = time_difference / (1000 * 60 * 60 * 24);
              takenLeaves += days_difference;
        
      days.push({ takenLeaves });
    }

     

    const _id = new BSON.ObjectId(user_id);
    const usersdata = await user.find({ reporting_user_id: _id });
    var reporting_user_id = [];
    for (let i = 0; i < usersdata.length; i++) {
      element = usersdata[i]._id;
      reporting_user_id.push(element);
    }

  
    // console.log("allLeavesData",allLeavesData);

    // const alluserData = await leaves.find({ deleted_at: "null" });

    const settingData = await Settings.find();
    const totalLeavesData = await Settings.find({ key: "leaves" });
    

    var leftLeaves = totalLeavesData[0].value-takenLeaves
    var totalLeaves = totalLeavesData[0].value

    // var userLeavesData = totalLeavesData.concat(leftLeaves, takenLeaves)


    var userLeavesData = []
    userLeavesData.push({leftLeaves,takenLeaves,totalLeaves})
    // const dataholiday = await holiday
    //   .find({ deleted_at: "null", holiday_date: { $gt: new Date() } })
    //   .sort({ holiday_date: 1 });


/////changes
const allLeavesData = await Leaves.find({
  deleted_at: "null",
  user_id: reporting_user_id,
  status: "PENDING",
})
const announcementData = await Announcement.find({
  date: { $gte: today },
}).sort({ date: 1 });

const referuserData = await user.find({
  deleted_at: "null",
  reporting_user_id: user_id,
});

const projectUserData = await project.find({
  deleted_at: "null",
  user_id: user_id,
});
const projectholdUser = await project.find({
  status: "on Hold",
  deleted_at: "null",
  user_id: user_id,
});
const projectinprogressUser = await project.find({
  status: "in Progress",
  deleted_at: "null",
  user_id: user_id,
});
const projectcompletedUser = await project.find({
  status: "Completed",
  deleted_at: "null",
  user_id: user_id,
});
const taskUserData = await task.find({
  deleted_at: "null",
  user_id: user_id,
});
const leavesUser = await user.find({
  deleted_at: "null",
  reporting_user_id: user_id,
});
const userwiserequest = [];
for (let i = 0; i < leavesUser.length; i++) {
  const element = leavesUser[i]._id;
  userwiserequest.push(element);
}
const leavesrequestData = await leaves.find({
  status: "PENDING",
  deleted_at: "null",
  user_id: userwiserequest,
});


const month = new Date().getMonth() + 1;
const year = new Date().getFullYear();
// const settingData = await Settings.find();
const dataholiday = await holiday
  .find({
    $expr: {
      $and: [
        {
          $eq: [
            {
              $month: "$holiday_date",
            },
            month,
          ],
        },
        {
          $eq: [
            {
              $year: "$holiday_date",
            },
            year,
          ],
        },
      ],
    },
    deleted_at: "null",
    holiday_date: { $gt: new Date() },
  })
  .sort({ holiday_date: 1 });

var today = new Date().toISOString().split("T")[0];



    res.json({
      userLeavesData,
      
      totalLeavesData,
      userData,
      userPending,
      userActive,
      userInActive,
      projectData,
      projecthold,
      dataholiday,
      projectinprogress,
      projectcompleted,
      taskData,
      leavesData,
      settingData,
      projectHashTask,
      //changes
      announcementData,
      allLeavesData,
      referuserData,
      projectUserData,
      projectholdUser,
      projectinprogressUser,
      projectcompletedUser,
      taskUserData,
      leavesUser,
      leavesrequestData,

    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
apicontroller.deleteUser = async (req, res) => {
  sess = req.session;

  const user_id = req.user._id;

  const role_id = req.user.role_id.toString();

  helper
    .checkPermission(role_id, user_id, "Delete Employee")
    .then(async (rolePerm) => {
      if (rolePerm.status == true) {
        const _id = req.params.id;
        const updateUser = {
          deleted_at: Date(),
        };
        const updateEmployee = await user.findByIdAndUpdate(_id, updateUser);

        res.json({ status: "user deleted", updateUser });
      } else {
        res.json({ status: false });
      }
    })
    .catch((error) => {
      res.status(403).send(error);
    });
};
apicontroller.sendforget = async (req, res) => {
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
      res.json({ status: 1, mesasge: "Email Sent Successfully" });
    } else {
      res.json({ status: 0, message: "User Not found" });
    }
  } catch {
    res.send("noooo");
  }
};
apicontroller.change = async (req, res) => {
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
  if (!token) return res.status(400).json("Invalid link or expired");

  if (!(password == cpassword)) {
    res.json({ success: "please check confirm password" });
  } else {
    const passswords = await bcrypt.hash(req.body.password, 10);
    const updatepassword = {
      password: passswords,
    };
    const updatPssword = await user.findByIdAndUpdate(_id, updatepassword);

    await token.delete();
    res.json({ status: "password updated" });
  }
};
apicontroller.holidaylist = async (req, res) => {
  sess = req.session;

  const user_id = req.user._id;
  const role_id = req.user.role_id.toString();

  helper
    .checkPermission(role_id, user_id, "View Holidays")
    .then((rolePerm) => {
    
      if (rolePerm.status == true) {
        Holiday.find({ deleted_at: "null" })
          .sort({ holiday_date: 1 })
          .then((holidayData) => res.status(200).json({ holidayData }))
          .catch((error) => {
            res.status(400).send(error);
          });
      } else {
        res.json({ status: false });
      }
    })
    .catch((error) => {
      res.status(403).send(error);
    });
};
apicontroller.getHoliday = async (req, res) => {
  sess = req.session;
  const user_id = req.user._id;

  const role_id = req.user.role_id.toString();

  helper
    .checkPermission(role_id, user_id, "Add Holiday")
    .then((rolePerm) => {
      if (rolePerm.status == true) {
        res.json({ status: true });
      } else {
        res.json({ status: false });
      }
    })
    .catch((error) => {
      res.status(403).send(error);
    });
};
apicontroller.Holidayadd = async (req, res) => {
  sess = req.session;

  const user_id = req.user._id;

  const role_id = req.user.role_id.toString();

  helper
    .checkPermission(role_id, user_id, "Add Holiday")
    .then((rolePerm) => {
      if (rolePerm.status == true) {
        Holiday.create({
          holiday_name: req.body.holiday_name,
          holiday_date: req.body.holiday_date,
        })
          .then((holiday) => res.status(201).send(holiday))
          .catch((error) => {
            console.log(error);
            res.status(400).send(error);
          });
      } else {
        res.json({ status: false });
      }
    })
    .catch((error) => {
      res.status(403).send(error);
    });
};
apicontroller.Holidayedit = async (req, res) => {
  sess = req.session;

  const user_id = req.user._id;

  const role_id = req.user.role_id.toString();

  helper
    .checkPermission(role_id, user_id, "Update Holiday")
    .then(async (rolePerm) => {
      if (rolePerm.status == true) {
        const _id = req.params.id;
        const holidayData = await Holiday.findById(_id);
        res.json({ holidayData });
      } else {
        res.json({ status: false });
      }
    })
    .catch((error) => {
      res.status(403).send(error);
    });
};
apicontroller.Holidayupdate = async (req, res) => {
  sess = req.session;

  const user_id = req.user._id;

  const role_id = req.user.role_id.toString();

  helper
    .checkPermission(role_id, user_id, "Update Holiday")
    .then(async (rolePerm) => {
      if (rolePerm.status == true) {
        const _id = req.params.id;
        const updateHoliday = {
          holiday_name: req.body.holiday_name,
          holiday_date: req.body.holiday_date,
          updated_at: Date(),
        };
        const updateHolidaydata = await Holiday.findByIdAndUpdate(
          _id,
          updateHoliday
        );
        res.json({ updateHolidaydata });
      } else {
        res.json({ status: false });
      }
    })
    .catch((error) => {
      res.status(403).send(error);
    });
};
apicontroller.deleteHoliday = async (req, res) => {
  sess = req.session;

  const user_id = req.user._id;

  const role_id = req.user.role_id.toString();

  helper
    .checkPermission(role_id, user_id, "Delete Holiday")
    .then(async (rolePerm) => {
      if (rolePerm.status == true) {
        const _id = req.params.id;
        const deleteHoliday = {
          deleted_at: Date(),
        };
        const deleteHolidaydata = await Holiday.findByIdAndUpdate(
          _id,
          deleteHoliday
        );
        res.json({ deleteHolidaydata });
      } else {
        res.json({ status: false });
      }
    })
    .catch((error) => {
      res.status(403).send(error);
    });
};
apicontroller.employeeLavesList = async (req, res) => {
  sess = req.session;
  const user_id = req.user._id;

  sess = req.session;

  const role_id = req.user.role_id.toString();
  helper
    .checkPermission(role_id, user_id, "View Leaves")
    .then(async (rolePerm) => {
      if (rolePerm.status == true) {
        const emplyeeLeaves = await Leaves.find({
          user_id: user_id,
          deleted_at: "null",
        });
        res.json({ emplyeeLeaves });
      } else {
        res.json({ status: false });
      }
    })
    .catch((error) => {
      res.status(403).send(error);
    });
};
apicontroller.getaddleaves = async (req, res) => {
  sess = req.session;
  const user_id = req.user._id;

  const role_id = req.user.role_id.toString();
  helper
    .checkPermission(role_id, user_id, "Add Leaves")
    .then(async (rolePerm) => {
      if (rolePerm.status == true) {
        res.json("you can add data");
      } else {
        res.json({ status: false });
      }
    })
    .catch((error) => {
      res.status(403).send(error);
    });
};

apicontroller.addleaves = async (req, res) => {
  sess = req.session;
  const user_id = req.user._id;

  const role_id = req.user.role_id.toString();
  helper
    .checkPermission(role_id, user_id, "Add Leaves")
    .then(async (rolePerm) => {
      if (rolePerm.status == true) {
        const addLeaves = new Leaves({
          user_id: req.body.user_id,
          datefrom: req.body.datefrom,
          dateto: req.body.dateto,
          reason: req.body.reason,
        });
        const leavesadd = await addLeaves.save();
        res.json("leaves add done");
      } else {
        res.json({ status: false });
      }
    })
    .catch((error) => {
      res.status(403).send(error);
    });
};

apicontroller.leavesrequest = async (req, res) => {
  sess = req.session;
  const user_id = req.user._id;
  const _id = new BSON.ObjectId(user_id);
  sess = req.session;

  const role_id = req.user.role_id.toString();
  helper
    .checkPermission(role_id, user_id, "View Leaves")
    .then(async (rolePerm) => {
      if (rolePerm.status == true) {
        const usersdata = await user.find({ reporting_user_id: _id });
        var reporting_user_id = [];
        for (let i = 0; i < usersdata.length; i++) {
          element = usersdata[i]._id;
          reporting_user_id.push(element);
        }
        const allLeaves = await Leaves.aggregate([
          { $match: { deleted_at: "null" } },
          { $match: { status: { $ne: "CANCELLED" } } },
          { $match: { user_id: { $in: reporting_user_id } } },
          {
            $lookup: {
              from: "users",
              localField: "user_id",
              foreignField: "_id",
              as: "user",
            },
          },
        ]);

        res.json({ allLeaves });
      } else {
        res.json({ status: false });
      }
    })
    .catch((error) => {
      res.status(403).send(error);
    });
};

apicontroller.leavesList = async (req, res) => {
  sess = req.session;
  const user_id = req.user._id;

  const role_id = req.user.role_id.toString();

  helper
    .checkPermission(role_id, user_id, "View Leaves")
    .then(async (rolePerm) => {
      if (rolePerm.status == true) {
        const allLeaves = await Leaves.aggregate([
          { $match: { deleted_at: "null" } },
          // { $match: { status: "APPROVE" } },
          {
            $lookup: {
              from: "users",
              localField: "user_id",
              foreignField: "_id",
              as: "userData",////////test
            },
          },
        ]);
        res.json({ allLeaves });
      } else {
        res.json({ status: false });
      }
    })
    .catch((error) => {
      res.status(403).send(error);
    });
};

apicontroller.cancelLeaves = async (req, res) => {
  try {
    const _id = req.params.id;
    const cancelLeaves = {
      status: "CANCELLED",
      approver_id: req.body.approver_id,
    };
    const leavescancel = await Leaves.findByIdAndUpdate(_id, cancelLeaves);
    res.json({ leavescancel });
  } catch (e) {
    res.status(400).send(e);
  }
};
apicontroller.rejectLeaves = async (req, res) => {
  const user_id = req.user._id;

  const role_id = req.user.role_id.toString();

  helper
    .checkPermission(role_id, user_id, "View Leaves")
    .then(async (rolePerm) => {
      if (rolePerm.status == true) {
        const _id = req.params.id;
        const rejectLeaves = {
          status: "REJECT",
          approver_id: req.body.approver_id,
        };
        const leavesReject = await Leaves.findByIdAndUpdate(_id, rejectLeaves);
        res.json({ leavesReject });
      } else {
        res.json({ status: false });
      }
    })
    .catch((error) => {
      res.status(403).send(error);
    });
};
apicontroller.approveLeaves = async (req, res) => {
  const user_id = req.user._id;

  const role_id = req.user.role_id.toString();

  helper
    .checkPermission(role_id, user_id, "View Leaves")
    .then(async (rolePerm) => {
      if (rolePerm.status == true) {
        const _id = req.params.id;
        const approveLeaves = {
          status: "APPROVE",
          approver_id: req.body.approver_id,
        };
        const leavesapprove = await Leaves.findByIdAndUpdate(
          _id,
          approveLeaves
        );
        res.json({ leavesapprove });
      } else {
        res.json({ status: false });
      }
    })
    .catch((error) => {
      res.status(403).send(error);
    });
};

apicontroller.getTimeEntry = async (req, res) => {
  sess = req.session;
  const user_id = req.user._id;

  const role_id = req.user.role_id.toString();

  helper
    .checkPermission(role_id, user_id, "Add TimeEntry")
    .then(async (rolePerm) => {
      if (rolePerm.status == true) {
        const user_id = req.user._id;
        const projectData = await project.find({
          user_id: user_id,
          status: "in Progress",
        });
        res.json({ projectData });
      } else {
        res.json({ status: false });
      }
    })
    .catch((e) => {
      res.status(403).send(e);
    });
};
apicontroller.addTimeEntry = async (req, res) => {
  sess = req.session;
  const user_id = req.user._id;

  const role_id = req.user.role_id.toString();

  helper
    .checkPermission(role_id, user_id, "Add TimeEntry")
    .then(async (rolePerm) => {
      if (rolePerm.status == true) {
        const user_id = req.user._id;
        const addTimeEntry = new timeEntry({
          user_id: user_id,
          project_id: req.body.project_id,
          task_id: req.body.task_id,
          hours: req.body.hours,
          date: req.body.date,
        });
        const timeEntryadd = await addTimeEntry.save();
        res.json("time entry added");
      } else {
        res.json({ status: false });
      }
    })
    .catch((e) => {
      res.status(403).send(e);
    });
};

apicontroller.timeEntryListing = async (req, res) => {
  sess = req.session;
  const user_id = req.user._id;

  const role_id = req.user.role_id.toString();

  helper
    .checkPermission(role_id, user_id, "View TimeEntries")
    .then(async (rolePerm) => {
      if (rolePerm.status == true) {
        const user_id = req.body.user_id;

        const timeEntryData = await timeEntry.aggregate([
          {
            $lookup: {
              from: "projects",
              localField: "project_id",
              foreignField: "_id",
              as: "projectData", ///////test
            },
          },
          {
            $lookup: {
              from: "tasks",
              localField: "task_id",
              foreignField: "_id",
              as: "taskData",///////test1
            },
          },
        ]);

        res.json({ timeEntryData });
      } else {
        res.json({ status: false });
      }
    })
    .catch((e) => {
      res.status(403).send(e);
    });
};
apicontroller.getDataBymonth = async (req, res) => {
  try {
    const _month = parseInt(req.body.month);
    const _year = parseInt(req.body.year);

    const timeEntryData = await timeEntry.aggregate([
      // { $match: { deleted_at: "null" }},

      {
        $match: {
          $expr: {
            $and: [
              {
                $eq: [
                  {
                    $month: "$date",
                  },
                  _month,
                ],
              },
              {
                $eq: [
                  {
                    $year: "$date",
                  },
                  _year,
                ],
              },
            ],
          },
        },
      },
      {
        $lookup: {
          from: "projects",
          localField: "project_id",
          foreignField: "_id",
          as: "projectData",
        },
      },
      {
        $lookup: {
          from: "tasks",
          localField: "task_id",
          foreignField: "_id",
          as: "taskData",
        },
      },
    ]);

    res.json({ timeEntryData });
  } catch (e) {
    res.status(400).send(e);
  }
};

apicontroller.getRolePermission = async (req, res) => {
  sess = req.session;

  const user_id = req.user._id;

  const role_id = req.user.role_id.toString();

  helper
    .checkPermission(role_id, user_id, "View Roles")
    .then(async (rolePerm) => {
      if (rolePerm.status == true) {
        const _id = req.params.id;

        // const _id = req.body._id;
        const rolePermissiondata = await rolePermissions.find({ role_id: _id });
        var rolepermission = [];
        rolePermissiondata.forEach((element) => {
          rolepermission.push(element.permission_id);
        });

        const roles = rolepermission.toString();

        const roleData = await Role.findById(_id);
        const permissions = await Permission.find({ deleted_at: "null" });

        if (rolePermissiondata.length > 0) {
          var roleHasPermission = rolePermissiondata[0].permission_id;
          res.json({ permissions, roleHasPermission, roleData, roles });
        } else {
          roleHasPermission = [];
          res.json({ permissions, roleData, roleHasPermission, roles });
        }
      } else {
        res.json({ status: false });
      }
    })
    .catch((e) => {
      res.status(403).send(e);
    });
};
apicontroller.addRolePermission = async (req, res) => {
  sess = req.session;
  const user_id = req.user._id;

  const role_id = req.user.role_id.toString();

  helper
    .checkPermission(role_id, user_id, "View Roles")
    .then(async (rolePerm) => {
      if (rolePerm.status == true) {
        const _id = req.params.id;
        const id = await rolePermissions.find({ role_id: _id });

        if (id) {
          const deletepermission = await rolePermissions.findByIdAndDelete(id);

          const addpermission = new rolePermissions({
            role_id: req.body.role_id,
            permission_id: req.body.permission_id,
          });

          const permissionadd = await addpermission.save();
          res.status(201).json({ permissionadd });
        } else {
          const addpermission = new rolePermissions({
            role_id: req.body.role_id,
            permission_id: req.body.permission_id,
          });

          const permissionadd = await addpermission.save();
          res.status(201).json({ permissionadd });
        }
      } else {
        res.json({ status: false });
      }
    })
    .catch((e) => {
      res.status(403).send(e);
    });
};

apicontroller.getUserPermission = async (req, res) => {
  sess = req.session;
  const user_id = req.user._id;

  const role_id = req.user.role_id.toString();

  helper
    .checkPermission(role_id, user_id, "View Permissions")
    .then(async (rolePerm) => {
      if (rolePerm.status == true) {
        const _id = req.params.id;
        sess = req.session;

        const userData = await user.findById(_id);
        const role_id = userData.role_id;

        const rolePermissiondata = await rolePermissions.find({
          role_id: role_id,
        });

        const userid = userData._id;
        const userPermissiondata = await userPermissions.find({
          user_id: userid,
        });
        var userPermission = [];
        var userId = [];

        userPermissiondata.forEach((element) => {
          userPermission.push(element.permission_id);
          userId.push(element.user_id);
        });

        // var userHaspermissions = userPermissiondata[0].permission_id;

        var rolePermission = [];
        var roleId = [];

        rolePermissiondata.forEach((element) => {
          rolePermission.push(element.permission_id);
          roleId.push(element.role_id);
        });
        var roleHasPermissions = rolePermissiondata[0].permission_id;
        // const roleHasPermissions = rolePermission.toString();

        const roleData = await user.findById(_id);

        const allPermmission = await Permission.find();

        const UserId = roleData._id;
        const roledatas = await user.aggregate([
          { $match: { _id: UserId } },
          {
            $lookup: {
              from: "roles",
              localField: "role_id",
              foreignField: "_id",
              as: "roleData",/////test
            },
          },
        ]);
        var userHaspermissions;
        if (userPermissiondata.length > 0) {
          userHaspermissions = userPermissiondata[0].permission_id;
          res.json({
            allPermmission,
            roledatas,
            roleData,
            userHaspermissions,
            roleId,
            roleHasPermissions,
            userData,
          });
        } else {
          userHaspermissions = [];
          res.json({
            allPermmission,
            roledatas,
            roleData,
            userHaspermissions,
            roleId,
            roleHasPermissions,
            userData,
          });
        }
      } else {
        res.json({ status: false });
      }
    })
    .catch((error) => {
      res.status(403).send(error);
    });
};

apicontroller.addUserPermission = async (req, res) => {
  sess = req.session;
  const user_id = req.user._id;
  const role_id = req.user.role_id.toString();

  helper
    .checkPermission(role_id, user_id, "Add UserPermission")
    .then(async (rolePerm) => {
      if (rolePerm.status == true) {
        const _id = req.params.id;
        const id = await userPermissions.find({ user_id: _id });
        if (id) {
          const deletepermission = await userPermissions.findByIdAndDelete(id);
          const addPermission = new userPermissions({
            user_id: req.body.user_id,
            role_id: req.body.role_id,
            permission_id: req.body.permission_id,
          });
          const Permissionadd = await addPermission.save();

          res.status(201).json({ Permissionadd });
        } else {
          const addPermission = new userPermissions({
            user_id: req.body.user_id,
            role_id: req.body.role_id,
            permission_id: req.body.permission_id,
          });
          const Permissionadd = await addPermission.save();
          res.status(201).json({ Permissionadd });
        }
      } else {
        res.json({ status: false });
      }
    })
    .catch((error) => {
      res.status(403).send(error);
    });
};
apicontroller.Settingslist = async (req, res) => {
  sess = req.session;
  const user_id = req.user._id;

  const role_id = req.user.role_id.toString();

  helper
    .checkPermission(role_id, user_id, "View Settings")
    .then(async (rolePerm) => {
      if (rolePerm.status == true) {
        const settingData = await Settings.find({ deleted_at: "null" });
        res.json({ settingData });
      } else {
        res.json({ status: false });
      }
    })
    .catch((error) => {
      res.status(403).send(error);
    });
};
apicontroller.leavesSettingData = async (req, res) => {
  const leavesSettingData = await Settings.find({ key: "leaves" });
  res.json({leavesSettingData})
};
apicontroller.getAddSetting = async (req, res) => {
  sess = req.session;
  const user_id = req.user._id;

  const role_id = req.user.role_id.toString();
  helper
    .checkPermission(role_id, user_id, "Add Setting")
    .then((rolePerm) => {
      if (rolePerm.status == true) {
        res.json({ status: true });
      } else {
        res.json({ status: false });
      }
    })
    .catch((error) => {
      res.status(403).send(error);
    });
};
apicontroller.Settingsadd = async (req, res) => {
  sess = req.session;
  const user_id = req.user._id;

  const role_id = req.user.role_id.toString();
  helper
    .checkPermission(role_id, user_id, "Add Setting")
    .then(async (rolePerm) => {
      if (rolePerm.status == true) {
        const addSettings = new Settings({
          key: req.body.key,
          type: req.body.type,
          value: req.body.value,
        });
        const Settingsadd = await addSettings.save();
        res.json("Settings add done");
      } else {
        res.json({ status: false });
      }
    })
    .catch((error) => {
      res.status(403).send(error);
    });
};
apicontroller.SettingsEdit = async (req, res) => {
  sess = req.session;
  const user_id = req.user._id;

  const role_id = req.user.role_id.toString();
  helper
    .checkPermission(role_id, user_id, "Update Setting")
    .then(async (rolePerm) => {
      if (rolePerm.status == true) {
        const _id = req.params.id;
        const settingData = await Settings.findById(_id);
        res.json({ settingData });
      } else {
        res.json({ status: false });
      }
    })
    .catch((error) => {
      res.status(403).send(error);
    });
};
apicontroller.SettingsUpdate = async (req, res) => {
  sess = req.session;
  const user_id = req.user._id;

  const role_id = req.user.role_id.toString();
  helper
    .checkPermission(role_id, user_id, "Update Setting")
    .then(async (rolePerm) => {
      if (rolePerm.status == true) {
        const _id = req.params.id;
        const updatedSettings = {
          key: req.body.key,
          type: req.body.type,
          value: req.body.value,
        };
        const updatedSetting = await Settings.findByIdAndUpdate(
          _id,
          updatedSettings
        );
        res.json("setting updated");
      } else {
        res.json({ status: false });
      }
    })
    .catch((error) => {
      res.status(403).send(error);
    });
};
apicontroller.SettingsDelete = async (req, res) => {
  sess = req.session;
  const user_id = req.user._id;

  const role_id = req.user.role_id.toString();

  helper
    .checkPermission(role_id, user_id, "Delete Setting")
    .then(async (rolePerm) => {
      if (rolePerm.status == true) {
        const _id = req.params.id;
        const deleteSettings = {
          deleted_at: Date(),
        };
        const deletedSetting = await Settings.findByIdAndUpdate(
          _id,
          deleteSettings
        );
        res.json({ delete: deletedSetting });
      } else {
        res.json({ status: false });
      }
    })
    .catch((error) => {
      res.status(403).send(error);
    });
};
apicontroller.deleteTimeEntry = async (req, res) => {
  sess = req.session;
  const user_id = req.user._id;

  const role_id = req.user.role_id.toString();

  helper
    .checkPermission(role_id, user_id, "Delete TimeEntry")
    .then(async (rolePerm) => {
      if (rolePerm.status == true) {
        const _id = req.params.id;
        const permissionDelete = {
          deleted_at: Date(),
        };
        await timeEntry.findByIdAndUpdate(_id, permissionDelete);
        res.json("data deleted");
      } else {
        res.json({ status: false });
      }
    })
    .catch((error) => {
      res.status(403).send(error);
    });
};
apicontroller.editTimeEntry = async (req, res) => {
  sess = req.session;

  const user_id = req.user._id;

  const role_id = req.user.role_id.toString();

  helper
    .checkPermission(role_id, user_id, "Update TimeEntry")
    .then(async (rolePerm) => {
      if (rolePerm.status == true) {
        const _id = req.params.id;
        const timeEntryData = await timeEntry.findById(_id);
        const projectData = await project.find({
          user_id: user_id,
          status: "in Progress",
        });
        const taskData = await task.find();

        res.json({ timeEntryData, projectData, taskData });
      } else {
        res.json({ status: false });
      }
    })
    .catch((error) => {
      res.status(403).send(error);
    });
};
apicontroller.updateTimeEntry = async (req, res) => {
  sess = req.session;
  const _id = req.params.id;
  const user_id = req.user._id;

  const role_id = req.user.role_id.toString();
  helper
    .checkPermission(role_id, user_id, "Update TimeEntry")
    .then(async (rolePerm) => {
      if (rolePerm.status == true) {
        const updateTimeEntry = {
          project_id: req.body.project_id,
          task_id: req.body.task_id,
          hours: req.body.hours,
          date: req.body.date,
        };
        const updateHolidaydata = await timeEntry.findByIdAndUpdate(
          _id,
          updateTimeEntry
        );
        res.json("data updated");
      } else {
        res.json({ status: false });
      }
    })
    .catch((error) => {
      res.status(403).send(error);
    });
};
apicontroller.getSettingData = async function (req, res) {
  const key = req.body.key;
  const settingData = await Settings.find({ key: key });
  if (settingData.length > 0) {
    res.json(settingData[0].value);
  }
};
apicontroller.checkEmplyeeCode = async (req, res) => {
  const EMPCODE = `${"CC-" + req.body.emp_code}`;

  let emp_codeExist = await user.findOne({ emp_code: EMPCODE });
  if (emp_codeExist) {
    return res.status(200).json({ status: true });
  } else {
    return res.status(200).json({ status: false });
  }
};
apicontroller.alluserleaves = async (req, res) => {
  sess = req.session;
  const user_id = req.user._id;

  const role_id = req.user.role_id.toString();
  helper
    .checkPermission(role_id, user_id, "View Leaves")
    .then(async (rolePerm) => {
      if (rolePerm.status == true) {
        const userData = await user.aggregate([
          {
            $lookup: {
              from: "leaves",
              localField: "_id",
              foreignField: "user_id",
              as: "leaves",
            },
          },
        ]);

        var days = [];
        let days_difference = 0;

        userData.forEach(function (u) {
          var takenLeaves = 0;
          u.leaves.forEach(function (r) {
            const DF = new Date(r.datefrom);
            const DT = new Date(r.dateto);
            const time_difference = DT.getTime() - DF.getTime();
          
            days_difference = time_difference / (1000 * 60 * 60 * 24);
            takenLeaves += days_difference;
          });
          days.push({ takenLeaves });
        });
      
        let users = userData;
        let leaves = days;

        for (let i = 0; i < users.length; i++) {
          Object.assign(users[i], leaves[i]);
        }
        
        res.json({ users });
      } else {
        res.json({ status: false });
      }
    })
    .catch((error) => {
      res.status(403).send(error);
    });
};

// ***************
apicontroller.Announcementslist = async (req, res) => {
  sess = req.session;
  try {
  
    const AnnouncementData = await Announcement.aggregate([
      { $match: { deleted_at: "null" } },
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "username",
        },
      },
    ]);
    const AnnouncementStatus0 = await Announcement.aggregate([
      { $match: { deleted_at: "null" } },
      { $match: { status: 0 } },
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "username",
        },
      },
    ]);
    const AnnouncementStatus1 = await Announcement.aggregate([
      { $match: { deleted_at: "null" } },
      { $match: { status: 1 } },

      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "username",
        },
      },
    ]);

    res.json({ AnnouncementData, AnnouncementStatus0, AnnouncementStatus1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
apicontroller.Announcementsadd = async (req, res) => {
  sess = req.session;
  const user_id = req.user._id;

  const role_id = req.user.role_id.toString();
  helper
    .checkPermission(role_id, user_id, "Add Setting")
    .then(async (rolePerm) => {
      if (rolePerm.status == true) {
        const addAnnouncement = new Announcement({
          title: req.body.title,
          description: req.body.description,
          date: req.body.date,
          user_id: user_id,
        });
        const Announcementadd = await addAnnouncement.save({});
        res.json({ "Announcement add done ": addAnnouncement });
      } else {
        res.json({ status: false });
      }
    })
    .catch((error) => {
      res.status(403).send(error);
    });
};
apicontroller.statusAnnouncements = async (req, res) => {
  sess = req.session;
  const user_id = req.user._id;

  const role_id = req.user.role_id.toString();
  helper
    .checkPermission(role_id, user_id, "Add Setting")
    .then(async (rolePerm) => {
      if (rolePerm.status == true) {
        const announcement_id = req.params.announcement_id;
       
        const updateAnnouncementStatus = {
          status: 1,
        };
        const updatedAnnouncement = await Announcement.findByIdAndUpdate(
          announcement_id,
          updateAnnouncementStatus
        );
        res.json("status updated");
      } else {
        res.json({ status: false });
      }
    })
    .catch((error) => {
      res.status(403).send(error);
    });
};
apicontroller.AnnouncementsEdit = async (req, res) => {
  try {
    sess = req.session;
    const _id = new BSON.ObjectId(req.params.id);
   
    const AnnouncementData = await Announcement.aggregate([
      { $match: { deleted_at: "null" } },
      { $match: { _id: _id } },
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "username",
        },
      },
    ]);
  
    res.json({ AnnouncementData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// apicontroller.AnnouncementsUpdate = async (req, res) => {
//   try {
//     const _id = req.params.id;
//     const updateAnnouncement = {
//       announcement_title: req.body.announcement_title,
//       announcement_description: req.body.announcement_description,
//       announcement_date: req.body.announcement_date,
//       updated_at: Date(),
//     };
//     const updatedAnnouncement = await Announcement.findByIdAndUpdate(
//       _id,
//       updateAnnouncement
//     );
//     res.json({ updatedAnnouncement });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };
apicontroller.Announcementsdelete = async (req, res) => {
  try {
    const _id = req.params.id;
    const deleteAnnouncement = {
      deleted_at: Date(),
    };
    const deletedAnnouncement = await Announcement.findByIdAndUpdate(
      _id,
      deleteAnnouncement
    );
    res.json({ delete: deletedAnnouncement });
  } catch (e) {
    res.status(400).send(e);
  }
};


apicontroller.searchTimeEntry = async (req, res) => {
  try {
    const user_id = req.body.user_id;

    const timeEntryData = await timeEntry.aggregate([
      { $match: { hours: inputValue } },
      {
        $lookup: {
          from: "projects",
          localField: "project_id",
          foreignField: "_id",
          as: "proejectData",
        },
      },
      {
        $lookup: {
          from: "tasks",
          localField: "task_id",
          foreignField: "_id",
          as: "taskData",
        },
      },
    ]);

    res.json({ timeEntryData });
  } catch (e) {
    res.status(400).send(e);
  }
};

apicontroller.getTaskByProject = async (req, res) => {
  const _id = new BSON.ObjectId(req.params.id);
  try {
    const tasks = await task.find({ project_id: _id });
    return res.status(200).json({ tasks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

apicontroller.deleteLeave = async (req, res) => {
  sess = req.session;
  const user_id = req.user._id;

  const role_id = req.user.role_id.toString();

  helper
    .checkPermission(role_id, user_id, "Delete Leaves")
    .then(async (rolePerm) => {
      if (rolePerm.status == true) {
        const _id = req.params.id;
        const leaveDelete = {
          deleted_at: Date(),
        };
        const Deleteleave = await Leaves.findByIdAndUpdate(_id, leaveDelete);
        res.json("Leave deleted");
      } else {
        res.json({ status: false });
      }
    })
    .catch((error) => {
      res.status(403).send(error);
    });
};
apicontroller.checkEmail = async (req, res) => {
  const Email = req.body.personal_email;
  const user_id = req.body.user_id;

 
  const emailExists = await user.findOne({
    _id: { $ne: user_id },
    personal_email: Email,
  });
  if (emailExists) {
    return res.status(200).json({ status: true });
  } else {
    return res.status(200).json({ status: false });
  }
};
apicontroller.getDataByUser = async (req, res) => {
  console.log("data",req.body)
  sess = req.session;
  const user_id = req.user._id;
  const user = req.body.userId;
  const role_id = req.user.role_id.toString();
  helper
    .checkPermission(role_id, user_id, "Add Leaves")
    .then(async (rolePerm) => {
      if (rolePerm.status == true) {
        // const month = req.body.month;
        // const year = req.body.year;

        const month = parseInt(req.body.month);
        const year = parseInt(req.body.year);
        const userLeavesData = await leaves.find({
          $expr: {
            $and: [
              {
                $eq: [
                  {
                    $month: "$dateto",
                  },
                  month,
                ],
              },
              {
                $eq: [
                  {
                    $year: "$dateto",
                  },
                  year,
                ],
              },
            ],
          },
          user_id: user,
          status: "APPROVE",
        });
        console.log("userLeavesData",userLeavesData)
        res.json({ userLeavesData });
      } else {
        res.json({ status: false });
      }
    })
    .catch((error) => {
      res.status(403).send(error);
    });
};


apicontroller.checkUsername = async (req, res) => {
  const user_name = req.body.user_name;
  const user_id = req.body.user_id;

  const usernameExist = await user.findOne({
    _id: { $ne: user_id },
    user_name: user_name,
  });

  if (usernameExist) {
    return res.status(200).json({ status: true });
  } else {
    return res.status(200).json({ status: false });
  }
};

apicontroller.checkUserHAsPermission = async (req, res) => {
  const user_id = req.params.id;
  const role_id = req.params.role_id;
  const roleData = await rolePermissions.find({ role_id: role_id });
  const rolepermission = roleData[0].permission_id;
  const rolePerm = await Permission.find({ _id: rolepermission });
  var rolepermissionName = [];
  for (var i = 0; i < rolePerm.length; i++) {
    rolepermissionName.push(rolePerm[i].permission_name);
  }
  const userPermissiondata = await userPermissions.find({ user_id: user_id });
  if (userPermissiondata.length > 0) {
    const userpermission = userPermissiondata[0].permission_id;
    const userPerm = await Permission.find({ _id: userpermission });
    var userpermissionName = [];
    for (var i = 0; i < userPerm.length; i++) {
      userpermissionName.push(userPerm[i].permission_name);
    }
  }
  const allPerm = rolepermissionName.concat(userpermissionName);
  var Allpermission = [...new Set(allPerm)];
  res.json({ Allpermission });
  
};

apicontroller.getholidayDataBymonth = async (req, res) => {
  console.log(req.body)
  sess = req.session;
  const user_id = req.user._id;

  const role_id = req.user.role_id.toString();
  helper
    .checkPermission(role_id, user_id, "Add Leaves")
    .then(async (rolePerm) => {
      if (rolePerm.status == true) {

        const month = req.body.month;
        const year = req.body.year;
        // const year = new Date().getFullYear();
        // const userData = await user.find({ deleted_at: "null" });
        const holidayData = await Holiday.find({
          $expr: {
            $and: [
              {
                $eq: [
                  {
                    $month: "$holiday_date",
                  },
                  month,
                ],
              },
              {
                $eq: [
                  {
                    $year: "$holiday_date",
                  },
                  year,
                ],
              },
            ],
          },
        });
        console.log(holidayData)
        res.json({holidayData });
      } else {
        res.json({ status: false });
      }
    })
    .catch((error) => {
      res.status(403).send(error);
    });
};

module.exports = apicontroller;
