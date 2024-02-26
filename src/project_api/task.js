const task = require("../model/createTask");

// console.log("asgsg")
const taskApi = {
  async allTasks() {
    const taskData = await task.find({deleted_at:'null'});
    return taskData;
  },
  async userTasks(id) {
    const taskData = await task.find({ deleted_at: null, user_id: { $in: id } });
    return taskData;
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

module.exports = taskApi;
