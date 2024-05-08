const BSON = require("bson");
const userApi = require("../../project_api/user");
const projectApi = require("../../project_api/project");
const taskApi = require("../../project_api/task");
const holidayApi = require("../../project_api/holiday");
const settingApi = require("../../project_api/setting");
const timeEntry = require("../../model/timeEntries");
const timeEntryRequest = require("../../model/timeEntryRequest");
const setting = require("../../model/settings");
const leaves = require("../../model/leaves");
// const timeEntrytimeEntry = require("../../model");
const Helper = require("../../utils/helper");
const Role = require("../../model/roles");
const task = require("../../model/createTask");
const Holiday = require("../../model/holiday");
const helper = new Helper();
// const timeEntryApi = require("../../project_api/timeEntry");

const timeEntryController = {};
timeEntryController.timeEntries = async (req, res) => {
  try {
    sess = req.session;
    const user_id = req.user._id;
    const role_id = req.user.role_id.toString();
    const rolePerm = await helper.checkPermission(
      role_id,
      user_id,
      "View TimeEntries"
    );
    if (rolePerm.status == true) {
      const _month = parseInt(req.query.month);
      const _year = parseInt(req.query.year);
      const page = parseInt(req.query.page) || 1;
      const limit = req.query.limit ? parseInt(req.query.limit) : 10;
      const sortParams = {};
      if (req.query.dateSort) {
        sortParams.date = req.query.dateSort === "ASC" ? 1 : -1;
      }
      sortParams.created_at = -1;
      console.log(sortParams, "sortParams")
      const skip = (page - 1) * limit;
      const user_id = new BSON.ObjectId(req.user._id);
      const userRole = req.user.role[0].role_name;
      const userMatch = req.query.userId
        ? [{ $match: { user_id: new BSON.ObjectId(req.query.userId) } }]
        : [];
      const projectMatch = req.query.projectId
        ? [{ $match: { project_id: new BSON.ObjectId(req.query.projectId) } }]
        : [];
      const timeEntryData = await timeEntry.aggregate([
        { $match: { deleted_at: "null" } },
        {
          $match: {
            $expr: {
              $cond: {
                if: { $eq: [userRole, "Admin"] },
                then: true,
                else: { $eq: ["$user_id", user_id] },
              },
            },
          },
        },
        ...userMatch,
        ...projectMatch,
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
                  from: "tasks",
                  localField: "task_id",
                  foreignField: "_id",
                  as: "taskData",
                },
              },
              {
                $project: {
                  "userData.firstname": 1,
                  "userData._id": 1,
                  "projectData.title": 1,
                  "taskData.title": 1,
                  date: 1,
                  created_at: 1,
                  hours: 1,
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
      const totalDocuments = timeEntryData[0].totalDocuments[0]
        ? timeEntryData[0].totalDocuments[0].count
        : 0;

      // console.log("timeEntryData", timeEntryData);
      const totalData = totalDocuments;
      const totalPages = Math.ceil(totalData / limit);
      const indexetimeEntryData = timeEntryData[0].documents.map(
        (item, index) => ({
          index: skip + index + 1,
          ...item,
        })
      );
      const userData = await userApi.allUsers();
      const projectData = await projectApi.allProjcects();
      const userprojectData = await projectApi.userProjcects(user_id);
      res.json({
        page,
        limit,
        totalPages,
        totalData,
        userData,
        projectData,
        userprojectData,
        timeEntryData: indexetimeEntryData,
      });
    } else {
      res.status(403).json({ status: false, errors: "Permission denied" });
    }
  } catch (error) {
    if (error.name === "ValidationError") {
      const errorMessages = Object.keys(error.errors).map(
        (key) => error.errors[key].message
      );
      res.status(400).json({ errors: errorMessages.join(", ") });
    } else if (error.name === "timeEntryError") {
      res.status(403).json({ message: error.message });
    } else {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
};
timeEntryController.getAddTimeEntry = async (req, res) => {
  sess = req.session;
  const user_id = req.user._id;
  const role_id = req.user.role_id.toString();
  const userRole = req.user.role[0].role_name;
  helper
    .checkPermission(role_id, user_id, "Add TimeEntry")
    .then(async (rolePerm) => {
      if (rolePerm.status == true) {
        const user_id = req.user._id;
        // const projectData = await project.find({user_id: user_id,status: "in Progress",deleted_at: "null"}).sort({ created_at: -1 });
        const validTimeEntryDays = await settingApi.getSettingValue(
          "ValidTimeEntryDays"
        );
        let projectData;
        // const projectData = await projectApi.allProjcects();
        if (userRole == "Admin") {
          projectData = await projectApi.allProjcects();
        } else {
          projectData = await projectApi.userInCompletedProjcects(user_id);
        }

        const validDays = validTimeEntryDays.value;
        const timeEntryRequestData = await timeEntryRequest.find({
          status: "1",
          user_id: user_id,
        });
        const holidayData = await holidayApi.allHolidays();
        const userLeavesdata = await leaves.find({
          deleted_at: "null",
          status: "APPROVED",
          half_day: "",
          user_id: req.user._id,
        });
        console.log("");
        res.json({
          projectData,
          timeEntryRequestData,
          validDays,
          holidayData,
          userLeavesdata,
        });
      } else {
        res.status(403).json({ status: false, errors: "Permission denied" });
      }
    })
    .catch((e) => {
      console.log(e, "error");
      res.status(403).send(e);
    });
};
timeEntryController.addTimeEntry = async (req, res) => {
  try {
    sess = req.session;
    const user_id = req.user._id;
    const role_id = req.user.role_id.toString();
    const rolePerm = await helper.checkPermission(
      role_id,
      user_id,
      "Add TimeEntry"
    );
    if (rolePerm.status == true) {
      const project_id = req.body.project_id;
      const task_id = req.body.task_id;
      const hours = parseFloat(req.body.hours);
      const date = req.body.date;
      const missingFields = [];
      if (!project_id) missingFields.push("Project");
      if (!task_id) missingFields.push("Task");
      if (!hours) missingFields.push("Hours");
      if (!date) missingFields.push("Date");
      // Check if any required field is missing
      if (missingFields.length > 0) {
        return res.status(400).json({
          errors: `${missingFields.join(", ")} ${missingFields.length > 1 ? "are" : "is"
            } Required`,
        });
      }
      const addTimeEntry = new timeEntry({
        user_id: user_id,
        project_id: project_id,
        task_id: task_id,
        hours: hours,
        date: date,
      });
      await addTimeEntry.save();
      res.status(201).json({ message: "Time Entry Created Successfully" });
    } else {
      res.status(403).json({ status: false, errors: "Permission denied" });
    }
  } catch (error) {
    if (error.name === "ValidationError") {
      const errorMessages = Object.keys(error.errors).map(
        (key) => error.errors[key].message
      );
      res.status(400).json({ errors: errorMessages.join(", ") });
    } else if (error.name === "timeEntryError") {
      res.status(403).json({ message: error.message });
    } else {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
};
timeEntryController.getTimeEntry = async (req, res) => {
  try {
    sess = req.session;
    const user_id = req.user._id;
    const role_id = req.user.role_id.toString();
    const userRole = req.user.role[0].role_name;
    const rolePerm = await helper.checkPermission(
      role_id,
      user_id,
      "Update TimeEntry"
    );
    var projectData
    if (rolePerm.status == true) {
      const _id = req.params.id;
      const timeEntryData = await timeEntry
        .findById(_id)
        .select("_id project_id task_id hours date");
      const validTimeEntryDays = await settingApi.getSettingValue(
        "ValidTimeEntryDays"
      );
      const validDays = validTimeEntryDays.value;
      const timeEntryRequestData = await timeEntryRequest.find({
        status: "1",
        user_id: user_id,
      });
      const holidayData = await holidayApi.allHolidays();
      if (userRole == "Admin") {
        projectData = await projectApi.allProjcects();
      } else {
        projectData = await projectApi.userInCompletedProjcects(user_id);
      }
      const taskData = await taskApi.allTasks();
      const userLeavesdata = await leaves.find({
        deleted_at: "null",
        status: "APPROVED",
        half_day: "",
        user_id: req.user._id,
      });
      res.status(200).json({
        timeEntryData,
        projectData,
        taskData,
        validDays,
        holidayData,
        timeEntryRequestData,
        userLeavesdata,
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
    } else if (error.name === "timeEntryError") {
      res.status(403).json({ message: error.message });
    } else {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
};
timeEntryController.updateTimeEntry = async (req, res) => {
  try {
    sess = req.session;
    const user_id = req.user._id;
    const role_id = req.user.role_id.toString();

    const rolePerm = await helper.checkPermission(
      role_id,
      user_id,
      "Update TimeEntry"
    );
    const data = req.body;
    const _id = req.params.id;

    if (rolePerm.status) {
      var today = new Date(Date.now()).toISOString().split("T")[0];
      var twoDayAgo = new Date(Date.now() - 3 * 86400000)
        .toISOString()
        .split("T")[0];
      if (req.body.date > today || req.body.date < twoDayAgo) {
        throw new Error("Invalid Date");
      } else {
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
        res.status(201).json({ message: "Time Entry Updated Successfully" });
      }
    } else {
      res.status(403).json({ status: false, errors: "Permission denied" });
    }
  } catch (error) {
    if (error.name === "ValidationError") {
      const errorMessages = Object.keys(error.errors).map(
        (key) => error.errors[key].message
      );
      res.status(400).json({ errors: errorMessages.join(", ") });
    } else if (error.name === "timeEntryError") {
      res.status(403).json({ message: error.message });
    } else {
      console.error(error);
      res.status(500).json({ errors: error.message });
    }
  }
};
timeEntryController.deleteTimeEntry = async (req, res) => {
  console.log("gettt");
  try {
    sess = req.session;
    const user_id = req.user._id;
    const role_id = req.user.role_id.toString();

    const rolePerm = await helper.checkPermission(
      role_id,
      user_id,
      "Delete TimeEntry"
    );
    if (rolePerm.status == true) {
      const _id = req.params.id;
      const data = {
        deleted_at: Date(),
      };
      await timeEntry.findByIdAndUpdate(_id, data);
      // await timeEntryApi.deletetimeEntry({ data, _id });
      res.status(201).json({ message: "timeEntry Deleted Successfully" });
    } else {
      res.status(403).json({ status: false });
    }
  } catch (error) {
    if (error.name === "ValidationError") {
      const errorMessages = Object.keys(error.errors).map(
        (key) => error.errors[key].message
      );
      res.status(400).json({ errors: errorMessages.join(", ") });
    } else if (error.name === "timeEntryError") {
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
timeEntryController.getTaskByProject = async (req, res) => {
  try {
    const project_id = new BSON.ObjectId(req.params.id);
    const user_id = req.user._id;
    const role_id = req.user.role_id.toString();
    const _id = new BSON.ObjectId(req.params.id);

    const roleData = await Role.findOne({ _id: role_id });
    const RoleName = roleData.role_name;
    var taskData;
    if (RoleName == "Admin") {
      taskData = await task
        .find({
          project_id: project_id,
          deleted_at: "null",
          $or: [{ task_status: { $eq: 0 } }, { task_status: { $eq: "0" } }],
        })
        .sort({ created_at: -1 });
    } else {
      taskData = await task
        .find({
          project_id: project_id,
          deleted_at: "null",
          user_id: user_id,
          $or: [{ task_status: { $eq: 0 } }, { task_status: { $eq: "0" } }],
        })
        .sort({ created_at: -1 });
    }
    return res.status(200).json({ taskData });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errorMessages = Object.keys(error.errors).map(
        (key) => error.errors[key].message
      );
      res.status(400).json({ errors: errorMessages.join(", ") });
    } else if (error.name === "timeEntryError") {
      res.status(403).json({ message: error.message });
    } else {
      console.log(error);
      res.status(500).json({ errors: error.message });
    }
  }
};
timeEntryController.newTimeEntryData = async (req, res) => {
  try {
    const user_id = req.user._id;
    const _month = parseInt(req.body.month);
    const _year = parseInt(req.body.year);
    const users =
      req.body.user !== null ? new BSON.ObjectId(req.body.user) : "";
    const timeEntryData = await timeEntry.aggregate([
      { $match: { deleted_at: "null" } },
      { $match: { user_id: users } },
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
      // { $match: { user_id: user_id } },
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

    var timeData = [];
    timeEntryData.forEach((key) => {
      var _date = key.date.toISOString().split("T")[0].split("-").join("-");
      var _dates = new Date(_date);
      var day = _dates.getDate();

      timeData.push({
        [key.projectData[0].title]: {
          [key.taskData[0]?.title]: {
            [day]: { _day: `${day}`, h: key.hours },
          },
        },
      });
    });

    let result = {};

    for (let item of timeData) {
      let key1 = Object.keys(item)[0];
      let key2 = Object.keys(item[key1])[0];
      let value = item[key1][key2];

      if (result[key1] === undefined) {
        result[key1] = {};
      }
      if (result[key1][key2] === undefined) {
        result[key1][key2] = [value];
      } else {
        result[key1][key2].push(value);
      }
    }
    let mergedData = [result];
    const userData = await userApi.allUsers();
    const holidayData = await Holiday.find({
      $expr: {
        $and: [
          {
            $eq: [
              {
                $month: "$holiday_date",
              },
              _month,
            ],
          },
          {
            $eq: [
              {
                $year: "$holiday_date",
              },
              _year,
            ],
          },
        ],
      },
      deleted_at: "null",
    }).select("_id holiday_date");
    const leavesData = await leaves
      .find({
        $expr: {
          $and: [
            {
              $and: [
                {
                  $eq: [
                    {
                      $month: "$datefrom",
                    },
                    _month,
                  ],
                },
                {
                  $eq: [
                    {
                      $year: "$datefrom",
                    },
                    _year,
                  ],
                },
              ],
            },
            {
              $and: [
                {
                  $eq: [
                    {
                      $month: "$dateto",
                    },
                    _month,
                  ],
                },
                {
                  $eq: [
                    {
                      $year: "$dateto",
                    },
                    _year,
                  ],
                },
              ],
            },
          ],
        },
        user_id: users,
        deleted_at: "null",
        half_day: "",
      })
      .select("_id datefrom dateto");
    res
      .status(200)
      .json({ timeEntryData: mergedData, userData, holidayData, leavesData });
  } catch (error) {
    res.status(400).send(error);
  }
};
module.exports = timeEntryController;
