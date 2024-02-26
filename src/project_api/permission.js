const permission = require("../model/addpermissions");
const rolePermission = require("../model/rolePermission");
// const permissionPermission = require("../model/permissionPermission");
const user = require("../model/user");

// console.log("asgsg")
const permissionApi = {
  async permissions({ searchParams, sortParams, skip, limit }) {
    const permissionData = await permission
      .find(searchParams)
      .select("permission_description permission_name")
      .collation({ locale: "en", strength: 2 })
      .sort(sortParams)
      .skip(skip)
      .limit(limit);
    return permissionData;
  },
  async allpermissions() {
    const permissionData = await permission
      .find({ deleted_at: "null" })
      .select("permission_description permission_name");
    return permissionData;
  },
  async addpermission(data) {
    try {
      const permissionData = new permission(data);
      await permissionData.save();
      console.log("permission added successfully:", data);
      return { success: true };
    } catch (error) {
      console.error("Error adding permission:", error);
      throw error; // Rethrow the error for the calling function to handle
    }
  },
  async getpermission(id) {
    try {
      console.log("gettt")
      const data = await permission.findById(id).select("permission_description permission_name");
      return data;
    } catch (error) {
      console.error("Error adding permission:", error);
      throw error; // Rethrow the error for the calling function to handle
    }
  },
  async updatepermission({ data, _id }) {
    try {
      var alreadypermission = await rolePermission.find({ permission_id: { $in: _id } });
      var userHasAlreadypermission = alreadypermission.toString().includes(_id);
      if (userHasAlreadypermission == true) {
        throw new Error("permission already assigned to role");
      } else {
        await permission.findByIdAndUpdate(
          _id,
          data,
          { runValidators: true, context: "query" } // Enable validation and use 'query' context
        );
        console.log("permission Updated successfully:", data);
        return { success: true };
      }
    } catch (error) {
      console.error("Error adding permission:", error);
      throw error; // Rethrow the error for the calling function to handle
    }
  },
  async deletepermission({ data, _id }) {
    try {
      var alreadypermission = await rolePermission.find({ permission_id: { $in: _id } });
      var userHasAlreadypermission = alreadypermission.toString().includes(_id);
      if (userHasAlreadypermission == true) {
        throw new Error("permission already assigned to role");
      } else {
        await permission.findByIdAndUpdate(_id, data);
        console.log("permission Deleted successfully:", data);
        return { success: true };
      }
    } catch (error) {
      console.error("Error adding permission:", error);
      throw error; // Rethrow the error for the calling function to handle
    }
  },
};

module.exports = permissionApi;
