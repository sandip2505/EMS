const project = require("../../model/createProject");
const invoice = require("../../model/invoice");
const currencie = require("../../model/currencie");
const customer = require("../../model/customer");
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

const fs = require("fs");

const path = require("path");
const PaymentMode = require("../../model/paymentmode");
const payment = require("../../model/payment");
const Permission = require("../../model/addpermissions");

const apicontroller = {};

apicontroller.editInvoice = async (req, res) => {
  try {
    const { _id: user_id, role_id } = req.user;

    const rolePerm = await helper.checkPermission(role_id.toString(), user_id, "View Holidays");

    if (rolePerm.status===true) {
      const user_name = req.user.firstname + " " + req.user.last_name;
      try {
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
    
    
        req.body.amount_due = parseFloat(req.body.grand_total) - parseFloat(dueAmount);
    
        await invoice.findByIdAndUpdate(_id, req.body);
        logger.info({ message: 'Successfully update invoice', meta: { user_name } });
        res.status(200).json({ message: "Invoice updated" });
      } catch (err) {
        res.status(400).json({ message: err.message });
      }
    } else {
      res.json({ status: false, message: "Permission denied." });
    }
  } catch (error) {
    res.status(403).send(error.message);
  }

};

apicontroller.addInvoice = async (req, res) => {
  try {
    const { _id: user_id, role_id } = req.user;

    const rolePerm = await helper.checkPermission(role_id.toString(), user_id, "View Holidays");

    if (rolePerm.status) {
      const user_name = req.user.firstname + " " + req.user.last_name;
      try {
        req.body.amount_due = req.body.grand_total;
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
        logger.info({ message: 'Successfully add invoice', meta: { user_name } });
        res.status(200).json({ message: "Invoice Added Successfully" });
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

apicontroller.getInvoice = async (req, res) => {
  try {
    const { _id: user_id, role_id } = req.user;

    const rolePerm = await helper.checkPermission(role_id.toString(), user_id, "View Holidays");

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

    const rolePerm = await helper.checkPermission(role_id.toString(), user_id, "View Holidays");

    if (rolePerm.status) {
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

    const rolePerm = await helper.checkPermission(role_id.toString(), user_id, "View Holidays");

    if (rolePerm.status) {
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
    } else {
      res.json({ status: false, message: "Permission denied." });
    }
  } catch (error) {
    res.status(403).send(error.message);
  }

};

apicontroller.invoiceGenerate = async (req, res) => {
  try {
    const { _id: user_id, role_id } = req.user;

    const rolePerm = await helper.checkPermission(role_id.toString(), user_id, "View Holidays");

    if (rolePerm.status) {
      try {
        const _id = new BSON.ObjectId(req.params.id);
        const invoiceData = await invoice.aggregate([
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
        ]);
        const company = await companySetting.find();
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
    
        if (invoiceData.length > 0) {
          const templatePath = path.join(
            __dirname.split("\\API")[0],
            "/views/partials",
            "invoice.ejs"
          );
    
          // Render the EJS template with the invoiceData
          const renderedHtml = await ejs.renderFile(templatePath, { data });
    
 
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
  
              res.status(201).send(buffer);

            }
          });

        }
      } catch (err) {
        res.status(400).json({ message: err.message });
      }
    } else {
      res.json({ status: false, message: "Permission denied." });
    }
  } catch (error) {
    res.status(403).send(error.message);
  }


};

apicontroller.getCurrencies = async (req, res) => {
  try {
    const { _id: user_id, role_id } = req.user;

    const rolePerm = await helper.checkPermission(role_id.toString(), user_id, "View Holidays");

    if (rolePerm.status) {
      try {
        const data = await currencie
          .find({ deleted_at: null })
          .sort({ currency: "asc" });
        res.status(200).json({ data });
      } catch (err) {
        res.status(400).json({ message: err.message });
      } 
    } else {
      res.json({ status: false, message: "Permission denied." });
    }
  } catch (error) {
    res.status(403).send(error.message);
  }

};

apicontroller.getInvoiceNumber = async (req, res) => {
  try {
    const { _id: user_id, role_id } = req.user;

    const rolePerm = await helper.checkPermission(role_id.toString(), user_id, "View Holidays");

    if (rolePerm.status) {
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
    } else {
      res.json({ status: false, message: "Permission denied." });
    }
  } catch (error) {
    res.status(403).send(error.message);
  }

};

apicontroller.customerInvoice = async (req, res) => {
  try {
    const { _id: user_id, role_id } = req.user;

    const rolePerm = await helper.checkPermission(role_id.toString(), user_id, "View Holidays");

    if (rolePerm.status) {
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
    } else {
      res.json({ status: false, message: "Permission denied." });
    }
  } catch (error) {
    res.status(403).send(error.message);
  }


};
apicontroller.Invoicestatus = async (req, res) => {
  try {
    const { _id: user_id, role_id } = req.user;

    const rolePerm = await helper.checkPermission(role_id.toString(), user_id, "View Holidays");

    if (rolePerm.status) {
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
    } else {
      res.json({ status: false, message: "Permission denied." });
    }
  } catch (error) {
    res.status(403).send(error.message);
  }

};
apicontroller.sentEmailInvoice = async (req, res) => {
  try {
    const { _id: user_id, role_id } = req.user;

    const rolePerm = await helper.checkPermission(role_id.toString(), user_id, "View Holidays");

    if (rolePerm.status) {
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
    } else {
      res.json({ status: false, message: "Permission denied." });
    }
  } catch (error) {
    res.status(403).send(error.message);
  }

};
apicontroller.deleteInvoice = async (req, res) => {
  try {
    const { _id: user_id, role_id } = req.user;

    const rolePerm = await helper.checkPermission(role_id.toString(), user_id, "View Holidays");

    if (rolePerm.status) {
      const user_name = req.user.firstname + " " + req.user.last_name;
      try {
        const _id = req.params.id;
        const data = await invoice.findByIdAndUpdate(
          _id,
          { deleted_at: new Date() },
          { new: true }
        );
    
        logger.info({ message: 'Successfully delete invoice', meta: { user_name } });
        res.status(200).json({ message: "Invoice deleted" });
      } catch (err) {
        res.status(400).json({ message: err.message });
      }
    } else {
      res.json({ status: false, message: "Permission denied." });
    }
  } catch (error) {
    res.status(403).send(error.message);
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
    const { _id: user_id, role_id } = req.user;

    const rolePerm = await helper.checkPermission(role_id.toString(), user_id, "View Holidays");

    if (rolePerm.status) {
      const user_name = req.user.firstname + " " + req.user.last_name;
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
        logger.info({ message: 'Successfully add payment', meta: { user_name } });
        res
          .status(200)
          .json({ message: "Payment Added Successfully", paymentData });
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

apicontroller.getPayments = async (req, res) => {
  try {
    const { _id: user_id, role_id } = req.user;

    const rolePerm = await helper.checkPermission(role_id.toString(), user_id, "View Holidays");

    if (rolePerm.status) {
     
  const user_name = req.user.firstname + " " + req.user.last_name;
  logger.info({ message: 'Successfully retrieved payments', meta: { user_name ,user_id } });

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
    logger.error({ message: 'Error while retrieving payments', meta: { user_id, user_name, error: error.message } });
    res.status(500).json({ error: "Internal Server Error" });
  }
    } else {
      res.json({ status: false, message: "Permission denied." });
    }
  } catch (error) {
    res.status(403).send(error.message);
  }

};

apicontroller.getPaymentByid = async (req, res) => {
  try {
    const { _id: user_id, role_id } = req.user;

    const rolePerm = await helper.checkPermission(role_id.toString(), user_id, "View Holidays");

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

    const rolePerm = await helper.checkPermission(role_id.toString(), user_id, "View Holidays");

    if (rolePerm.status) {
      const user_name = req.user.firstname + " " + req.user.last_name;
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
        logger.info({ message: 'Successfully update payment', meta: { user_name } });
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

apicontroller.getLogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '',user_id, from, to } = req.query;

    // Convert page and limit to integers
    const parsedPage = parseInt(page);
    const parsedLimit = parseInt(limit);

    // Build the query for searching
    const searchQuery = {
      $or: [
        { 'message': { $regex: new RegExp(search, 'i') } },
        { 'meta.user_id': { $regex: new RegExp(user_id, 'i') } },
      ],
    };


    // Add timestamp range filtering
    if (from && to) {
      searchQuery.timestamp = {
        $gte: new Date(from),
        $lte: new Date(to),
      };
    }

    // Query logs with pagination and search
    const logs = await log
      .find(searchQuery)
      .skip((parsedPage - 1) * parsedLimit)
      .limit(parsedLimit);

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
    res.status(500).json({ error: 'Internal Server Error' });
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
    console.log(Roledata.permission_id.length);

    res.status(200).json({ permission: Roledata });
  } catch (error) {
    console.error(error);
  }
}

module.exports = apicontroller;
