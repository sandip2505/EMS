const permission = require("../../model/addpermissions");
// const permissionPermission = require("../../model");
const Helper = require("../../utils/helper");
const helper = new Helper();
const permissionApi = require("../../project_api/permission");

const permissionController = {};
permissionController.permissions = async (req, res) => {
  try {
    sess = req.session;
    const user_id = req.user._id;
    const role_id = req.user.role_id.toString();
    const permissionPerm = await helper.checkPermission(
      role_id,
      user_id,
      "View Permissions"
    );
    if (permissionPerm.status == true) {
      const page = parseInt(req.query.page) || 1;
      const limit = req.query.limit ? parseInt(req.query.limit) : 10;
      const skip = (page - 1) * limit;
      let searchParams = { deleted_at: "null" };
      if (req.query.search || req.query.year) {
        if (req.query.search) {
          searchParams.$or = [
            { permission_name: { $regex: new RegExp(req.query.search, "i") } },
            { permission_description: { $regex: new RegExp(req.query.search, "i") } },
          ];
        }
      }
      const sortParams = {};
      if (req.query.nameSort) {
        sortParams.permission_name = req.query.nameSort === "ASC" ? 1 : -1;
      }
      const permissionData = await permissionApi.permissions({
        searchParams,
        sortParams,
        skip,
        limit,
      });
      const allpermissionData = await permissionApi.allpermissions();
      const totalData = allpermissionData.length;
      const totalPages = Math.ceil(totalData / limit);
      const indexepermissionData = permissionData.map((item, index) => ({
        index: skip + index + 1,
        ...item._doc,
      }));
      console.log(indexepermissionData,'indexepermissionData')
      res.json({
        page,
        limit,
        totalPages,
        totalData,
        permissionData: indexepermissionData,
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
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
};
permissionController.addpermission = async (req, res) => {
  try {
    sess = req.session;
    const user_id = req.user._id;
    const role_id = req.user.role_id.toString();
    const rolePerm = await helper.checkPermission(role_id, user_id, "Add Permission");
    if (rolePerm.status == true) {
      await permissionApi.addpermission(req.body);
      res.status(201).json({ message: "permission Created Successfully" });
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
permissionController.getpermission = async (req, res) => {
  try {
    sess = req.session;
    const user_id = req.user._id;
    const role_id = req.user.role_id.toString();
    const rolePerm = await helper.checkPermission(
      role_id,
      user_id,
      "Update Permission"
    );
    if (rolePerm.status == true) {
      const _id = req.params.id;
      const permissionData = await permissionApi.getpermission(_id);
      res.status(200).json({ permissionData });
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
permissionController.updatepermission = async (req, res) => {
  try {
    sess = req.session;
    const user_id = req.user._id;
    const role_id = req.user.role_id.toString();

    const rolePerm = await helper.checkPermission(
      role_id,
      user_id,
      "Update Permission"
    );
    const data = req.body;
    const _id = req.params.id;

    if (rolePerm.status) {
      await permissionApi.updatepermission({ data, _id });
      res.status(201).json({ message: "Permission Updated Successfully" });
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
      res.status(500).json({ errors: error.message });
    }
  }
};
permissionController.deletepermission = async (req, res) => {
  console.log("gettt")
  try {
    sess = req.session;
    const user_id = req.user._id;
    const role_id = req.user.role_id.toString();

    const rolePerm = await helper.checkPermission(
      role_id,
      user_id,
      "Delete Permission"
    );
    if (rolePerm.status == true) {
      const _id = req.params.id;
      const data = {
        deleted_at: Date(),
      };
      await permissionApi.deletepermission({ data, _id });
      res.status(201).json({ message: "permission Deleted Successfully" });
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
      res.status(500).json({ errors: error.message });
    }
  }
  //   }
  //   .catch((error) => {
  //     res.status(403).send(error);
  //   });
};
module.exports = permissionController;
