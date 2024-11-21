const project = require("../../model/createProject");
const invoice = require("../../model/invoice");
const currency = require("../../model/currencie");
const customer = require("../../model/customer");
const Users = require("../../model/user");
const task = require("../../model/createTask");
const companySetting = require("../../model/companySetting");
const rolePermission = require("../../model/rolePermission");
const log = require("../../model/log");
const session = require("express-session");
const moment = require("moment");
const mongoose = require("mongoose");
const sendEmail = require("../../utils/send_invoice");
const logger = require("../../utils/logger");

const express = require("express");
const ejs = require("ejs");
const BSON = require("bson");
const Helper = require("../../utils/helper");
const helper = new Helper();
const PDFDocument = require("pdfkit");
const pdf = require("html-pdf");
const { ToWords } = require("to-words");
const fs = require("fs");

const path = require("path");
const PaymentMode = require("../../model/paymentmode");
const payment = require("../../model/payment");
const Permission = require("../../model/addpermissions");

const apicontroller = {};

apicontroller.editInvoice = async (req, res) => {
  try {
    const { _id: user_id, role_id } = req.user;

    const rolePerm = await helper.checkPermission(
      role_id.toString(),
      user_id,
      "Update Invoice"
    );

    if (rolePerm.status === true) {
      const user_name = req.user.firstname + " " + req.user.last_name;
      const _id = req.params.id;
      const invoiceData = await invoice.findOne({ _id, deleted_at: "null" });
      const payments = await payment.find({ invoice_id: _id });

      const projectId = [];
      invoiceData.projects.forEach((element) => {
        projectId.push(element.id);
      });

      await task.updateMany(
        { _id: { $in: projectId } },
        { $set: { invoice_created: 0 } }
      );

      req.body.projects.forEach((element) => {
        projectId.push(element.id);
      });
      await task.updateMany(
        { _id: { $in: projectId } },
        { $set: { invoice_created: 1 } }
      );
      const dueAmount = payments.reduce((sum, item) => {
        return sum + (item.amount || 0);
      }, 0);

      req.body.amount_due =
        parseFloat(req.body.grand_total) - parseFloat(dueAmount);

      await invoice.findByIdAndUpdate(_id, req.body);

      logger.info({
        message: `<a href="invoice/pdf/${invoiceData._id.toString()}"><span>${
          req.body.invoice_number
        }</a> Invoice Updated By ${user_name}</span><br/>
          <li>Invoice Amount: ${req.body.currency_symbol} ${
          req.body.grand_total
        }</li>
          <li>Invoice Due Date: ${moment(req.body.due_date).format(
            "DD-MM-YYYY"
          )}</li>`,
        meta: { user_id: `${user_id}`, type: "Update Invoice" },
      });
      res.status(200).json({ message: "Invoice updated" });
    } else {
      throw new Error("Permission denied");
    }
  } catch (error) {
    res.status(403).send(error.message);
  }
};

apicontroller.addInvoice = async (req, res) => {
  try {
    req.body.amount_due = req.body.grand_total;
    const { _id: user_id, role_id } = req.user;
    const rolePerm = await helper.checkPermission(
      role_id.toString(),
      user_id,
      "Add Invoice"
    );

    if (rolePerm.status || true) {
      const user_name = req.user.firstname + " " + req.user.last_name;

      req.body.amount_due = req.body.grand_total;
      const invoiceSave = new invoice(req.body);
      const projectId = [];
      req.body.projects.forEach((element) => {
        projectId.push(element.id);
      });
      await task.updateMany(
        { _id: { $in: projectId } },
        { $set: { invoice_created: 1 } }
      );

      const invoiceData = await invoiceSave.save();

      logger.info({
        message: `<a href="invoice/pdf/${invoiceData._id.toString()}"><span>${
          req.body.invoice_number
        }</a> Invoice Created By ${user_name}</span></a><br/><li>Invoice Amount: ${
          req.body.currency_symbol
        } ${req.body.grand_total}</li>
          <li>Invoice Due Date: ${moment(req.body.due_date).format(
            "DD-MM-YYYY"
          )}</li>`,
        meta: { user_id: `${user_id}`, type: "Create Invoice" },
      });
      res.status(200).json({ message: "Invoice Added Successfully" });
    } else {
      throw new Error("Permission denied");
    }
  } catch (error) {
    console.log(error.message);
    res.status(403).send(error.message);
  }
};

