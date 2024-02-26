// const task = require("../../model/createtask");
const BSON = require("bson");
const Helper = require("../../utils/helper");
const helper = new Helper();
const taskApi = require("../../project_api/task");
const userApi = require("../../project_api/user");
const technologyApi = require("../../project_api/technology");
const Technology = require("../../model/technology");
const Users = require("../../model/user");
const task = require("../../model/createTask");
const Project = require("../../model/createProject");
const timeEntry = require("../../model/timeEntries");

const taskController = {};
taskController.tasks = async (req, res) => {
  try {
    sess = req.session;
    const user_id = req.user._id;
    const role_id = req.user.role_id.toString();
    const userId = new BSON.ObjectId(req.user._id);
    const userRole = req.user.roleName;
    console.log("userRole",userRole == "Admin")
    const isAdmin = userRole == "Admin";
    const rolePerm = await helper.checkPermission(
      role_id,
      user_id,
      "View Tasks"
    );
    if (rolePerm.status == true) {
      const page = parseInt(req.query.page) || 1;
      const limit = req.query.limit ? parseInt(req.query.limit) : 10;
      const skip = (page - 1) * limit;

      const sortParams = {};
      if (req.query.nameSort) {
        sortParams.title = req.query.nameSort === "ASC" ? 1 : -1;
      }
      // if (req.query.nameSort) {
      //   sortParams.title = req.query.nameSort === "ASC" ? 1 : -1;
      // }

      let searchParams = { deleted_at: "null" };
      if (req.query.projectId) {
        searchParams.project_id = new BSON.ObjectId(req.query.projectId);
      }
      if (req.query.userId) {
        searchParams.user_id = new BSON.ObjectId(req.query.userId);
      }
      if (req.query.status === 0 || !!req.query.status ) {
        console.log(":as",req.query.status)
        searchParams.task_status = parseInt(req.query.status);
      }

      if (req.query.search) {
        searchParams.$or = [
          { title: { $regex: new RegExp(req.query.search, "i") } },
          // { role_description: { $regex: new RegExp(req.query.search, "i") } },
        ];
      }
      const taskData = await task.aggregate([
        { $match: searchParams },
        {
          $match: {
            $expr: {
              $cond: {
                if: isAdmin ,
                then: {},
                else: { $eq: ["$user_id", userId] },
              },
            },
          },
        },        
        {
          $facet: {
            documents: [
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
                  from: "timeentries",
                  localField: "_id",
                  foreignField: "task_id",
                  as: "timeEntryData",
                },
              },
              {
                $project: {
                  "projectData.title": 1,
                  "userData.firstname": 1,
                  "userData.last_name": 1,
                  title: 1,
                  task_status: 1,
                  task_type: 1,
                  short_description: 1,
                  task_estimation: 1,
                  _id: 1,
                  totalHours: {
                    $reduce: {
                      input: {
                        $map: {
                          input: "$timeEntryData",
                          as: "hour",
                          in: {
                            $cond: {
                              if: {
                                $and: [
                                  { $ne: ["$$hour.hours", ""] },
                                  { $gte: [{ $toDouble: "$$hour.hours" }, 0] },
                                ],
                              },
                              then: { $toDouble: "$$hour.hours" },
                              else: 0,
                            },
                          },
                        },
                      },
                      initialValue: 0,
                      in: { $add: ["$$value", "$$this"] },
                    },
                  },
                  estimatedHours: { $toDouble: "$task_estimation" },
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
      ]).collation({ locale: "en", strength: 2 });

      // const taskData = await task.aggregate([
      //   { $match: searchParams },
      //   {
      //     $match: {
      //       $expr: {
      //         $cond: {
      //           if: { $eq: [userRole, "Admin"] },
      //           then: true,
      //           else: { $in: [new BSON.ObjectId(req.user._id), "$user_id"] },
      //         },
      //       },
      //     },
      //   },
      //   ...userMatch,
      //   ...statusMatch,
      //   {
      //     $facet: {
      //       documents: [
      //         {
      //           $lookup: {
      //             from: "users",
      //             localField: "user_id",
      //             foreignField: "_id",
      //             as: "userData",
      //           },
      //         },
      //         {
      //           $task: {
      //             "userData.firstname": 1,
      //             "userData.last_name": 1,
      //             title: 1,
      //             start_date: 1,
      //             end_date: 1,
      //             status: 1,
      //             technology: 1,
      //             task_type: 1,
      //             short_description: 1,
      //             _id: 1,
      //           },
      //         },
      //         // { $sort: sortParams },
      //         { $skip: skip },
      //         { $limit: limit },
      //       ],
      //       totalDocuments: [
      //         { $count: "count" }, // Count without skip and limit
      //       ],
      //     },
      //   },
      // ]);
      const totalDocuments = taskData[0].totalDocuments[0]
        ? taskData[0].totalDocuments[0].count
        : 0;

      // console.log("timeEntryData", timeEntryData);
      const totalData = totalDocuments;
      const totalPages = Math.ceil(totalData / limit);
      const indextaskData = taskData[0].documents.map((item, index) => ({
        index: skip + index + 1,
        ...item,
      }));
      const userData = await userApi.allUsers();
      const projectData = await Project.find({
        $or: [
          isAdmin
            ? { deleted_at: "null" }
            : {
                user_id: user_id,
                deleted_at: "null",
                status: { $ne: "Completed" },
              },
        ],
      })
        .select("_id title")
        .sort({ created_at: -1 });

      res.json({
        page,
        limit,
        totalPages,
        totalData,
        userData,
        projectData,
        taskData: indextaskData,
      });
    } else {
      res.json({ status: false });
    }
  } catch (error) {
    console.log("errir", error);
    res.status(403).json({ message: error.message });
  }
};
taskController.getAddTask = async (req, res) => {
  try {
    sess = req.session;
    const user_id = req.user._id;
    const role_id = req.user.role_id.toString();
    const rolePerm = await helper.checkPermission(role_id, user_id, "Add Task");
    const userRole = req.user.roleName;
    if (rolePerm.status) {
      const isAdmin = userRole == "Admin";
      const projectData = await Project.find({
        $or: [
          isAdmin
            ? { deleted_at: "null", status: { $ne: "Completed" } }
            : {
                user_id: user_id,
                deleted_at: "null",
                status: { $ne: "Completed" },
              },
        ],
      })
        .select("_id title")
        .sort({ created_at: -1 });
      var userData = await userApi.allUsers();
      res.json({ projectData, userData });
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
taskController.getUserByProject = async (req, res) => {
  const user_id = req.user._id;
  const role_id = req.user.role_id.toString();
  const _id = new BSON.ObjectId(req.params.id);
  const userRole = req.user.roleName;
  try {
    const isAdmin = userRole == "Admin";
    console.log(isAdmin);

    var userProjectData = await Project.aggregate([
      { $match: { _id } },
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $cond: {
                        if: isAdmin,
                        then: {},
                        else: {
                          $eq: ["$_id", new BSON.ObjectId(req.user._id)],
                        },
                      },
                    },
                    { $eq: ["$deleted_at", "null"] },
                  ],
                },
              },
            },
          ],
          foreignField: "_id",
          as: "userData",
        },
      },
      {
        $project: {
          "userData.firstname": 1,
          "userData.last_name": 1,
          "userData._id": 1,
        },
      },
    ]);
    return res.status(200).json({ userProjectData:userProjectData[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
taskController.addTask = async (req, res) => {
  try {
    sess = req.session;
    const user_id = req.user._id;
    const role_id = req.user.role_id.toString();
    const rolePerm = await helper.checkPermission(role_id, user_id, "Add Task");
    const data = {
      project_id: req.body.project_id,
      user_id: req.body.user_id,
      title: req.body.title,
      short_description: req.body.short_description,
      task_type: req.body.task_type,
      task_estimation: req.body.task_estimation,
    };
    if (rolePerm.status) {
      const missingFields = [];
      if (!req.body.project_id.length) missingFields.push("Project");
      if (!req.body.user_id.length) missingFields.push("User");
      if (!req.body.title) missingFields.push("Title");
      if (missingFields.length > 0) {
        return res.status(400).json({
          errors: `${missingFields.join(", ")} ${
            missingFields.length > 1 ? "are" : "is"
          } Required`,
        });
      }
      const taskData = new task(data);
      await taskData.save();
      res.status(201).json({ message: "Task Created Successfully" });
    } else {
      res.status(403).json({ errors: "You Dont Have Permission" ,status: false });
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
taskController.getTask = async (req, res) => {
  try {
    sess = req.session;
    const user_id = req.user._id;
    const role_id = req.user.role_id.toString();
    const userRole = req.user.roleName;
    const isAdmin = userRole == "Admin";
    const rolePerm = await helper.checkPermission(role_id, user_id, "Update Task");
    if (rolePerm.status) {
      const projectData = await Project.find({
        $or: [
          isAdmin
            ? { deleted_at: "null", status: { $ne: "Completed" } }
            : {
                user_id: user_id,
                deleted_at: "null",
                status: { $ne: "Completed" },
              },
        ],
      })
        .select("_id title")
        .sort({ title: 1 });
      const _id = new BSON.ObjectId(req.params.id);
      const taskdata = await task.aggregate([
        { $match: { deleted_at: "null" } },
        {
          $match: {
            $expr: {
              $cond: {
                if: { $eq: [userRole, "Admin"] },
                then: true,
                else: { $eq: ["$_id", _id] },
              },
            },
          },
        },
        // { $match: { _id: _id } },
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
            as: "userData", //test1
          },
        },
        {
          $lookup: {
            from: "timeentries",
            localField: "_id",
            foreignField: "task_id",
            as: "timeEntryData",
          },
        },
        {
          $project: {
            "projectData.title": 1,
            "userData.firstname": 1,
            "userData._id": 1,
            "userData.last_name": 1,
            task_type: 1,
            title: 1,
            project_id: 1,
            user_id: 1,
            task_status: 1,
            short_description: 1,
            _id: 1,
            task_estimation: 1,
            estimatedHours: { $toDouble: "$task_estimation" },
          },
        },
      ]);
      res.json({ taskdata, projectData, });
      // const projectData = await project
      // .find({
      //   deleted_at: "null",
      //   user_id: user_id,
      // })
      // .select("_id title project_id");
    } else {
      res.status(403).json({ errors: "You Dont Have Permission" ,status: false });
    }
    // const adminProjectData = await project
    //   .find({
    //     deleted_at: "null",
    //   })
    //   .select("_id title project_id");
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
taskController.updateTask = async (req, res) => {
  try {
    sess = req.session;
    const user_id = req.user._id;
    const role_id = req.user.role_id.toString();
    const rolePerm = await helper.checkPermission(
      role_id,
      user_id,
      "Update Task"
    );
    const data = {
      project_id: req.body.project_id,
      user_id: req.body.user_id,
      title: req.body.title,
      short_description: req.body.short_description,
      task_type: req.body.task_type,
      task_estimation: req.body.task_estimation,
      updated_at: Date(),
    };
    const _id = req.params.id;
    if (rolePerm.status) {
      const missingFields = [];
      if (!req.body.project_id.length) missingFields.push("Project");
      if (!req.body.user_id.length) missingFields.push("User");
      if (!req.body.title) missingFields.push("Title");
      if (missingFields.length > 0) {
        return res.status(400).json({
          errors: `${missingFields.join(", ")} ${
            missingFields.length > 1 ? "are" : "is"
          } Required`,
        });
      }
      const updatetask = await task.findByIdAndUpdate(_id, data);
      res.status(201).json({ message: "Task Updated Successfully" });
    } else {
      res.status(403).json({ errors: "You Dont Have Permission" ,status: false });
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
taskController.deleteTask = async (req, res) => {
  try {
    sess = req.session;
    const user_id = req.user._id;
    const role_id = req.user.role_id.toString();

    const rolePerm = await helper.checkPermission(
      role_id,
      user_id,
      "Delete Task"
    );
    if (rolePerm.status == true) {
      const _id = req.params.id;
      const taskHasTimeEntry = await timeEntry.find({
        task_id: _id,
        deleted_at: "null",
      });
      if (taskHasTimeEntry.length == 0) {
        const data = {
          deleted_at: Date(),
        };
        await task.findByIdAndUpdate(_id, data);
        res.status(201).json({ message: "Task Deleted Successfully" });
      } else {
        throw new Error("Task Has TimeEntry So You Cant Delete");
      }
    } else {
      res.status(403).json({ errors: "You Dont Have Permission" , status: false });
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
taskController.task_status_update = async (req, res) => {
  try {
    const _id = req.params.id;
    const task_update = {
      task_status: "1",
      updated_at: Date(),
    };
    const updateTask = await task.findByIdAndUpdate(_id, task_update);
    res.status(201).json({ message: "Task status Updated Successfully" });
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


module.exports = taskController;
