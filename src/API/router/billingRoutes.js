const express = require("express");
const Apirouter = express.Router();
const billingController = require("../controller/billingController");
const invoiceController = require("../controller/invoiceController");
const SettingController = require("../controller/SettingController");
const auth = require("../../middleware/auth");

const apiKey = process.env.API_KEY;

const checkApiKey = (req, res, next) => {
  const apiKeyHeader = req.headers["x-api-key"];
  if (!apiKeyHeader || apiKeyHeader !== apiKey) {
    res.status(403).json({ Error: "Forbidden" });
  } else {
    next();
  }
};

// Customer Routes
Apirouter.route("/customers")
  .post(checkApiKey, auth, billingController.addCustomer)
  .get(checkApiKey, auth, billingController.getCustomers);

Apirouter.route("/customers/:id")
  .get(checkApiKey, auth, billingController.editCustomers)
  .post(checkApiKey, auth, billingController.UpdateCustomers)
  .delete(checkApiKey, auth, billingController.DeleteCustomers);

Apirouter.post("/customers/delete", checkApiKey, auth, billingController.MultiDeleteCustomers);
Apirouter.get("/searchCustomers", checkApiKey, auth, billingController.SearchCustomers);
Apirouter.get("/projects/:customer_id", checkApiKey, auth, billingController.projectslisting);
Apirouter.get("/customerProject/:id/:invoice_id", checkApiKey, auth, billingController.getCustomerProjects);
Apirouter.get("/customerProjectTasks/:id", checkApiKey, auth, billingController.getCustomerTask);
Apirouter.get("/restore", billingController.restore);

// Invoice Routes
Apirouter.route("/invoices")
  .post(checkApiKey, auth, invoiceController.addInvoice)
  .get(checkApiKey, auth, invoiceController.Invoice);

Apirouter.route("/invoices/:customer_id")
  .get(checkApiKey, auth, invoiceController.CustomerInvoice);

Apirouter.route("/invoice/:id")
  .get(checkApiKey, auth, invoiceController.getInvoice)
  .post(checkApiKey, auth, invoiceController.editInvoice)
  .delete(checkApiKey, auth, invoiceController.deleteInvoice);

Apirouter.get("/invoiceGenerate/:id", invoiceController.invoiceGenerate);
Apirouter.get("/currencies", checkApiKey, auth, invoiceController.getCurrencies);
Apirouter.get("/getInvoiceNumber", checkApiKey, auth, invoiceController.getInvoiceNumber);
Apirouter.get("/sentInvoice/:id", checkApiKey, auth, invoiceController.Invoicestatus);
Apirouter.post("/sendInvoice", invoiceController.sentEmailInvoice);

// Setting Routes
Apirouter.route("/companySettings")
  .post(checkApiKey, auth, SettingController.AddSetting)
  .get(checkApiKey, auth, SettingController.getSetting);

Apirouter.post("/getSettingData", checkApiKey, SettingController.getSettingData);

// Payment Routes
Apirouter.route("/payments")
  .get(checkApiKey, auth, invoiceController.getPayments);

Apirouter.route("/payments/:id")
  .get(checkApiKey, auth, invoiceController.getPaymentByid)
  .post(checkApiKey, auth, invoiceController.editPayment);

Apirouter.get("/paymentmodes", checkApiKey, auth, invoiceController.paymentmode);
Apirouter.get("/getPaymentNumber", checkApiKey, auth, invoiceController.getPaymentNumber);
Apirouter.post("/addPayment", checkApiKey, auth, invoiceController.addPayment);

// Log Routes
Apirouter.get("/logs", invoiceController.getLogs);
Apirouter.get("/test", invoiceController.test);

module.exports = Apirouter;