apicontroller.getInvoice = async (req, res) => {
  try {
    const { _id: user_id, role_id } = req.user;

    const rolePerm = await helper.checkPermission(
      role_id.toString(),
      user_id,
      "View Invoice"
    );

    if (rolePerm.status) {
      try {
        const _id = req.params.id;
        const invoiceData = await invoice.findOne({ _id });
        res.status(200).json({ invoiceData });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    } else {
      res.json({ status: false, message: "Permission denied." });
    }
  } catch (error) {
    res.status(403).send(error.message);
  }
};

apicontroller.Invoice = async (req, res) => {
  try {
    const { _id: user_id, role_id } = req.user;

    const rolePerm = await helper.checkPermission(
      role_id.toString(),
      user_id,
      "View Invoice"
    );

    if (rolePerm.status || true) {
      const todayDate = new Date();
      const invoicesToUpdate = await invoice.find({
        deleted_at: "null",
        status: 2,
        due_date: { $lte: todayDate },
      });
      if (invoicesToUpdate.length > 0) {
        await invoice.updateMany(
          {
            _id: { $in: invoicesToUpdate.map((invoice) => invoice._id) },
            status: { $ne: 3 },
          },
          { $set: { status: 4 } }
        );
      }

      const page = parseInt(req.query.page) || 1;
      const limit = req.query.limit ? parseInt(req.query.limit) : 10;
      const skip = (page - 1) * limit;

      const fromDate = req.query.invoice_date_from
        ? new Date(req.query.invoice_date_from)
        : "";
      const toDate = req.query.invoice_date_to
        ? new Date(req.query.invoice_date_to)
        : "";
      const status = req.query.status ? parseInt(req.query.status) : "";
      const invoice_number = req.query.invoice_number;

      const customer_id = !(
        req.query.customer_id == undefined ||
        req.query.customer_id == null ||
        req.query.customer_id == ""
      )
        ? new BSON.ObjectId(req.query.customer_id)
        : "";

      const searchParams = {
        customer_id: customer_id,
        status: status,
        deleted_at: "null",
      };
      if (invoice_number) {
        searchParams.invoice_number = {
          $regex: new RegExp(invoice_number, "i"),
        };
      }

      // Check if both fromDate and toDate are provided before adding the created_at condition
      if (fromDate && toDate) {
        // Set the end of the day for toDate
        const toDateEndOfDay = new Date(toDate);
        toDateEndOfDay.setHours(23, 59, 59, 999);

        searchParams.created_at = {
          $gte: new Date(fromDate),
          $lte: toDateEndOfDay,
        };
      }
      // Remove undefined or null values from searchParams

      Object.keys(searchParams).forEach((key) => {
        if (
          searchParams[key] === undefined ||
          searchParams[key] === null ||
          searchParams[key] === ""
        ) {
          delete searchParams[key];
        }
      });

      try {
        const pipeline = [
          {
            $match: searchParams,
          },
          {
            $lookup: {
              from: "customers",
              localField: "customer_id",
              foreignField: "_id",
              as: "customer",
            },
          },

          {
            $unwind: "$customer",
          },
          {
            $match: {
              $or: [
                {
                  "customer.name": {
                    $regex: new RegExp(req.query.customer, "i"),
                  },
                },
                {
                  "customer.email": {
                    $regex: new RegExp(req.query.customer, "i"),
                  },
                },
                {
                  "customer.contact_name": {
                    $regex: new RegExp(req.query.customer, "i"),
                  },
                },
              ],
            },
          },

          // {
          //   $lookup: {
          //     from: "currency",
          //     localField: "customer.primary_currency",
          //     foreignField: "_id",
          //     as: "currency",
          //   },
          // },

          {
            $sort: {
              created_at: -1,
            },
          },
          {
            $skip: skip,
          },
          {
            $limit: limit,
          },
          {
            $lookup: {
              from: "currencies",
              localField: "customer.primary_currency",
              foreignField: "_id",
              as: "currency",
            },
          },
          {
            $unwind: "$currency",
          },
          {
            $project: {
              _id: 1,
              index: 1,
              invoice_date: 1,
              amount_due: 1,
              status: 1,
              due_date: 1,
              invoice_number: 1,
              payment_status: 1,
              "currency.symbol": 1,
              "customer.contact_name": 1,
            },
          },
        ];
        const invoiceData = await invoice.aggregate(pipeline);
        const totalItems = await invoice.countDocuments({ deleted_at: "null" });

        let totalPages = {};
        if (
          req.query.invoice_number ||
          req.query.invoice_date_from ||
          req.query.status ||
          req.query.invoice_date_to ||
          customer_id
        ) {
          totalPages = Math.ceil(invoiceData.length / limit);
        } else {
          totalPages = Math.ceil(totalItems / limit);
        }
        const indexedInvoiceData = invoiceData.map((item, index) => ({
          index: skip + index + 1,
          ...item,
        }));
        res
          .status(200)
          .json({ totalPages, page, limit, invoiceData: indexedInvoiceData });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    } else {
      res.json({ status: false, message: "Permission denied." });
    }
  } catch (error) {
    res.status(403).send(error.message);
  }
};

apicontroller.CustomerInvoice = async (req, res) => {
  try {
    const { _id: user_id, role_id } = req.user;

    const rolePerm = await helper.checkPermission(
      role_id.toString(),
      user_id,
      "View Invoice"
    );

    if (rolePerm.status) {
      const _id = req.params.customer_id;
      const isEdit = req.params.isEdit;
      const $match = {
        customer_id: new BSON.ObjectId(_id),
        status: { $in: [2, 4] },
        amount_due: { $gt: 0 },
        deleted_at: "null",
      };

      if (isEdit == 1) {
        delete $match.status;
        delete $match.amount_due;
      }

      const invoiceData = await invoice.aggregate([
        {
          $match,
        },
        {
          $lookup: {
            from: "customers",
            localField: "customer_id",
            foreignField: "_id",
            as: "customer",
          },
        },
        { $unwind: "$customer" },
        {
          $lookup: {
            from: "currencies",
            localField: "customer.primary_currency",
            foreignField: "_id",
            as: "currency",
          },
        },
        { $unwind: "$currency" },
      ]);
      res.status(200).json({ invoiceData });
    } else {
      throw new Error("Permission denied");
    }
  } catch (error) {
    res.status(403).send(error.message);
  }
};

apicontroller.invoiceGenerate = async (req, res) => {
  try {
    // console.log(req.user,"req.user")
    // const user_id = req.user._id
    // const role_id = req.user.role_id

    // const rolePerm = await helper.checkPermission(
    //   role_id.toString(),
    //   user_id,
    //   "View Invoice"
    // );

    // if (rolePerm.status) {
    const _id = new BSON.ObjectId(req.params.id);
    let invoiceData = await invoice.aggregate([
      {
        $match: {
          _id: _id,
        },
      },
      {
        $lookup: {
          from: "customers",
          localField: "customer_id",
          foreignField: "_id",
          as: "customer",
        },
      },
      {
        $unwind: "$customer",
      },
      {
        $lookup: {
          from: "currencies",
          localField: "customer.primary_currency",
          foreignField: "_id",
          as: "currency",
        },
      },
      { $unwind: "$currency" },
      {
        $replaceRoot: { newRoot: "$$ROOT" },
      },
    ]);
    const company = await companySetting.findOne();
    const promises = invoiceData[0].projects.map(async (particular) => {
      const tasks = await task.findById(particular.id);
      const projects = await project.findById(tasks.project_id);
      particular.title = projects.title + "-" + tasks.title;
      return particular;
    });
    if (invoiceData[0].customer.is_local) {
      invoiceData[0].total_cgst = invoiceData[0].projects.reduce(
        (sum, project) => {
          return sum + project.cgst.amount;
        },
        0
      );

      invoiceData[0].total_sgst = invoiceData[0].projects.reduce(
        (sum, project) => {
          return sum + project.sgst.amount;
        },
        0
      );

      invoiceData[0].total_igst = invoiceData[0].projects.reduce(
        (sum, project) => {
          return sum + project.igst.amount;
        },
        0
      );

      invoiceData[0].total_gst =
        invoiceData[0].total_cgst +
        invoiceData[0].total_sgst +
        invoiceData[0].total_igst;
    }
    const toWords = new ToWords({
      localeCode: "en-IN",
      converterOptions: {
        currency: true,
        ignoreDecimal: true,
        ignoreZeroCurrency: false,
        doNotAddOnly: false,
        currencyOptions: {
          name: invoiceData[0].currency.name,
          plural: invoiceData[0].currency.name,
          symbol: invoiceData[0].currency.symbol,
        },
      },
    });
    invoiceData[0].amountInWords = toWords.convert(invoiceData[0].grand_total);
    const particulars = await Promise.all(promises);
    data = {
      ...invoiceData[0],
      company,
      particulars,
    };

    if (invoiceData.length > 0) {
      const templatePath = path.join(
        __dirname.split("\\API")[0],
        "/views/partials",
        "invoice.ejs"
      );

      // Render the EJS template with the invoiceData
      const renderedHtml = await ejs.renderFile(templatePath, { data });

      // Options for html-pdf
      // const pdfOptions = {
      //   format: "Letter",
      //   border: {
      //     top: "0.5in",
      //     right: "0.5in",
      //     bottom: "0.5in",
      //     left: "0.5in",
      //   },
      // };

      // Convert HTML to PDF
      // const response = await htmlToBlob(renderedHtml)
      pdf.create(renderedHtml, {}).toBuffer((err, buffer) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error generating PDF");
        } else {
          res.setHeader("Content-Type", "application/pdf");
          res.setHeader(
            "Content-Disposition",
            `inline; filename="${data.invoice_number}.pdf"`
          );

          // Set PDF content (replace this with your actual content)

          // Set the Content-Type header

          // Pipe the PDF content to the response

          // End the PDF stream
          res.status(201).send(buffer);
          // Add content to the PDF (replace this with your actual content)
          // Set response headers
          // Pipe the PDF content to the response
          // End the PDF stream
        }
      });
      // }
      // else {
      // res.status(200).json({ data });
      // res.render("partials/invoice", { data });
    }
    // } else {
    //   throw new Error("Permission denied");
    // }
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: err.message });
  }
};

