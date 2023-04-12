const NewTimeEntriesController = {};
var helpers = require("../helpers");
require("dotenv").config();
const timeEntry = require("../model/timeEntries");
var rolehelper = require("../utilis_new/helper");

NewTimeEntriesController.timeEntrieslisting = async (req, res) => {
  sess = req.session;
  token = req.cookies.jwt;
  helpers
    .axiosdata("get", "/api/timeEntryListing", token)
    .then(function (response) {
      // console.log(response.data.timeEntryData.length);
      sess = req.session;
      if (response.data.status == false) {
        res.redirect("/forbidden");
      } else {
        rolehelper
          .checkPermission(req.user.role_id, req.user.user_id, "Add TimeEntry")
          .then((addPerm) => {
            rolehelper
              .checkPermission(
                req.user.role_id,
                req.user.user_id,
                "Update TimeEntry"
              )
              .then((updatePerm) => {
                rolehelper
                  .checkPermission(
                    req.user.role_id,
                    req.user.user_id,
                    "Delete TimeEntry"
                  )
                  .then(async (deletePerm) => {
                    // console.log(response)
                    res.render("NewtimeEntriesListing", {
                     roleHasPermission : await helpers.getpermission(req.user),
                      timeEntryData: response.data.timeEntryData,
                      userData : response.data.userData,
                      loggeduserdata: req.user,
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
      //console.log("response");
    });
};

NewTimeEntriesController.AddtimeEntries = async (req, res) => {
  sess = req.session;
  token = req.cookies.jwt;
  helpers
    .axiosdata("get", "/api/addTimeEntries", token)
    .then (async function (response) {
      sess = req.session;
      if (response.data.status == false) {
        res.redirect("/forbidden");
      } else {
        res.render("AddtimeEntries", {
         roleHasPermission : await helpers.getpermission(req.user),
          projectData: response.data.projectData,
          days:response.data.validDays,
          holidayData:response.data.holidayData,
          userLeavesdata:response.data.userLeavesdata,
          loggeduserdata: req.user,
          timeEntryRequestData:response.data.timeEntryRequestData,
          message:response.data.message
        });
      }
    })
    .catch(function (response) {
      console.log(response);
    });
};

NewTimeEntriesController.NewAddtimeEntries = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    const data = {
      project_id: req.body.project_id,
      task_id: req.body.task_id,
      hours: req.body.hours,
      date: req.body.date,
    };
    helpers
      .axiosdata("post", "/api/addTimeEntries", token, data)
      .then(async function (response) {
        if (response.data.status == false) {
          res.redirect("/forbidden");
        } else if( response.data.date_status == 0) {
          res.render("AddtimeEntries", {
            roleHasPermission : await helpers.getpermission(req.user),
             projectData: response.data.projectData,
             loggeduserdata: req.user,
             timeEntryRequestData:response.data.timeEntryRequestData,
             message:response.data.message
           });
          
        } else {
          res.redirect('/timeEntryListing')
        }
       
      })
      .catch(function (response) {
        console.log(response);
      });
  } catch (e) {
    res.status(400).send(e);
  }
};

NewTimeEntriesController.search = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    const data = {
      inputValue: req.body.inputValue,
    };
    helpers
      .axiosdata("post", "/api/viewpermissions", token, data)
      .then(function (response) {
        res.redirect("/timeEntrieslisting");
      })
      .catch(function (response) {
        console.log(response);
      });
  } catch (e) {
    res.status(400).send(e);
  }timeEntryRequestData
};
NewTimeEntriesController.getDataBymonth = async (req, res) => {
  try {
    const _month = parseInt(req.body.month);
    const _year = parseInt(req.body.year);

    const timeEntryData = await timeEntry.aggregate([
      { $match: { deleted_at: "null" } },

      {
        $match: {
          $expr: {
            $and: [
              {
                $eq: [
                  {
                    $month: "$date",
                  },
                  _month,
                ],
              },
              {
                $eq: [
                  {
                    $year: "$date",
                  },
                  _year,
                ],
              },
            ],
          },
        },
      },
      { $sort: { date: 1 } },
      {
        $lookup: {
          from: "projects",
          localField: "project_id",
          foreignField: "_id",
          as: "projectData",
        },
      },
      {
        $lookup: {
          from: "tasks",
          localField: "task_id",
          foreignField: "_id",
          as: "taskData",
        },
      },
    ]);

    res.json({ timeEntryData });
  } catch (e) {
    res.status(400).send(e);
  }
};
NewTimeEntriesController.editTimeEntry = async (req, res) => {
  const _id = req.params.id;
  const token = req.cookies.jwt;
  helpers
    .axiosdata("get", "/api/editTimeEntry/" + _id, token)
    .then( async function (response) {
      sess = req.session;
      if (response.data.status == false) {
        res.redirect("/forbidden");
      } else {
        res.render("EditTimeEntries", {
          projectData: response.data.projectData,
          adminProjectData: response.data.adminProjectData,
           roleHasPermission : await helpers.getpermission(req.user),
          timeEntryData: response.data.timeEntryData,
          taskData: response.data.taskData,
          validDays:response.data.validDays,
          holidayData:response.data.holidayData,
          userLeavesdata:response.data.userLeavesdata,
          timeEntryRequestData:response.data.timeEntryRequestData,
          loggeduserdata: req.user,
          users: sess.userData,
        });
      }
    })
    .catch(function (response) {});
};
NewTimeEntriesController.updateTimeEntry = async (req, res, next) => {
  try {
    const _id = req.params.id;

    const token = req.cookies.jwt;
    const data = {
      project_id: req.body.project_id,
      task_id: req.body.task_id,
      hours: req.body.hours,
      date: req.body.date,
    };

    helpers
      .axiosdata("post", "/api/editTimeEntry/" + _id, token, data)
      .then(function (response) {
        res.redirect("/timeEntryListing");
      })
      .catch(function (response) {
        console.log(response);
      });
  } catch (e) {
    res.status(400).send(e);
  }
};
NewTimeEntriesController.timeEntryRequest = async (req, res) => {
  sess = req.session;
  token = req.cookies.jwt;
  helpers
    .axiosdata("get", "/api/addTimeEntries", token)
    .then (async function (response) {

      sess = req.session;
      if (response.data.status == false) {
        res.redirect("/forbidden");
      } else {
        res.render("timeEntryRequest", {
         roleHasPermission : await helpers.getpermission(req.user),
          projectData: response.data.projectData,
          loggeduserdata: req.user,
          message:response.data.message
        });
      }
    })
    .catch(function (response) {
      console.log(response);
    });
};

NewTimeEntriesController.AddtimeEntryRequest = async (req, res) => {
  sess = req.session;
  token = req.cookies.jwt;
  const timeEntryRequestData = {
    start_date:req.body.start_date,
     end_date:req.body.end_date,
  };
  helpers
    .axiosdata("post", "/api/timeEntryRequest", token, timeEntryRequestData)
    .then (async function (response) {

      console.log("response",response.data)
      sess = req.session;
      if (response.data.status == false) {
        res.redirect("/forbidden");
      } else if( response.data.date_status == 0) {
        res.render("timeEntryRequest", {
           roleHasPermission : await helpers.getpermission(req.user),
            loggeduserdata: req.user,
            message:response.data.message
          });
        
      } else {
        res.redirect('/timeEntryListing')
      }
    })
    .catch(function (response) {
      console.log(response);
    });
};
NewTimeEntriesController.timeEntryRequestListing = async (req, res) => {
  sess = req.session;
  token = req.cookies.jwt;
  helpers
    .axiosdata("get", "/api/timeEntryRequestListing", token)
    .then (async function (response) {

      sess = req.session;
      if (response.data.status == false) {
        res.redirect("/forbidden");
      } else { 
         rolehelper
        .checkPermission(req.user.role_id, req.user.user_id, "Accept Or Reject TimeEntryRequest")
        .then(async ( acceptRejectPerm) => {
        // console.log(response)
        res.render("timeEntryRequestListing", {
         roleHasPermission : await helpers.getpermission(req.user),
          timeEntryRequestData: response.data.timeEntryRequestData,
          userTimeEntryRequestData: response.data.userTimeEntryRequestData,
          loggeduserdata: req.user,
          acceptRejectStatus: acceptRejectPerm.status, 
        });
      })
      }
    })
    .catch(function (response) {
      console.log(response);
    });
};
NewTimeEntriesController.approveTimeEntryRequest = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    const _id = req.params.id;
    const user_id = sess.userData._id;
    const approveRequestData = {
      status: "1",
    };
    helpers
      .axiosdata("post", "/api/approveTimeEntryRequest/" + _id, token, approveRequestData)
      .then(function (response) {
        if (response.data.status == false) {
          res.redirect("/forbidden");
        } else {
          res.redirect("/timeEntryRequestListing");
        }
      })

  } catch (e) {
    res.status(400).send(e);
  }
};
NewTimeEntriesController.rejectTimeEntryRequest = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    const _id = req.params.id;
    const user_id = sess.userData._id;
    const approveRequestData = {
      status: "2",
    };
    helpers
      .axiosdata("post", "/api/rejectTimeEntryRequest/" + _id, token, approveRequestData)
      .then(function (response) {
        if (response.data.status == false) {
          res.redirect("/forbidden");
        } else {
          res.redirect("/timeEntryRequestListing");
        }
      })

  } catch (e) {
    res.status(400).send(e);
  }
};

NewTimeEntriesController.getAddWorkingHour = async (req, res) => {
  sess = req.session;
  token = req.cookies.jwt;
  helpers
    .axiosdata("get", "/api/addWorkingHour", token)
    .then (async function (response) {
      
      sess = req.session;
      if (response.data.status == false) {
        res.redirect("/forbidden");
      } else {
        // console.log("response",response)
        res.render("addWorkingHour", {
         roleHasPermission : await helpers.getpermission(req.user),
          projectData: response.data.projectData,
          validDays:response.data.validDays,
          holidayData:response.data.holidayData,
          userLeavesdata:response.data.userLeavesdata,
          loggeduserdata: req.user,
          timeEntryRequestData:response.data.timeEntryRequestData,
          message:response.data.message
        });
      }
    })
    .catch(function (response) {
      console.log(response);
    });
};
NewTimeEntriesController.AddWorkingHour = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    const data = {
      start_time: req.body.start_time,
      end_time: req.body.end_time,
      date: req.body.date,
      total_hour:req.body.total_hour
    };
    helpers
      .axiosdata("post", "/api/addWorkingHour", token, data)
      .then(async function (response) {
        if (response.data.status == false) {
          res.redirect("/forbidden");
        }else{
          res.redirect("/showWorkingHour");
        } 
       
      })
      .catch(function (response) {
        console.log(response);
      });
  } catch (e) {
    res.status(400).send(e);
  }
};

NewTimeEntriesController.showWorkingHour = async (req, res) => {
  sess = req.session;
const  token = req.cookies.jwt;
  helpers
    .axiosdata("get", "/api/showWorkingHour", token)
    .then (async function (response) {
      sess = req.session;
      if (response.data.status == false) {
        res.redirect("/forbidden");
      } else {
        // console.log("response",response)
        res.render("showWrokingHour", {
         roleHasPermission : await helpers.getpermission(req.user),
         userData : response.data.userData,
        loggeduserdata: req.user,
        });
      }
    })
    .catch(function (response) {
      console.log(response);
    });
};

module.exports = NewTimeEntriesController;
