// const task = require("../../model/createtask");
const BSON = require("bson");
const Helper = require("../../utils/helper");
const helper = new Helper();
// const taskApi = require("../../project_api/task");
const userApi = require("../../project_api/user");
// const technologyApi = require("../../project_api/technology");
// const Technology = require("../../model/technology");
const Users = require("../../model/user");
const task = require("../../model/createTask");
const Project = require("../../model/createProject");
const timeEntry = require("../../model/timeEntries");
const Role = require("../../model/roles");
const City = require("../../model/city");
const roleApi = require("../../project_api/role");
const LeaveHistory = require("../../model/leaveHistory");
const sendUserEmail = require("../../utils/sendemail");
const settingApi = require("../../project_api/setting");
const Leaves = require("../../model/leaves");
const assignInventory = require("../../model/assignInventory");

const userController = {};
userController.users = async (req, res) => {
  try {
    sess = req.session;
    const user_id = req.user._id;
    const role_id = req.user.role_id.toString();
    const userId = new BSON.ObjectId(req.user._id);
    const userRole = req.user.roleName;
    console.log("userRole", userRole == "Admin");
    const isAdmin = userRole == "Admin";
    const rolePerm = await helper.checkPermission(
      role_id,
      user_id,
      "View Employees"
    );
    if (rolePerm.status == true) {
      const page = parseInt(req.query.page) || 1;
      const limit = req.query.limit ? parseInt(req.query.limit) : 10;
      const skip = (page - 1) * limit;

      const sortParams = {};
      if (req.query.nameSort) {
        sortParams.firstname = req.query.nameSort === "ASC" ? 1 : -1;
      }
      if (req.query.nameSort) {
        sortParams.emp_code = req.query.codeSort === "ASC" ? 1 : -1;
      }

      let searchParams = { deleted_at: "null" };
      if (req.query.search) {
        searchParams.$or = [
          { firstname: { $regex: new RegExp(req.query.search, "i") } },
          { user_name: { $regex: new RegExp(req.query.search, "i") } },
          { emp_code: { $regex: new RegExp(req.query.search, "i") } },
          { company_email: { $regex: new RegExp(req.query.search, "i") } },
          { mo_number: { $regex: new RegExp(req.query.search, "i") } },
        ];
      }
      const totalData = await Users.countDocuments(searchParams);
      const totalPages = Math.ceil(totalData / limit);

      const userData = await Users.find(searchParams)
        .populate("role_id", "role_name")
        .select(
          "firstname last_name photo company_email mo_number status doj emp_code"
        )
        .sort(sortParams)
        .collation({ locale: "en", strength: 2 })
        .skip(skip)
        .limit(limit);

      const indexedUserData = userData.map((item, index) => ({
        index: skip + index + 1,
        ...item._doc,
      }));
      res.json({
        page,
        limit,
        totalPages,
        totalData,
        userData: indexedUserData,
      });
    } else {
      res.json({ status: false });
    }
  } catch (error) {
    console.log("errir", error);
    res.status(403).json({ message: error.message });
  }
};
userController.getAddUser = async (req, res) => {
  try {
    sess = req.session;
    const user_id = req.user._id;
    const role_id = req.user.role_id.toString();
    const rolePerm = await helper.checkPermission(role_id, user_id, "Add Employee");
    const userRole = req.user.roleName;
    if (rolePerm.status) {
      const roleData = await roleApi.allRoles();
      const cityData = await City.find().select("city");
      const userData = await userApi.allUsers();
      let maxEmpCode = userData.reduce(function (prev, curr) {
        return prev.emp_code > curr.emp_code ? prev : curr;
      });
      let newNum = parseInt(maxEmpCode.emp_code.substr(3)) + 1;
      // Combine the "CC-" prefix with the new numeric value
      let newEmpCode = "CC-" + newNum.toString().padStart(4, "0");
      res.status(200).json({ roleData, cityData, userData, newEmpCode });
    } else {
      res.json({ status: false });
    }
  } catch (error) {
    if (error.name === "ValidationError") {
      const errorMessages = Object.keys(error.errors).map(
        (key) => error.errors[key].message
      );
      res.status(400).json({ errors: errorMessages.join(", ") });
    } else if (error.name === "PermissionError") {
      res.status(403).json({ message: error.message });
    } else {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
};
userController.addUser = async (req, res) => {
  try {
    sess = req.session;
    const user_id = req.user._id;
    const role_id = req.user.role_id.toString();

    const rolePerm = await helper.checkPermission(
      role_id,
      user_id,
      "Add Employee"
    );
    if (rolePerm.status) {
      const emailExist = await Users.findOne({
        // personal_email: req.body.personal_email,
        company_email: req.body.company_email,
        deleted_at: "null",
      });
      if (emailExist) {
        res.json("email already exist");
      } else {
        if (!req.files) {
          var addUser = new Users({
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
            photo: "",
            bank_account_no: req.body.bank_account_no,
            bank_name: req.body.bank_name,
            ifsc_code: req.body.ifsc_code,
          });
        } else {
          let file = req.files.photo;
          file.mv("public/images/" + file.name);
          var addUser = new Users({
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
            photo: file.name,
            bank_account_no: req.body.bank_account_no,
            bank_name: req.body.bank_name,
            ifsc_code: req.body.ifsc_code,
          });
        }
        const email = req.body.company_email;
        const name = req.body.user_name;
        const firstname = req.body.firstname;

        const genrate_token = await addUser.genrateToken();
        const Useradd = await addUser.save();
        //add user leave
        const leavesSettingData = await settingApi.getSettingValue("leaves");
        // userData.forEach(async user => {
        const doj = Useradd.doj;
        const dojYear = doj.getFullYear();
        const dojMonth = doj.getMonth() + 1; // Adding 1 because months are zero-based
        let workingMonths;
        let totalLeaves = parseInt(leavesSettingData[0].value);
        let academicYear;
        if (dojMonth >= 4) {
          workingMonths = 12 - (dojMonth - 4); // Corrected subtraction
          console.log("workingMonths", workingMonths);
          academicYear = `${dojYear}-${dojYear + 1}`;
        } else {
          workingMonths = 4 - dojMonth;
          academicYear = `${dojYear - 1}-${dojYear}`;
        }
        totalLeaves = Math.floor(totalLeaves / 12) * workingMonths;
        const payload = new LeaveHistory({
          user_id: Useradd._id,
          year: academicYear,
          total_leaves: totalLeaves,
          taken_leaves: 0,
          remaining_leaves: totalLeaves,
        });
        const userLeavesData = payload.save();
        const id = Useradd._id;
        await sendUserEmail(email, id, name, firstname);
        res.status(200).json({ message: "User Created Successfully" });
      }
    } else {
      res.status(403).json({ status: false });
    }
  } catch (error) {
    if (error.name === "ValidationError") {
      const errorMessages = Object.keys(error.errors).map(
        (key) => error.errors[key].message
      );
      res.status(400).json({ errors: errorMessages.join(", ") });
    } else if (error.name === "PermissionError") {
      res.status(403).json({ message: error.message });
    } else {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
};
userController.getUser = async (req, res) => {
  try {
    sess = req.session;
    const user_id = req.user._id;
    const role_id = req.user.role_id.toString();

    const rolePerm = await helper.checkPermission(
      role_id,
      user_id,
      "Update Employee"
    );
    if (rolePerm.status) {
      const _id = req.params.id;
      const userData = await Users.findById(_id);
      const roleData = await roleApi.allRoles();
      const cityData = await City.find().select("city");
      const allUserData = await userApi.allUsers();
      res.json({ userData, roleData, allUserData, cityData });
    } else {
      res.status(403).json({ status: false });
    }
  } catch (error) {
    if (error.name === "ValidationError") {
      const errorMessages = Object.keys(error.errors).map(
        (key) => error.errors[key].message
      );
      res.status(400).json({ errors: errorMessages.join(", ") });
    } else if (error.name === "PermissionError") {
      res.status(403).json({ message: error.message });
    } else {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
};
userController.updateUser = async (req, res) => {
  try {
    sess = req.session;
    const user_id = req.user._id;
    const role_id = req.user.role_id.toString();

    const rolePerm = await helper.checkPermission(
      role_id,
      user_id,
      "Update Employee"
    );
    if (rolePerm.status) {
      const _id = req.params.id;
      let data = {};
      if (!req.files) {
        data = {
          role_id: req.body.role_id,
          emp_code: req.body.emp_code,
          reporting_user_id: req.body.reporting_user_id,
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
          status: req.body.status,
          bank_account_no: req.body.bank_account_no,
          bank_name: req.body.bank_name,
          ifsc_code: req.body.ifsc_code,
          updated_at: Date(),
        };
      } else {
        let file = req.files.photo;
        file.mv("public/images/" + file.name);
        data = {
          role_id: req.body.role_id,
          emp_code: req.body.emp_code,
          reporting_user_id: req.body.reporting_user_id,
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
          photo: file.name,
          bank_account_no: req.body.bank_account_no,
          bank_name: req.body.bank_name,
          ifsc_code: req.body.ifsc_code,
        };
      }
      await Users.findByIdAndUpdate(_id, data);
      const updatedUser = await Users.findById(_id);
      const leavesSettingData = await settingApi.getSettingValue("leaves");
      const doj = updatedUser.doj;
      const dojYear = doj.getFullYear();
      const dojMonth = doj.getMonth() + 1; // Adding 1 because months are zero-based
      // console.log(dojMonth, " ::dojYear")
      let workingMonths;
      let totalLeaves = parseInt(leavesSettingData[0].value);
      let academicYear;
      if (dojMonth >= 4) {
        workingMonths = 12 - (dojMonth - 4); // Corrected subtraction
        console.log("workingMonths", workingMonths);
        academicYear = `${dojYear}-${dojYear + 1}`;
      } else {
        workingMonths = 4 - doj.getMonth();
        academicYear = `${dojYear - 1}-${dojYear}`;
      }
      totalLeaves = Math.floor((totalLeaves / 12) * workingMonths);
      const takenLeaves = await Leaves.find({
        user_id: updatedUser._id,
        deleted_at: "null",
        status: "APPROVED",
      }).select("total_days");
      let totaldays = 0;
      takenLeaves.forEach((leaves) => {
        totaldays += parseFloat(leaves.total_days);
      });
      const remainingLeaves = totalLeaves - totaldays;
      console.log(totalLeaves, " ::remainingLeaves");
      const userHistory = {
        user_id: updatedUser._id,
        year: academicYear,
        total_leaves: totalLeaves,
        taken_leaves: totaldays,
        remaining_leaves: remainingLeaves,
      };
      console.log("gett", updatedUser._id);
      const userLeaveHistory = await LeaveHistory.findOne({
        user_id: updatedUser._id,
        year: academicYear,
      });
      console.log("gettts", userLeaveHistory, academicYear);
      await LeaveHistory.findByIdAndUpdate(userLeaveHistory?._id, userHistory);
      res.status(201).json({ message: "User Updated Successfully" });
    } else {
      res.status(403).json({ status: false });
    }
  } catch (error) {
    if (error.name === "ValidationError") {
      const errorMessages = Object.keys(error.errors).map(
        (key) => error.errors[key].message
      );
      res.status(400).json({ errors: errorMessages.join(", ") });
    } else if (error.name === "PermissionError") {
      res.status(403).json({ message: error.message });
    } else {
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
};
userController.deleteUser = async (req, res) => {
  try {
    sess = req.session;
    const user_id = req.user._id;
    const role_id = req.user.role_id.toString();

    const rolePerm = await helper.checkPermission(
      role_id,
      user_id,
      "Delete Employee"
    );
    if (rolePerm.status) {
      const _id = req.params.id;
      const updateUser = {
        deleted_at: Date(),
      };
      await Users.findByIdAndUpdate(_id, updateUser);
      res.status(201).json({ message: "User Deleted Successfully" });
    } else {
      res.status(403).json({ status: false });
    }
  } catch (error) {
    if (error.name === "ValidationError") {
      const errorMessages = Object.keys(error.errors).map(
        (key) => error.errors[key].message
      );
      res.status(400).json({ errors: errorMessages.join(", ") });
    } else if (error.name === "PermissionError") {
      res.status(403).json({ message: error.message });
    } else {
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
};
userController.restoreuser = async (req, res) => {
  sess = req.session;
  const user_id = req.user._id;
  const role_id = req.user.role_id.toString();
  helper
    .checkPermission(role_id, user_id, "View Employees")
    .then(async (rolePerm) => {
      if (rolePerm.status == true) {
        const _id = req.params.id;
        const updateUser = {
          deleted_at: "null",
        };
        const updateEmployee = await Users.findByIdAndUpdate(_id, updateUser);

        res.status(201).json({message:"User restored Successfully" });
      } else {
        res.json({ status: false });
      }
    })
    .catch((error) => {
      res.status(403).send(error);
    });
};
userController.userDetail = async (req, res) => {
  try {
    sess = req.session;
    const user_id = req.user._id;
    const role_id = req.user.role_id.toString();
    const rolePerm = helper.checkPermission(
      role_id,
      user_id,
      "View Employees Details"
    );
    // .then(async (rolePerm) => {
    if (rolePerm.status == true) {
      const _id = req.params.id;
      const user_id = new BSON.ObjectId(req.params.id);

      const userData = await Users.findById(_id);

      const userDetailData = await Users.aggregate([
        { $match: { _id: user_id } },
        { $addFields: { roleId: { $toObjectId: "$role_id" } } },
        {
          $lookup: {
            from: "roles",
            localField: "roleId",
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
        userDetailData: userDetailData,
        name: sess.name,
        loggeduserdata: req.user,
        users: sess.userData,
        role: sess.role,
        layout: false,
      });
    } else {
      res.json({ status: false });
    }
  } catch (error) {
    if (error.name === "ValidationError") {
      const errorMessages = Object.keys(error.errors).map(
        (key) => error.errors[key].message
      );
      res.status(400).json({ errors: errorMessages.join(", ") });
    } else if (error.name === "PermissionError") {
      res.status(403).json({ message: error.message });
    } else {
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
};
userController.profile = async (req, res) => {
  sess = req.session;
  const _id = new BSON.ObjectId(req.params.id);

  try {
    const userData = await Users.aggregate([
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
      {
        $lookup: {
          from: "users",
          localField: "reporting_user_id",
          foreignField: "_id",
          as: "repoting_user",
        },
      },
      {
        $project: {
          "roleData.role_name": 1,
          "repoting_user.firstname": 1,
          "roleData._id": 1,
          firstname: 1,
          middle_name: 1,
          last_name: 1,
          mo_number: 1,
          dob: 1,
          doj: 1,
          gender: 1,
          company_email: 1,
          personal_email: 1,
          emp_code: 1,
          add_1: 1,
          add_2: 1,
          aadhar_number: 1,
          pan_number: 1,
          city: 1,
          state: 1,
          country: 1,
          bank_name: 1,
          bank_account_no: 1,
          ifsc_code: 1,
          user_name: 1,
          photo: 1,
          pincode: 1,
        },
      },
    ]);
    const [AssignInventoryData] = await assignInventory.aggregate([
      { $match: { deleted_at: "null", user_id: _id } },
      {
        $lookup: {
          from: "inventoryitems",
          localField: "inventoryItem_id",
          foreignField: "_id",
          as: "InventoryItemData",
        },
      },
      {
        $lookup: {
          from: "cpuMasterInventories",
          localField: "InventoryItemData.cpu_data",
          foreignField: "_id",
          as: "CpuDataDetails",
        },
      },
    ]);

    const allCpuData = [];

    for (
      let i = 0;
      i < AssignInventoryData && AssignInventoryData.InventoryItemData.length;
      i++
    ) {
      const element = AssignInventoryData.InventoryItemData[i];
      const cpuData = await cpuInventory.find({
        _id: { $in: element.cpu_data },
      });

      if (cpuData.length > 0) {
        allCpuData.push(cpuData);
      }
    }

    res.json({
      userData,
      cpuData: allCpuData,
      AssignInventoryData:
        AssignInventoryData && AssignInventoryData.InventoryItemData,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errorMessages = Object.keys(error.errors).map(
        (key) => error.errors[key].message
      );
      res.status(400).json({ errors: errorMessages.join(", ") });
    } else if (error.name === "PermissionError") {
      res.status(403).json({ message: error.message });
    } else {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  }
};
userController.updateProfile = async (req, res) => {
  // const _id = req.params.id;
  const _id = new BSON.ObjectId(req.params.id);
  try {
    var userData = await Users.aggregate([
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

    if (userData[0].roleData[0].role_name == "Admin") {
      var updateUserProfile = {
        firstname: req.body.firstname,
        middle_name: req.body.middle_name,
        last_name: req.body.last_name,
        gender: req.body.gender,
        personal_email: req.body.personal_email,
        mo_number: req.body.mo_number,
        add_1: req.body.add_1,
        add_2: req.body.add_2,
        bank_account_no: req.body.bank_account_no,
        bank_name: req.body.bank_name,
        ifsc_code: req.body.ifsc_code,
        company_email: req.body.company_email,
        dob: req.body.dob,
        doj: req.body.doj,
        pan_number: req.body.pan_number,
        aadhar_number: req.body.aadhar_number,
        pincode: req.body.pincode,
        updated_at: Date(),
      };
    } else {
      var updateUserProfile = {
        firstname: req.body.firstname,
        middle_name: req.body.middle_name,
        last_name: req.body.last_name,
        gender: req.body.gender,
        personal_email: req.body.personal_email,
        mo_number: req.body.mo_number,
        add_1: req.body.add_1,
        add_2: req.body.add_2,
        pincode: req.body.pincode,
        updated_at: Date(),
      };
    }
    const updateProfile = await Users.findByIdAndUpdate(_id, updateUserProfile);
    res.status(201).json({ updateProfile, message: "User Profile Updated Successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
userController.editUserProfile = async (req, res) => {
  const _id = req.params.id;
  try {
    const updateProfilePhoto = {
      photo: req.files.photo.name,
    };
    var file = req.files.photo;
    const array_of_allowed_files = ["png", "jpeg", "jpg", "gif"];
    const imageName = file.name;
    const file_extension = imageName.split(".").pop();
    if (!array_of_allowed_files.includes(file_extension)) {
      var oldProfilePhoto = await Users.findByIdAndUpdate(_id);
      var photo = oldProfilePhoto.photo;
      res.json({ status: false });
    } else {
      file.mv("public/images/" + file.name);
      var ProfilePhotoUpdate = await Users.findByIdAndUpdate(
        _id,
        updateProfilePhoto
      );
      var photo = ProfilePhotoUpdate.photo;
      res.send({ photo });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
userController.addUserimage = async (req, res) => {
  try {
    const addImage = {
      photo: req.files.image.name,
    };
    var file = req.files.image;
    const array_of_allowed_files = ["png", "jpeg", "jpg", "gif"];
    const imageName = file.name;
    const file_extension = imageName.split(".").pop();
    if (!array_of_allowed_files.includes(file_extension)) {
      res.json({ status: false });
    } else {
      file.mv("public/images/" + file.name);

      const addUser = new Users({
        photo: req.files.image.name,
      });
      const addImage = await addUser.save();
      res.json({message:"Image added Successfully"});
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
userController.updateUserPhoto = async (req, res) => {
  const _id = req.params.id;
  try {
    const updateProfilePhoto = {
      photo: req.files.image.name,
    };
    var file = req.files.image;
    const array_of_allowed_files = ["png", "jpeg", "jpg", "gif"];
    const imageName = file.name;
    const file_extension = imageName.split(".").pop();
    if (!array_of_allowed_files.includes(file_extension)) {
      var oldProfilePhoto = await Users.findByIdAndUpdate(_id);
      var photo = oldProfilePhoto.photo;
      res.json({message:"Photo Updated Successfully" , status: false });
    } else {
      file.mv("public/images/" + file.name);
      var ProfilePhotoUpdate = await Users.findByIdAndUpdate(
        _id,
        updateProfilePhoto
      );
      var photo = ProfilePhotoUpdate.photo;
      res.send({ photo });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
userController.userprofilephoto = async (req, res) => {
  const _id = req.params.id;
  try {
    const updateProfilePhoto = {
      photo: req.body.photo,
    };
    const ProfilePhotoUpdate = await Users.findByIdAndUpdate(
      _id,
      updateProfilePhoto
    );
    res.status(201).json({message:'Profile Photo Updated Successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
userController.deleteduser = async (req, res) => {
  sess = req.session;
  const user_id = req.body;
  const userData = await Users.find({
    deleted_at: {$ne: "null"},
  }).select();
  res.status(200).json({userData});
};
userController.deletedMany = async (req, res) => {
  sess = req.session;
  // const user_id = new BSON.ObjectId(req.body.multiDelete);
  const user_id = req.body.multiDelete;

  const updateEmployee = await Users.updateMany(
    { _id: { $in: user_id } },
    { $set: { deleted_at: Date() } }
  );
  res.status(201).json({ message: "Selected User Deleted Successfully" });
};
userController.checkEmplyeeCode = async (req, res) => {
  const EMPCODE = req.body.emp_code;

  let emp_codeExist = await user.findOne({ emp_code: EMPCODE });
  if (emp_codeExist) {
    return res.status(200).json({ status: true });
  } else {
    return res.status(200).json({ status: false });
  }
}
userController.existusername = async (req, res) => {
  try {
    const Existuser = await Users.findOne({
      user_name: req.body.user_name,
      deleted_at: "null",
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
userController.existpersonal_email = async (req, res) => {
  try {
    const Existuser = await Users.findOne({
      company_email: req.body.company_email,
      deleted_at: "null",
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



module.exports = userController;