apicontroller.getCurrencies = async (req, res) => {
  try {
    const data = await currency
      .find({ deleted_at: null })
      .sort({ currency: "asc" });
    res.status(200).json({ data });
  } catch (error) {
    res.status(403).send(error.message);
  }
};

apicontroller.addCurrency = async (req, res) => {
  try {
    const description = `${req.body.currency}-(${req.body.symbol})`;
    const data = {
      name: req.body.name,
      currency: description,
      // plural: req.body.plural,
      code: req.body.code,
      symbol: req.body.symbol,
    };
    await currency.create(data);
    res.status(200).json({ message: "Currency successfully added" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

apicontroller.deleteCurrency = async (req, res) => {
  try {
    const id = req.params.id;
    await currency.findByIdAndDelete(id);
    res.status(200).json({ message: "Currency successfully Deleted" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

apicontroller.getInvoiceNumber = async (req, res) => {
  try {
    const { is_local } = req.query;
    let invoice_number;
    const currentDate = new Date();
    const startMonth = 3;

    let academicYearStart;
    let academicYearEnd;

    if (currentDate.getMonth() + 1 >= startMonth) {
      academicYearStart = currentDate.getFullYear();
      academicYearEnd = academicYearStart + 1;
    } else {
      academicYearEnd = currentDate.getFullYear();
      academicYearStart = academicYearEnd - 1;
    }

    // Format the result as per your needs
    const academicYear = `${academicYearStart}-${academicYearEnd
      .toString()
      .slice(2)}`;

    const startOfMonth = moment().startOf("month");
    const endOfMonth = moment().endOf("month");
    let regexPattern;
    if (is_local === "true") {
      regexPattern = new RegExp("D", "i");
    } else {
      regexPattern = new RegExp("EXP", "i");
    }

    const latestInvoice = await invoice
      .findOne({
        deleted_at: "null",
        created_at: { $gte: startOfMonth, $lt: endOfMonth },
        invoice_number: { $regex: regexPattern },
      })
      .sort({ created_at: -1 });
    let lastInvoiceNumber = latestInvoice
      ? parseInt(latestInvoice.invoice_number.split("/").pop(), 10)
      : 0;
    const newInvoiceNumber = lastInvoiceNumber + 1;
    const getCurrentMonth = moment().month() + 1;
    const company_name = "CC";
    let invoiceLocation;
    if (is_local === "true") {
      invoiceLocation = "D";
    } else {
      invoiceLocation = "EXP";
    }
    invoice_number =
      company_name +
      "/" +
      academicYear +
      "/" +
      getCurrentMonth +
      "/" +
      invoiceLocation +
      "/" +
      String(newInvoiceNumber).padStart(2, "0");
    res.status(200).json({ invoice_number });
  } catch (error) {
    res.status(403).send(error.message);
  }
};

apicontroller.customerInvoice = async (req, res) => {
  try {
    const _id = req.params.id;
    const invoiceData = await invoice.find({
      customer_id: _id,
      deleted_at: "null",
    });
    res.status(200).json({ invoiceData });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

apicontroller.Invoicestatus = async (req, res) => {
  try {
    const _id = req.params.id;
    const data = await invoice.findByIdAndUpdate(
      _id,
      { status: 2 },
      { new: true }
    );

    res.status(200).json({ message: "Invoice Done" });
  } catch (error) {
    res.status(403).send(error.message);
  }
};

apicontroller.sentEmailInvoice = async (req, res) => {
  try {
    const invoice_id = new BSON.ObjectId(req.body.invoice_id);
    const subject = req.body.subject;
    const to = req.body.to;

    let invoiceData = await invoice.aggregate([
      {
        $match: {
          _id: invoice_id,
        },
      },
      {
        $lookup: {
          from: "customers",
          localField: "customer_id",
          foreignField: "_id",
          as: "customer",
        },
      },
      {
        $unwind: "$customer",
      },
      {
        $lookup: {
          from: "currencies",
          localField: "customer.primary_currency",
          foreignField: "_id",
          as: "currency",
        },
      },
      { $unwind: "$currency" },
      {
        $replaceRoot: { newRoot: "$$ROOT" },
      },
    ]);

    const company = await companySetting.findOne();
    const promises = invoiceData[0].projects.map(async (particular) => {
      const tasks = await task.findById(particular.id);
      const projects = await project.findById(tasks.project_id);
      particular.title = projects.title + "-" + tasks.title;
      return particular;
    });

    if (invoiceData[0].customer.is_local) {
      invoiceData[0].total_cgst = invoiceData[0].projects.reduce(
        (sum, project) => {
          return sum + project.cgst.amount;
        },
        0
      );

      invoiceData[0].total_sgst = invoiceData[0].projects.reduce(
        (sum, project) => {
          return sum + project.sgst.amount;
        },
        0
      );

      invoiceData[0].total_igst = invoiceData[0].projects.reduce(
        (sum, project) => {
          return sum + project.igst.amount;
        },
        0
      );

      invoiceData[0].total_gst =
        invoiceData[0].total_cgst +
        invoiceData[0].total_sgst +
        invoiceData[0].total_igst;
    }
    const customerName = invoiceData[0].customer.name;
    const toWords = new ToWords({
      localeCode: "en-IN",
      converterOptions: {
        currency: true,
        ignoreDecimal: true,
        ignoreZeroCurrency: false,
        doNotAddOnly: false,
        currencyOptions: {
          name: invoiceData[0].currency.name,
          plural: invoiceData[0].currency.name,
          symbol: invoiceData[0].currency.symbol,
        },
      },
    });
    invoiceData[0].amountInWords = toWords.convert(invoiceData[0].grand_total);
    const particulars = await Promise.all(promises);
    let data = {
      ...invoiceData[0],
      company,
      particulars,
    };

    const send_email = await sendEmail(
      to,
      subject,
      customerName,
      invoice_id,
      data
    );
    await invoice.findByIdAndUpdate(invoice_id, {
      status: 2,
    });
    const user_name = req.user.firstname + " " + req.user.last_name;
    logger.info({
      message: `<a href=invoice/pdf/${data._id}>&nbsp;${data.invoice_number}</a> Invoice Send By ${user_name} to ${customerName}</span>`,
      meta: { user_id: `${req.user._id}`, type: "Send Invoice" },
    });
    res.json({ message: send_email });
  } catch (error) {
    console.log(error, "Errorr-----------");
    res.status(400).send(error.message);
  }
};

apicontroller.deleteInvoice = async (req, res) => {
  try {
    const { _id: user_id, role_id } = req.user;

    const rolePerm = await helper.checkPermission(
      role_id.toString(),
      user_id,
      "Delete Invoice"
    );

    if (rolePerm.status) {
      const _id = req.params.id;

      const getPayment = await payment.find({
        invoice_id: _id,
        deleted_at: "null",
      });
      const isPayment = getPayment.length > 0;
      if (isPayment) throw new Error("invoice is assign with payment");

      const user_name = req.user.firstname + " " + req.user.last_name;
      const data = await invoice.findByIdAndUpdate(
        _id,
        { deleted_at: new Date() },
        { new: true }
      );
      data.projects.forEach(async (item) => {
        await task.findByIdAndUpdate(item.id, { invoice_created: 0 });
      });

      logger.info({
        message: `Invoice ${data.invoice_number} Deleted By ${user_name}</span>`,
        meta: { user_id: `${user_id}`, type: "Delete Invoice" },
      });

      res.status(200).json({ message: "Invoice deleted" });
    } else {
      throw new Error("Permission denied.");
    }
  } catch (error) {
    res.status(403).send(error.message);
  }
};

apicontroller.paymentmode = async (req, res) => {
  const paymentModes = await PaymentMode.find();
  return res.json({ paymentModes });
};

apicontroller.addPaymentMode = async (req, res) => {
  try {
    const data = {
      name: req.body.name,
      value: req.body.value,
    };
    await PaymentMode.create(data);
    return res
      .status(201)
      .json({ message: "Payment Mode created successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

apicontroller.deletePaymentmode = async (req, res) => {
  try {
    const id = req.params.id;
    await PaymentMode.findByIdAndDelete(id);
    res.status(200).json({ message: "Payment Mode Successfully deleted" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

apicontroller.getPaymentNumber = async (req, res) => {
  try {
    function generatePaymentId(sequenceNumber) {
      const paddedSequence = sequenceNumber.toString().padStart(4, "0");
      return `PAY-${paddedSequence}`;
    }

    // Retrieve the latest payment from the database
    const latestPayment = await payment.findOne().sort({ created_at: -1 });
    // Extract the sequence number from the latest payment, or default to 1
    let sequenceNumber = 1;
    if (latestPayment && latestPayment.payment_number) {
      const match = latestPayment.payment_number.match(/\d+$/);
      sequenceNumber = match ? parseInt(match[0], 10) + 1 : 1;
    }

    // Generate the new payment ID
    const payment_number = generatePaymentId(sequenceNumber);
    res.status(200).json({ payment_number });
  } catch (error) {
    console.error(error);
  }
};

apicontroller.addPayment = async (req, res) => {
  try {
    const { _id: user_id, role_id } = req.user;

    const rolePerm = await helper.checkPermission(
      role_id.toString(),
      user_id,
      "Add Payment"
    );

    if (rolePerm.status || true) {
      const user_name = req.user.firstname + " " + req.user.last_name;
      const adjustableAmount = req.body.adjustable_amount;
      const paymentSave = new payment(req.body);
      const paymentData = await paymentSave.save();
      console.log(paymentData, req.body, "paymentData");
      const invoiceData = await invoice.findOne({
        _id: paymentData.invoice_id,
        deleted_at: "null",
      });
      if (
        adjustableAmount ||
        parseFloat(invoiceData.amount_due) - parseFloat(req.body.amount) ==
          parseFloat(0)
      ) {
        const invoiceUpdate = await invoice.findByIdAndUpdate(
          paymentData.invoice_id,
          { amount_due: 0, status: 3, payment_status: 3 }
        );
      } else {
        const invoiceUpdate = await invoice.findByIdAndUpdate(
          paymentData.invoice_id,
          {
            amount_due: invoiceData.amount_due - req.body.amount,
            status: 2,
            payment_status: 2,
          }
        );
      }
      const customerData = await customer.findById(paymentData.customer_id);
      const currencyData = await currency.findById(
        customerData.primary_currency
      );
      const currency_symbol = currencyData.symbol;
      logger.info({
        message: `<a href="payment/${paymentData._id.toString()}"><span>${
          req.body.payment_number
        }</a> Payment Created By ${user_name}</span><br>
          <li>Customer Name: ${customerData.name}</li> <li>Invoice Number: ${
          invoiceData.invoice_number
        }</li>
          <li>Payment Amount:${currency_symbol} ${paymentData.amount}</li>
          <li>Due Amount:${currency_symbol} ${
          invoiceData.amount_due - paymentData.amount
        }</li>`,
        meta: { user_id: `${user_id}`, type: "Create Payment" },
      });
      res
        .status(200)
        .json({ message: "Payment Added Successfully", paymentData });
    } else {
      throw new Error("Permission denied.");
    }
  } catch (error) {
    res.status(403).send(error.message);
  }
};

apicontroller.getPayments = async (req, res) => {
  try {
    const { _id: user_id, role_id } = req.user;

    const rolePerm = await helper.checkPermission(
      role_id.toString(),
      user_id,
      "View Payment"
    );

    if (rolePerm.status) {
      const user_name = req.user.firstname + " " + req.user.last_name;
      const {
        page = 1,
        limit = 10,
        payment_mode = "",
        payment_number = "",
      } = req.query;
      const skip = (page - 1) * limit;
      const customer_id = !(
        req.query.customer_id == undefined ||
        req.query.customer_id == null ||
        req.query.customer_id == ""
      )
        ? new BSON.ObjectId(req.query.customer_id)
        : "";

      const matchConditions = {
        customer_id: customer_id,
        payment_mode: payment_mode
          ? { $regex: new RegExp(payment_mode, "i") }
          : undefined,
        payment_number: payment_number
          ? { $regex: new RegExp(payment_number, "i") }
          : undefined,
        deleted_at: "null",
      };

      Object.keys(matchConditions).forEach((key) => {
        if (
          matchConditions[key] === undefined ||
          matchConditions[key] === null ||
          matchConditions[key] === ""
        ) {
          delete matchConditions[key];
        }
      });

      const paymentData = await payment.aggregate([
        {
          $match: matchConditions,
        },
        {
          $lookup: {
            from: "customers",
            localField: "customer_id",
            foreignField: "_id",
            as: "customer",
          },
        },
        {
          $unwind: "$customer",
        },
        {
          $lookup: {
            from: "invoices",
            localField: "invoice_id",
            foreignField: "_id",
            as: "invoice",
          },
        },
        {
          $unwind: "$invoice",
        },
        {
          $lookup: {
            from: "paymentmodes",
            localField: "payment_mode",
            foreignField: "value",
            as: "paymentMode",
          },
        },
        {
          $unwind: "$paymentMode",
        },
        {
          $lookup: {
            from: "currencies",
            localField: "customer.primary_currency",
            foreignField: "_id",
            as: "currency",
          },
        },
        {
          $unwind: "$currency",
        },
        {
          $skip: skip,
        },
        {
          $limit: parseInt(limit),
        },
        { $sort: { created_at: -1 } },
      ]);

      const totalItems = await payment.countDocuments({ deleted_at: "null" });
      const indexedPaymentData = paymentData.map((item, index) => ({
        index: skip + index + 1,
        ...item,
      }));
      let totalPages = {};
      if (req.query.payment_mode || req.query.payment_number || customer_id) {
        totalPages = Math.ceil(paymentData.length / limit);
      } else {
        totalPages = Math.ceil(totalItems / limit);
      }
      res.status(200).json({
        totalPages,
        limit,
        page,
        totalData: paymentData.length,
        paymentData: indexedPaymentData,
      });
    } else {
      throw new Error("Permission denied");
    }
  } catch (error) {
    res.status(403).send(error.message);
  }
};

apicontroller.getPaymentByid = async (req, res) => {
  try {
    const { _id: user_id, role_id } = req.user;

    const rolePerm = await helper.checkPermission(
      role_id.toString(),
      user_id,
      "View Payment"
    );

    if (rolePerm.status) {
      try {
        const _id = req.params.id;
        const paymentData = await payment.aggregate([
          {
            $match: {
              _id: new BSON.ObjectId(_id),
              deleted_at: "null",
            },
          },
          {
            $lookup: {
              from: "customers",
              localField: "customer_id",
              foreignField: "_id",
              as: "customer",
            },
          },
          {
            $unwind: "$customer",
          },
          {
            $lookup: {
              from: "currencies",
              localField: "customer.primary_currency",
              foreignField: "_id",
              as: "currency",
            },
          },
          {
            $unwind: "$currency",
          },
          {
            $project: {
              _id: 1,
              date: 1,
              payment_number: 1,
              customer_id: 1,
              invoice_id: 1,
              exchange_rate: 1,
              adjustable_amount: 1,
              amount: 1,
              payment_mode: 1,
              notes: 1,
              updated_at: 1,
              deleted_at: 1,
              created_at: 1,
              __v: 1,
              currency: "$currency",
            },
          },
        ]);

        res.status(200).json({ paymentData: paymentData[0] });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
      }
    } else {
      res.json({ status: false, message: "Permission denied." });
    }
  } catch (error) {
    res.status(403).send(error.message);
  }
};

apicontroller.editPayment = async (req, res) => {
  try {
    const { _id: user_id, role_id } = req.user;

    const rolePerm = await helper.checkPermission(
      role_id.toString(),
      user_id,
      "Update Payment"
    );

    if (rolePerm.status) {
      const user_name = req.user.firstname + " " + req.user.last_name;
      try {
        const _id = req.params.id;
        const {
          date,
          payment_number,
          customer_id,
          amount_in_inr,
          invoice_id,
          amount,
          payment_mode,
          adjustable_amount,
          notes,
        } = req.body;
        const paymentData = await payment.findByIdAndUpdate(_id, {
          date,
          payment_number,
          customer_id,
          invoice_id,
          amount_in_inr,
          amount,
          payment_mode,
          adjustable_amount,
          notes,
        });
        const getinvoice = await invoice.findOne({
          _id: paymentData.invoice_id,
          deleted_at: "null",
        });
        let invoiceData;
        if (
          adjustable_amount ||
          parseFloat(getinvoice.grand_total) - parseFloat(req.body.amount) == 0
        ) {
          invoiceData = await invoice.findByIdAndUpdate(
            paymentData.invoice_id,
            { amount_due: 0, status: 3, payment_status: 3 }
          );
        } else {
          const otherPaymentData = await payment.find({
            invoice_id: paymentData.invoice_id,
            _id: { $ne: paymentData._id },
            deleted_at: "null",
          });
          let totalAmount = 0;
          otherPaymentData.forEach((payment) => {
            totalAmount += payment.amount;
          });
          invoiceData = await invoice.findByIdAndUpdate(
            paymentData.invoice_id,
            {
              amount_due:
                getinvoice.grand_total - totalAmount - req.body.amount,
              payment_status: 2,
              status: 2,
            }
          );
        }

        const updatedInvoice = await invoice.findById(paymentData.invoice_id);
        const customerData = await customer.findById(paymentData.customer_id);
        const currencyData = await currency.findById(
          customerData.primary_currency
        );
        const currency_symbol = currencyData.symbol;
        logger.info({
          message: `<a href="payment/${paymentData._id.toString()}"><span>${
            req.body.payment_number
          }</a> Payment Updated By ${user_name}</span><br>
          <li>Customer Name: ${customerData.name}</li> <li>Invoice Number: ${
            invoiceData.invoice_number
          }</li>
          <li>Payment Amount:${currency_symbol} ${req.body.amount}</li>
          <li>Due Amount:${currency_symbol} ${updatedInvoice.amount_due}</li>`,
          meta: { user_id: `${user_id}`, type: "Update Payment" },
        });
        res.status(200).json({ message: "Payment updated", paymentData });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
      }
    } else {
      res.json({ status: false, message: "Permission denied." });
    }
  } catch (error) {
    res.status(403).send(error.message);
  }
};

apicontroller.deletePayment = async (req, res) => {
  try {
    const { _id: user_id, role_id } = req.user;

    const rolePerm = await helper.checkPermission(
      role_id.toString(),
      user_id,
      "Delete Payment"
    );

    if (rolePerm.status) {
      const _id = req.params.id;
      const deletedPayment = await payment.findByIdAndUpdate(_id, {
        deleted_at: new Date(),
      });
      const hasPayment = await payment.countDocuments({
        invoice_id: deletedPayment.invoice_id,
        deleted_at: "null",
      });
      const invoiceData = await invoice
        .findById(deletedPayment.invoice_id)
        .populate("customer_id")
        .populate({
          path: "customer_id",
          populate: { path: "primary_currency" },
        });
      const totalDueAmount = deletedPayment.amount + invoiceData.amount_due;
      deletedPayment &&
        (await invoice.findByIdAndUpdate(
          deletedPayment?.invoice_id,
          {
            amount_due: totalDueAmount,
            payment_status: !!hasPayment ? 2 : 1,
            status: 2,
          },
          { new: true }
        ));
      const user_name = req.user.firstname + " " + req.user.last_name;
      const symbol = invoiceData.customer_id.primary_currency.symbol;

      logger.info({
        message: `Payment ${deletedPayment.payment_number} Deleted By ${user_name}</span><br><li> Payment Amount: ${symbol} ${deletedPayment.amount}</li>`,
        meta: { user_id: `${req.user._id}`, type: "Delete Payment" },
      });
    } else {
      throw new Error("Permission denied.");
    }

    res.status(200).json({ message: "Payment deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

apicontroller.getLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      user_id,
      date_from,
      date_to,
    } = req.query;

    // Convert page and limit to integers
    const parsedPage = parseInt(page);
    const parsedLimit = parseInt(limit);

    // Build the query for searching
    const searchQuery = {
      $and: [
        { "meta.user_id": { $regex: new RegExp(user_id, "i") } },
        { "meta.type": { $regex: new RegExp(type, "i") } },
      ],
    };

    // Add timestamp range filtering
    if (date_from && date_to) {
      const toDateEndOfDay = new Date(date_to);
      toDateEndOfDay.setHours(23, 59, 59, 999);
      searchQuery.timestamp = {
        $gte: new Date(date_from),
        $lte: new Date(toDateEndOfDay),
      };
    }

    // Query logs with pagination and search
    const logs = await log
      .find(searchQuery)
      .skip((parsedPage - 1) * parsedLimit)
      .limit(parsedLimit)
      .sort({ timestamp: -1 });

    // Count total number of logs for pagination
    const totalLogs = await log.countDocuments(searchQuery);

    res.status(200).json({
      logs,
      currentPage: parsedPage,
      totalPages: Math.ceil(totalLogs / parsedLimit),
      totalLogs,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

apicontroller.users = async (req, res) => {
  try {
    const users = await Users.find({ deleted_at: "null" });
    res.status(200).json({ users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

apicontroller.test = async (req, res) => {
  try {
    const data = await Permission.find();
    const permision_id = [];
    data.forEach(async (element) => {
      permision_id.push(element._id.toString());
    });
    const Roledata = await rolePermission.findOne();
    res.status(200).json({ permission: Roledata });
  } catch (error) {
    console.error(error);
  }
};

apicontroller.logTypes = async (req, res) => {
  try {
    const allLogs = await log.find();
    const uniqueTypes = [
      ...new Set(allLogs.map((item) => item.meta && item.meta.type)),
    ];
    res.status(200).json({ types: uniqueTypes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

apicontroller.defaultCurrency = async (req, res) => {
  try {
    const _id = req.params.id;
    await currency.findOneAndUpdate(
      { _id },
      { $set: { is_default: true } },
      { new: true }
    );
    await currency.updateMany(
      { _id: { $ne: _id } },
      { $set: { is_default: false } }
    );
    res.status(200).json({ message: "Default Currency updated" });
  } catch (error) {}
};

module.exports = apicontroller;
