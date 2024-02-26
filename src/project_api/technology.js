const technology = require("../model/technology");

// console.log("asgsg")
const technologyApi = {
  async technologies({ searchParams, skip, limit }) {
    const technologyData = await technology
      .find(searchParams)
      .skip(skip)
      .limit(limit);
    return technologyData;
  },
  async allTechnologies() {
    const technologyData = await technology.find()
    return technologyData;
  },
  async addTechnology(data) {
    try {
      const technologyData = new technology(data);
      await technologyData.save();
      console.log("technology added successfully:", data);
      return { success: true };
    } catch (error) {
      console.error("Error adding technology:", error);
      throw error; // Rethrow the error for the calling function to handle
    }
  },
  async getTechnology(id) {
    try {
      const data = await technology.findById(id);
      return data;
    } catch (error) {
      console.error("Error adding technology:", error);
      throw error; // Rethrow the error for the calling function to handle
    }
  },
  async updateTechnology({data,_id}){
    try {
      await technology.findByIdAndUpdate(
        _id,
        data,
        { runValidators: true, context: "query" } // Enable validation and use 'query' context
      );
      return { success: true };
    } catch (error) {
      console.error("Error adding holiday:", error);
      throw error; // Rethrow the error for the calling function to handle
    }
  },
  
};

module.exports = technologyApi;
