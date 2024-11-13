const moment = require("moment");
function formatTimes(minutes) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  return `${hours}h ${remainingMinutes}m`;
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
function convertMinutesToHoursMinutes(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60); // Get the total hours
  const minutes = Math.floor(totalMinutes % 60); // Get the remaining minutes

  // Format hours and minutes with leading zeros if necessary
  const formattedHours = String(hours).padStart(2, "0");
  const formattedMinutes = String(minutes).padStart(2, "0");

  return parseFloat(`${formattedHours}.${formattedMinutes}`);
}
function monthWiseWorkingData(data) {
  let totalMonthWiseWorkingTime = 0;
  const punchesByDate = data.reduce((acc, punch) => {
    const date = moment(punch.punch_time).format("YYYY-MM-DD");
    if (!acc[date]) acc[date] = [];
    acc[date].push(punch);
    return acc;
  }, {});

  for (let date in punchesByDate) {
    punchesByDate[date].sort((a, b) => new Date(a) - new Date(b));
  }

  const processedPunches = [];
  for (let date in punchesByDate) {
    let totalWorkingTime = 0;
    const punches = removeDuplicatePunches(punchesByDate[date]);
    for (let index = 0; index < punches.length; index++) {
      const punch = punches[index];

      if (index % 2 === 0) {
        const checkInTime = new Date(punch);

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

        const workingDuration =
          (checkOutTime - new Date(lastPunch.punch_time)) / (1000 * 60);
        totalWorkingTime += workingDuration;
      }
    }
    totalMonthWiseWorkingTime += totalWorkingTime;
  }
  const formattedMonthlyHours = convertMinutesToHoursMinutes(
    totalMonthWiseWorkingTime.toFixed(2)
  );
  return { formattedMonthlyHours };
}

module.exports = { monthWiseWorkingData };
