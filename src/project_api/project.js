const project = require("../model/createProject");

// console.log("asgsg")
const projectApi = {
  async allProjcects() {
    const projectData = await project.find({deleted_at:'null'}).select('title');
    return projectData;
  },
  async userProjcects(id) {
    const projectData = await project.find({ deleted_at: 'null', user_id: id }).select('title');
    return projectData;
  },

};

module.exports = projectApi;
