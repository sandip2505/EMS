var helpers = require("../helpers");
const leavesController = {};
var rolehelper = require("../utilis_new/helper");
leavesController.getAddLeaves = async (req, res) => {
  sess = req.session;
  try {
    const token = req.cookies.jwt;
    helpers.axiosdata("get", "/api/addLeaves", token).then( async function (response) {
      sess = req.session;
      if (response.data.status == false) {
        res.redirect("/forbidden");
      } else {
        res.render("leaves", {
          loggeduserdata: req.user,
          users: sess.userData,
         roleHasPermission : await helpers.getpermission(req.user),
          layout: false,
        });
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

leavesController.addleaves = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    console.log(req.body)
    const AddLeavesdata = {
      user_id: req.body.user_id,
      datefrom: req.body.datefrom,
      dateto: req.body.dateto,
      reason: req.body.reason,
      is_adhoc:req.body.is_adhoc,
      half_day:req.body.half_day
    };
    helpers
      .axiosdata("post", "/api/addLeaves", token, AddLeavesdata)
      .then(function (response) {
        if (response.data.status == false) {
          res.redirect("/forbidden");
        } else {
          res.redirect("/employeeLeavesList");
        }
      })
      .catch(function (response) {});
  } catch (e) {
    res.status(400).send(e);
  }
};

leavesController.viewleaves = async (req, res) => {
  const token = req.cookies.jwt;
  try {
    helpers
      .axiosdata("get", "/api/viewleavesrequest", token)
      .then(async function (response) {
        sess = req.session;
        if (response.data.status == false) {
          res.redirect("/forbidden");
        }
        //  else {
          
        //   res.render("leaveslist", {
        //     leavesData: response.data.allLeaves,
        //     adminLeavesrequestData: response.data.adminLeavesrequest,
        //     roleHasPermission : await helpers.getpermission(req.user),
        //     name: sess.name,
        //     loggeduserdata: req.user,
        //     users: sess.userData,
        //   });
        // }
        else{
          rolehelper
            .checkPermission(req.user.role_id, req.user.user_id, "Add Leaves")
            .then((addPerm) => {
              rolehelper
                .checkPermission(
                  req.user.role_id,
                  req.user.user_id,
                  "Update Leaves"
                )
                .then((updatePerm) => {
                  rolehelper
                    .checkPermission(
                      req.user.role_id,
                      req.user.user_id,
                      "Delete Leaves"
                    )
                    .then(async(deletePerm) => {
                      res.render("leaveslist", {
                        leavesData: response.data.allLeaves,
                        adminLeavesrequestData: response.data.adminLeavesrequest,
                        roleHasPermission : await helpers.getpermission(req.user),
                        name: sess.name,
                        loggeduserdata: req.user,
                        users: sess.userData,
                        addStatus: addPerm.status,
                      updateStatus: updatePerm.status,
                      deleteStatus: deletePerm.status,
                      });
                    });
                });
            });
        }
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
      .axiosdata("get", "/api/employeeLeavesList", token)
      .then(async function (response) {
        sess = req.session;
        if (response.data.status == false) {
          res.redirect("/forbidden");
        } else {
          res.render("emlpoleaveslist", {
            employeeLeavesData: response.data.emplyeeLeaves,
            name: sess.name,
           roleHasPermission : await helpers.getpermission(req.user),
            loggeduserdata: req.user,
            users: sess.userData,
          });
        }
      });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
leavesController.cancelLeaves = async (req, res) => {
  try {
    // console.log("ASd")
    const token = req.cookies.jwt;
    const _id = req.params.id;
    const user_id = sess.userData._id;
    const cancelData = {
      status: "CANCELLED",
      approver_id: user_id,
    };
    helpers
      .axiosdata("post", "/api/cancelLeaves/" + _id, token, cancelData)
      .then(function (response) {
        if (response.data.status == false) {
          res.redirect("/forbidden");
        } else {
          res.redirect("/employeeLeavesList");
        }
      })
      .catch(function (response) {});
  } catch (e) {
    res.status(400).send(e);
  }
};

leavesController.rejectLeaves = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    const _id = req.params.id;
    const user_id = sess.userData._id;
    const rejectData = {
      status: "REJECT",
      approver_id: user_id,
    };
    helpers
      .axiosdata("post", "/api/rejectLeaves/" + _id, token, rejectData)
      .then(function (response) {
        if (response.data.status == false) {
          res.redirect("/forbidden");
        } else {
          res.redirect("/viewleavesrequest");
        }
      })
     
  } catch (e) {
    res.status(400).send(e);
  }
};

leavesController.approveLeaves = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    const _id = req.params.id;
    const user_id = sess.userData._id;
    const approveData = {
      status: "APPROVE",
      approver_id: user_id,
    };
    helpers
      .axiosdata("post", "/api/approveLeaves/" + _id, token, approveData)
      .then(function (response) {
        if (response.data.status == false) {
          res.redirect("/forbidden");
        } else {
          res.redirect("/viewleavesrequest");
        }
      })

  } catch (e) {
    res.status(400).send(e);
  }
};

leavesController.alluserLeaves = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    helpers
      .axiosdata("get", "/api/alluserleaves", token)
      .then(async function (response) {
        sess = req.session;
        if (response.data.status == false) {
          res.redirect("/forbidden");
        } else {
          res.render("alluser_leaves", {
            employeeData: response.data.userData,
            leaves: await helpers.getSettingData("leaves"),
           roleHasPermission : await helpers.getpermission(req.user),
            name: sess.name,
            loggeduserdata: req.user,
            users: sess.userData,
          });
        }
      });
  } catch (e) {
    res.status(400).send(e);
  }
};

leavesController.editLeave = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    const _id = req.params.id;
  
    helpers
      .axiosdata("get", "/api/editLeave/" + _id, token,)
      .then(async function (response) {
        sess = req.session;
        if (response.data.status == false) {
          res.redirect("/forbidden");
        } else {
          console.log(response)
          res.render("editLeave", {
            leaveData: response.data.leavesData,
           roleHasPermission : await helpers.getpermission(req.user),
            loggeduserdata: req.user,
            users: sess.userData,
            
          });
        }
      })
      .catch(function (response) {});
  } catch (e) {
    res.status(400).send(e);
  }
};
leavesController.updateLeave = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    const _id = req.params.id;
    const updateLeavedata = {
      user_id: req.body.user_id,
      datefrom: req.body.datefrom,
      dateto: req.body.dateto,
      reason: req.body.reason,
      is_adhoc:req.body.is_adhoc,
      half_day:req.body.half_day
    };
    helpers
      .axiosdata("post", "/api/editLeave/" + _id, token,updateLeavedata)
      .then(function (response) {
        console.log(response)
        res.redirect("/viewleavesrequest");
      })
      .catch(function (response) {});
  } catch (e) {
    res.status(400).send(e);
  }
};
leavesController.deleteLeave = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    const _id = req.params.id;
    helpers.axiosdata("post", "/api/deleteLeaves/" + _id, token)
      .then(function (response) {
        if (response.data.status == false) {
          res.redirect("/forbidden");
        } else {
          res.redirect("/viewleavesrequest");
        }
      })
      .catch(function (response) {});
  } catch (e) {
    res.status(400).send(e);
  }
};



// leavesController.alluserLeaves = async (req, res) => {

//    try {

//   const userData = await user.aggregate([
//             {
//               $lookup: {
//                 from: "leaves",
//                 localField: "_id",
//                 foreignField: "user_id",
//                 as: "leaves",
//               },
//             },
//           ]);

// res.render("alluser_leaves", {
//               employeeData: userData,
//               leaves : await helpers.getSettingData('leaves'),
//               name: sess.name,
//           loggeduserdata: req.user,
//               users: sess.userData,
//             });

//   } catch (e) {
//     res.status(400).send(e);
//   }
// };
module.exports = leavesController;
