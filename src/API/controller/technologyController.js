const technology = require("../../model/technology");
const Helper = require("../../utils/helper");
const helper = new Helper();
const technologyApi = require("../../project_api/technology");

const technologyController = {};
technologyController.technologies = async (req, res) => {
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
          technology: {
            $regex: new RegExp(req.query.search, "i"),
          },
        }),
      };
      console.log("searchParams", searchParams);

      const totalData = await technology.countDocuments(searchParams);
      const totalPages = Math.ceil(totalData / limit);
      const technologyData = await technologyApi.technologies({
        searchParams,
        skip,
        limit,
      });
      const indexTechnologyData = technologyData.map((item, index) => ({
        index: skip + index + 1,
        ...item._doc,
      }));
      res.json({
        page,
        limit,
        totalPages,
        totalData,
        technologyData: indexTechnologyData,
      });
    } else {
      res.json({ status: false });
    }
  } catch (error) {
    console.log("errir", error);
    res.status(403).json({ message: error.message });
  }
};
technologyController.addTechnology = async (req, res) => {
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
      await technologyApi.addTechnology(req.body);
      res.status(201).json({ message: "Technology Created Successfully" });
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
technologyController.editTechnology = async (req, res) => {
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
      const technologyData = await technologyApi.getTechnology(_id);
      res.status(200).json({ technologyData });
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
technologyController.updateTechnology = async (req,res) =>{
  try {
    sess = req.session;
    const user_id = req.user._id;
    const role_id = req.user.role_id.toString();

    const rolePerm = await helper.checkPermission(
      role_id,
      user_id,
      "Update Holiday"
    );
    const data = req.body;
    const _id = req.params.id;
    if (rolePerm.status) {
      await technologyApi.updateTechnology({ data, _id });
      res.status(201).json({ message: "Technology Updated Successfully" });
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
}
technologyController.deleteTechnology = async (req, res) => {
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
module.exports = technologyController;
