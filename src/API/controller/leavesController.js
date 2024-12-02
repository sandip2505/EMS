const { default: BSON } = require("bson");
const leaves = require("../../model/leaves");
const Helper = require("../../utils/helper");
const userApi = require("../../project_api/user");
const holidayApi = require("../../project_api/holiday");
const Users = require("../../model/user");
const LeaveHistory = require("../../model/leaveHistory");
const helper = new Helper();
const sendAcceptRejctEmail = require("../../utils/send_acceptedleave_mail");
const sendleaveEmail = require("../../utils/send_leave_mail");
const moment = require("moment");

// const technologyApi = require("../../project_api/technology");

const leavesController = {};


leavesController.leaves = async (req, res) => {
  try {
    sess = req.session;
    const user_id = req.user._id;
    const userId = new BSON.ObjectId(req.user._id);
    const role_id = req.user.role_id.toString();
    const userRole = req.user.roleName;
    const rolePerm = await helper.checkPermission(
      role_id,
      user_id,
      "View Leaves"
    );

    if (rolePerm.status == true) {
      const search = req.query.search;
      const userMatch = req.query.user_id
        ? [{ $match: { user_id: new BSON.ObjectId(req.query.user_id) } }]
        : [];

      const yearMatch = req.query.year
        ? [
          {
            $match: {
              $expr: {
                $or: [
                  {
                    $and: [
                      { $gte: ["$datefrom", new Date(parseInt(req.query.year.split("-")[0]), 0, 1)] },
                      { $lte: ["$datefrom", new Date(parseInt(req.query.year.split("-")[1]), 11, 31)] }
                    ]
                  },
                  {
                    $and: [
                      { $gte: ["$dateto", new Date(parseInt(req.query.year.split("-")[0]), 0, 1)] },
                      { $lte: ["$dateto", new Date(parseInt(req.query.year.split("-")[1]), 11, 31)] }
                    ]
                  },
                  {
                    $and: [
                      { $lt: ["$datefrom", new Date(parseInt(req.query.year.split("-")[0]), 0, 1)] },
                      { $gt: ["$dateto", new Date(parseInt(req.query.year.split("-")[1]), 11, 31)] }
                    ]
                  }
                ]
              }
            }
          }
        ]
        : [];

      const selectedMonth = parseInt(req.query.month);
      const monthMatch = req.query.month
        ? [
          {
            $addFields: {
              monthStart: { $month: "$datefrom" },
              monthEnd: { $month: "$dateto" },
              yearStart: { $year: "$datefrom" },
              yearEnd: { $year: "$dateto" }
            }
          },
          {
            $addFields: {
              effectiveStartDate: {
                $cond: {
                  if: { $eq: ["$monthStart", selectedMonth] },
                  then: "$datefrom",
                  else: {
                    $dateFromParts: {
                      year: { $year: "$datefrom" },
                      month: selectedMonth,
                      day: 1
                    }
                  }
                }
              },
              effectiveEndDate: {
                $cond: {
                  if: { $eq: ["$monthEnd", selectedMonth] },
                  then: "$dateto",
                  else: {
                    $dateFromParts: {
                      year: { $year: "$datefrom" },
                      month: selectedMonth,
                      day: {
                        $switch: {
                          branches: [
                            { case: { $eq: [selectedMonth, 2] }, then: 28 },
                            { case: { $in: [selectedMonth, [4, 6, 9, 11]] }, then: 30 },
                            { case: { $in: [selectedMonth, [1, 3, 5, 7, 8, 10, 12]] }, then: 31 }
                          ],
                          default: 31
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          {
            $addFields: {
              daysInPeriod: {
                $add: [
                  {
                    $divide: [
                      { $subtract: ["$effectiveEndDate", "$effectiveStartDate"] },
                      1000 * 60 * 60 * 24
                    ]
                  },
                  1
                ]
              },
              startDayOfWeek: {
                $subtract: [
                  { $dayOfWeek: "$effectiveStartDate" },
                  1
                ]
              }
            }
          },
          {
            $addFields: {
              completeWeeks: {
                $floor: {
                  $divide: ["$daysInPeriod", 7]
                }
              },
              remainingDays: {
                $mod: ["$daysInPeriod", 7]
              }
            }
          },
          {
            $addFields: {
              weekendDays: {
                $add: [
                  { $multiply: ["$completeWeeks", 2] },
                  {
                    $size: {
                      $filter: {
                        input: {
                          $range: [
                            "$startDayOfWeek",
                            { $add: ["$startDayOfWeek", "$remainingDays"] }
                          ]
                        },
                        as: "dayNum",
                        cond: {
                          $or: [
                            { $eq: [{ $mod: ["$$dayNum", 7] }, 0] },
                            { $eq: [{ $mod: ["$$dayNum", 7] }, 6] }
                          ]
                        }
                      }
                    }
                  }
                ]
              }
            }
          },
          {
            $addFields: {
              businessDays: {
                $subtract: [
                  "$daysInPeriod",
                  "$weekendDays"
                ]
              }
            }
          },
          {
            $match: {
              $expr: {
                $or: [
                  { $eq: ["$monthStart", selectedMonth] },
                  { $eq: ["$monthEnd", selectedMonth] },
                  {
                    $and: [
                      { $lt: ["$monthStart", selectedMonth] },
                      { $gt: ["$monthEnd", selectedMonth] }
                    ]
                  }
                ]
              }
            }
          },
          {
            $addFields: {
              total_days: {
                $toString: {
                  $max: [{ $ceil: "$businessDays" }, 0]
                }
              }
            }
          }
        ]
        : [];

      const statusMatch = req.query.status
        ? [{ $match: { status: req.query.status } }]
        : [];

      const combinedMatch = userMatch.concat(
        yearMatch,
        monthMatch,
        statusMatch
      );

      const searchQuery = req.query.search
        ? [
          {
            $match: {
              $or: [
                {
                  "userData.firstname": {
                    $regex: search,
                    $options: "i",
                  },
                },
                {
                  reason: {
                    $regex: search,
                    $options: "i",
                  },
                },
              ],
            },
          },
        ]
        : null;

      const isAdmin = userRole == "Admin";
      const page = parseInt(req.query.page) || 1;
      const limit = req.query.limit ? parseInt(req.query.limit) : 10;
      const skip = (page - 1) * limit;

      const leavesData = await leaves.aggregate([
        { $match: { deleted_at: "null" } },
        {
          $match: {
            $expr: {
              $cond: {
                if: isAdmin,
                then: {},
                else: { $eq: ["$user_id", userId] },
              },
            },
          },
        },
        ...combinedMatch,
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
                $unwind: "$userData",
              },
              ...(searchQuery || []),
              {
                $addFields: {
                  statusOrder: {
                    $switch: {
                      branches: [
                        { case: { $eq: ["$status", "PENDING"] }, then: 1 },
                        { case: { $eq: ["$status", "APPROVED"] }, then: 2 },
                        { case: { $eq: ["$status", "REJECTED"] }, then: 3 },
                      ],
                      default: 4,
                    },
                  },
                },
              },
              { $sort: { statusOrder: 1, datefrom: -1 } },
              {
                $project: {
                  "userData.firstname": 1,
                  "userData.last_name": 1,
                  "userData._id": 1,
                  reason: 1,
                  datefrom: 1,
                  dateto: 1,
                  total_days: 1,
                  paid_status: 1,
                  status: 1,
                  is_adhoc: 1,
                  half_day: 1,
                  _id: 1,
                },
              },
              { $skip: skip },
              { $limit: limit },
            ],
            totalDocuments: [
              { $count: "count" },
            ],
          },
        },
      ]);

      const totalDocuments = leavesData[0].totalDocuments[0]
        ? leavesData[0].totalDocuments[0].count
        : 0;
      const totalData = totalDocuments;
      const totalPages = Math.ceil(totalData / limit);

      const indexLeavesData = leavesData[0].documents.map((item, index) => ({
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
        leavesData: indexLeavesData,
      });
    } else {
      res.status(403).json({ status: false, errors: 'Permission denied' });
    }
  } catch (error) {
    console.log("error", error);
    res.status(403).json({ message: error.message });
  }
};


leavesController.getAddLeave = async (req, res) => {
  sess = req.session;
  const user_id = req.user._id;

  const role_id = req.user.role_id.toString();
  helper
    .checkPermission(role_id, user_id, "Add Leaves")
    .then(async (rolePerm) => {
      if (rolePerm.status == true) {
        const holidayData = await holidayApi.allHolidays();
        var allHolidayDate = [];
        holidayData.forEach((holiday_date) => {
          allHolidayDate.push(holiday_date.holiday_date);
        });
        const existLeaveData = await leaves
          .find({
            $or: [{ status: "APPROVED" }, { status: "PENDING" }],
            user_id,
            deleted_at: "null",
          })
          .select("datefrom dateto");
        var existLeaveDates = [];
        existLeaveData.forEach((leaves) => {
          existLeaveDates.push({
            datefrom: leaves.datefrom,
            dateto: leaves.dateto,
          });
        });
        res.json({
          holidayData,
          allHolidayDate,
          existLeaveDates: [...new Set(existLeaveDates)],
        });
      } else {
        res.status(403).json({ status: false, errors: 'Permission denied' });
      }
    })
    .catch((error) => {
      res.status(403).send(error);
    });
};
leavesController.addLeave = async (req, res) => {
  sess = req.session;
  const user_id = req.user._id;
  var usreData = await Users.findById(req.user._id);
  var reportingData = await Users.findById(req.user.reporting_user_id);

  var link = `${process.env.BASE_URL}/viewleavesrequest/`;
  const role_id = req.user.role_id.toString();
  helper
    .checkPermission(role_id, user_id, "Add Leaves")
    .then(async (rolePerm) => {
      if (rolePerm.status == true) {
        const missingFields = [];
        if (!req.body.reason) missingFields.push("Reason");
        if (!req.body.datefrom) missingFields.push("From Date");
        if (!req.body.dateto) missingFields.push("To Date");
        if (missingFields.length > 0) {
          return res.status(400).json({
            errors: `${missingFields.join(", ")} ${missingFields.length > 1 ? "are" : "is"
              } Required`,
          });
        }
        var is_adhoc = req.body.is_adhoc;
        const startYear = new Date(req.body.datefrom).getFullYear();
        const startMonth = new Date(req.body.datefrom).getMonth() + 1; // Adding 1 because months are zero-based
        let academicYear;
        if (startMonth >= 4) {
          academicYear = `${startYear}-${startYear + 1}`;
        } else {
          academicYear = `${startYear - 1}-${startYear}`;
        }
        const leaveHistoryData = await LeaveHistory.findOne({
          year: academicYear,
          user_id: user_id,
        });

        const userPaidStatus =
          leaveHistoryData?.remaining_leaves > 0 ? "PAID" : "UNPAID";
        const userLeaves =
          leaveHistoryData?.remaining_leaves - req.body.totalLeaveDay;
        let paidLeavesCount = 0;
        let unpaidLeavesCount = 0;

        if (userLeaves < 0) {
          paidLeavesCount = leaveHistoryData?.remaining_leaves;
          unpaidLeavesCount = Math.abs(userLeaves);
        } else {
          paidLeavesCount = req.body.totalLeaveDay;
        }
        if (is_adhoc == 1) {
          const addLeaves = new leaves({
            user_id: req.user._id,
            is_adhoc: req.body.is_adhoc,
            datefrom: req.body.datefrom,
            dateto: req.body.dateto,
            total_days: req.body.totalLeaveDay,
            reason: req.body.reason,
            half_day: req.body.half_day,
            status: "APPROVED",
            paid_status: userPaidStatus,
            paid_leaves: paidLeavesCount,
            unpaid_leaves: unpaidLeavesCount,
            approver_id: reportingData?._id,
          });
          var datefrom = req.body.datefrom;
          var dateto = req.body.dateto;
          var reason = req.body.reason;
          var dateparts = datefrom.split("-");
          var DateFrom = dateparts[2] + "-" + dateparts[1] + "-" + dateparts[0];

          var datetoparts = dateto.split("-");
          var DateTo =
            datetoparts[2] + "-" + datetoparts[1] + "-" + datetoparts[0];
          const leavesadd = await addLeaves.save();
          if (leaveHistoryData) {
            const takenLeavesToUpdate =
              parseFloat(leaveHistoryData.taken_leaves) +
              parseFloat(leavesadd.total_days);

            if (leavesadd.paid_status == "PAID") {
              if (leavesadd.unpaid_leaves > 0) {
                await LeaveHistory.updateOne(
                  { _id: leaveHistoryData._id },
                  {
                    $set: {
                      taken_leaves: takenLeavesToUpdate,
                      remaining_leaves:
                        parseFloat(leaveHistoryData?.remaining_leaves) -
                        parseFloat(leavesadd.paid_leaves),
                      unpaid_leaves: Math.abs(
                        parseFloat(leaveHistoryData.unpaid_leaves) +
                        leavesadd.unpaid_leaves
                      ),
                    },
                  }
                );
              } else {
                await LeaveHistory.updateOne(
                  { _id: leaveHistoryData._id },
                  {
                    $set: {
                      taken_leaves: takenLeavesToUpdate,
                      remaining_leaves:
                        parseFloat(leaveHistoryData?.remaining_leaves) -
                        parseFloat(leavesadd.paid_leaves),
                    },
                  }
                );
              }
            } else {
              await LeaveHistory.updateOne(
                { _id: leaveHistoryData._id },
                {
                  $set: {
                    taken_leaves: takenLeavesToUpdate,
                    unpaid_leaves: Math.abs(
                      parseFloat(leaveHistoryData.unpaid_leaves) +
                      parseFloat(leavesadd.total_days)
                    ),
                  },
                }
              );
            }
            console.log("Leave history updated successfully.");
          }
          await sendleaveEmail(
            usreData.firstname,
            DateFrom,
            DateTo,
            reason,
            reportingData?.firstname,
            reportingData?.company_email,
            link,
            is_adhoc
          );
          res.status(200).json({ message: "Leaves Created Successfully" });
        } else {
          const addLeaves = new leaves({
            user_id: req.body.user_id,
            datefrom: req.body.datefrom,
            dateto: req.body.dateto,
            reason: req.body.reason,
            paid_status: userPaidStatus,
            half_day: req.body.half_day,
            total_days: req.body.totalLeaveDay,
            paid_leaves: paidLeavesCount,
            unpaid_leaves: unpaidLeavesCount,
          });
          var is_adhoc = 0;
          const leavesadd = await addLeaves.save();
          var datefrom = req.body.datefrom;
          var dateto = req.body.dateto;
          var reason = req.body.reason;
          // const usreData = await user.findById(req.user._id)
          // const reportingData = await user.findById(req.user.reporting_user_id)
          var dateparts = datefrom.split("-");
          var DateFrom = dateparts[2] + "-" + dateparts[1] + "-" + dateparts[0];

          var datetoparts = dateto.split("-");
          var DateTo =
            datetoparts[2] + "-" + datetoparts[1] + "-" + datetoparts[0];
          await sendleaveEmail(
            usreData.firstname,
            DateFrom,
            DateTo,
            reason,
            reportingData?.firstname,
            reportingData?.company_email,
            link,
            is_adhoc
          );
          res.status(200).json({ message: "Leaves Created Successfully" });
        }
      } else {
        res.status(403).json({ status: false, errors: 'Permission denied' });
      }
    })
    .catch((error) => {
      res.status(403).send(error.message);
    });
};
leavesController.getLeave = async (req, res) => {
  // const userId = req.body.user_id
  const userId = new BSON.ObjectId(req.params.user_id);
  sess = req.session;
  const user_id = req.user._id;
  const role_id = req.user.role_id.toString();
  helper
    .checkPermission(role_id, user_id, "Update Leaves")
    .then(async (rolePerm) => {
      if (rolePerm.status == true) {
        const _id = req.params.id;
        const leavesData = await leaves.findById(_id);
        const existLeaveData = await leaves
          .find({
            _id: { $ne: _id },
            user_id: userId,
            status: "APPROVED",
            deleted_at: "null",
          })
          .select("datefrom dateto");
        var existLeaveDates = [];
        existLeaveData.forEach((leaves) => {
          existLeaveDates.push({
            datefrom: leaves.datefrom,
            dateto: leaves.dateto,
          });
        });
        const holidayData = await holidayApi.allHolidays();
        const userData = await userApi.allUsers();
        var allHolidayDate = [];
        holidayData.forEach((holiday_date) => {
          allHolidayDate.push(holiday_date.holiday_date);
        });
        res.json({ leavesData, allHolidayDate, existLeaveDates, userData });
      } else {
        res.status(403).json({ status: false, errors: 'Permission denied' });
      }
    })
    .catch((error) => {
      console.log("error", error);
      res.status(403).send(error);
    });
};
leavesController.updateLeave = async (req, res) => {
  sess = req.session;
  const user_id = req.user._id;
  const _id = req.params.id;
  const role_id = req.user.role_id.toString();
  let paidLeavesCount = 0;
  let unpaidLeavesCount = 0;
  if (req.body.paidStatus == "UNPAID") {
    unpaidLeavesCount = req.body.totalLeaveDay;
    paidLeavesCount = 0;
  } else {
    paidLeavesCount = req.body.totalLeaveDay;
    unpaidLeavesCount = 0;
  }
  var total_days = req.body.totalLeaveDay;
  helper
    .checkPermission(role_id, user_id, "Update Leaves")
    .then(async (rolePerm) => {
      if (rolePerm.status == true) {
        const missingFields = [];
        if (!req.body.reason) missingFields.push("Reason");
        if (!req.body.datefrom) missingFields.push("From Date");
        if (!req.body.dateto) missingFields.push("To Date");
        if (missingFields.length > 0) {
          return res.status(400).json({
            errors: `${missingFields.join(", ")} ${missingFields.length > 1 ? "are" : "is"
              } Required`,
          });
        }
        const updateLeaveData = {
          user_id: req.body.user_id,
          total_days: total_days,
          datefrom: req.body.datefrom,
          dateto: req.body.dateto,
          paid_status: req.body.paidStatus,
          reason: req.body.reason,
          is_adhoc: req.body.is_adhoc,
          half_day: req.body.half_day,
          paid_leaves: paidLeavesCount,
          unpaid_leaves: unpaidLeavesCount,
          updated_at: Date(),
        };
        await leaves.findByIdAndUpdate(_id, updateLeaveData);
        const startYear = new Date(req.body.datefrom).getFullYear();
        const startMonth = new Date(req.body.datefrom).getMonth() + 1; // Adding 1 because months are zero-based
        let academicYear;
        if (startMonth >= 4) {
          academicYear = `${startYear}-${startYear + 1}`;
        } else {
          academicYear = `${startYear - 1}-${startYear}`;
        }
        const leaveHistoryData = await LeaveHistory.findOne({
          year: academicYear,
          user_id: req.body.user_id,
        });
        const endMonth = moment().month() + 1 < 4;
        const currentYear = endMonth
          ? moment().subtract(1, "year").year()
          : moment().year();
        const nextYear = currentYear + 1;
        const startDateRange = moment({ year: currentYear, month: 3, day: 1 }); // April 1st of the current year
        const endDateRange = moment({ year: nextYear, month: 2, day: 31 });
        const userLeaves = await leaves
          .find({
            deleted_at: "null",
            status: "APPROVED",
            user_id: req.body.user_id,
            datefrom: {
              $gte: startDateRange.toDate(),
              $lte: endDateRange.toDate(),
            },
          })
          .select("paid_leaves unpaid_leaves");

        const totalPaidLeaves = userLeaves.reduce((sum, leave) => sum + parseFloat(leave.paid_leaves), 0);
        const totalUnpaidLeaves = userLeaves.reduce((sum, leave) => sum + parseFloat(leave.unpaid_leaves), 0);
        await LeaveHistory.updateOne(
          { _id: leaveHistoryData._id },
          {
            $set: {
              taken_leaves: parseFloat(totalPaidLeaves) + parseFloat(totalUnpaidLeaves),
              remaining_leaves: parseFloat(leaveHistoryData.total_leaves) - parseFloat(totalPaidLeaves),
              unpaid_leaves: parseFloat(totalUnpaidLeaves),
            },
          }
        );
        res.status(201).json({ message: "Leave Updated Succeessfully" });
      } else {
        res.status(403).json({ status: false, errors: 'Permission denied' });
      }
    })
    .catch((error) => {
      console.log("error", error);
      res.status(403).send(error);
    });
};
leavesController.deleteLeave = async (req, res) => {
  const user_id = req.user._id;
  const role_id = req.user.role_id.toString();
  helper
    .checkPermission(role_id, user_id, "Delete Leaves")
    .then(async (rolePerm) => {
      if (rolePerm.status == true) {
        const _id = req.params.id;
        const leaveDelete = {
          deleted_at: Date(),
        };
        const Deleteleave = await leaves.findByIdAndUpdate(_id, leaveDelete);
        const startYear = new Date(Deleteleave.datefrom).getFullYear();
        const startMonth = new Date(Deleteleave.datefrom).getMonth() + 1; // Adding 1 because months are zero-based
        let academicYear;
        if (startMonth >= 4) {
          academicYear = `${startYear}-${startYear + 1}`;
        } else {
          academicYear = `${startYear - 1}-${startYear}`;
        }
        const leaveHistoryData = await LeaveHistory.findOne({
          year: academicYear,
          user_id: Deleteleave.user_id,
        });

        const userLeaves = await leaves
          .find({ deleted_at: "null", user_id: Deleteleave.user_id })
          .select("paid_leaves unpaid_leaves");

        const totalPaidLeaves = userLeaves.reduce(
          (sum, leave) => sum + leave.paid_leaves,
          0
        );
        const totalUnpaidLeaves = userLeaves.reduce(
          (sum, leave) => sum + leave.unpaid_leaves,
          0
        );
        await LeaveHistory.updateOne(
          { _id: leaveHistoryData._id },
          {
            $set: {
              taken_leaves: totalPaidLeaves + totalUnpaidLeaves,
              remaining_leaves: leaveHistoryData.total_leaves - totalPaidLeaves,
              unpaid_leaves: totalUnpaidLeaves,
            },
          }
        );
        res.status(201).json({ message: "Leave Deleted Succeessfully" });
      } else {
        res.status(403).json({ status: false, errors: 'Permission denied' });
      }
    })
    .catch((error) => {
      res.status(403).send(error);
    });
};
leavesController.cancelLeaves = async (req, res) => {
  try {
    const _id = req.params.id;
    const cancelLeaves = {
      status: "CANCELLED",
      paid_status: "CANCELLED",
      paid_leaves: 0,
      unpaid_leaves: 0,
      approver_id: null,
      updated_at: new Date(),
    };
    const leavescancel = await leaves.findByIdAndUpdate(_id, cancelLeaves);
    res.status(201).json({ message: "Leave Cancelled Succeessfully" });
  } catch (error) {
    console.log(error);
    res.status(403).send(error);
  }
};
leavesController.leaveRequests = async (req, res) => {
  try {
    sess = req.session;
    const user_id = req.user._id;
    const userId = new BSON.ObjectId(req.user._id);
    const role_id = req.user.role_id.toString();
    const userRole = req.user.roleName;

    const reportingUser = await Users.find({ reporting_user_id: user_id });

    const reportingUsers = reportingUser.map((user) => user._id);
    console.log("reportingUsers", reportingUsers)

    console.log("reportingUser", reportingUser);
    const rolePerm = await helper.checkPermission(
      role_id,
      user_id,
      "View Leaves Request"
    );
    if (rolePerm.status == true) {
      const search = req.query.search;
      const userMatch = req.query.user_id
        ? [{ $match: { user_id: new BSON.ObjectId(req.query.user_id) } }]
        : [];
      const yearMatch = req.query.year
        ? [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $gte: [
                      "$datefrom",
                      new Date(parseInt(req.query.year.split("-")[0]), 3, 1),
                    ],
                  },
                  {
                    $lte: [
                      "$dateto",
                      new Date(parseInt(req.query.year.split("-")[1]), 2, 31),
                    ],
                  },
                ],
              },
            },
          },
        ]
        : [];
      const monthMatch = req.query.month
        ? [
          {
            $match: {
              $expr: {
                $eq: [
                  {
                    $month: "$datefrom",
                  },
                  parseInt(req.query.month),
                ],
              },
            },
          },
        ]
        : [];
      const statusMatch = req.query.status
        ? [{ $match: { status: req.query.status } }]
        : [];
      const combinedMatch = userMatch.concat(
        yearMatch,
        monthMatch,
        statusMatch
      );
      const searchQuery = req.query.search
        ? [
          {
            $match: {
              $or: [
                {
                  "userData.firstname": {
                    $regex: search,
                    $options: "i",
                  },
                },
                {
                  reason: {
                    $regex: search,
                    $options: "i",
                  },
                },
              ],
            },
          },
        ]
        : null;
      const isAdmin = userRole == "Admin";
      const page = parseInt(req.query.page) || 1;
      const limit = req.query.limit ? parseInt(req.query.limit) : 10;
      const skip = (page - 1) * limit;

      const leaveRequestsData = await leaves.aggregate([
        { $match: { deleted_at: "null" } },
        { $match: { status: "PENDING" } },
        {
          $match: {
            $expr: {
              $cond: {
                if: isAdmin,
                then: {},
                // { $match: { user_id: { $in: reporting_user_id } } }
                else: { $in: ["$user_id", reportingUsers] },
              },
            },
          },
        },
        ...combinedMatch,
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
                $unwind: "$userData",
              },
              ...(searchQuery || []),
              {
                $addFields: {
                  statusOrder: {
                    $switch: {
                      branches: [
                        { case: { $eq: ["$status", "PENDING"] }, then: 1 },
                        { case: { $eq: ["$status", "APPROVED"] }, then: 2 },
                        { case: { $eq: ["$status", "REJECTED"] }, then: 3 },
                        // Add more branches if needed for other status values
                      ],
                      default: 4, // Default value for any other status not covered
                    },
                  },
                },
              },
              { $sort: { statusOrder: 1, datefrom: -1 } },
              {
                $project: {
                  "userData.firstname": 1,
                  "userData.last_name": 1,
                  "userData._id": 1,
                  reason: 1,
                  datefrom: 1,
                  dateto: 1,
                  total_days: 1,
                  paid_status: 1,
                  status: 1,
                  is_adhoc: 1,
                  half_day: 1,
                  _id: 1,
                },
              },
              { $skip: skip },
              { $limit: limit },
            ],
            totalDocuments: [
              { $count: "count" }, // Count without skip and limit
            ],
          },
        },
      ]);
      const totalDocuments = leaveRequestsData[0].totalDocuments[0]
        ? leaveRequestsData[0].totalDocuments[0].count
        : 0;
      const totalData = totalDocuments;
      const totalPages = Math.ceil(totalData / limit);
      const indexLeaveRequestsData = leaveRequestsData[0].documents.map(
        (item, index) => ({
          index: skip + index + 1,
          ...item,
        })
      );
      const userData = await userApi.allUsers();
      res.json({
        page,
        limit,
        totalPages,
        totalData,
        userData,
        leavesData: indexLeaveRequestsData,
      });
    } else {
      res.status(403).json({ errors: "Permission denied", status: false });
    }
  } catch (error) {
    console.log("errir", error);
    res.status(403).json({ message: error.message });
  }
};
leavesController.rejectLeaves = async (req, res) => {
  const user_id = req.user._id;

  const role_id = req.user.role_id.toString();

  helper
    .checkPermission(role_id, user_id, "Accept Or Reject Leaves")
    .then(async (rolePerm) => {
      if (rolePerm.status == true) {
        const _id = req.params.id;
        const rejectLeaves = {
          status: "REJECTED",
          approver_id: req.body.approver_id,
        };
        var link = `${process.env.BASE_URL}/employeeLeavesList/`;
        const leavesReject = await leaves.findByIdAndUpdate(_id, rejectLeaves);
        const usreData = await Users.findById(leavesReject.user_id);
        var reportingData = await Users.findById(req.user._id);
        var datefrom = leavesReject.datefrom;
        var dateto = leavesReject.dateto;
        var status = leavesReject.status;
        var reason = leavesReject.reason;
        const df = new Date(datefrom);
        const DateFrom = `${df.getDate().toString().padStart(2, "0")}-${(
          df.getMonth() + 1
        )
          .toString()
          .padStart(2, "0")}-${df.getFullYear()}`;
        const dt = new Date(dateto);
        const DateTo = `${dt.getDate().toString().padStart(2, "0")}-${(
          dt.getMonth() + 1
        )
          .toString()
          .padStart(2, "0")}-${dt.getFullYear()}`;


        await sendAcceptRejctEmail(
          usreData.firstname,
          DateFrom,
          DateTo,
          reason,
          "Rejected",
          reportingData.firstname,
          usreData.company_email,
          link
        );
        res.status(200).json({ message: "Leave Rejected Successfully" });
      } else {
        res.status(403).json({ status: false, errors: 'Permission denied' });
      }
    })
    .catch((error) => {
      console.log("err", error);
      res.status(403).send(error);
    });
};
leavesController.approveLeaves = async (req, res) => {
  const user_id = req.user._id;
  const role_id = req.user.role_id.toString();

  helper
    .checkPermission(role_id, user_id, "Accept Or Reject Leaves")
    .then(async (rolePerm) => {
      if (rolePerm.status == true) {
        const _id = req.params.id;
        const approveLeaves = {
          status: "APPROVED",
          approver_id: user_id,
          paid_status: req.body.paidStatus,
        };
        const leaveData = await leaves.findById(_id);
        const startDate = new Date(leaveData.datefrom);
        const endDate = new Date(leaveData.dateto);
        const startYear = startDate.getFullYear();
        const startMonth = startDate.getMonth() + 1; // Adding 1 because months are zero-based
        let academicYear;
        if (startMonth >= 4) {
          academicYear = `${startYear}-${startYear + 1}`;
        } else {
          academicYear = `${startYear - 1}-${startYear}`;
        }
        const leavesapprove = await leaves.findByIdAndUpdate(
          _id,
          approveLeaves
        );

        const leaveHistoryData = await LeaveHistory.findOne({
          year: academicYear,
          user_id: leaveData.user_id,
        });

        const userLeavesData = await leaves.findById(_id);

        console.log("userLeavesData", userLeavesData);
        if (leaveHistoryData) {
          const takenLeavesToUpdate =
            parseFloat(leaveHistoryData.taken_leaves) +
            parseFloat(userLeavesData.total_days);
          if (userLeavesData.paid_status == "PAID") {
            if (userLeavesData.unpaid_leaves > 0) {
              await LeaveHistory.updateOne(
                { _id: leaveHistoryData._id },
                {
                  $set: {
                    taken_leaves: takenLeavesToUpdate,
                    remaining_leaves:
                      parseFloat(leaveHistoryData?.remaining_leaves) -
                      parseFloat(userLeavesData.paid_leaves),
                    unpaid_leaves: Math.abs(
                      parseFloat(leaveHistoryData.unpaid_leaves) +
                      userLeavesData.unpaid_leaves
                    ),
                  },
                }
              );
            } else {
              await LeaveHistory.updateOne(
                { _id: leaveHistoryData._id },
                {
                  $set: {
                    taken_leaves: takenLeavesToUpdate,
                    remaining_leaves:
                      parseFloat(leaveHistoryData?.remaining_leaves) -
                      parseFloat(userLeavesData.paid_leaves),
                  },
                }
              );
            }
          } else {
            await LeaveHistory.updateOne(
              { _id: leaveHistoryData._id },
              {
                $set: {
                  taken_leaves: takenLeavesToUpdate,
                  unpaid_leaves: Math.abs(
                    parseFloat(leaveHistoryData.unpaid_leaves) +
                    parseFloat(userLeavesData.total_days)
                  ),
                },
              }
            );
          }

          console.log("Leave history updated successfully.");
        } else {
          // Handle the case where no document is found for the specified academic year and user ID
          console.log(
            "No leave history found for the specified academic year and user ID."
          );
        }
        var link = `${process.env.BASE_URL}/employeeLeavesList/`;
        const usreData = await Users.findById(userLeavesData.user_id);
        var reportingData = await Users.findById(req.user._id);
        var datefrom = userLeavesData.datefrom;
        var dateto = userLeavesData.dateto;
        var reason = userLeavesData.reason;
        var status = userLeavesData.status;

        const df = new Date(datefrom);
        const DateFrom = `${df.getDate().toString().padStart(2, "0")}-${(
          df.getMonth() + 1
        )
          .toString()
          .padStart(2, "0")}-${df.getFullYear()}`;

        const dt = new Date(dateto);
        const DateTo = `${dt.getDate().toString().padStart(2, "0")}-${(
          dt.getMonth() + 1
        )
          .toString()
          .padStart(2, "0")}-${dt.getFullYear()}`;

        await sendAcceptRejctEmail(
          usreData.firstname,
          DateFrom,
          DateTo,
          reason,
          "Accepted",
          reportingData.firstname,
          usreData.company_email,
          link
        );
        res.status(200).json({ message: "Leave Approved Successfully" });
      } else {
        res.status(403).json({ status: false, errors: 'Permission denied' });
      }
    })
    .catch((error) => {
      console.log("Erre", error);
      res.status(403).send(error);
    });
};

