const axios = require("axios");
var helpers = require("../helpers");
const leavesController = {};

leavesController.getAddLeaves = async (req, res) => {
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
    const token = req.cookies.jwt;
    const AddLeavesdata = {
      user_id: req.body.user_id,
      datefrom: req.body.datefrom,
      dateto: req.body.dateto,
      reason: req.body.reason,
    };
    helpers
    .axiosdata("post","/api/addLeaves",token,AddLeavesdata)
      .then(function (response) {
        res.redirect("/employeeLeavesList");
      })
      .catch(function (response) { });
  } catch (e) {
    res.status(400).send(e);
  }
};


leavesController.viewleaves = async (req, res) => {
  const token = req.cookies.jwt;
  try {
    helpers
    .axiosdata("get","/api/viewleavesrequest",token)
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

leavesController.employeeLeavesList = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    helpers
    .axiosdata("get","/api/employeeLeavesList",token).then(function (response) {
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
leavesController.cancelLeaves = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    const _id = req.params.id;
    const user_id = sess.userData._id;
    const cancelData={
      status: "CANCELLED",
      approver_id: user_id,
    }
    helpers
    .axiosdata("post","/api/cancelLeaves/"+_id,token,cancelData)
      .then(function (response) {
        res.redirect("/employeeLeavesList");
      })
      .catch(function (response) { });
  } catch (e) {
    res.status(400).send(e);
  }
};

leavesController.rejectLeaves = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    const _id = req.params.id;
    const user_id = sess.userData._id;
    const rejectData={
      status: "REJECT",
      approver_id: user_id,
    }
    helpers
    .axiosdata("post","/api/rejectLeaves/"+_id,token,rejectData)
      .then(function (response) {
        res.redirect("/viewleaves");
      })
      .catch(function (response) { });
  } catch (e) {
    res.status(400).send(e);
  }
};

leavesController.approveLeaves = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    const _id = req.params.id;
    const user_id = sess.userData._id;
    const approveData={
      status: "APPROVE",
      approver_id: user_id,
    }
    helpers
    .axiosdata("post","/api/approveLeaves/"+_id,token,approveData)
      .then(function (response) {
        res.redirect("/viewleaves");
      })
      .catch(function (response) { });
  } catch (e) {
    res.status(400).send(e);
  }
};

module.exports = leavesController;
