 const Role = require("../model/roles");

const userController = {}

userController.addUser=  async(req, res) => {
 sess = req.session; 
 const blogs =  await Role.find();
res.render("addUser",{data: blogs,name:sess.name,role:sess.role,layout:false});
}  

module.exports = userController;