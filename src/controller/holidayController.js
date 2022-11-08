const Holiday = require("../model/holiday");
const holidayController = {};

holidayController.list = async (req, res) => {
  sess = req.session;
  try {
    const blogs = await Holiday.find({ deleted_at: "null" });
    res.render("holidayListing", {
      data: blogs,
      username: sess.username,
      users: sess.userData,
      layout: false,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

holidayController.getHoliday = async (req, res) => {
  sess = req.session;

  res.render("addHoliday", { username: sess.username });
};

holidayController.addHoliday = async (req, res) => {
  try {
    const addHoliday = new Holiday({
      holiday_name: req.body.holiday_name,
      holiday_date: req.body.holiday_date,
    });
    const Holidayadd = await addHoliday.save();
    res.status(201).redirect("/holidayListing");
  } catch (e) {
    res.status(400).send(e);
  }
};

holidayController.editHoliday = async (req, res) => {
  try {
    sess = req.session;
    const _id = req.params.id;
    const holidayData = await Holiday.findById(_id);
    res.render("editHoliday", {
      data: holidayData,
      username: sess.username,
      layout: false,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

holidayController.updateHoliday = async (req, res) => {
  try {
    const _id = req.params.id;
    const updateHoliday = {
      holiday_name: req.body.holiday_name,
      holiday_date: req.body.holiday_date,
      updated_at: Date(),
    };
    const updateEmployee = await Holiday.findByIdAndUpdate(_id, updateHoliday);
    res.redirect("/holidayListing");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

holidayController.deleteHoliday = async (req, res) => {
  const _id = req.params.id;
  const updateHoliday = {
    deleted_at: Date(),
  };
  const updateEmployee = await Holiday.findByIdAndUpdate(_id, updateHoliday);
  res.redirect("/holidayListing");
};

module.exports = holidayController;
