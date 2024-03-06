const holiday = require("../model/holiday");

// console.log("asgsg")
const holidayApi = {
  async holidays({ searchParams,sortParams, skip, limit }) {
    const holidayData = await holiday
      .find(searchParams)
      .select("holiday_date holiday_name")
      .sort(sortParams)
      .skip(skip)
      .limit(limit);
    return holidayData;
  },
  async allHolidays() {
    const holidayData = await holiday
      .find({ deleted_at: "null" })
      .select("holiday_date holiday_name");
    return holidayData;
  },
  async addHoliday(data) {
    try {
      const holidayData = new holiday(data);
      await holidayData.save();
      console.log("Holiday added successfully:", data);
      return { success: true };
    } catch (error) {
      console.error("Error adding holiday:", error);
      throw error; // Rethrow the error for the calling function to handle
    }
  },
  async getHoliday(id) {
    try {
      const data = await holiday
        .findById(id)
        .select("holiday_date holiday_name");
      return data;
    } catch (error) {
      console.error("Error adding holiday:", error);
      throw error; // Rethrow the error for the calling function to handle
    }
  },
  async updateHoliday({ data, _id }) {
    try {
      await holiday.findByIdAndUpdate(
        _id,
        data,
        { runValidators: true, context: "query" } // Enable validation and use 'query' context
      );
      console.log("Holiday Updated successfully:", data);
      return { success: true };
    } catch (error) {
      console.error("Error adding holiday:", error);
      throw error; // Rethrow the error for the calling function to handle
    }
  },
  async deleteHoliday({ data, _id }) {
    try {
      await holiday.findByIdAndUpdate(_id, data);
      console.log("Holiday Deleted successfully:", data);
      return { success: true };
    } catch (error) {
      console.error("Error adding holiday:", error);
      throw error; // Rethrow the error for the calling function to handle
    }
  },
};

module.exports = holidayApi;
