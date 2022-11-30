const axios = require("axios");
const leavesController = {};

leavesController.leaves = async (req, res) => {
  sess = req.session;
  try {
    res.render("leaves", {
      username: sess.username,
      users: sess.userData,
      layout: false,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

leavesController.addleaves = async (req, res) => {
  try {
    axios({
      method: "post",
      url: process.env.BASE_URL + "/addLeaves",
      data: {
        user_id: req.body.user_id,
        datefrom: req.body.datefrom,
        dateto: req.body.dateto,
        reason: req.body.reason,
      },
    })
      .then(function (response) {
        res.redirect("/emlpoleaveslist");
      })
      .catch(function (response) { });
  } catch (e) {
    res.status(400).send(e);
  }
};

leavesController.viewleaves = async (req, res) => {
  sess = req.session;
  try {
    axios({
      method: "get",
      url: process.env.BASE_URL + "/leavesList/",
    })
      .then(function (response) {
        sess = req.session;
        res.render("leaveslist", {
          leavesData: response.data.allLeaves,
          name: sess.name,
          username: sess.username,
          users: sess.userData,
        });
      })
      .catch(function (response) {
        console.log(response);
      });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

leavesController.employeeLavesList = async (req, res) => {
  sess = req.session;
  try {
    axios({
      method: "get",
      url: process.env.BASE_URL + "/employeeLavesList/",
    }).then(function (response) {
      sess = req.session;
      res.render("emlpoleaveslist", {
        employeeLeavesData: response.data.emplyeeLeaves,
        name: sess.name,
        username: sess.username,
        users: sess.userData,
      });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
leavesController.cancelleaves = async (req, res) => {
  try {
    const _id = req.params.id;
    const user_id = sess.userData._id;
    axios({
      method: "post",
      url: process.env.BASE_URL + "/cancelLeaves/" + _id,
      data: {
        status: "CANCELLED",
        approver_id: user_id,
      },
    })
      .then(function (response) {
        res.redirect("/emlpoleaveslist");
      })
      .catch(function (response) { });
  } catch (e) {
    res.status(400).send(e);
  }
};

leavesController.rejectleaves = async (req, res) => {
  try {
    const _id = req.params.id;
    const user_id = sess.userData._id;
    axios({
      method: "post",
      url: process.env.BASE_URL + "/rejectLeaves/" + _id,
      data: {
        status: "REJECT",
        approver_id: user_id,
      },
    })
      .then(function (response) {
        res.redirect("/viewleaves");
      })
      .catch(function (response) { });
  } catch (e) {
    res.status(400).send(e);
  }
};
leavesController.approveleaves = async (req, res) => {
  try {
    const _id = req.params.id;
    const user_id = sess.userData._id;
    axios({
      method: "post",
      url: process.env.BASE_URL + "/approveLeaves/" + _id,
      data: {
        status: "APPROVE",
        approver_id: user_id,
      },
    })
      .then(function (response) {
        res.redirect("/viewleaves");
      })
      .catch(function (response) { });
  } catch (e) {
    res.status(400).send(e);
  }
};

module.exports = leavesController;
