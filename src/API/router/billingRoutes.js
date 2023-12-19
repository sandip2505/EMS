const express = require("express");
const Apirouter = new express.Router();
const BSON = require("bson");
// const = require("express-session");
const billingController = require("../controller/billingController");
const invoiceController = require("../controller/invoiceController");
const SettingController = require("../controller/SettingController");
const InventoryController = require("../controller/InventoryController");
const auth = require("../../middleware/auth");
const session = require("express-session");

const app = express();
// const auth = require("../middleware/auth");
const flash = require("connect-flash");
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
Apirouter.post("/login", billingController.employeelogin);
Apirouter.post(
  "/addCustomer",
  checkApiKey,
  auth,
  billingController.addCustomer
);
Apirouter.get("/customers", checkApiKey, auth, billingController.getCustomers);
Apirouter.get(
  "/viewCustomer/:id",
  checkApiKey,
  auth,
  billingController.editCustomers
);
Apirouter.post(
  "/editCustomers/:id",
  checkApiKey,
  auth,
  billingController.UpdateCustomers
);
Apirouter.delete(
  "/deleteCustomers/:id",
  checkApiKey,
  auth,
  billingController.DeleteCustomers
);
Apirouter.post(
  "/deleteCustomers",
  checkApiKey,
  auth,
  billingController.MultiDeleteCustomers
);
Apirouter.get(
  "/searchCustomers",
  checkApiKey,
  auth,
  billingController.SearchCustomers
);
Apirouter.get(
  "/projects/:customer_id",
  checkApiKey,
  auth,
  billingController.projectslisting
);
Apirouter.get(
  "/customerProject/:id/:invoice_id",
  checkApiKey,
  auth,
  billingController.getCustomerProjects
);
Apirouter.get(
  "/customerProjectTasks/:id",
  checkApiKey,
  auth,
  billingController.getCustomerTask
);
Apirouter.get("/restore", billingController.restore);

// Invoice Routes
Apirouter.post("/addInvoice", checkApiKey, auth, invoiceController.addInvoice);
Apirouter.post(
  "/editInvoice/:id",
  checkApiKey,
  auth,
  invoiceController.editInvoice
);
Apirouter.delete(
  "/deleteInvoice/:id",
  checkApiKey,
  auth,
  invoiceController.deleteInvoice
);
Apirouter.get("/invoice/:id", checkApiKey, auth, invoiceController.getInvoice);
Apirouter.get("/invoices", checkApiKey, auth, invoiceController.Invoice);
Apirouter.get(
  "/invoices/:customer_id",
  checkApiKey,
  auth,
  invoiceController.CustomerInvoice
);
// Apirouter.get("/invoiceGenerate/:id", checkApiKey, auth, invoiceController.invoiceGenerate);
Apirouter.get("/invoiceGenerate/:id", invoiceController.invoiceGenerate);
Apirouter.get(
  "/currencies",
  checkApiKey,
  auth,
  invoiceController.getCurrencies
);
Apirouter.get(
  "/getInvoiceNumber",
  checkApiKey,
  auth,
  invoiceController.getInvoiceNumber
);
Apirouter.get(
  "/customerInvoice/:id",
  checkApiKey,
  auth,
  invoiceController.customerInvoice
);
Apirouter.get(
  "/sentInvoice/:id",
  checkApiKey,
  auth,
  invoiceController.Invoicestatus
);
Apirouter.post("/sendInvoice", invoiceController.sentEmailInvoice);

// Setting Routes
Apirouter.post(
  "/companySettings",
  checkApiKey,
  auth,
  SettingController.AddSetting
);
Apirouter.get(
  "/companySettings",
  checkApiKey,
  auth,
  SettingController.getSetting
);
Apirouter.post(
  "/getSettingData",
  checkApiKey,
  SettingController.getSettingData
);

// Payment Routes
Apirouter.get(
  "/paymentmodes",
  checkApiKey,
  auth,
  invoiceController.paymentmode
);
Apirouter.get(
  "/getPaymentNumber",
  checkApiKey,
  auth,
  invoiceController.getPaymentNumber
);
Apirouter.post("/addPayment", checkApiKey, auth, invoiceController.addPayment);
Apirouter.get("/payments", invoiceController.getPayments);
Apirouter.get(
  "/editPayment/:id",
  checkApiKey,
  auth,
  invoiceController.getPaymentByid
);
Apirouter.post(
  "/editPayment/:id",
  checkApiKey,
  auth,
  invoiceController.editPayment
);

// log Routes
Apirouter.get("/logs", invoiceController.getLogs);

