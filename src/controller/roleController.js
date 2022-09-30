const Role = require("../model/roles");

const roleController = {}

roleController.getRole=  async(req, res) => {
 sess = req.session; 
res.render("addRole",{name:sess.name,role:sess.role,layout:false});
}   
roleController.addRole=  async(req, res) => {

    try {
        const addRole = new Role({
          role_name: req.body.role_name,
          role_description: req.body.role_description,
        });
        const Roleadd  = await addRole.save();
        res.status(201).redirect("/index");
      
    } catch (e) {
      res.status(400).send(e);
    }

} 

module.exports = roleController;