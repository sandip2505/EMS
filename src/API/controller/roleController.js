const role = require("../../model/roles");
const permission = require("../../model/addpermissions");
const rolePermission = require("../../model/rolePermission");
const Helper = require("../../utils/helper");
const helper = new Helper();
const roleApi = require("../../project_api/role");
const PermissionModule = require("../../model/permission_module");

const roleController = {};
roleController.roles = async (req, res) => {
  try {
    sess = req.session;
    const user_id = req.user._id;
    const role_id = req.user.role_id.toString();
    const rolePerm = await helper.checkPermission(
      role_id,
      user_id,
      "View Roles"
    );
    if (rolePerm.status == true) {
      const page = parseInt(req.query.page) || 1;
      const limit = req.query.limit ? parseInt(req.query.limit) : 10;
      const skip = (page - 1) * limit;
      let searchParams = { deleted_at: "null" };
      if (req.query.search || req.query.year) {
        if (req.query.search) {
          searchParams.$or = [
            { role_name: { $regex: new RegExp(req.query.search, "i") } },
            { role_description: { $regex: new RegExp(req.query.search, "i") } },
          ];
        }
      }
      const sortParams = {};
      if (req.query.nameSort) {
        sortParams.role_name = req.query.nameSort === "ASC" ? 1 : -1;
      }
      const roleData = await roleApi.roles({
        searchParams,
        sortParams,
        skip,
        limit,
      });
      const allRoleData = await roleApi.allRoles();
      const totalData = allRoleData.length;
      const totalPages = Math.ceil(totalData / limit);
      const indexeroleData = roleData.map((item, index) => ({
        index: skip + index + 1,
        ...item._doc,
      }));
      res.json({
        page,
        limit,
        totalPages,
        totalData,
        roleData: indexeroleData,
      });
    } else {
      res.status(403).json({ status: false ,errors:'Permission denied' });
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
roleController.addRole = async (req, res) => {
  try {
    sess = req.session;
    const user_id = req.user._id;
    const role_id = req.user.role_id.toString();
    const rolePerm = await helper.checkPermission(role_id, user_id, "Add Role");
    if (rolePerm.status == true) {
      await roleApi.addrole(req.body);
      res.status(201).json({ message: "Role Created Successfully" });
    } else {
      res.status(403).json({ status: false ,errors:'Permission denied' });
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
roleController.getRole = async (req, res) => {
  try {
    sess = req.session;

    const user_id = req.user._id;
    const role_id = req.user.role_id.toString();
    const rolePerm = await helper.checkPermission(
      role_id,
      user_id,
      "Update Role"
    );
    if (rolePerm.status == true) {
      const _id = req.params.id;
      const roleData = await roleApi.getRole(_id);
      res.status(200).json({ roleData });
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
roleController.updateRole = async (req, res) => {
  try {
    sess = req.session;
    const user_id = req.user._id;
    const role_id = req.user.role_id.toString();

    const rolePerm = await helper.checkPermission(
      role_id,
      user_id,
      "Update Role"
    );
    const data = req.body;
    const _id = req.params.id;

    if (rolePerm.status) {
      await roleApi.updateRole({ data, _id });
      res.status(201).json({ message: "Role Updated Successfully" });
    } else {
      res.status(403).json({ status: false ,errors:'Permission denied' });
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
roleController.deleteRole = async (req, res) => {
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
      await roleApi.deleteRole({ data, _id });
      res.status(201).json({ message: "Role Deleted Successfully" });
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
roleController.getRolePermission = async (req, res) => {
  try {
    sess = req.session;
    const user_id = req.user._id;
    const role_id = req.user.role_id.toString();
    const rolePerm = await helper.checkPermission(
      role_id,
      user_id,
      "View RolePermissions"
    );
    const _id = req.params.id;
    const rolePermissiondata = await roleApi.getRolePermission(_id);
    const roleData = await roleApi.getRole(_id);
    const permissions = await permission
      .find({ deleted_at: "null" })
      .select("_id permission_name");

      const permissionModuleData = await PermissionModule.find()

    var roleHasPermission = [];
    if (rolePermissiondata) {
      roleHasPermission = rolePermissiondata.permission_id;
      res.status(200).json({ permissions, roleHasPermission, roleData , permissionModuleData });
    }
    res.json({ permissions, roleData, roleHasPermission });
  } catch (error) {}
};
roleController.addRolePermission = async (req, res) => {
  try {
    sess = req.session;
    const user_id = req.user._id;
    const role_id = req.user.role_id.toString();
    const rolePerm = await helper.checkPermission(
      role_id,
      user_id,
      "Add RolePermission"
    );
    const _id = req.params.id;
    if (!req.body.permission_id.length > 0)
      throw new Error("Please select atleast one permission");
    const existingRolePermission = await rolePermission.findOne({
      role_id: _id,
    });
    if (existingRolePermission)
      await rolePermission.deleteMany({ role_id: _id });
    const data = {
      role_id: req.body.role_id,
      permission_id: req.body.permission_id,
    };
    await roleApi.addRolePermission(data);
    res.status(201).json({ message: "Role Permission Updated Successfully" });
  } catch (error) {
    console.log("error", error);
    res.status(400).json({ errors: error.message });
  }
};
module.exports = roleController;
