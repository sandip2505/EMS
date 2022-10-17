

const Holiday = require("../model/holiday");
const holidayController = {}

holidayController.list = async (req, res) => {
  sess = req.session;
  try {
    const blogs = await Holiday.find();
    res.render('holidayListing', {

      data: blogs, name: sess.name, username: sess.username, users: sess.userData, layout: false
    });
    // res.json({ data: blogs, status: "success" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
  // res.render("holidayListing",{name:sess.name,layout:false});


};
holidayController.getHoliday = async (req, res) => {
  sess = req.session;
  res.render("addHoliday", { name: sess.name, username: sess.username, users: sess.userData, layout: false });
}
holidayController.addHoliday = async (req, res) => {

  try {
    const addHoliday = new Holiday({
      holiday_name: req.body.holiday_name,
      holiday_date: req.body.holiday_date
    });
    const Holidayadd = await addHoliday.save();
    res.status(201).redirect("/holidayListing");

  } catch (e) {
    res.status(400).send(e);
  }

}
holidayController.editHoliday = async (req, res) => {
  try {
    sess = req.session
    const _id = req.params.id;
    const studentData = await Holiday.findById(_id);
    res.render('editHoliday', {

      data: studentData, name: sess.name, username: sess.username, users: sess.userData, layout: false
    });
    // res.json({ data: blogs, status: "success" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
holidayController.updateHoliday = async (req, res) => {
  try {
    const _id = req.params.id;
    const updateHoliday = {
      holiday_name: req.body.holiday_name,
      holiday_date: req.body.holiday_date,
      updated_at: Date(),
    }
    const updateEmployee = await Holiday.findByIdAndUpdate(_id, updateHoliday);
    res.redirect("/holidayListing");

    // res.json({ data: blogs, status: "success" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }

}
holidayController.deleteHoliday = async (req, res) => {
  try {
    const _id = req.params.id;
    await Holiday.findByIdAndDelete(_id);
    res.redirect("/holidayListing");
  } catch (e) {
    res.status(400).send(e);
  }
}


module.exports = holidayController