leavesController.userLeaveHistory = async (req, res) => {
  try {

    const dateString = req.query.date;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (!dateString) {
      return res.status(400).json({ error: 'Date parameter is required' });
    }
    const parsedDate = new Date(dateString);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    const startOfDay = new Date(parsedDate);


    const totalData = await leaves.countDocuments({
      deleted_at: "null",
      $expr: {
        $and: [
          { $lte: ["$datefrom", startOfDay] },
          { $gte: ["$dateto", startOfDay] }
        ]
      }
    });
    const search = req.query.search;

    const totalPages = Math.ceil(totalData / limit);
    const searchQuery = req.query.search
      ? [
        {
          $match: {
            $or: [
              {
                "userData.firstname": {
                  $regex: search,
                  $options: "i",
                },
              },
              {
                reason: {
                  $regex: search,
                  $options: "i",
                },
              },
            ],
          },
        },
      ]
      : null;
    const leaveData = await leaves.aggregate([
      {
        $match: {
          deleted_at: "null",
          status: { $ne: 'REJECTED' },
          $expr: {
            $and: [
              { $lte: ["$datefrom", startOfDay] },
              { $gte: ["$dateto", startOfDay] }
            ]
          }
        }
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
        $unwind: "$userData",
      },
      ...(searchQuery || []),
      {
        $project: {
          "userData.firstname": 1,
          "userData.last_name": 1,
          "userData._id": 1,
          reason: 1,
          datefrom: 1,
          dateto: 1,
          total_days: 1,
          paid_status: 1,
          status: 1,
          is_adhoc: 1,
          half_day: 1,
          _id: 1,
        },
      },
      { $skip: skip },
      { $limit: limit }
    ]);

    const indexeleaveData = leaveData.map((item, index) => ({
      index: skip + index + 1,
      ...item,
    }));

    res.json({
      page: page,
      limit: limit,
      totalPages: totalPages,
      totalData: totalData,
      leavesData: indexeleaveData,
    });

  } catch (error) {
    console.log("error", error);
    res.status(403).json({ message: error.message });
  }
}




leavesController.leaveData = async (req, res) => {
  const user_id = req.params.id;
  const currentYear = new Date().getFullYear();
  const thisyear = `${currentYear}-${currentYear + 1}`;

  const leaveHistoryData = await LeaveHistory.findOne({
    deleted_at: "null",
    user_id: user_id,
    year: thisyear,
  });
  res.json({ leaveHistoryData });
}

module.exports = leavesController;
