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
Apirouter.post("/addCustomer", checkApiKey, auth, billingController.addCustomer);
Apirouter.get("/customers", checkApiKey, auth, billingController.getCustomers);
Apirouter.get("/viewCustomer/:id", checkApiKey, auth, billingController.editCustomers);
Apirouter.post("/editCustomers/:id", checkApiKey, auth, billingController.UpdateCustomers);
Apirouter.delete("/deleteCustomers/:id", checkApiKey, auth, billingController.DeleteCustomers);
Apirouter.post("/deleteCustomers", checkApiKey, auth, billingController.MultiDeleteCustomers);
Apirouter.get("/searchCustomers", checkApiKey, auth, billingController.SearchCustomers);
Apirouter.get("/projects/:customer_id",checkApiKey, auth, billingController.projectslisting);
Apirouter.get("/customerProject/:id/:invoice_id", checkApiKey, auth, billingController.getCustomerProjects);
Apirouter.get("/customerProjectTasks/:id", checkApiKey, auth, billingController.getCustomerTask);
Apirouter.get("/restore", billingController.restore);

// Invoice Routes
Apirouter.post("/addInvoice", checkApiKey, auth, invoiceController.addInvoice);
Apirouter.post("/editInvoice/:id", checkApiKey, auth, invoiceController.editInvoice);
Apirouter.delete("/deleteInvoice/:id", checkApiKey, auth, invoiceController.deleteInvoice);
Apirouter.get("/invoice/:id", checkApiKey, auth, invoiceController.getInvoice);
Apirouter.get("/invoices", checkApiKey, auth, invoiceController.Invoice);
Apirouter.get("/invoices/:customer_id",checkApiKey, auth, invoiceController.CustomerInvoice);
// Apirouter.get("/invoiceGenerate/:id", checkApiKey, auth, invoiceController.invoiceGenerate);
Apirouter.get("/invoiceGenerate/:id", invoiceController.invoiceGenerate);
Apirouter.get("/currencies", checkApiKey, auth, invoiceController.getCurrencies);
Apirouter.get("/getInvoiceNumber",checkApiKey, auth, invoiceController.getInvoiceNumber);
Apirouter.get("/customerInvoice/:id",checkApiKey, auth, invoiceController.customerInvoice);
Apirouter.get("/sentInvoice/:id",checkApiKey, auth, invoiceController.Invoicestatus);
Apirouter.post("/sendInvoice", invoiceController.sentEmailInvoice);

// Setting Routes
Apirouter.post("/companySettings", checkApiKey, auth, SettingController.AddSetting);
Apirouter.get("/companySettings", checkApiKey, auth, SettingController.getSetting);
Apirouter.post("/getSettingData", checkApiKey, SettingController.getSettingData);

// Payment Routes
Apirouter.get("/paymentmodes", checkApiKey, auth, invoiceController.paymentmode);
Apirouter.get("/getPaymentNumber",checkApiKey, auth, invoiceController.getPaymentNumber);
Apirouter.post("/addPayment", checkApiKey, auth, invoiceController.addPayment);
Apirouter.get("/payments", invoiceController.getPayments);
Apirouter.get("/editPayment/:id",checkApiKey, auth,  invoiceController.getPaymentByid);
Apirouter.post("/editPayment/:id", checkApiKey, auth, invoiceController.editPayment);

// log Routes
Apirouter.get("/logs",  invoiceController.getLogs);



