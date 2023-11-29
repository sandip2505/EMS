const express = require("express");
const Apirouter = new express.Router();
// const = require("express-session");
const billingController = require("../controller/billingController");
const auth = require("../../middleware/auth");
const session = require("express-session");

const app = express();
// const auth = require("../middleware/auth");
const flash = require("connect-flash");
const apiKey = process.env.API_KEY;
const checkApiKey = (req, res, next) => {
  const apiKeyHeader =
    req.headers['x-api-key'];
    if (!apiKeyHeader || apiKeyHeader !== apiKey) {
     res.status(403).json({Error:"Forbidden"})
     } else {
    next();
  }
};
// Customer Routes
Apirouter.post("/login", billingController.employeelogin);
Apirouter.post("/addCustomer",checkApiKey, auth, billingController.addCustomer);
Apirouter.get("/customers",checkApiKey, auth, billingController.getCustomers);
Apirouter.get("/viewCustomer/:id",checkApiKey, auth, billingController.editCustomers);
Apirouter.post("/editCustomers/:id",checkApiKey, auth, billingController.UpdateCustomers);
Apirouter.delete("/deleteCustomers/:id",checkApiKey, auth, billingController.DeleteCustomers);
Apirouter.post("/deleteCustomers",checkApiKey, auth, billingController.MultiDeleteCustomers);
Apirouter.get("/searchCustomers",checkApiKey, auth, billingController.SearchCustomers);
Apirouter.get("/projects", checkApiKey, auth, billingController.projectslisting);
Apirouter.get("/customerProject/:id",checkApiKey, auth, billingController.getCustomerProjects);


Apirouter.get("/restore",  billingController.restore);

// Invoice Routes
// Apirouter.post("/addInvoice",checkApiKey, auth, billingController.addInvoice);




// Apirouter.get("*", checkApiKey, auth, (req, res) => {
//  res.status(404).json({Error:"Not Found"})
// });




module.exports = Apirouter;
