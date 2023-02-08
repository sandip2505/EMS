const EmployeeSalaryController = {};
var helpers = require("../helpers");
require("dotenv").config();

EmployeeSalaryController.EmployeeSalaryListing = (req, res) => {
  token = req.cookies.jwt;
  helpers
    .axiosdata("get", "/api/userListing", token)
    .then(async function (response) {
      sess = req.session;
      if (response.data.status == false) {
        res.redirect("/forbidden");
      } else {
        res.render("Employee_salaryListing", {
            data: response.data.userData,
           roleHasPermission : await helpers.getpermission(req.user),
          loggeduserdata: req.user,
          users: sess.userData,
        });
      }
    })
    .catch(function (response) {
      console.log(response);
    });
};



module.exports = EmployeeSalaryController;