Apirouter.get("/invoicePDf", async (req, res) => {
  const data = {
    _id: "657800f2cf86c6a5dc415f20",
    customer_id: "6577ff8176332127581c4d93",
    invoice_date: "2023-12-12T00:00:00.000Z",
    due_date: "2023-12-27T00:00:00.000Z",
    invoice_number: "CC/2023-24/12/D/01",
    projects: [
      {
        id: "655f44e62d01e47dbbd420af",
        hsa: "ASD",
        amount: 120,
        uom: "ea",
        quantity: 1,
        taxable_value: 24,
        cgst: 0,
        sgst: 0,
        igst: 20,
        rate: 120,
        total: 144,
        assigned_tasks: [
          {
            _id: "6572eb0742d8f9e309092c3e",
            project_id: "655f44e62d01e47dbbd420af",
            user_id: "652d3baaa5ce822fcfbd4697",
            title: "create task design",
            short_description: "create task design",
            task_estimation: 4,
            task_type: "0",
            task_status: "0",
            created_at:
              "Fri Dec 08 2023 15:36:33 GMT+0530 (India Standard Time)",
            updated_at: "null",
            deleted_at: "null",
            __v: 0,
            invoice_created: "1",
          },
          {
            _id: "6576a0727f658378c61cf3b3",
            project_id: "655f44e62d01e47dbbd420af",
            user_id: "652d3baaa5ce822fcfbd4697",
            title: "create about page",
            short_description: "",
            task_estimation: 0,
            task_status: "0",
            created_at:
              "Mon Dec 11 2023 11:08:54 GMT+0530 (India Standard Time)",
            updated_at: "null",
            deleted_at: "null",
            __v: 0,
            invoice_created: "1",
          },
        ],
        _id: "657800f2cf86c6a5dc415f21",
        data: {
          _id: "655f44e62d01e47dbbd420af",
          title: "Twiter Clone",
          short_description: "Twiter Clone",
          start_date: "2023-11-15",
          end_date: "2023-11-25",
          status: "in Progress",
          technology: ["TypeScript", "ActionScript", "NativeScript"],
          project_type: "Dedicated",
          user_id: ["652d3baaa5ce822fcfbd4697", "65603a410c0d8b9a3d14ca8a"],
          created_at: "Thu Nov 23 2023 17:54:22 GMT+0530 (India Standard Time)",
          updated_at: "Fri Dec 08 2023 15:39:26 GMT+0530 (India Standard Time)",
          deleted_at: "null",
          __v: 0,
        },
      },
    ],
    status: 1,
    payment_status: 0,
    total_cost: 120,
    total_tax: 20,
    total_discount: 10,
    discount_type: "Fixed",
    grand_total: 134,
    updated_at: "null",
    deleted_at: "null",
    amount_due: 134,
    created_at: "2023-12-12T06:42:58.882Z",
    __v: 0,
    customer: {
      _id: "6577ff8176332127581c4d93",
      name: "XYZ Infotech",
      email: "xyz@gmail.com",
      phone: "54646",
      contact_name: "XYZ",
      primary_currency: "6577f5bd4b7a9971f06bd8d9",
      prefix: "xyz",
      website: "www.xyz.com",
      project_id: ["655f44e62d01e47dbbd420af", "6565cd8b3a1cbc158f334f8f"],
      billing: {
        name: "05g93pkf64",
        address_street_1: "Avadh Pride",
        address_street_2: "Vastral",
        city: "AHMEDABAD",
        state: "Gujarat",
        country_id: "IN",
        zip: "382415",
        phone: null,
        gstin: "23346tffgn",
        _id: "6577ff8176332127581c4d94",
      },
      shipping: {
        name: "05g93pkf64",
        address_street_1: "Avadh Pride",
        address_street_2: "Vastral",
        city: "AHMEDABAD",
        state: "Gujarat",
        country_id: "IN",
        zip: "382415",
        phone: null,
        gstin: "23346tffgn",
        _id: "6577ff8176332127581c4d95",
      },
      updated_at: "null",
      deleted_at: "null",
      created_at: "1702363009654",
      __v: 0,
    },
    currency: [
      {
        _id: "6577f5bd4b7a9971f06bd8d9",
        currency: "Indian Rupee-(₹)",
        code: "INR",
        symbol: "₹",
        __v: 0,
      },
    ],
    company: [
      {
        _id: "65701ca45484006790c056e4",
        company_name: "Code Crew3",
        company_email: "codecre3w@gmail.com",
        company_telephone: 9245613259,
        state: "UP",
        city: "AHMEDABADW",
        address_street_1: "Avadh meTT",
        address_street_2: "VastralAA",
        zip: 382419,
        gstin: "SFAF234A",
        ac_no: 4545456456,
        ifsc_code: "AS456A",
        swift_code: "DAS565A",
        cgst: "20",
        sgst: "18",
        igst: "20",
        pan_no: "24XZZCASA",
        updated_at: null,
        deleted_at: null,
        created_at: "2023-12-06T07:03:00.339Z",
        __v: 0,
        country_code: "AU",
        cin: "ASFAA",
      },
    ],
  };
  res.render("partials/invoice", { data });
});

// Apirouter.get("*", checkApiKey, auth, (req, res) => {
//  res.status(404).json({Error:"Not Found"})
// });

module.exports = Apirouter;
