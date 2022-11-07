const Role = require("../model/roles");
const user = require("../model/user");



const roleController = {}

roleController.getRole = async (req, res) => {
  sess = req.session;
  res.render("addRole", { name: sess.name, users: sess.userData, username: sess.username, role: sess.role, layout: false });
}
roleController.addRole = async (req, res) => {

  try {
    const addRole = new Role({
      role_name: req.body.role_name,
      role_description: req.body.role_description,
    });
    const Roleadd = await addRole.save();
    res.status(201).redirect("/roleListing");

  } catch (e) {
    res.status(400).send(e);
  }

}
roleController.list = async (req, res) => {
  sess = req.session;
  try {
    const blogs = await Role.find({ deleted_at: "null" });


    res.render('roleListing', {
      success: req.flash('success'), data: blogs, name: sess.name, users: sess.userData, username: sess.username, role: sess.role, layout: false
    });



  } catch (err) {
    res.status(500).json({ error: err.message });
  }
  // res.render("holidayListing",{name:sess.name,layout:false});


};
roleController.editRole = async (req, res) => {
  try {
    sess = req.session
    const _id = req.params.id;

    const roleData = await Role.findById(_id);
    res.render('editRole', {
      data: roleData, role: sess.role, users: sess.userData, username: sess.username, name: sess.name, layout: false
    });
    // res.json({ data: blogs, status: "success" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
roleController.updateRole = async (req, res) => {
  try {
    const _id = req.params.id;
    const role = {
      role_name: req.body.role_name,
      role_description: req.body.role_description,
      permission_name: req.body.permission_name,
      updated_at: Date(),
    }

    const updateEmployee = await Role.findByIdAndUpdate(_id, role);
    res.redirect("/roleListing");
  } catch (e) {
    res.status(400).send(e);
  }
}
roleController.deleteRole = async (req, res) => {

  const _id = req.params.id;
  var alreadyRole = await user.find({ role_id: _id })
  var data = (alreadyRole.toString().includes(_id))

  if (data == true) {
    req.flash('success', `this role is already assigned to user so you can't delete this role`)
    res.redirect('/roleListing')


  } else {
    const deleteRole = {
      deleted_at: Date(),
    }
    await Role.findByIdAndUpdate(_id, deleteRole);
    res.redirect("/roleListing");
  }




}

module.exports = roleController;