Apirouter.get("/invoicePDf", async (req, res) => {
  const data = {
    _id: "65803261c837c7ec68aceb36",
    customer_id: "657fdba16c8d7cf841e18563",
    invoice_date: "2023-12-18T00:00:00.000Z",
    due_date: "2024-01-02T00:00:00.000Z",
    invoice_number: "CC/2023-24/12/D/02",
    projects: [
      {
        id: "6450eb0f25c776b2a21324a9",
        hsa: null,
        amount: 422.45,
        uom: "",
        quantity: 1,
        discount: 15,
        taxable_value: 76.041,
        cgst: { amount: 38.0205, rate: 9 },
        sgst: { amount: 38.0205, rate: 9 },
        igst: { amount: 0, rate: 0 },
        rate: 497,
        total: 498.491,
        assigned_tasks: [],
        _id: "65803261c837c7ec68aceb37",
        title: "EMS-ss",
      },
    ],
    status: 1,
    payment_status: 1,
    total_cost: 422.45,
    total_tax: 76.041,
    total_discount: 0,
    discount_type: "Fixed",
    grand_total: 498.491,
    amount_due: 498.491,
    updated_at: "null",
    deleted_at: "null",
    created_at: "2023-12-18T11:52:01.701Z",
    __v: 0,
    customer: {
      _id: "657fdba16c8d7cf841e18563",
      name: "Sandip Ganava",
      email: "sandip321@gmail.com",
      phone: "7894567895",
      contact_name: "SG Highway",
      primary_currency: "657bf53b3d8ec4b01f1b4c65",
      prefix: "",
      website: "",
      project_id: ["6437cdc474219366eef8711e"],
      billing: {
        name: "Sandip Ganava",
        address_street_1: "Ahmedabad",
        address_street_2: "",
        city: "Ahmedabad",
        state: "Gujarat",
        country_id: "IN",
        zip: "789654",
        phone: "7894567895",
        gstin: "7894567895",
        _id: "657fdd316c8d7cf841e185f3",
      },
      is_local: true,
      updated_at: "Mon Dec 18 2023 11:18:33 GMT+0530 (India Standard Time)",
      deleted_at: "null",
      created_at: "1702878113492",
      __v: 0,
    },
    currency: {
      _id: "657bf53b3d8ec4b01f1b4c65",
      currency: "Indian Rupee-(₹)",
      code: "INR",
      symbol: "₹",
      name: "Rupee",
      __v: 0,
    },
    total_cgst: 160.62,
    total_sgst: 160.62,
    total_igst: 0,
    total_gst: 321.24,
    amountInWords: "Four Hundred Ninety-Eight",
    company: [
      {
        _id: "657b01bb8e4ccf5f40b0bb5d",
        company_name: "Code Crew",
        company_email: "codecrew@gmail.com",
        company_telephone: 9265613259,
        country_code: "IN",
        state: "Gujarat",
        city: "AHMEDABAD",
        address_street_1: "Avadh Pride",
        address_street_2: "Vastral",
        zip: 382415,
        cgst: "9",
        sgst: "9",
        igst: "18",
        updated_at: null,
        deleted_at: null,
        created_at: "2023-12-14T13:23:07.895Z",
        __v: 0,
        ac_no: 50564846484,
        bank_name: "HDFC BANK",
        cin: "123123123123123",
        gstin: "123123123123123",
        ifsc_code: "50564846484",
        pan_no: "123123123123123",
        swift_code: "50564846484",
      },
      {
        _id: "657b01c08e4ccf5f40b0bb61",
        company_name: "Code Crew",
        company_email: "codecrew@gmail.com",
        company_telephone: 9265613259,
        country_code: "IN",
        state: "Gujarat",
        city: "AHMEDABAD",
        address_street_1: "Avadh Pride",
        address_street_2: "Vastral",
        zip: 382415,
        cgst: "9",
        sgst: "9",
        igst: "18",
        updated_at: null,
        deleted_at: null,
        created_at: "2023-12-14T13:23:12.004Z",
        __v: 0,
      },
    ],
    particulars: [
      {
        id: "6450eb0f25c776b2a21324a9",
        hsa: null,
        amount: 422.45,
        uom: "",
        quantity: 1,
        discount: 15,
        taxable_value: 76.041,
        cgst: { amount: 38.0205, rate: 9 },
        sgst: { amount: 38.0205, rate: 9 },
        igst: { amount: 0, rate: 0 },
        rate: 497,
        total: 498.491,
        assigned_tasks: [],
        _id: "65803261c837c7ec68aceb37",
        title: "EMS-ss",
      },
    ],
  };
  res.render("partials/invoice", { data });
});

// Apirouter.get("*", checkApiKey, auth, (req, res) => {
//  res.status(404).json({Error:"Not Found"})
// });

module.exports = Apirouter;
