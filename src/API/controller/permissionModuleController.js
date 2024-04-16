const permissionModule = require("../../model/permission_module");
const Helper = require("../../utils/helper");
const helper = new Helper();
const technologyApi = require("../../project_api/technology");

const permissionModuleController = {};
permissionModuleController.permissionModules = async (req, res) => {
  try {
    sess = req.session;
    const user_id = req.user._id;
    const role_id = req.user.role_id.toString();
    const rolePerm = await helper.checkPermission(
      role_id,
      user_id,
      "View Holidays"
    );
    console.log("req.qu", req.query, rolePerm);
    if (rolePerm.status == true) {
      const page = parseInt(req.query.page) || 1;
      const limit = req.query.limit ? parseInt(req.query.limit) : 10;
      const skip = (page - 1) * limit;
      const searchParams = {
        ...(req.query.search && {
          name: {
            $regex: new RegExp(req.query.search, "i"),
          },
        }),
      };
      const totalData = await permissionModule.countDocuments(searchParams);
      const totalPages = Math.ceil(totalData / limit);
      const permissionModuleData = await permissionModule
        .find(searchParams)
        .skip(skip)
        .limit(limit);
      const indexPermissionModuleData = permissionModuleData.map(
        (item, index) => ({
          index: skip + index + 1,
          ...item._doc,
        })
      );
      res.json({
        page,
        limit,
        totalPages,
        totalData,
        permissionModuleData: indexPermissionModuleData,
      });
    } else {
      res.status(403).json({ status: false ,errors:'Permission denied' });
    }
  } catch (error) {
    console.log("errir", error);
    res.status(403).json({ message: error.message });
  }
};
permissionModuleController.addPermissionModule = async (req, res) => {
  try {
    sess = req.session;
    const user_id = req.user._id;
    const role_id = req.user.role_id.toString();

    const rolePerm = await helper.checkPermission(
      role_id,
      user_id,
      "Add Technology"
    );
    if (rolePerm.status) {
      const data = req.body;
      const permissionModuleData = new permissionModule(data);
      await permissionModuleData.save();
      res
        .status(201)
        .json({ message: "Permission Module Created Successfully" });
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
permissionModuleController.editPermissionModule = async (req, res) => {
  try {
    sess = req.session;
    const user_id = req.user._id;
    const role_id = req.user.role_id.toString();

    const rolePerm = await helper.checkPermission(
      role_id,
      user_id,
      "Update Holiday"
    );
    if (rolePerm.status == true) {
      const _id = req.params.id;
      const permissionModuleData = await permissionModule.findById(_id);
      res.status(200).json({ permissionModuleData });
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
permissionModuleController.updatePermissionModule = async (req, res) => {
  try {
    sess = req.session;
    const user_id = req.user._id;
    const role_id = req.user.role_id.toString();

    const rolePerm = await helper.checkPermission(
      role_id,
      user_id,
      "Update Holiday"
    );
    // const data = req.body;
    if (rolePerm.status) {
      const _id = req.params.id;
      console.log("req.body",req.body.name,_id)
      const data = {
        name: req.body.name,
      };
      await permissionModule.findByIdAndUpdate(_id,{name: req.body.name});
      res.status(201).json({ message: "Permission Module Updated Successfully" });
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
permissionModuleController.deletePermissionModule = async (req, res) => {
  try {
    sess = req.session;
    const user_id = req.user._id;
    const role_id = req.user.role_id.toString();

    const rolePerm = await helper.checkPermission(
      role_id,
      user_id,
      "Delete Role"
    );
    if (rolePerm.status == true) {
      const _id = req.params.id;
      const data = {
        deleted_at: Date(),
      };
      await permissionModule.findByIdAndDelete(_id)
      res.status(201).json({ message: "PermissionModule Deleted Successfully" });
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
      res.status(500).json({ errors: error.message });
    }
  }
  //   }
  //   .catch((error) => {
  //     res.status(403).send(error);
  //   });
};


module.exports = permissionModuleController;
