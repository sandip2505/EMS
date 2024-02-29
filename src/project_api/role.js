const role = require("../model/roles");
const rolePermission = require("../model/rolePermission");
const user = require("../model/user");

// console.log("asgsg")
const roleApi = {
  async roles({ searchParams, sortParams, skip, limit }) {
    const roleData = await role
      .find(searchParams)
      .select("role_description role_name")
      .collation({ locale: "en", strength: 2 })
      .sort(sortParams)
      .skip(skip)
      .limit(limit);
    return roleData;
  },

  async allRoles() {
    const roleData = await role
      .find({ deleted_at: "null" })
      .select("role_date role_name");
    return roleData;
  },
  async addrole(data) {
    try {
      const roleData = new role(data);
      await roleData.save();
      console.log("role added successfully:", data);
      return { success: true };
    } catch (error) {
      console.error("Error adding role:", error);
      throw error; // Rethrow the error for the calling function to handle
    }
  },
  async getRole(id) {
    try {
      const data = await role.findById(id).select("role_description role_name");
      return data;
    } catch (error) {
      console.error("Error adding role:", error);
      throw error; // Rethrow the error for the calling function to handle
    }
  },
  async updateRole({ data, _id }) {
    try {
      var alreadyRole = await user.find({ role_id: _id });
      var userHasAlreadyRole = alreadyRole.toString().includes(_id);
      if (userHasAlreadyRole == true) {
        throw new Error("Role already assigned to user");
      } else {
        await role.findByIdAndUpdate(
          _id,
          data,
          { runValidators: true, context: "query" } // Enable validation and use 'query' context
        );
        console.log("role Updated successfully:", data);
        return { success: true };
      }
    } catch (error) {
      console.error("Error adding role:", error);
      throw error; // Rethrow the error for the calling function to handle
    }
  },
  async deleteRole({ data, _id }) {
    try {
      var alreadyRole = await user.find({ role_id: _id });
      var userHasAlreadyRole = alreadyRole.toString().includes(_id);
      if (userHasAlreadyRole == true) {
        throw new Error("Role already assigned to user");
      } else {
        await role.findByIdAndUpdate(_id, data);
        console.log("role Deleted successfully:", data);
        return { success: true };
      }
    } catch (error) {
      console.error("Error adding role:", error);
      throw error; // Rethrow the error for the calling function to handle
    }
  },
  async getRolePermission(id) {
    try {
      console.log("id", id);
      const data = await rolePermission.findOne({ role_id: id });
      return data;
    } catch (error) {
      console.error("Error adding role:", error);
      throw error; // Rethrow the error for the calling function to handle
    }
  },
  async addRolePermission(data) {
    try {
      const addpermission = new rolePermission(data);
      await addpermission.save();
      return true;
    } catch (error) {
      throw error;
    }
  },
};

module.exports = roleApi;
