require("dotenv").config();
const mysqlConnection = require("../../db/sqlconn");
const Holiday = require("../../model/holiday");
const Leaves = require("../../model/leaves");
const user = require("../../model/user");
const { default: BSON } = require("bson");
const punchController = {};
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const Helper = require("../../utils/helper");
const helper = new Helper();
const moment = require("moment");
const { monthWiseWorkingData } = require("../../utils/punchHelper");
const LeaveHistory = require("../../model/leaveHistory");

punchController.empdata = async (req, res) => {
  try {
    const query = `
      SELECT 
        id, 
        CONCAT('CC-', LPAD(SUBSTRING(emp_pin, 3), 4, '0')) AS emp_pin, 
        emp_firstname, 
        emp_lastname 
      FROM hr_employee;
    `;

    mysqlConnection.query(query, (error, results) => {
      if (error) {
        res.status(500).send("An error occurred while fetching employees");
        return;
      }
      res.json(results);
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
};

function processPunchesWithBreaksAndWorkingHours(punches) {
  punches.sort((a, b) => new Date(a.punch_time) - new Date(b.punch_time));

  let totalBreakTime = 0;
  let totalWorkingTime = 0;
  const breaks = [];
  const processedPunches = [];

  for (let index = 0; index < punches.length; index++) {
    const punch = punches[index];

    if (index % 2 === 0) {
      const checkInTime = new Date(punch.punch_time);

      processedPunches.push({
        id: punch.id,
        employee_id: punch.employee_id,
        punch_time: punch.punch_time,
        emp_pin: punch.emp_pin,
        check_in: checkInTime,
        check_out: null,
      });
    } else {
      const lastPunch = processedPunches[processedPunches.length - 1];
      const checkOutTime = new Date(punch.punch_time);

      lastPunch.check_out = checkOutTime;

      const workingDuration =
        (checkOutTime - new Date(lastPunch.punch_time)) / (1000 * 60);
      totalWorkingTime += workingDuration;

      if (index + 1 < punches.length) {
        const nextPunch = punches[index + 1];
        if (nextPunch) {
          const breakDuration =
            (new Date(nextPunch.punch_time) - checkOutTime) / (1000 * 60);
          totalBreakTime += breakDuration;

          breaks.push({
            break_start: punch.punch_time,
            break_end: nextPunch.punch_time,
            break_duration_minutes: breakDuration,
          });
        }
      }
    }
  }

  const totalWorkingTimeFormatted = formatTime(totalWorkingTime);

  const totalBreakTimeFormatted = formatTime(totalBreakTime);

  return {
    processedPunches,
    breaks,
    totalBreakTimeFormatted,
    totalWorkingTimeFormatted,
  };
}

function formatTimeAMPM(date) {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  return `${hours}:${minutes} ${ampm}`;
}

function formatTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}
function removeDuplicatePunches(punches) {
  const seen = new Set();
  return punches.filter((item) => {
    const time = `${new Date(item.punch_time)
      .getUTCHours()
      .toString()
      .padStart(2, "0")}:${new Date(item.punch_time)
        .getUTCMinutes()
        .toString()
        .padStart(2, "0")}`;
    if (seen.has(time)) {
      return false;
    }
    seen.add(time);
    return true;
  });
}

punchController.getPunchesByEmployee = async (req, res) => {

  const date = req.query.date;
  const userId = req.params.id;
  const punchEmployee = await user.findOne({ _id: userId, deleted_at: "null" }).select('_id emp_code firstname last_name');

  const emp_pin = punchEmployee.emp_code.replace(/-/, '');
  const [year, month] = date.split("-");

  try {
    const query1 = `select hr_employee.id,hr_employee.emp_pin,emp_firstname from hr_employee where emp_pin = ?`

    const userData = await new Promise((resolve, reject) => {
      mysqlConnection.query(query1, [emp_pin, date], (error, sqlUser) => {
        if (error) {
          return reject(error);
        }
        resolve(sqlUser);
      });
    });
    const empId = userData.length > 0 ? userData[0].id : null;

    const query = `
      SELECT 
        att_punches.id, 
        att_punches.employee_id, 
        att_punches.punch_time, 
        hr_employee.emp_pin 
      FROM att_punches
      JOIN hr_employee ON att_punches.employee_id = hr_employee.id
      WHERE att_punches.employee_id = ? 
        AND DATE(att_punches.punch_time) = ?
      ORDER BY att_punches.punch_time ASC;
    `;

    const totalAverage = await punchController.getAverageByEmployee(
      year,
      month,
      empId,
      userId
    );
    const results = await new Promise((resolve, reject) => {
      mysqlConnection.query(query, [empId, date], (error, results) => {
        if (error) {
          return reject(error);
        }
        resolve(results);
      });
    });
    const uniqueResults = removeDuplicatePunches(results);

    const { breaks, totalBreakTimeFormatted, totalWorkingTimeFormatted } =
      processPunchesWithBreaksAndWorkingHours(uniqueResults);

    if (results.length === 0) {
      res.status(200).json({
        punches: uniqueResults ? uniqueResults : [],
        breaks: breaks ? breaks : [],
        totalBreakTime: totalBreakTimeFormatted
          ? totalBreakTimeFormatted
          : "00:00",
        totalWorkingHours: totalWorkingTimeFormatted
          ? totalWorkingTimeFormatted
          : "00:00",
        totalAverage: totalAverage ? totalAverage : 0,
      });
    } else {
      res.json({
        punches: uniqueResults,
        breaks: breaks,
        totalBreakTime: totalBreakTimeFormatted,
        totalWorkingHours: totalWorkingTimeFormatted,
        totalAverage: totalAverage ? totalAverage : 0,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

function getWeekdaysCountInMonth(year, month) {
  let weekdaysCount = 0;
  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() == year && today.getMonth() + 1 === parseInt(month);
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  // Set the last day for counting: if it's the current month, use today's date, otherwise the full month's days
  const lastDay = isCurrentMonth ? today.getDate() : daysInMonth;
  for (let day = 1; day <= lastDay; day++) {
    const date = new Date(Date.UTC(year, month - 1, day));
    const dayOfWeek = date.getUTCDay();
    // Skip weekends (Sunday = 0, Saturday = 6)
    if (dayOfWeek !== 0 && dayOfWeek !== 6 && day !== today.getDate()) {
      weekdaysCount++;
    }
  }
  return weekdaysCount;
}


async function getLeavesByMonthAndYear(year, month, userId) {
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0); // Last day of the month

  const currentDate = new Date();  // Current date for checking past leaves

  const userLeaveHistorys = await Leaves.aggregate([
    {
      $match: {
        deleted_at: "null",
        status: "APPROVED",
        user_id: new ObjectId(userId),
        // Ensure that the leave is in the past (leave should end before today)
        dateto: { $lte: currentDate },
        $or: [
          // Case 1: Leave starts in the specified month
          {
            datefrom: { $gte: startOfMonth, $lte: endOfMonth },
          },
          // Case 2: Leave ends in the specified month
          {
            dateto: { $gte: startOfMonth, $lte: endOfMonth },
          },
          // Case 3: Leave spans the entire month
          {
            datefrom: { $lte: startOfMonth },
            dateto: { $gte: endOfMonth },
          },
        ],
      },
    },
    {
      $addFields: {
        effectiveStartDate: {
          $max: ["$datefrom", startOfMonth],
        },
        effectiveEndDate: {
          $min: ["$dateto", endOfMonth],
        },
      },
    },
    {
      $addFields: {
        daysInMonth: {
          $add: [
            {
              $subtract: [
                { $dayOfMonth: "$effectiveEndDate" },
                { $dayOfMonth: "$effectiveStartDate" },
              ],
            },
            1,
          ],
        },
      },
    },
  ]);
  console.log(userLeaveHistorys, "userLeaveHistorys")
  return userLeaveHistorys;
}


async function getWorkingDayByMonth(year, month, userId) {
  try {
    const userLeaveHistorys = await getLeavesByMonthAndYear(
      year,
      month,
      userId
    );
    const totalLeaveDays = userLeaveHistorys.reduce((total, leave) => {
      return total + parseFloat(leave.total_days);
    }, 0);

    const holidays = await Holiday.find({ deleted_at: "null" });

    const holidaysInMonth = holidays.filter((holiday) => {
      const holidayDate = new Date(holiday.holiday_date);
      return holidayDate.getFullYear() == year && holidayDate.getMonth() + 1 == parseInt(month);
    });


    const dayOfMonth = getWeekdaysCountInMonth(year, month);

    const totalWorkingDays =
      dayOfMonth - (totalLeaveDays + holidaysInMonth.length);
    return { totalWorkingDays };
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}

punchController.getAverageByEmployee = async (
  year,
  month,
  employeeId,
  userId
) => {
  const { totalWorkingDays } = await getWorkingDayByMonth(year, month, userId);
  try {
    const query = `
      SELECT 
        att_punches.id, 
        att_punches.employee_id, 
        att_punches.punch_time, 
        hr_employee.emp_pin 
      FROM att_punches
      JOIN hr_employee ON att_punches.employee_id = hr_employee.id
      WHERE att_punches.employee_id = ? 
        AND MONTH(att_punches.punch_time) = ? 
        AND YEAR(att_punches.punch_time) = ?
      ORDER BY att_punches.punch_time ASC;
    `;

    const results = await new Promise((resolve, reject) => {
      mysqlConnection.query(
        query,
        [employeeId, month, year],
        (error, results) => {
          if (error) {
            return reject(error);
          }
          resolve(results);
        }
      );
    });

    if (results.length === 0) {
      return false;
    } else {
      const { formattedMonthlyHours } = monthWiseWorkingData(results);
      const averageHours = formattedMonthlyHours / totalWorkingDays;
      const totalAverageRounded = parseFloat(averageHours.toFixed(2));
      return totalAverageRounded;
    }
  } catch (error) {
    console.error(error);
    return false;
  }
};

punchController.editPunchedata = async (req, res) => {
  const id = req.params.id;
  try {
    const query = `SELECT * FROM att_punches WHERE id = ?`;
    mysqlConnection.query(query, [id], (error, results) => {
      if (error) {
        res.status(500).send("An error occurred while fetching punch");
        return;
      }
      res.json(results);
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
};
punchController.updatePunchedata = async (req, res) => {
  const { punch_time } = req.body;
  const id = req.params.id;
  try {
    const query = `
      UPDATE att_punches
      SET punch_time = ?
      WHERE id = ?;
    `;

    mysqlConnection.query(query, [punch_time, id], (error, results) => {
      if (error) {
        res.status(500).send("An error occurred while updating punch");
        return;
      }
      res.json(results);
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
};

punchController.getPunches = async (req, res) => {
  const employeeId = req.params.id;
  const date = req.query.date;
  const userId = req.query.userId;
  const [year, month] = date.split("-");

  try {
    const query = `
      SELECT 
        att_punches.id, 
        att_punches.employee_id, 
        att_punches.punch_time, 
        hr_employee.emp_pin 
      FROM att_punches
      JOIN hr_employee ON att_punches.employee_id = hr_employee.id
      WHERE att_punches.employee_id = ? 
        AND DATE(att_punches.punch_time) = ?
      ORDER BY att_punches.punch_time ASC;
    `;

    const results = await new Promise((resolve, reject) => {
      mysqlConnection.query(query, [employeeId, date], (error, results) => {
        if (error) {
          return reject(error);
        }
        resolve(results);
      });
    });

    res.json({
      punches: results,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

function calculateTotalWorkingHours(punches) {
  // Step 1: Group punches by date
  const punchesByDate = punches.reduce((acc, punch) => {
    const date = moment(punch.punch_time).format("YYYY-MM-DD");
    if (!acc[date]) acc[date] = [];
    acc[date].push(punch.punch_time);
    return acc;
  }, {});

  // Step 2: Sort punches by time for each date
  for (let date in punchesByDate) {
    punchesByDate[date].sort((a, b) => new Date(a) - new Date(b));
  }

  // Step 3: Calculate working hours for each day
  let totalWorkingHours = 0;

  for (let date in punchesByDate) {
    const dailyPunches = punchesByDate[date];
    for (let i = 0; i < dailyPunches.length; i += 2) {
      if (i + 1 < dailyPunches.length) {
        const punchIn = moment(dailyPunches[i]);
        const punchOut = moment(dailyPunches[i + 1]);
        const duration = punchOut.diff(punchIn, "hours", true); // Calculate hours between punch-in and punch-out
        totalWorkingHours += duration;
      }
    }
  }

  // Return the total working hours, rounded to 2 decimal places
  return totalWorkingHours.toFixed(2);
}

function calculateTotalWorkingHours1(punches) {
  // Step 1: Group punches by date
  const punchesByDate = punches.reduce((acc, punch) => {
    const date = moment(punch.punch_time).format("YYYY-MM-DD");
    if (!acc[date]) acc[date] = [];
    acc[date].push(punch.punch_time);
    return acc;
  }, {});

  // Step 2: Sort punches by time for each date
  for (let date in punchesByDate) {
    punchesByDate[date].sort((a, b) => new Date(a) - new Date(b));
  }

  // Step 3: Calculate working hours for each day
  let totalWorkingHours = 0;
  const dailyHours = {};

  for (let date in punchesByDate) {
    const dailyPunches = punchesByDate[date];
    let dailyTotal = 0;

    for (let i = 0; i < dailyPunches.length; i += 2) {
      if (i + 1 < dailyPunches.length) {
        const punchIn = moment(dailyPunches[i]);
        const punchOut = moment(dailyPunches[i + 1]);
        const duration = punchOut.diff(punchIn, "hours", true);
        dailyTotal += duration;
      }
    }

    // Store the daily total in an object
    dailyHours[date] = dailyTotal.toFixed(2);
    totalWorkingHours += dailyTotal;
  }

  // Return both daily hours and total working hours
  return {
    dailyHours,
    total: totalWorkingHours.toFixed(2),
  };
}

function processPunchesByMonth(punches) {
  punches.sort((a, b) => new Date(a.punch_time) - new Date(b.punch_time));

  let totalWorkingTime = 0;
  const workingTimeByDay = {};
  const uniqueWorkingDays = new Set();

  for (let index = 0; index < punches.length; index++) {
    const punch = punches[index];

    if (index % 2 === 0) {
      const checkInTime = new Date(punch.punch_time);
      uniqueWorkingDays.add(checkInTime.toISOString().split("T")[0]); // Capture the date as 'YYYY-MM-DD'
    } else {
      const checkInTime = new Date(punches[index - 1].punch_time);
      const checkOutTime = new Date(punch.punch_time);

      const workingDuration = (checkOutTime - checkInTime) / (1000 * 60); // in minutes
      totalWorkingTime += workingDuration;

      const dayKey = checkInTime.toISOString().split("T")[0]; // Group by 'YYYY-MM-DD'

      // Add the working duration to the respective day
      if (!workingTimeByDay[dayKey]) {
        workingTimeByDay[dayKey] = 0;
      }
      workingTimeByDay[dayKey] += workingDuration;
    }
  }

  const totalWorkingTimeFormatted = formatTimes(totalWorkingTime); // Total working time in hours and minutes
  const workingTimeByDayFormatted = {};

  // Format the working time by day
  for (const day in workingTimeByDay) {
    workingTimeByDayFormatted[day] = formatTimes(workingTimeByDay[day]);
  }

  const totalWorkingDays = uniqueWorkingDays.size; // Count unique working days

  return {
    totalWorkingTimeFormatted,
    workingTimeByDayFormatted,
    totalWorkingDays,
  };
}

// Helper function to format time in hours and minutes
function formatTimes(minutes) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  return `${hours}h ${remainingMinutes}m`;
}

punchController.deletePunch = async (req, res) => {
  const id = req.params.id;
  try {
    const query = `DELETE FROM att_punches WHERE id = ?`;
    mysqlConnection.query(query, [id], (error, results) => {
      if (error) {
        res.status(500).send("An error occurred while deleting punch");
        return;
      }
      res.json(results);
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
}


punchController.punchEmployee = async (req, res) => {
  try {
    const user_id = req.user._id;
    const role_id = req.user.role_id.toString();
    const rolePerm = await helper.checkPermission(
      role_id,
      user_id,
      "View Punching"
    );
    if (!rolePerm.status) {
      return res.status(403).json({ message: "Permission denied" });
    }
    const punchEmployee = await user.find({ deleted_at: "null", status: { $ne: 'ExEmployee' } }).select('_id emp_code firstname last_name');
    res.status(200).json(punchEmployee);
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
}


punchController.averageHours = async (req, res) => {
  const year = req.query.year;
  const month = req.query.month;
  const userId = req.params.id;
  const punchEmployee = await user.findOne({ _id: userId, deleted_at: "null" }).select('_id emp_code firstname last_name');
  const { totalWorkingDays } = await getWorkingDayByMonth(year, month);
  const userLeaveHistorys = await getLeavesByMonthAndYear(
    year,
    month,
    userId
  );
  const emp_pin = punchEmployee.emp_code.replace(/-/, '');

  try {
    const query1 = `select hr_employee.id,hr_employee.emp_pin,emp_firstname from hr_employee where emp_pin = ?`

    const userData = await new Promise((resolve, reject) => {
      mysqlConnection.query(query1, [emp_pin], (error, sqlUser) => {
        if (error) {
          return reject(error);
        }
        resolve(sqlUser);
      });
    });
    const empId = userData.length > 0 ? userData[0].id : null;

    const query = `
    SELECT 
      att_punches.id, 
      att_punches.employee_id, 
      att_punches.punch_time, 
      hr_employee.emp_pin 
    FROM att_punches
    JOIN hr_employee ON att_punches.employee_id = hr_employee.id
    WHERE att_punches.employee_id = ? 
      AND MONTH(att_punches.punch_time) = ? 
      AND YEAR(att_punches.punch_time) = ?
    ORDER BY att_punches.punch_time ASC;
  `;

    const totalAverage = await punchController.getAverageByEmployeeWithPresent(
      year,
      month,
      empId,
      userId
    );
    const results = await new Promise((resolve, reject) => {
      mysqlConnection.query(query, [empId, month, year], (error, results) => {
        if (error) {
          return reject(error);
        }
        resolve(results);
      });
    });
    const totalLeaveDays = userLeaveHistorys.reduce((total, leave) => {
      return total + parseFloat(leave.total_days);
    }, 0);
    console.log(totalAverage, "totalAverage")
    res.status(200).json({
      totalAverage: `${totalAverage.averageHours ? totalAverage.averageHours : 0} h`,
      totalPresentDays: `${totalAverage.totalPresentDays ? totalAverage.totalPresentDays : 0}`,
      totalWorkingDays: totalWorkingDays ? totalWorkingDays : 0,
      leaveHistory: totalLeaveDays ? totalLeaveDays : 0,
    });


  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
}

async function getWorkingDaysByMonth(year, month) {
  try {


    const holidays = await Holiday.find({ deleted_at: "null" });

    const holidaysInMonth = holidays.filter((holiday) => {
      const holidayDate = new Date(holiday.holiday_date);
      return holidayDate.getFullYear() == year && holidayDate.getMonth() + 1 == parseInt(month);
    });


    const dayOfMonth = getWeekdaysCountInMonth(year, month);

    const totalWorkingDays =
      dayOfMonth - holidaysInMonth.length;
    return { totalWorkingDays };
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}

punchController.getAverageByEmployeeWithPresent = async (
  year,
  month,
  employeeId,
  userId
) => {
  const { totalWorkingDays } = await getWorkingDayByMonth(year, month, userId);
  try {
    // Query 1: Get punch details for calculating average hours
    const punchQuery = `
      SELECT 
        att_punches.id, 
        att_punches.employee_id, 
        att_punches.punch_time, 
        hr_employee.emp_pin
      FROM att_punches
      JOIN hr_employee ON att_punches.employee_id = hr_employee.id
      WHERE att_punches.employee_id = ? 
        AND MONTH(att_punches.punch_time) = ? 
        AND YEAR(att_punches.punch_time) = ?
      ORDER BY att_punches.punch_time ASC;
    `;

    // Query 2: Get distinct punch dates for calculating total present days
    const presentDaysQuery = `
      SELECT 
        DATE(att_punches.punch_time) AS punch_date
      FROM att_punches
      JOIN hr_employee ON att_punches.employee_id = hr_employee.id
      WHERE att_punches.employee_id = ? 
        AND MONTH(att_punches.punch_time) = ? 
        AND YEAR(att_punches.punch_time) = ?
      GROUP BY punch_date
      ORDER BY punch_date ASC;
    `;

    // Execute both queries in parallel
    const [punchResults, presentDaysResults] = await Promise.all([
      new Promise((resolve, reject) => {
        mysqlConnection.query(
          punchQuery,
          [employeeId, month, year],
          (error, results) => {
            if (error) {
              return reject(error);
            }
            resolve(results);
          }
        );
      }),
      new Promise((resolve, reject) => {
        mysqlConnection.query(
          presentDaysQuery,
          [employeeId, month, year],
          (error, results) => {
            if (error) {
              return reject(error);
            }
            resolve(results);
          }
        );
      })
    ]);

    if (punchResults.length === 0) {
      return false;
    } else {
      // Calculate total present days by counting unique dates
      const totalPresentDays = presentDaysResults.length;

      // Use punchResults for calculating the average working hours
      const { formattedMonthlyHours } = monthWiseWorkingData(punchResults);
      const averageHours = formattedMonthlyHours / totalWorkingDays;
      const totalAverageRounded = parseFloat(averageHours.toFixed(2));
      let hoursData = Math.floor(totalAverageRounded);
      let minutesData = Math.round((totalAverageRounded - hoursData) * 60);

      const formattedTime = `${hoursData}:${minutesData < 10 ? '0' + minutesData : minutesData}`;


      console.log(totalAverageRounded, "totalAverageRounded")
      console.log(formattedTime, "formattedTime")

      // Return both values
      return {
        totalHours: formattedMonthlyHours,
        averageHours: formattedTime,
        totalPresentDays: totalPresentDays
      };
    }
  } catch (error) {
    console.error(error);
    return false;
  }
};

punchController.addPunch = async (req, res) => {
  const id = req.params.id;

  const userData = await user.findById(id);
  const emp_pin = userData.emp_code.replace('-', '');
  const punch_time = req.body.punch_time;

  if (!punch_time) {
    return res.status(400).json({ message: "Punch time is required." });
  }

  try {
    const query = `
      INSERT INTO att_punches (employee_id, punch_time)
      SELECT he.id, ?
      FROM hr_employee he
      WHERE he.emp_pin = ?
    `;

    mysqlConnection.query(query, [punch_time, emp_pin], (error, results) => {
      if (error) {
        console.error("Database Error:", error);
        return res.status(500).json({ message: "An error occurred while adding punch." });
      }

      res.json({
        message: "Punch added successfully.",
        dataAdded: {
          employee_id: emp_pin,
          punch_time: punch_time,
        },
        results,
      });
    });

  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


punchController.leaveData = async (req, res) => {
  const user_id = req.params.id;
  const thisyear = new Date().getFullYear();
  const leaveHistoryData = await LeaveHistory.findOne({
    deleted_at: "null",
    user_id: user_id,
    year: thisyear,
  });
}


module.exports = punchController;
