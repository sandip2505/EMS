const setting = require("../model/settings");

// console.log("asgsg")
const settingApi = {
  async getSettingValue(key) {
    const settingData = await setting.find({key})
    return settingData;
  },
  // async alltechnologys() {
  //   const technologyData = await technology
  //     .find({ deleted_at: "null" })
  //     .select("technology_date technology_name");
  //   return technologyData;
  // },
  // async addTechnology(data) {
  //   try {
  //     const technologyData = new technology(data);
  //     await technologyData.save();
  //     console.log("technology added successfully:", data);
  //     return { success: true };
  //   } catch (error) {
  //     console.error("Error adding technology:", error);
  //     throw error; // Rethrow the error for the calling function to handle
  //   }
  // },
  // async getTechnology(id) {
  //   try {
  //     const data = await technology.findById(id);
  //     return data;
  //   } catch (error) {
  //     console.error("Error adding technology:", error);
  //     throw error; // Rethrow the error for the calling function to handle
  //   }
  // },
  // async updateTechnology({data,_id}){
  //   try {
  //     await technology.findByIdAndUpdate(
  //       _id,
  //       data,
  //       { runValidators: true, context: "query" } // Enable validation and use 'query' context
  //     );
  //     return { success: true };
  //   } catch (error) {
  //     console.error("Error adding holiday:", error);
  //     throw error; // Rethrow the error for the calling function to handle
  //   }
  // }
};

module.exports = settingApi;
