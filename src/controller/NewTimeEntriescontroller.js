const NewTimeEntriesController = {};
var helpers = require("../helpers");
require("dotenv").config();
const timeEntry = require("../model/timeEntries");
const project = require("../model/createProject");
const { CURSOR_FLAGS } = require("mongodb");

NewTimeEntriesController.timeEntrieslisting = async (req, res) => {
  sess = req.session;
  token = req.cookies.jwt;
  helpers
    .axiosdata("get", "/api/timeEntryListing", token)
    .then(function (response) {
      // console.log("data",response.data.timeEntryData);
      sess = req.session;
      res.render("NewtimeEntriesListing", {
        timeEntryData: response.data.timeEntryData,
    loggeduserdata: req.user,
      });
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
    .then(function (response) {
      sess = req.session;
      if (response.data.status == false) {
        res.redirect("/forbidden");
      } else {
        res.render("AddtimeEntries", {
          projectData: response.data.projectData,
          loggeduserdata: req.user,
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

NewTimeEntriesController.search = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    const data = {
      inputValue: req.body.inputValue,
    };
    helpers
      .axiosdata("post", "/api/viewpermissions", token, data)
      .then(function (response) {
       // console.log("response", response);
        res.redirect("/timeEntrieslisting");
      })
      .catch(function (response) {
        console.log(response);
      });
  } catch (e) {
    res.status(400).send(e);
  }
};
NewTimeEntriesController.getDataBymonth = async (req, res) => {
  try {
    const _month = parseInt(req.body.month);
    const _year = parseInt(req.body.year);


    const timeEntryData = await timeEntry.aggregate([
      { $match: { deleted_at: "null" }},
      
       { $match :{ $expr: {
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
    
    // console.log("timeEntryData", timeEntryData);

    res.json({ timeEntryData });
  } catch (e) {
    res.status(400).send(e);
  }
};
NewTimeEntriesController.editTimeEntry = async (req, res) => {
  const _id = req.params.id;
  const token = req.cookies.jwt;
  helpers
  .axiosdata("get","/api/editTimeEntry/"+_id,token)
    .then(function (response) {
    //  console.log(response)
      sess = req.session;
      if (response.data.status == false) {
        res.redirect("/forbidden")
      } else {
        res.render("editTimeEntries", {
          projectData: response.data.projectData,
          timeEntryData: response.data.timeEntryData,
          taskData: response.data.taskData,
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
    //console.log(_id)
    const token = req.cookies.jwt;
    const data = {
      project_id: req.body.project_id,
      task_id: req.body.task_id,
      hours: req.body.hours,
      date: req.body.date,
    };
   // console.log("data",data)
    helpers
      .axiosdata("post", "/api/editTimeEntry/"+_id, token, data)
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

module.exports = NewTimeEntriesController;
