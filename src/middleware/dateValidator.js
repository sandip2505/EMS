const moment = require('moment-timezone');

/**
 * Validates the date based on the criteria:
 * - The date should not be in the future.
 * - The date should not be older than 2 days.
 * 
 * @param {string} dateString - The date string to validate.
 * @param {string} empCode - The employee code to check against.
 * @param {Array} checkUser - List of employee codes that are exempted from the validation.
 * @returns {object} - Returns an object with a `valid` boolean and an optional `message` if invalid.
 */
const validateDate = (dateString, empCode) => {
    const date = moment.tz(dateString, 'Asia/Kolkata');
    const now = moment.tz('Asia/Kolkata');
    const numbers = [11, 12, 15, 19, 27, 30, 23];
    const checkUser = numbers.map((number) => `CC-00${number}`);
    const isFuture = date.isAfter(now);
    const isTooOld = !date.isSame(now, 'day') && date.isBefore(now.clone().subtract(2, 'days'));
    console.log(checkUser.includes(empCode))
    if (!checkUser.includes(empCode)) {
        if (isFuture || isTooOld) {
            return { valid: false, message: 'Invalid Date' };
        }
    }

    return { valid: true };
};

module.exports = { validateDate };
