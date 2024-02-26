const project = require("../../model/createProject");
const BSON = require("bson");
const Helper = require("../../utils/helper");
const helper = new Helper();
const projectApi = require("../../project_api/project");
const userApi = require("../../project_api/user");
const technologyApi = require("../../project_api/technology");
const Technology = require("../../model/technology");
const Users = require("../../model/user");
const task = require("../../model/createTask");

const projectController = {};
projectController.projects = async (req, res) => {
  try {
    sess = req.session;
    const user_id = req.user._id;
    const role_id = req.user.role_id.toString();
    const userId = new BSON.ObjectId(req.user._id);
    const userRole = req.user.role[0].role_name;
    const rolePerm = await helper.checkPermission(
      role_id,
      user_id,
      "View Projects"
    );
    if (rolePerm.status == true) {
      const page = parseInt(req.query.page) || 1;
      const limit = req.query.limit ? parseInt(req.query.limit) : 10;
      const skip = (page - 1) * limit;
      const userMatch = req.query.userId
        ? [{ $match: { user_id: new BSON.ObjectId(req.query.userId) } }]
        : [];
      const statusMatch = req.query.status
        ? [{ $match: { status: req.query.status } }]
        : [];

      let sortParams = {};
      if (req.query.nameSort) {
        sortParams.title = req.query.nameSort === "ASC" ? 1 : -1;
      }

      let searchParams = { deleted_at: "null" };
      if (req.query.search) {
        searchParams.$or = [
          { title: { $regex: new RegExp(req.query.search, "i") } },
          // { role_description: { $regex: new RegExp(req.query.search, "i") } },
        ];
      }

      const projectData = await project.aggregate([
        { $match: searchParams },
        {
          $match: {
            $expr: {
              $cond: {
                if: { $eq: [userRole, "Admin"] },
                then: {},
                else: { $in: [new BSON.ObjectId(req.user._id), "$user_id"] },
              },
            },
          },
        },
        ...userMatch,
        ...statusMatch,
        {
          $facet: {
            documents: [
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
                  let: { projectId: "$_id" },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $and: [
                            { $eq: ["$project_id", "$$projectId"] },
                            { $eq: ["$deleted_at", 'null'] },
                          ],
                        },
                      },
                    },
                  ],
                  as: "taskData",
                },
              },
              {
                $lookup: {
                  from: "timeentries",
                  let: { projectId: "$_id" },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $and: [
                            { $eq: ["$project_id", "$$projectId"] },
                            { $eq: ["$deleted_at", 'null'] },
                          ],
                        },
                      },
                    },
                  ],
                  as: "timeEntryData",
                },
              },
              {
                $addFields: {
                  totalProjectEstimatedHours: { $sum: "$taskData.task_estimation" },
                },
              },
              {
                $addFields: {
                  totalProjectActualHours: { $sum: "$timeEntryData.hours" },
                },
              },
              {
                $project: {
                  "userData.firstname": 1,
                  "userData.last_name": 1,
                  totalProjectEstimatedHours: 1,
                  totalProjectActualHours: 1,
                  title: 1,
                  start_date: 1,
                  end_date: 1,
                  status: 1,
                  technology: 1,
                  project_type: 1,
                  short_description: 1,
                  _id: 1,
                },
              },
              { $sort: sortParams },
              { $skip: skip },
              { $limit: limit },
            ],
            totalDocuments: [
              { $count: "count" }, // Count without skip and limit
            ],
          },
        },
      ]);
      const totalDocuments = projectData[0].totalDocuments[0]
        ? projectData[0].totalDocuments[0].count
        : 0;

      // console.log("timeEntryData", timeEntryData);
      const totalData = totalDocuments;
      const totalPages = Math.ceil(totalData / limit);
      const indexprojectData = projectData[0].documents.map((item, index) => ({
        index: skip + index + 1,
        ...item,
      }));
      const userData = await userApi.allUsers();
      res.json({
        page,
        limit,
        totalPages,
        totalData,
        userData,
        projectData: indexprojectData,
      });
    } else {
      res.json({ status: false });
    }
  } catch (error) {
    console.log("errir", error);
    res.status(403).json({ message: error.message });
  }
};
projectController.getAddProject = async (req, res) => {
  try {
    sess = req.session;
    const user_id = req.user._id;
    const role_id = req.user.role_id.toString();
    const rolePerm = await helper.checkPermission(
      role_id,
      user_id,
      "Add Project"
    );
    if (rolePerm.status) {
      var userName = [];
      const UserData = await userApi.allUsers();
      UserData.forEach(function (element) {
        userName.push({
          value: element._id,
          label: element.firstname,
        });
      });
      const TechnologyData = await technologyApi.allTechnologies();
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
projectController.addproject = async (req, res) => {
  try {
    sess = req.session;
    const user_id = req.user._id;
    const role_id = req.user.role_id.toString();
    const rolePerm = await helper.checkPermission(
      role_id,
      user_id,
      "Add Project"
    );
    const data = {
      title: req.body.title,
      short_description: req.body.short_description,
      start_date: req.body.start_date,
      end_date: req.body.end_date,
      status: req.body.status,
      technology: req.body.technology,
      project_type: req.body.project_type,
      user_id: req.body.user_id,
    };
    if (rolePerm.status) {
      const missingFields = [];
      if (!req.body.title) missingFields.push("Title");
      if (!req.body.technology.length) missingFields.push("Technology");
      if (!req.body.user_id.length) missingFields.push("User");
      if (!req.body.start_date) missingFields.push("Start Date");
      if (!req.body.project_type) missingFields.push("Project Type");
      // if (!hours) missingFields.push("Hours");
      // if (!date) missingFields.push("Date");
      // Check if any required field is missing
      if (missingFields.length > 0) {
        return res.status(400).json({
          errors: `${missingFields.join(", ")} ${
            missingFields.length > 1 ? "are" : "is"
          } Required`,
        });
      }
      const projectData = new project(data);
      await projectData.save();
      res.status(201).json({ message: "Project Created Successfully" });
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
projectController.getproject = async (req, res) => {
  try {
    sess = req.session;
    const user_id = req.user._id;
    const role_id = req.user.role_id.toString();

    const rolePerm = await helper.checkPermission(
      role_id,
      user_id,
      "Update Project"
    );
    if (rolePerm.status == true) {
      const _id = req.params.id;
      const projectData = await project
        .findById(_id)
        .select(
          "_id title short_description start_date end_date status project_type technology user_id"
        );

      const existuserData = await Users.find({
        _id: { $in: projectData.user_id },
      }).select("_id firstname last_name");
      const existTechnologyData = await Technology.find({
        technology: { $in: projectData.technology },
      });

      console.log("existTechnologyData", existTechnologyData);

      const TechnologyData = await technologyApi.allTechnologies();
      var technologyname = [];
      TechnologyData.forEach(function (element) {
        technologyname.push({
          value: element.technology,
          label: element.technology,
        });
      });
      var existTechnologyname = [];
      existTechnologyData.forEach(function (technologies) {
        existTechnologyname.push({
          value: technologies.technology,
          label: technologies.technology,
        });
      });
      const UserData = await userApi.allUsers();
      var userName = [];
      UserData.forEach(function (element) {
        userName.push({
          value: element._id,
          label: element.firstname,
        });
      });
      var existUserName = [];
      existuserData.forEach(function (users) {
        existUserName.push({
          value: users._id,
          label: users.firstname,
        });
      });
      res.status(200).json({
        projectData,
        existuserData,
        technologyname,
        existTechnologyname,
        userName,
        existUserName,
        UserData,
        TechnologyData,
        existTechnologyData,
      });
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
projectController.updateProject = async (req, res) => {
  try {
    sess = req.session;
    const user_id = req.user._id;
    const role_id = req.user.role_id.toString();

    const rolePerm = await helper.checkPermission(
      role_id,
      user_id,
      "Update Project"
    );
    const data = {
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
    const _id = req.params.id;
    if (rolePerm.status) {
      const missingFields = [];
      if (!req.body.title) missingFields.push("Title");
      if (!req.body.technology.length) missingFields.push("Technology");
      if (!req.body.user_id.length) missingFields.push("User");
      if (!req.body.start_date) missingFields.push("Start Date");
      if (!req.body.project_type) missingFields.push("Project Type");
      // if (!hours) missingFields.push("Hours");
      // if (!date) missingFields.push("Date");
      // Check if any required field is missing
      if (missingFields.length > 0) {
        return res.status(400).json({
          errors: `${missingFields.join(", ")} ${
            missingFields.length > 1 ? "are" : "is"
          } Required`,
        });
      }
      const updateProject = await project.findByIdAndUpdate(_id, data);
      res.status(201).json({ message: "Project Updated Successfully" });
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
};
projectController.deleteProject = async (req, res) => {
  try {
    sess = req.session;
    const user_id = req.user._id;
    const role_id = req.user.role_id.toString();

    const rolePerm = await helper.checkPermission(
      role_id,
      user_id,
      "Delete Project"
    );
    if (rolePerm.status == true) {
      const _id = req.params.id;
      const projectHasTask = await task.find({
        project_id: _id,
        deleted_at: "null",
      });
      if (projectHasTask.length == 0) {
        const deleteProject = {
          deleted_at: Date(),
        };
        await project.findByIdAndUpdate(_id, deleteProject);
        res.status(201).json({ message: "Role Deleted Successfully" });
      } else {
        throw new Error("Project Has Task So You Cant Delete");
      }
      // const data = {
      //   deleted_at: Date(),
      // };
      // await roleApi.deleteRole({ data, _id });
      // res.status(201).json({ message: "Role Deleted Successfully" });
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
module.exports = projectController;
