const project = require("../../model/createProject");
const permission = require("../../model/addpermissions");
const Role = require("../../model/roles");
const task = require("../../model/createTask");
const user = require("../../model/user");
const technology = require("../../model/technology");
const city = require("../../model/city");
const holiday = require("../../model/holiday");
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
const fs = require("fs");
const xlsxj = require("xlsx-to-json");

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
        const EMPCODE = `${"CC-" + req.body.emp_code}`;
        let emp_code = await user.findOne({ emp_code: EMPCODE });
        if (emailExist) {
          res.json("email already exist");
        } else if (emp_code) {
          res.json("Employee code already exist");
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
  // console.log("adasd")
  const user_id = req.user._id;

  const role_id = req.user.role_id.toString();

  helper
    .checkPermission(role_id, user_id, "Add Employee")
    .then(async (rolePerm) => {
      // console.log(rolePerm.status)
      if (rolePerm.status == true) {
        const role = await Role.find({ deleted_at: "null" });
        const cities = await city.find({ deleted_at: "null" });
        const users = await user.find({ deleted_at: "null" });

        res.json({ role, cities, users });
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
    const password = req.body.oldpassword;
    const newpwd = req.body.newpassword;
    const cpassword = req.body.cpassword;
    if (!(newpwd == cpassword)) {
      req.flash("alert", "confirm password not matched");
      res.redirect(`/change_password/${_id}`);
    } else {
      const bcryptpass = await bcrypt.hash(req.body.newpassword, 10);
      const newpassword = {
        password: bcryptpass,
        updated_at: Date(),
      };
      const userData = await user.findById({ _id: _id });
      const isMatch = await bcrypt.compare(password, userData.password);

      if (!isMatch) {
      } else {
        const newsave = await user.findByIdAndUpdate(_id, newpassword);
        req.json({ newsave });
      }
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
apicontroller.employeelogin = async (req, res) => {
  try {
    const personal_email = req.body.personal_email;
    const password = req.body.password;
    const users = await user.findOne({ personal_email: personal_email });
    if (!users) {
      res.json({ emailError: "Invalid email" });
    } else {
      const userData = await user.aggregate([
        { $match: { deleted_at: "null" } },
        { $match: { personal_email: personal_email } },
        {
          $lookup: {
            from: "roles",
            localField: "role_id",
            foreignField: "_id",
            as: "test",
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

        const man = await user.findByIdAndUpdate(users._id, { token });

        res.json({ userData, token, login_status: "login success" });
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
        const TechnologyData = await technology.find();
        res.json({ UserData, TechnologyData });
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
        const saddamProjectData = [ProjectData];
        const UserData = await user.find();
        const technologyData = await technology.find();
        res.json({ ProjectData, saddamProjectData, UserData, technologyData });
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
  // console.log("sdf",req.params.searchValue.toUpperCase())
  const searchData = await permission.find({
    permission_name: {
      $regex: req.params.searchValue,
      $options: "i",
    },
  });
  // db.collection.find({'name': {'$regex': thename,$options:'i'}});
  console.log(searchData);
  res.json({ searchData });
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
    .checkPermission(role_id, user_id, "Update Permission")
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
apicontroller.getAddRole = async (req, res) => {
  sess = req.session;
  const user_id = req.user._id;

  const role_id = req.user.role_id.toString();

  helper
    .checkPermission(role_id, user_id, "Add Role")
    .then(async (rolePerm) => {
      if (rolePerm.status == true) {
        res.json({ status: "you can add Role" });
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
          user_id: user_id,
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
              as: "test",
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "user_id",
              foreignField: "_id",
              as: "test1",
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
              as: "test",
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "user_id",
              foreignField: "_id",
              as: "test1",
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
        const projectData = await project.find({ deleted_at: "null" });
        const _id = new BSON.ObjectId(req.params.id);
        const tasks = await task.aggregate([
          { $match: { deleted_at: "null" } },
          { $match: { _id: _id } },
          {
            $lookup: {
              from: "projects",
              localField: "project_id",
              foreignField: "_id",
              as: "test",
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "user_id",
              foreignField: "_id",
              as: "test1",
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

apicontroller.getTaskByProject = async (req, res) => {
  const _id = new BSON.ObjectId(req.params.id);
  try {
    const tasks = await task.find({ project_id: _id });
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
              as: "test",
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

  const user_id = req.user._id;
  const userid = await user.find({
    deleted_at: {
      $ne: "null",
    },
  });
  res.json(userid);
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
  const _id = new BSON.ObjectId(req.params.id);
  const user_id = req.user._id;
  const role_id = req.user.role_id.toString();
  helper
    .checkPermission(role_id, user_id, "View Employees Details")
    .then(async (rolePerm) => {
      // console.log(rolePerm.status)
      if (rolePerm.status == true) {
        // const user_id = req.user._id;
        const userData = await user.aggregate([
          { $match: { _id: _id } },
          {
            $lookup: {
              from: "roles",
              localField: "role_id",
              foreignField: "_id",
              as: "role",
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "reporting_user_id",
              foreignField: "_id",
              as: "repoting_user",
            },
          },
        ]);

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
          as: "test",
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
    };
    const updateProfile = await user.findByIdAndUpdate(_id, updateuser);

    res.json({ updateProfile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
apicontroller.updateUSerPhoto = async (req, res) => {
  const _id = req.params.id;
  try {
    const updateProfilePhoto = {
      photo: req.body.photo,
    };
    const ProfilePhotoUpdate = await user.findByIdAndUpdate(
      _id,
      updateProfilePhoto
    );
    res.json({ ProfilePhotoUpdate });
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
        const role = await Role.find({ deleted_at: "null" });
        const userData = await user.findById(_id);
        const users = await user.find();
        const cities = await city.find();
        // console.log(cities)
        // const countries = await country.find();
        // const states = await state.find();

        res.json({ role, userData, users, cities });
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
  sess = req.session;
  const user_id = req.user._id;
  try {
    const userData = await user.find({ deleted_at: "null" });
    const referuserData = await user.find({
      deleted_at: "null",
      reporting_user_id: user_id,
    });
    const pending = await user.find({ status: "Pending", deleted_at: "null" });
    const active = await user.find({ status: "Active", deleted_at: "null" });
    const InActive = await user.find({
      status: "InActive",
      deleted_at: "null",
    });
    const pendingUser = await user.find({
      status: "Pending",
      deleted_at: "null",
      reporting_user_id: user_id,
    });
    const activeUser = await user.find({
      status: "Active",
      deleted_at: "null",
      reporting_user_id: user_id,
    });
    const InActiveUser = await user.find({
      status: "InActive",
      deleted_at: "null",
      reporting_user_id: user_id,
    });
    const projectData = await project.find({ deleted_at: "null" });
    const projectUserData = await project.find({
      deleted_at: "null",
      user_id: user_id,
    });
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
    const taskData = await task.find({ deleted_at: "null" });
    const taskUserData = await task.find({
      deleted_at: "null",
      user_id: user_id,
    });
    const leavesData = await leaves.find({
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

    const _id = new BSON.ObjectId(user_id);
    const usersdata = await user.find({ reporting_user_id: _id });
    var reporting_user_id = [];
    for (let i = 0; i < usersdata.length; i++) {
      element = usersdata[i]._id;
      reporting_user_id.push(element);
    }

    const allLeavesData = await Leaves.find({
      deleted_at: "null",
      user_id: reporting_user_id,
      status: "PENDING",
    });

    // const alluserData = await leaves.find({ deleted_at: "null" });

    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();
    const settingData = await Settings.find();
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

    const announcementData = await Announcement.find({
      date: { $gte: today },
    }).sort({ date: 1 });
    res.json({
      userData,
      pending,
      active,
      InActive,
      projectData,
      projecthold,
      dataholiday,
      projectinprogress,
      projectcompleted,
      taskData,
      leavesData,
      settingData,
      allLeavesData,
      announcementData,
      taskUserData,
      projectUserData,
      projectcompletedUser,
      projectinprogressUser,
      projectholdUser,
      referuserData,
      InActiveUser,
      activeUser,
      pendingUser,
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
      res.json({ status: "Email Sent Successfully" });
    } else {
      res.json({ status: "User Not found" });
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
    res.json({ status: "please check confirm password" });
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
        const emplyeeLeaves = await Leaves.find({ user_id: user_id });
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
    .checkPermission(role_id, user_id, "View Leaves Request")
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
          { $match: { status: "APPROVE" } },
          {
            $lookup: {
              from: "users",
              localField: "user_id",
              foreignField: "_id",
              as: "test",
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
    .checkPermission(role_id, user_id, "Accept Or Reject Leaves")
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
    .checkPermission(role_id, user_id, "Accept Or Reject Leaves")
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
              as: "project",
            },
          },
          {
            $lookup: {
              from: "tasks",
              localField: "task_id",
              foreignField: "_id",
              as: "task",
            },
          },
        ]);
        // console.log(timeEntryData.length);
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
  sess = req.session;
  const user_id = req.user._id;
  // console.log(user_id)
  const role_id = req.user.role_id.toString();

  helper
    .checkPermission(role_id, user_id, "View TimeEntries")
    .then(async (rolePerm) => {
      if (rolePerm.status == true) {
        const _month = parseInt(req.body.month);
        const _year = parseInt(req.body.year);

        const timeEntryData = await timeEntry.aggregate([
          { $match: { deleted_at: "null" } },

          { $match: { user_id: user_id } },

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
          { $sort: { date: 1 } },
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
        const admintimeEntryData = await timeEntry.aggregate([
          { $match: { deleted_at: "null" } },
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
          { $sort: { date: 1 } },
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
              from: "users",
              localField: "user_id",
              foreignField: "_id",
              as: "userData",
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

        res.json({ timeEntryData, admintimeEntryData });
      } else {
        res.json({ status: false });
      }
    })
    .catch((e) => {
      res.status(403).send(e);
    });
};

apicontroller.getRolePermission = async (req, res) => {
  sess = req.session;

  const user_id = req.user._id;

  const role_id = req.user.role_id.toString();

  helper
    .checkPermission(role_id, user_id, "View Rolepermissions")
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

        // const holidaypermission = await Permission.find({
        //   permission_name: {
        //     $regex: "holiday",
        //     $options: "i",
        //   },
        // });
        // console.log(holidaypermission);

        // var HolidayPermissions = [];

        // holidaypermission.forEach((holidayPerm) => {
        //   HolidayPermissions.push(holidayPerm.permission_name);
        // });
        // var holidayArr = HolidayPermissions
        // // console.log("HolidayPermissions", [HolidayPermissions]);
        // var obj = {};
        // obj["holiday"] = holidayArr;
        // var arr = [];
        // const array = arr.push(obj);
        // console.log(arr);

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
    .checkPermission(role_id, user_id, "Add Rolepermission")
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
    .checkPermission(role_id, user_id, "View UserPermissions")
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
        const userHaspermissions = userPermission.toString();
        var rolePermission = [];
        var roleId = [];

        rolePermissiondata.forEach((element) => {
          rolePermission.push(element.permission_id);
          roleId.push(element.role_id);
        });
        const roleHasPermissions = rolePermission.toString();
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
              as: "test",
            },
          },
        ]);

        res.json({
          allPermmission,
          roledatas,
          roleData,
          userHaspermissions,
          roleId,
          roleHasPermissions,
          userPermissiondata,
        });
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
        var addSettings = new Settings({
          key: req.body.key,
          type: req.body.type,
          value: req.body.value,
        });
        const key = req.body.key;
        const existkey = await Settings.find({ key: key });
        if (existkey.length > 0) {
          res.json({ status: false, massage: "this key already exist" });
        } else {
          const Settingsadd = await addSettings.save();
          res.json("Settings add done");
        }
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
  const settingData = await Settings.find({ key: key, deleted_at: "null" });
  if (settingData.length > 0) {
    res.json(settingData[0].value);
  }
};
apicontroller.alluserleaves = async (req, res) => {
  sess = req.session;
  const user_id = req.user._id;

  const role_id = req.user.role_id.toString();
  helper
    .checkPermission(role_id, user_id, "View All UserLeaves")
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
        res.json({ userData });
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
    const announcementData = await Announcement.find({ deleted_at: "null" });
    res.json({ announcementData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

apicontroller.Announcements = async (req, res) => {
  sess = req.session;
  try {
    var today = new Date().toISOString().split("T")[0];
    const announcementData = await Announcement.find({
      date: { $gte: today },
    }).sort({ date: 1 });

    res.json({ announcementData });
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
        });
        const Announcementadd = await addAnnouncement.save({
          expireAfterSeconds: 20,
        });
        res.json({ "Announcement add done ": addAnnouncement });
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
    const _id = req.params.id;
    const AnnouncementsData = await Announcement.findById(_id);
    res.json({ AnnouncementsData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
apicontroller.AnnouncementsUpdate = async (req, res) => {
  try {
    const _id = req.params.id;
    const updateAnnouncement = {
      announcement_title: req.body.announcement_title,
      announcement_description: req.body.announcement_description,
      announcement_date: req.body.announcement_date,
      updated_at: Date(),
    };
    const updatedAnnouncement = await Announcement.findByIdAndUpdate(
      _id,
      updateAnnouncement
    );
    res.json({ updatedAnnouncement });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
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
apicontroller.permissionwise = async (req, res) => {
  try {
    const personal_email = req.body.personal_email;
    const password = req.body.password;
    const users = await user.findOne({ personal_email: personal_email });
    if (!users) {
      res.json({ emailError: "Invalid email" });
    } else {
      const userData = await user.aggregate([
        { $match: { deleted_at: "null" } },
        { $match: { personal_email: personal_email } },
        {
          $lookup: {
            from: "roles",
            localField: "role_id",
            foreignField: "_id",
            as: "test",
          },
        },
      ]);
      const roleid = userData[0].role_id.toString();

      const roledata = await Role.findById({ _id: roleid });
      const roleiddata = roledata._id;

      const rolePermissionsdata = await rolePermissions.find({
        role_id: roleiddata,
      });

      const permissionid = rolePermissionsdata[0].permission_id;

      const permissiondala = await Permission.find({ _id: permissionid });

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

        const man = await user.findByIdAndUpdate(users._id, { token });

        res.json({ permissiondala });
      } else {
        res.json({ passwordError: "Incorrect password" });
      }
    }
  } catch (e) {}
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
          as: "test",
        },
      },
      {
        $lookup: {
          from: "tasks",
          localField: "task_id",
          foreignField: "_id",
          as: "test1",
        },
      },
    ]);

    res.json({ timeEntryData });
  } catch (e) {
    res.status(400).send(e);
  }
};

apicontroller.getAddAnnouncement = async (req, res) => {
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
apicontroller.getAddSalary = async (req, res) => {
  sess = req.session;
  const user_id = req.user._id;

  const role_id = req.user.role_id.toString();
  helper
    .checkPermission(role_id, user_id, "Add Leaves")
    .then(async (rolePerm) => {
      if (rolePerm.status == true) {
        const month = new Date().getMonth() + 1;
        const year = new Date().getFullYear();
        const userData = await user.find({ deleted_at: "null" });
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
        console.log("holiday", holidayData);
        res.json({ userData, holidayData });
      } else {
        res.json({ status: false });
      }
    })
    .catch((error) => {
      res.status(403).send(error);
    });
};
apicontroller.getDataByUser = async (req, res) => {
  sess = req.session;
  const user_id = req.user._id;
  const user = req.body.userId;
  const role_id = req.user.role_id.toString();
  helper
    .checkPermission(role_id, user_id, "Add Leaves")
    .then(async (rolePerm) => {
      if (rolePerm.status == true) {
        const month = new Date().getMonth() + 1;
        const year = new Date().getFullYear();

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
        //  console.log("userLeavesData",userLeavesData.length)
        res.json({ userLeavesData });
      } else {
        res.json({ status: false });
      }
    })
    .catch((error) => {
      res.status(403).send(error);
    });
};

// status: "APPROVE",
// deleted_at: "null",
// user_id: user,
// apicontroller.checkEmail = async (req, res) => {
//   const Email = req.body.UserEmail;
//   const user_id = req.body.user_id;

//   const emailExists = await user.findOne({
//     _id: { $ne: user_id },
//     personal_email: Email,
//   });
//   // const existEmail =

//   return res.status(200).json({ emailExists });
// };
apicontroller.checkUsername = async (req, res) => {
  const user_name = req.body.user_name;
  const user_id = req.body.user_id;

  const usernameExist = await user.findOne({
    _id: { $ne: user_id },
    user_name: user_name,
  });
  // const existEmail =
  console.log("usernameExist", usernameExist);
  return res.status(200).json({ usernameExist });
};

apicontroller.checkEmplyeeCode = async (req, res) => {
  const EMPCODE = `${"CC-" + req.body.emp_code}`;
  let emp_codeExist = await user.findOne({ emp_code: EMPCODE });
  res.json({ emp_codeExist });
};

apicontroller.getaddtxlsx = async (req, res) => {
  sess = req.session;
  token = req.cookies.jwt;

  res.render("addtxlsx");
};

apicontroller.addxlsxfile = async (req, res) => {
  const file = req.files.file.name;
  const filedata = req.files.file.data;
  fs.appendFile(file, filedata, function (err, result) {
    // console.log("err", err);
    // console.log("result", result);
    // console.log("Saved!");
    xlsxj(
      {
        input: file,
        output: "output.json",
      },
      function (err, result) {
        if (err) {
          console.error(err);
        } else {
          const sandip = user.insertMany(result, (error, res) => {
            fs.unlink(file, function (err) {
              if (err) throw err;
            });
            // fs.unlink("output.json", function (err) {
            //   if (err) throw err;
            // console.log(err);
            // });
          });
        }
      }
    );
  });

  res.redirect("userListing");
};

module.exports = apicontroller;
