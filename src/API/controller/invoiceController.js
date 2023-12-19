const project = require("../../model/createProject");
const invoice = require("../../model/invoice");
const currencie = require("../../model/currencie");
const customer = require("../../model/customer");
const task = require("../../model/createTask");
const companySetting = require("../../model/companySetting");
const session = require("express-session");
const moment = require("moment");
const mongoose = require("mongoose");
const numberToWords = require("number-to-words");
const sendEmail = require("../../utils/send_invoice");
const logger = require("../../utils/logger");

const express = require("express");
const ejs = require("ejs");
const BSON = require("bson");
const Helper = require("../../utils/helper");
const helper = new Helper();
const PDFDocument = require("pdfkit");
const pdf = require("html-pdf");

const fs = require("fs");

const path = require("path");
const PaymentMode = require("../../model/paymentmode");
const payment = require("../../model/payment");

const apicontroller = {};

apicontroller.editInvoice = async (req, res) => {
  try {
    const _id = req.params.id;
    const invoiceData = await invoice.findOne({ _id });
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

    console.log(
      "==================================================================="
    );
    console.log(dueAmount, "sdsdsds");
    console.log(
      "==================================================================="
    );
    req.body.amount_due =
      parseFloat(req.body.grand_total) - parseFloat(dueAmount);
    await invoice.findByIdAndUpdate(_id, req.body);
    res.status(200).json({ message: "Invoice updated" });
  } catch (err) {
    // console.log(err);
    res.status(400).json({ message: err.message });
  }
};
apicontroller.addInvoice = async (req, res) => {
  try {
    req.body.amount_due = req.body.grand_total;
    console.log(typeof req.body.projects[0].cgst,"req.body");
    const invoiceSave = new invoice(req.body);
    const projectId = [];
    req.body.projects.forEach((element) => {
      projectId.push(element.id);
    });
    const invoice_created = await task.updateMany(
      { _id: { $in: projectId } },
      { $set: { invoice_created: 1 } }
    );

    await invoiceSave.save();
    res.status(200).json({ message: "Invoice Added Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

apicontroller.getInvoice = async (req, res) => {
  try {
    const _id = req.params.id;
    const invoiceData = await invoice.findOne({ _id });
    res.status(200).json({ invoiceData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

apicontroller.Invoice = async (req, res) => {
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
    searchParams.invoice_number = { $regex: new RegExp(invoice_number, "i") };
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
              "customer.name": { $regex: new RegExp(req.query.customer, "i") },
            },
            {
              "customer.email": { $regex: new RegExp(req.query.customer, "i") },
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
      //     from: "projects",
      //     localField: "projects.id",
      //     foreignField: "_id",
      //     as: "projects",
      //   },
      // },

      // {
      //   $match: {
      //     "projects.title": { $regex: new RegExp(req.query.project_name, "i") },
      //   },
      // },
      {
        $lookup: {
          from: "currency",
          localField: "customer.primary_currency",
          foreignField: "_id",
          as: "currency",
        },
      },
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

    res.status(200).json({ totalPages, page, limit, invoiceData });
  } catch (error) {
    // Handle any errors
    console.error(error);
  }
};

apicontroller.CustomerInvoice = async (req, res) => {
  try {
    const _id = req.params.customer_id;

    const invoiceData = await invoice.aggregate([
      {
        $match: {
          customer_id: new BSON.ObjectId(_id),
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
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

apicontroller.invoiceGenerate = async (req, res) => {
  try {
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
    ]);

    const company = await companySetting.find();
    const promises = invoiceData[0].projects.map(async (particular) => {
      const tasks = await task.findById(particular.id);
      const projects = await project.findById(tasks.project_id);
      particular.title = projects.title + "-" + tasks.title;
      return particular;
    });
if(invoiceData[0].customer.is_local){
    invoiceData[0].total_cgst = invoiceData[0].projects.reduce(
      (sum, project) => {
        return sum + project.cgst.amount
      },
      0
    );

    invoiceData[0].total_sgst = invoiceData[0].projects.reduce(
      (sum, project) => {
        return sum + project.sgst.amount
      },
      0
    );

    invoiceData[0].total_igst = invoiceData[0].projects.reduce(
      (sum, project) => {
        return sum + project.igst.amount
      },
      0
    );

    invoiceData[0].total_gst =
      invoiceData[0].total_cgst +
      invoiceData[0].total_sgst +
      invoiceData[0].total_igst;

    }
    invoiceData[0].amountInWords = numberToWords
      .toWords(invoiceData[0].grand_total)
      .replace(/\b\w/g, (match) => match.toUpperCase());
    const particulars = await Promise.all(promises);
    data = {
      ...invoiceData[0],
      company,
      particulars,
    };
    console.log(data, "titletitle");

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
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: err.message });
  }
};

apicontroller.getCurrencies = async (req, res) => {
  try {
    const data = await currencie
      .find({ deleted_at: null })
      .sort({ currency: "asc" });
    res.status(200).json({ data });
  } catch (err) {
    res.status(400).json({ message: err.message });
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
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

apicontroller.customerInvoice = async (req, res) => {
  try {
    const _id = req.params.id;
    const invoiceData = await invoice.find({
      customer_id: _id,
      deleted_at: "null",
    });

    //  const invoiceData = await invoice.aggregate([
    //     {
    //       $match: {
    //         customer_id: new BSON.ObjectId(_id),
    //         deleted_at: "null",
    //       },
    //     },
    //     {
    //       $lookup: {
    //         from: "customers",
    //         localField: "customer_id",
    //         foreignField: "_id",
    //         as: "customer",
    //       },
    //     },
    //     {
    //       $lookup: {
    //         from: "projects",
    //         localField: "projects.id",
    //         foreignField: "_id",
    //         as: "projects",
    //       },
    //     },
    //   ]);

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
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
apicontroller.sentEmailInvoice = async (req, res) => {
  try {
    const customer_id = req.body.customer_id;
    const invoice_id = req.body.invoice_id;
    const form = req.body.form;
    const subject = req.body.subject;
    const to = req.body.to;
    const costomerData = await customer.findOne({ _id: customer_id });
    const invoiceData = await invoice.aggregate([
      {
        $match: {
          _id: new BSON.ObjectId(customer_id),
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
    ]);
    const company = await companySetting.find();
    // return invoiceData
    await Promise.all(
      invoiceData[0].projects.map(async (i, index) => {
        const projects = await project.findById(i.id);
        invoiceData[0].projects[index].data = projects;
        if (i.assigned_tasks.length > 0) {
          await Promise.all(
            i.assigned_tasks.map(async (u, uindex) => {
              const tasks = await task.findById(u);
              invoiceData[0].projects[index].assigned_tasks[uindex] = tasks;
            })
          );
        }
      })
    );
    const data = { ...invoiceData[0], company };

    const send_email = await sendEmail(
      to,
      subject,
      costomerData,
      customer_id,
      data
    );
    await invoice.findByIdAndUpdate(customer_id, {
      status: 2,
    });
    res.json({ message: send_email });
  } catch (err) {
    console.log(err, "Errorr");
    res.status(400).send(err.message);
  }
};
apicontroller.deleteInvoice = async (req, res) => {
  try {
    const _id = req.params.id;
    const getPayment = await payment.find({ invoice_id:_id,deleted_at: "null" });
    const isPayment = getPayment.length > 0;
    if(isPayment) throw new Error('invoice is assign with payment');
    const data = await invoice.findByIdAndUpdate(
      _id,
      { deleted_at: new Date() },
      { new: true }
    );

    res.status(200).json({ message: "Invoice deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

apicontroller.paymentmode = async function (req, res) {
  const paymentModes = await PaymentMode.find();
  return res.json({ paymentModes });
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
    const paymentSave = new payment(req.body);
    const paymentData = await paymentSave.save();

    const getinvoice = await invoice.findOne({
      _id: paymentData.invoice_id,
      deleted_at: "null",
    });
    if (
      parseFloat(getinvoice.amount_due) - parseFloat(req.body.amount) ==
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
          amount_due: getinvoice.amount_due - req.body.amount,
          status: 2,
          payment_status: 2,
        }
      );
    }
    res
      .status(200)
      .json({ message: "Payment Added Successfully", paymentData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// apicontroller.getPayments = async (req, res) => {

//   try {
//     const paymentData = await payment.aggregate([
//       {
//         $match: {
//           deleted_at: "null",
//         },
//       },
//       {
//         $lookup: {
//           from: "customers",
//           localField: "customer_id",
//           foreignField: "_id",
//           as: "customer",
//         },
//       },
//       {
//         $unwind: "$customer",
//       },
//       {
//         $lookup: {
//           from: "invoices",
//           localField: "invoice_id",
//           foreignField: "_id",
//           as: "invoice",
//         },
//       },
//       {
//         $unwind: "$invoice",
//       },
//       {
//         $lookup: {
//           from: "paymentmodes",
//           localField: "payment_mode",
//           foreignField: "value",
//           as: "paymentMode",
//         },
//       },
//       {
//         $unwind: "$paymentMode",
//       },
//       {
//         $lookup: {
//           from: "currencies",
//           localField: "customer.primary_currency",
//           foreignField: "_id",
//           as: "currency",
//         },
//       },
//       {
//         $unwind: "$currency",
//       },
//     ]);
//     res.status(200).json({ paymentData });
//   } catch (error) {
//     console.error(error);
//   }
// };

apicontroller.getPayments = async (req, res) => {
  const username = "Sandip Ganava";
  logger.info("hello", { user: username });
  try {
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
    ]);
    const totalItems = await payment.countDocuments({ deleted_at: "null" });
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
      paymentData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

apicontroller.getPaymentByid = async (req, res) => {
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
          amount: 1,
          payment_mode: 1,
          notes: 1,
          updated_at: 1,
          deleted_at: 1,
          created_at: 1,
          __v: 1,
          currency: "$currency", // Include currency data
        },
      },
    ]);

    res.status(200).json({ paymentData: paymentData[0] });
  } catch (error) {
    console.error(error);
    // Handle error
  }
};

apicontroller.editPayment = async (req, res) => {
  try {
    const _id = req.params.id;

    const {
      date,
      payment_number,
      customer_id,
      invoice_id,
      amount,
      payment_mode,
      notes,
    } = req.body;
    const paymentData = await payment.findByIdAndUpdate(_id, {
      date,
      payment_number,
      customer_id,
      invoice_id,
      amount,
      payment_mode,
      notes,
    });
    const getinvoice = await invoice.findOne({
      _id: paymentData.invoice_id,
      deleted_at: "null",
    });
    if (getinvoice.grand_total == req.body.amount) {
      const invoiceUpdate = await invoice.findByIdAndUpdate(
        paymentData.invoice_id,
        { amount_due: 0, status: 3, payment_status: 3 }
      );
    } else {
      const invoiceData = await invoice.find({
        _id: paymentData.invoice_id,
        deleted_at: "null",
      });
      const otherPaymentData = await payment.find({
        invoice_id: paymentData.invoice_id,
        _id: { $ne: paymentData._id },
        deleted_at: "null",
      });
      let totalAmount = 0;
      otherPaymentData.forEach((payment) => {
        totalAmount += payment.amount;
      });
      const invoiceUpdate = await invoice.findByIdAndUpdate(
        paymentData.invoice_id,
        {
          amount_due: getinvoice.grand_total - totalAmount - req.body.amount,
          payment_status: 2,
          status: 2,
        }
      );
    }
    res.status(200).json({ message: "Payment updated", paymentData });
  } catch (error) {
    console.error(error);
  }
};

apicontroller.getLogs = async (req, res) => {
  try {
    const logs = await logger.find();
    res.status(200).json({ logs });
  } catch (error) {
    console.error(error);
  }
};

module.exports = apicontroller;
