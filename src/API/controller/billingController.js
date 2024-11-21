const project = require("../../model/createProject");
const user = require("../../model/user");
const customer = require("../../model/customer");
const logger = require("../../utils/logger");
const jwt = require("jsonwebtoken");
const Helper = require("../../utils/helper");
const bcrypt = require("bcryptjs");
const Invoice = require("../../model/invoice");
const Task = require("../../model/createTask");
const userPermissions = require("../../model/userPermission");
const rolePermissions = require("../../model/rolePermission");
const Category = require("../../model/category");
const permission = require("../../model/addpermissions");
const Currency = require("../../model/currencie");
const expenses = require("../../model/expenses");
const invoice = require("../../model/invoice");
const country = require("../../model/countries");
const payment = require("../../model/payment");
const moment = require("moment");
const excel = require("exceljs");
const Expenses = require("../../model/expenses");
const salarystructure = require("../../model/salarystructure");
const path = require("path");
const fs = require("fs");
const Intl = require("intl");

const helper = new Helper();

const apicontroller = {};

apicontroller.employeelogin = async (req, res) => {
  try {
    const company_email = req.body.company_email;
    const password = req.body.password;
    const users = await user.findOne({ company_email });
    if (!users) {
      res.status(401).json({ emailError: "Invalid email" });
    } else {
      const isMatch = await bcrypt.compare(password, users.password);
      if (isMatch) {
        var token = jwt.sign(
          {
            _id: users._id,
          },
          process.env.JWT_SECRET,
          {
            expiresIn: "5d",
          }
        );
        await user.findByIdAndUpdate(users._id, { token });

        const userData = await user.aggregate([
          { $match: { deleted_at: "null" } },
          { $match: { company_email: company_email } },
          { $addFields: { roleId: { $toObjectId: "$role_id" } } },
          {
            $lookup: {
              from: "roles",
              localField: "roleId",
              foreignField: "_id",
              as: "roleData",
            },
          },
        ]);

        const userResult = userData.map((user) => ({
          user: {
            _id: user._id,
            role_id: user.role_id,
            emp_code: user.emp_code,
            reporting_user_id: user.reporting_user_id,
            firstname: user.firstname,
            user_name: user.user_name,
            middle_name: user.middle_name,
            last_name: user.last_name,
            gender: user.gender,
            dob: user.dob,
            doj: user.doj,
            personal_email: user.personal_email,
            company_email: user.company_email,
            mo_number: user.mo_number,
            pan_number: user.pan_number,
            aadhar_number: user.aadhar_number,
            add_1: user.add_1,
            add_2: user.add_2,
            city: user.city,
            state: user.state,
            pincode: user.pincode,
            country: user.country,
            photo: user.photo,
            status: user.status,
            bank_account_no: user.bank_account_no,
            bank_name: user.bank_name,
            ifsc_code: user.ifsc_code,
            created_at: user.created_at,
            updated_at: user.updated_at,
            deleted_at: user.deleted_at,
            __v: user.__v,
            roleId: user.roleId,
          },
          roleData: user.roleData.length > 0 ? user.roleData[0] : null,
          token: user.token,
        }));
        const userdata = userResult[0].user;
        const roleData = userResult[0].roleData;
        const user_token = userResult[0].token;

        console.log("userdata", userdata);

        const existUserPermission = await userPermissions.findOne({
          user_id: userdata._id,
        });
        const existRolePermission = await rolePermissions.findOne({
          role_id: userdata.role_id,
        });

        const allPerm = existUserPermission.permission_id.concat(
          existRolePermission.permission_id
        );
        var existPermissions = [...new Set(allPerm)];

        console.log("existPermissions", existPermissions);
        const permissions = await permission.find({ _id: existPermissions });
        console.log("permissions", permissions.length);

        const allpermissions = permissions.map((i) => i.permission_name);
        // console.log("allpermissions",allpermissions)

        if (userData[0].roleData[0].role_name === "Admin") {
          // if (allpermissions.includes('Billing Access')) {
          res.status(200).json({
            userdata,
            roleData,
            user_token,
            permissions: allpermissions,
          });
        } else {
          res.status(403).json({ Error: "you are unauthorized" });
        }
      } else {
        res.status(401).json({ passwordError: "Incorrect password" });
      }
    }
  } catch (error) {
    console.error("error", error);
  }
};

apicontroller.addCustomer = async (req, res) => {
  try {
    const { _id: user_id, role_id } = req.user;

    const rolePerm = await helper.checkPermission(
      role_id.toString(),
      user_id,
      "View Holidays"
    );

    if (rolePerm.status === true) {
      try {
        const customerData = await customer.create({
          name: req.body.name,
          email: req.body.email,
          phone: req.body.phone,
          contact_name: req.body.contact_name,
          primary_currency: req.body.primary_currency,
          prefix: req.body.prefix,
          website: req.body.website,
          project_id: req.body.project_id,
          is_local: req.body.is_local,
          billing: {
            name: req.body.billing.name,
            address_street_1: req.body.billing.address_street_1,
            address_street_2: req.body.billing.address_street_2,
            city: req.body.billing.city,
            state: req.body.billing.state,
            country_id: req.body.billing.country_id,
            zip: req.body.billing.zip,
            phone: req.body.billing.phone,
            gstin: req.body.billing.gstin,
          },
        });
        await project.updateMany(
          { _id: { $in: customerData.project_id } },
          { $set: { is_assigned: 1 } }
        );
        const currencyData = await Currency.findOne({
          _id: req.body.primary_currency,
        });
        const customerProjectData = await project.find({
          _id: req.body.project_id,
        });
        const projectName = customerProjectData
          .map((project) => project.title)
          .join(",");

        const user_name = req.user.firstname + " " + req.user.last_name;
        const user_id = req.user._id;
        logger.info({
          message: `<a href="customer/${customerData._id.toString()}"><span>${
            req.body.contact_name
          }</a> Customer Created By ${user_name}</span></a><br>
          <li>Customer Currency: ${
            currencyData.symbol
          }</li> <li>Customer Projects: ${projectName}</li>`,
          meta: { user_id: `${user_id}`, type: "Create Customer" },
        });

        res.status(200).json(customerData);
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

apicontroller.getCustomers = async (req, res) => {
  try {
    const { _id: user_id, role_id } = req.user;

    const rolePerm = await helper.checkPermission(
      role_id.toString(),
      user_id,
      "View Holidays"
    );

    if (rolePerm.status === true) {
      const page = parseInt(req.query.page) || 1;
      const limit = req.query.limit ? parseInt(req.query.limit) : 0;
      const skip = (page - 1) * limit;
      let searchParams = { deleted_at: "null" };
      if (req.query.name || req.query.contact_name || req.query.phone) {
        req.query.name
          ? (searchParams.name = { $regex: new RegExp(req.query.name, "i") })
          : {};

        req.query.contact_name
          ? (searchParams.contact_name = {
              $regex: new RegExp(req.query.contact_name, "i"),
            })
          : {};

        req.query.phone
          ? (searchParams.phone = { $regex: new RegExp(req.query.phone, "i") })
          : {};
      }
      try {
        const totalItems = await customer.countDocuments(searchParams);

        const totalPages = Math.ceil(totalItems / limit);

        const customerData = await customer
          .find(searchParams)
          .select(
            "name contact_name is_local email phone billing primary_currency"
          )
          .populate("primary_currency")
          .sort({ created_at: -1 })
          .skip(skip)
          .limit(limit);
        const indexedCustomerData = customerData.map((item, index) => ({
          index: skip + index + 1,
          ...item._doc,
        }));
        res.json({
          page,
          limit,
          totalPages,
          totalItems,
          customerData: indexedCustomerData,
        });
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

apicontroller.editCustomers = async (req, res) => {
  try {
    const { _id: user_id, role_id } = req.user;

    const rolePerm = await helper.checkPermission(
      role_id.toString(),
      user_id,
      "View Holidays"
    );

    if (rolePerm.status === true) {
      try {
        const _id = req.params.id;
        const CustomerData = await customer
          .findOne({ _id: _id })
          .select("-created_at -deleted_at -updated_at -prefix");
        if (CustomerData) {
          res.json({ CustomerData });
        } else {
          res.status(404).json({ message: "Customer not found" });
        }
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    } else {
      res.json({ status: false, message: "Permission denied." });
    }
  } catch (error) {
    res.status(403).send(error.message);
  }
};

apicontroller.UpdateCustomers = async (req, res) => {
  try {
    const { _id: user_id, role_id } = req.user;

    const rolePerm = await helper.checkPermission(
      role_id.toString(),
      user_id,
      "View Holidays"
    );

    if (rolePerm.status === true) {
      const user_name = req.user.firstname + " " + req.user.last_name;
      try {
        const _id = req.params.id;
        const oldCustomerData = await customer.findById(_id);
        await project.updateMany(
          { _id: { $in: oldCustomerData.project_id } },
          { $set: { is_assigned: 0 } }
        );
        const updatedCustomer = await customer.findByIdAndUpdate(
          _id,
          {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            contact_name: req.body.contact_name,
            primary_currency: req.body.primary_currency,
            prefix: req.body.prefix,
            website: req.body.website,
            project_id: req.body.project_id,
            is_local: req.body.is_local,
            billing: {
              name: req.body.billing.name,
              address_street_1: req.body.billing.address_street_1,
              address_street_2: req.body.billing.address_street_2,
              city: req.body.billing.city,
              state: req.body.billing.state,
              country_id: req.body.billing.country_id,
              zip: req.body.billing.zip,
              phone: req.body.billing.phone,
              gstin: req.body.billing.gstin,
            },
            updated_at: new Date(),
          },
          { new: true }
        );
        await project.updateMany(
          { _id: { $in: updatedCustomer.project_id } },
          { $set: { is_assigned: 1 } }
        );

        if (!updatedCustomer) {
          return res.status(404).json({ message: "Customer not found" });
        }
        const customerProjectData = await project.find({
          _id: req.body.project_id,
        });
        const projectName = customerProjectData
          .map((project) => project.title)
          .join(",");

        const user_id = req.user._id;
        const currencyData = await Currency.findOne({
          _id: req.body.primary_currency,
        });
        logger.info({
          message: `<a href="customer/${oldCustomerData._id.toString()}"><span>${
            req.body.contact_name
          }</a> Customer Updated By ${user_name}</span><br>
          <li>Customer Currency: ${
            currencyData.symbol
          }</li> <li>Customer Projects: ${projectName}</li>`,
          meta: { user_id: `${user_id}`, type: "Update Customer" },
        });

        res.json({ updatedCustomer });
      } catch (error) {
        console.error("Error updating customer:", error);
        res.status(500).json({ error: error.message });
      }
    } else {
      res.json({ status: false, message: "Permission denied." });
    }
  } catch (error) {
    res.status(403).send(error.message);
  }
};

apicontroller.DeleteCustomers = async (req, res) => {
  try {
    const { _id: user_id, role_id } = req.user;

    const rolePerm = await helper.checkPermission(
      role_id.toString(),
      user_id,
      "View Holidays"
    );

    if (rolePerm.status === true) {
      const _id = req.params.id;
      const user_name = req.user.firstname + " " + req.user.last_name;
      const isInvoice = await invoice.countDocuments({
        customer_id: _id,
        deleted_at: "null",
      });
      if (isInvoice)
        throw new Error(
          "Cannot delete customer. Customer is assigned to an invoice."
        );
      const CustomerData = await customer.findByIdAndUpdate(
        _id,
        { deleted_at: new Date() },
        { new: true }
      );

      await project.updateMany(
        { _id: { $in: CustomerData.project_id } },
        { $set: { is_assigned: 0 } }
      );

      logger.info({
        message: `Customer ${CustomerData.contact_name} Deleted By ${user_name}</span>`,
        meta: { user_id: `${user_id}`, type: "Delete Customer" },
      });

      res.json({ CustomerData });
    } else {
      res.status(403).json({ status: false, message: "Permission denied." });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

apicontroller.MultiDeleteCustomers = async (req, res) => {
  try {
    const { _id: user_id, role_id } = req.user;

    const rolePerm = await helper.checkPermission(
      role_id.toString(),
      user_id,
      "View Holidays"
    );

    if (rolePerm.status === true) {
      const user_name = req.user.firstname + " " + req.user.last_name;
      const customer_id = req.body.customer_id;
      const CustomerData = await customer.updateMany(
        { _id: { $in: customer_id } },
        { $set: { deleted_at: Date() } },
        { new: true }
      );
      logger.info({
        message: "Successfully delete customer",
        meta: { user_name },
      });
      res.json({ message: "Multiple Data has been deleted", CustomerData });
    } else {
      res.json({ status: false, message: "Permission denied." });
    }
  } catch (error) {
    res.status(403).send(error.message);
  }
};

apicontroller.SearchCustomers = async (req, res) => {
  try {
    const { _id: user_id, role_id } = req.user;

    const rolePerm = await helper.checkPermission(
      role_id.toString(),
      user_id,
      "View Holidays"
    );

    if (rolePerm.status === true) {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 5;
      const skip = (page - 1) * limit;

      const searchParams = {
        name: req.query.name,
        contactName: req.query.contact_name,
        phone: req.query.phone,
        deleted_at: "null",
      };

      Object.keys(searchParams).forEach((key) =>
        searchParams[key] === undefined || searchParams[key] === null
          ? delete searchParams[key]
          : {}
      );

      try {
        const totalItems = await customer.countDocuments(searchParams);

        // Calculate the total number of pages
        const totalPages = Math.ceil(totalItems / limit);

        // Fetch the paginated data
        const customerData = await customer
          .find(searchParams)
          .skip(skip)
          .limit(limit);

        res.json({
          page,
          limit,
          totalPages, // Include the total pages in the response
          totalItems,
          data: customerData,
        });
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

apicontroller.projectslisting = async (req, res) => {
  try {
    const { _id: user_id, role_id } = req.user;

    const rolePerm = await helper.checkPermission(
      role_id.toString(),
      user_id,
      "View Holidays"
    );

    if (rolePerm.status === true) {
      try {
        const customer_id = req.params.customer_id;
        let projectData = [];
        if (customer_id == 0) {
          projectData = await project.find({
            deleted_at: "null",
            is_assigned: { $ne: 1 },
          });
        } else {
          const customerData = await customer.findOne({ _id: customer_id });
          const assinedProjectData = await project
            .find({
              deleted_at: "null",
              _id: { $in: customerData.project_id },
            })
            .select("_id title");
          const unassignedProjectData = await project
            .find({
              deleted_at: "null",
              is_assigned: { $ne: 1 },
            })
            .select("_id title");
          projectData = [...assinedProjectData, ...unassignedProjectData];
        }
        console.log(projectData, "projectData");
        res.json({ projectData });
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    } else {
      res.json({ status: false, message: "Permission denied." });
    }
  } catch (error) {
    res.status(403).send(error.message);
  }
};

apicontroller.restore = async (req, res) => {
  try {
    res.json("Data has been restored");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

apicontroller.getCustomerProjects = async (req, res) => {
  try {
    const id = req.params.id;
    const invoice_id = req.params.invoice_id;
    if (id !== "null") {
      const customerData = await customer.findOne({ _id: id });
      const projects = await project.find({
        _id: { $in: customerData.project_id },
      });

      const projectTaskArray = [];
      for (const project of projects) {
        let tasks = [];
        let assignedTasks = [];
        if (invoice_id == "undefined") {
          tasks = await Task.find({
            project_id: project._id,
            invoice_created: { $ne: "1" },
          });
        } else {
          const invoiceData = await Invoice.findOne({ _id: invoice_id });
          const invoiceProjects = invoiceData.projects;
          for (const task of invoiceProjects) {
            assignedTasks = await Task.find({
              project_id: project._id,
              _id: task.id,
              invoice_created: "1",
            });
            const remainingTasks = await Task.find({
              project_id: project._id,
              _id: { $nin: tasks.map((task) => task._id) },
              invoice_created: { $ne: "1" },
            });
            tasks.push(...assignedTasks, ...remainingTasks);
          }
          // tasks = [...assignedTasks, ...tasks];
        }
        tasks.forEach((task) => {
          const taskProjectObject = {
            title: `${project.title}-${task.title}`,
            value: task._id,
          };
          projectTaskArray.push(taskProjectObject);
        });
      }

      res.json({ Projects: projectTaskArray });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

apicontroller.getCustomerTask = async (req, res) => {
  try {
    const id = req.params.id;
    let tasks = [];
    if (id !== "null") {
      tasks = await Task.find({ project_id: id });
    }
    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

apicontroller.expenseCategory = async (req, res) => {
  try {
    let category = await Category.find();

    const employeeSalaries = await salarystructure
      .find()
      .select("_id Net_Salary Total_Salary");
    const allEmpSallaries = employeeSalaries?.reduce((sum, item) => {
      return sum + parseFloat(item.Net_Salary ? item.Net_Salary : 0);
    }, 0);
    const categoryExists = category.find(
      (cat) => cat.category_name === "Employee salary"
    );
    if (!categoryExists) {
      const data = {
        category_name: "Employee salary",
        description: "All Employee salaries",
        recurring: true,
        amount: allEmpSallaries,
        pay_to: "Employees",
        pay_by: "",
        note: "",
        payment_mode: null,
        undeletable: true,
      };
      await Category.create(data);
    } else {
      console.log(allEmpSallaries, "allEmpSallaries");
      const getUpdated = await Category.findByIdAndUpdate(categoryExists._id, {
        amount: allEmpSallaries,
      });
      console.log(getUpdated, "getUpdated");
    }
    category = await Category.find();
    res.status(200).json({ category });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

apicontroller.deleteExpenseCategory = async (req, res) => {
  try {
    const id = req.params.id;
    await Category.findByIdAndDelete(id);
    res.status(200).json({ message: "Expense category deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

apicontroller.addExpenseCategory = async (req, res) => {
  try {
    const data = {
      category_name: req.body.name,
      description: req.body.description,
      recurring: req.body.recurring,
      amount: req.body.amount,
      payment_mode: req.body.payment_mode,
      pay_by: req.body.pay_by,
      pay_to: req.body.pay_to,
      note: req.body.note,
    };
    await Category.create(data);
    res.status(201).json({ message: "Catagory added successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//Expense Module

apicontroller.addExpenses = async (req, res) => {
  try {
    const { _id: user_id, role_id } = req.user;

    const rolePerm = await helper.checkPermission(
      role_id.toString(),
      user_id,
      "Add Expense"
    );

    if (rolePerm.status || true) {
      const array_of_allowed_files = ["pdf"];
      let data = {
        category: req.body.category,
        due_date: req.body.due_date,
        amount: req.body.amount,
        paid_by: req.body.paid_by,
        paid_to: req.body.paid_to,
        payment_mode: req.body.payment_mode,
        note: req.body.note,
      };
      var file = req.files?.receipt;
      if (file) {
        const imageName = file.name;
        const file_extension = imageName.split(".").pop();
        if (!array_of_allowed_files.includes(file_extension)) {
          throw new Error("Unsupported file extension. Please use PDF");
        } else {
          file.mv("public/pdf/" + imageName);
          data.receipt = imageName;
        }
      }
      const dueDate = Date(data.due_date);
      data.due_date = dueDate;
      const expenseData = await expenses.create(data);
      const user_name = req.user.firstname + " " + req.user.last_name;

      const expenseCategory = await Category.findById(expenseData.category);
      logger.info({
        message: `<a href="expenses/${expenseData._id.toString()}">Expense</a> Created By ${user_name}</span><br>
      <li>Expense Category: ${
        expenseCategory.category_name
      }</li> <li>Expense Amount: ₹ ${expenseData.amount}</li>`,
        meta: { user_id: `${req.user._id}`, type: "Create Expense" },
      });

      res.status(201).json({ message: "Expenses Added Successfully" });
    } else {
      throw new Error("Permission denied");
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

apicontroller.editExpenses = async (req, res) => {
  try {
    const { _id: user_id, role_id } = req.user;

    const rolePerm = await helper.checkPermission(
      role_id.toString(),
      user_id,
      "Update Expense"
    );

    if (rolePerm.status) {
      const id = req.params.id;
      const array_of_allowed_files = ["pdf"];
      let data = {
        category: req.body.category,
        due_date: req.body.due_date,
        amount: req.body.amount,
        customer: req.body.customer,
        payment_mode: req.body.payment_mode,
        note: req.body.note,
      };
      var file = req.files?.receipt;
      if (file) {
        const imageName = file.name;
        const file_extension = imageName.split(".").pop();
        if (!array_of_allowed_files.includes(file_extension)) {
          throw new Error("Unsupported file extension. Please use PDF");
        } else {
          file.mv("public/pdf/" + file.name);
          data.receipt = imageName;
        }
      }
      const user_name = req.user.firstname + " " + req.user.last_name;
      const dueDate = Date(data.due_date);
      data.due_date = dueDate;
      const expenseData = await expenses.findByIdAndUpdate(id, data);
      const expenseCategory = await Category.findById(expenseData.category);
      logger.info({
        message: `<a href="expense/${expenseData._id.toString()}">Expense</a> Updated By ${user_name}</span><br>
      <li>Expense Category: ${
        expenseCategory.category_name
      }</li> <li>Expense Amount: ₹ ${expenseData.amount}</li>`,
        meta: { user_id: `${req.user._id}`, type: "Update Expense" },
      });
      res.status(201).json({ message: "Expenses Updated Successfully" });
    } else {
      throw new Error("Permission denied");
    }
  } catch (error) {
    res.status(403).json({ message: error.message });
  }
};

apicontroller.expenses = async (req, res) => {
  try {
    const { _id: user_id, role_id } = req.user;

    const rolePerm = await helper.checkPermission(
      role_id.toString(),
      user_id,
      "View Expense"
    );

    if (rolePerm.status) {
      const {
        page = 1,
        limit = 10,
        category_id = "",
        date_from,
        date_to,
      } = req.query;

      const from_date = new Date(date_from).setHours(0, 0, 0, 0);
      const to_date = new Date(date_to).setHours(23, 59, 59, 999);

      const skip = (page - 1) * limit;
      const query = {
        deleted_at: "null",
        category: category_id,
        created_at: {
          $gte: from_date,
          $lte: to_date,
        },
      };
      if (!date_from) delete query.created_at.$gte;
      if (!date_to) delete query.created_at.$lte;
      if (!category_id) delete query.category;
      if (!date_from && !date_to) delete query.created_at;
      const totalItems = await expenses.countDocuments(query);

      const data = await expenses
        .find(query)
        .populate("category")
        .populate("payment_mode")
        .skip(skip)
        .limit(limit);

      const indexedData = data.map((item, index) => ({
        index: skip + index + 1,
        ...item._doc,
      }));

      const totalPages = Math.ceil(totalItems / limit);
      res
        .status(200)
        .json({ expenses: indexedData, page, limit, totalItems, totalPages });
    } else {
      throw new Error("Permission denied");
    }
  } catch (error) {
    res.status(403).json({ message: error.message });
  }
};

apicontroller.expense = async (req, res) => {
  try {
    const { _id: user_id, role_id } = req.user;

    const rolePerm = await helper.checkPermission(
      role_id.toString(),
      user_id,
      "View Expense"
    );

    if (rolePerm.status) {
      const _id = req.params.id;
      const data = await expenses.findById(_id);
      console.log(data, "data");
      res.status(200).json({ expense: data });
    } else {
      throw new Error("Permission denied");
    }
  } catch (error) {
    res.status(403).json({ message: error.message });
  }
};
apicontroller.expenseReceipt = async (req, res) => {
  try {
    const _id = req.params.id;
    const data = await expenses.findOne({ _id });
    if (data && data.receipt) {
      const filePath = path.join(
        __dirname.split("\\src")[0],
        "public/pdf/",
        data.receipt
      );

      // Read the file as a buffer
      fs.readFile(filePath, async (err, bufferData) => {
        if (err) throw err;
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          'attachment; filename="downloaded-file.pdf"'
        );
        await res.end(bufferData);
      });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

apicontroller.deleteExpenses = async (req, res) => {
  try {
    const { _id: user_id, role_id } = req.user;

    const rolePerm = await helper.checkPermission(
      role_id.toString(),
      user_id,
      "View Expense"
    );

    if (rolePerm.status) {
      const _id = req.params.id;
      const expenseData = await expenses.findByIdAndUpdate(_id, {
        deleted_at: Date(),
      });
      const user_name = req.user.firstname + " " + req.user.last_name;
      logger.info({
        message: `Expense  Deleted By ${user_name}</span>`,
        meta: { user_id: `${req.user._id}`, type: "Delete Expense" },
      });
      res.status(200).json({ message: "Expenses Deleted Successfully" });
    } else {
      throw new Error("Permission denied");
    }
  } catch (error) {
    res.status(403).json({ message: error.message });
  }
};

apicontroller.reports = async (req, res) => {
  try {
    let data;
    let workbook = new excel.Workbook();
    let worksheet = workbook.addWorksheet("sheet1");
    let dateFrom = req.query.date_from && new Date(req.query.date_from);
    let dateTo = req.query.date_from && new Date(req.query.date_to);
    const { type } = req.params;
    const { isExcel } = req.query;
    dateFrom && dateFrom.setHours(0, 0, 0, 0);
    dateTo && dateTo.setHours(23, 59, 59, 999);

    let $match = {
      deleted_at: "null",
      created_at: { $gte: dateFrom, $lte: dateTo },
    };
    !dateFrom && delete $match.created_at.$gte;
    !dateTo && delete $match.created_at.$lte;
    !dateFrom && !dateTo && delete $match.created_at;

    const allInvoice = await invoice.aggregate([
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
      {
        $unwind: "$customer",
      },
      {
        $lookup: {
          from: "currencies",
          localField: "customer.primary_currency",
          foreignField: "_id",
          as: "currencyDetails",
        },
      },
      {
        $unwind: "$currencyDetails",
      },
      {
        $project: {
          _id: 1,
          currencyDetails: "$currencyDetails",
          invoice_number: 1,
          cgst: 1,
          sgst: 1,
          igst: 1,
          grand_total: 1,
          projects: "$projects",
          customer: "$customer",
        },
      },
    ]);
    const allExpenses = await expenses.find($match).populate("category");
    const lossAmount = allExpenses.reduce((sum, item) => {
      return sum + item.amount;
    }, 0);
    let allTax = {
      cgst: 0,
      sgst: 0,
      igst: 0,
    };
    allTax.cgst = allInvoice.reduce((sum, item) => {
      let tax = item.projects.reduce((total, i) => {
        total += i.cgst.amount;
        return total;
      }, 0);
      return sum + tax;
    }, 0);
    allTax.sgst = allInvoice.reduce((sum, item) => {
      let tax = item.projects.reduce((total, i) => {
        total += i.sgst.amount;
        return total;
      }, 0);
      return sum + tax;
    }, 0);
    allTax.igst = allInvoice.reduce((sum, item) => {
      let tax = item.projects.reduce((total, i) => {
        total += i.igst.amount;
        return total;
      }, 0);
      return sum + tax;
    }, 0);
    let totalGst = allTax.cgst + allTax.sgst + allTax.igst;
    for (let key in allTax) {
      if (allTax.hasOwnProperty(key)) {
        allTax[key] = `₹ ${allTax[key]}`;
      }
    }
    switch (type) {
      case "sales":
        const groupedByCustomer = allInvoice.reduce((acc, invoice) => {
          const customerId = invoice.customer.name;

          if (!acc[customerId]) {
            acc[customerId] = {
              invoices: [invoice],
              totalGrandTotal: 0,
              symbol: "",
            };
          } else {
            acc[customerId].invoices.push(invoice);
          }
          acc[customerId].totalGrandTotal += invoice.grand_total;
          acc[customerId].symbol = invoice.currencyDetails.symbol;

          return acc;
        }, {});

        const result = allInvoice.reduce((acc, item) => {
          const key = item.currencyDetails.code;
          acc[key] = acc[key] || [];
          acc[key].push(item);
          return acc;
        }, {});
        const totalByGroup = Object.entries(result).reduce(
          (acc, [key, group]) => {
            const total = group.reduce(
              (groupTotal, item) => groupTotal + item.grand_total,
              0
            );
            acc[key] = { total, symbol: group[0].currencyDetails.symbol };
            return acc;
          },
          {}
        );
        const customerFlat = Object.entries(groupedByCustomer).map(
          ([customerName, customer]) => ({
            customerName: customerName,
            invoices: customer.invoices.flat(),
            totalGrandTotal: customer.symbol + customer.totalGrandTotal,
          })
        );
        const salesData = { customer: customerFlat, total: totalByGroup };
        if (isExcel == 1) {
          worksheet.columns = [
            { header: "Customer Name", key: "customerName", width: 25 },
            { header: "Invoice Number", key: "invoiceNumber", width: 25 },
            { header: "Invoice Total", key: "invoiceTotal", width: 25 },
            { header: "Grand Total", key: "totalGrandTotal", width: 26 },
          ];

          salesData.customer.forEach((customer) => {
            const invoicesCount = customer.invoices.length;
            customer.invoices.forEach((invoice) => {
              worksheet.addRow({
                customerName: customer.customerName,
                invoiceNumber: invoice.invoice_number,
                invoiceTotal:
                  invoice.currencyDetails.symbol + invoice.grand_total,
                totalGrandTotal: customer.totalGrandTotal,
              });
            });

            const startRow = worksheet.rowCount - invoicesCount + 1;
            const endRow = worksheet.rowCount;
            worksheet.mergeCells(`A${startRow}:A${endRow}`);
            worksheet.mergeCells(`D${startRow}:D${endRow}`);
            worksheet.getCell(`A${startRow}`).alignment = {
              horizontal: "left",
              vertical: "middle",
            };
            worksheet.getCell(`D${startRow}`).alignment = {
              horizontal: "right",
              vertical: "middle",
            };
            for (let row = 2; row <= endRow; row++) {
              worksheet.getCell(`C${row}`).alignment = {
                horizontal: "right",
                vertical: "middle",
              };
            }
          });
          const totalCurrency = Object.entries(salesData.total)
            .map(([currency, { total, symbol }]) => `${symbol} ${total}`)
            .join("\n");

          worksheet
            .addRow({
              customerName: "",
              invoiceNumber: "",
              invoiceTotal: "",
              totalGrandTotal: totalCurrency,
            })
            .eachCell({ includeEmpty: true }, (cell) => {
              cell.alignment = { horizontal: "right", vertical: "middle" };
              cell.alignment.wrapText = true;
            });
        }
        data = salesData;
        break;
      case "profit":
        const allPayment = await payment.find($match);
        const profitAmount = allPayment.reduce((sum, item) => {
          return sum + item.amount_in_inr;
        }, 0);

        const total = "₹ " + (profitAmount - lossAmount - totalGst);
        const profitReport = {
          profit: "₹ " + parseFloat(profitAmount).toFixed(2),
          loss: "₹ " + parseFloat(lossAmount).toFixed(2),
          taxes: "₹ " + parseFloat(totalGst).toFixed(2),
          total,
        };

        if (isExcel == 1) {
          worksheet.columns = [
            { header: "Profit", key: "profit", width: 25 },
            { header: "Expenses", key: "loss", width: 25 },
            { header: "Taxes", key: "taxes", width: 25 },
            { header: "Net Profit", key: "total", width: 25 },
          ];
          worksheet.addRow(profitReport);
          worksheet.getRow(2).alignment = {
            horizontal: "right",
          };
        }
        data = profitReport;
        break;
      case "expenses":
        const AllExpenses = allExpenses.map((item) => {
          return {
            category_name: item.category.category_name,
            amount: "₹ " + item.amount,
          };
        });
        const Expenses = {
          expenses: AllExpenses,
          total: "₹ " + lossAmount,
        };

        if (isExcel == 1) {
          worksheet.columns = [
            { header: "Category", key: "category", width: 25 },
            { header: "Amount", key: "amount", width: 25 },
          ];
          const endRow = worksheet.rowCount;
          Expenses.expenses.forEach((item) => {
            worksheet.addRow({
              category: item.category_name,
              amount: item.amount,
            });
          });
          worksheet.addRow({
            category: "",
            amount: Expenses.total,
          });
          for (let i = 2; i <= worksheet.rowCount; i++) {
            worksheet.getCell(`B${i}`).alignment = {
              horizontal: "right",
              vertical: "middle",
            };
          }
        }
        data = Expenses;
        break;
      case "taxes":
        const taxes = {
          allTax,
          totalGst: `₹ ${totalGst}`,
        };
        if (isExcel == 1) {
          worksheet.columns = [
            { header: "Taxes", key: "allTax", width: 25 },
            { header: "Amount", key: "amount", width: 25 },
          ];
          Object.entries(taxes.allTax).forEach((key, item) => {
            worksheet.addRow({
              allTax: key[0],
              amount: key[1],
            });
          });
          worksheet.addRow({
            category: "",
            amount: taxes.totalGst,
          });
          for (let i = 2; i <= worksheet.rowCount; i++) {
            worksheet.getCell(`B${i}`).alignment = {
              horizontal: "right",
              vertical: "middle",
            };
          }
        }
        data = taxes;
        break;
      default:
        throw new Error("Please select Valid Type");
    }
    if (isExcel == 1) {
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=" + `${type}.xlsx`
      );
      await workbook.xlsx.write(res);
      return res.status(200).end();
    } else {
      return res.status(200).json({ data });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

apicontroller.country = async (req, res) => {
  try {
    const countries = await country.find();
    res.status(200).json({ countries });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

apicontroller.addCountry = async (req, res) => {
  try {
    const data = {
      name: req.body.name,
      code: req.body.code,
    };
    await country.create(data);
    res.status(201).json({ message: "Country Created successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

apicontroller.deleteCountry = async (req, res) => {
  try {
    const _id = req.params.id;
    await country.findByIdAndDelete(_id);
    res.status(200).json({ message: "Country Deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
apicontroller.dashboardData = async (req, res) => {
  try {
    let data;
    const dateFrom = req.query.date_from;
    const dateTo = req.query.date_to;

    const endMonth = moment().month() + 1 < 4;
    const currentYear = endMonth
      ? moment().subtract(1, "year").year()
      : moment().year();
    const nextYear = currentYear + 1;

    const graterThan = new Date(
      moment(dateFrom ? dateFrom : [currentYear, 3, 1])
        .startOf("day")
        .toISOString()
    );
    const lessThan = new Date(
      moment(dateTo ? dateTo : [nextYear, 3, 1])
        .endOf("day")
        .toISOString()
    );

    const allInvoice = await invoice.aggregate([
      {
        $match: {
          $expr: {
            $and: [
              { $eq: ["$deleted_at", "null"] },
              {
                $gt: ["$created_at", graterThan],
              },
              {
                $lt: ["$created_at", lessThan],
              },
            ],
          },
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
          as: "currencyDetails",
        },
      },
      {
        $unwind: "$currencyDetails",
      },
      {
        $project: {
          _id: 1,
          currencyDetails: "$currencyDetails",
          invoice_number: 1,
          cgst: 1,
          sgst: 1,
          igst: 1,
          amount_due: 1,
          grand_total: 1,
          projects: "$projects",
        },
      },
    ]);

    const result = allInvoice.reduce((acc, item) => {
      const key = item.currencyDetails.code;
      acc[key] = acc[key] || [];
      acc[key].push(item);
      return acc;
    }, {});
    const formattedCurrency = (amount, code = true) => {
      return amount.toLocaleString(code ? "en-IN" : "en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    };
    const totalSales = Object.entries(result).reduce((acc, [key, group]) => {
      const total = group.reduce(
        (groupTotal, item) => groupTotal + item.grand_total,
        0
      );
      const isCurrency = group[0].currencyDetails.symbol == "₹";
      acc[key] = {
        total: formattedCurrency(total, isCurrency),
        symbol: group[0].currencyDetails.symbol,
      };
      return acc;
    }, {});

    const totalDueAmount = Object.entries(result).reduce(
      (acc, [key, group]) => {
        const total = group.reduce(
          (groupTotal, item) => groupTotal + item.amount_due,
          0
        );

        if (total) {
          const isCurrency = group[0].currencyDetails.symbol == "₹";
          acc[key] = {
            total: formattedCurrency(total, isCurrency),
            symbol: group[0].currencyDetails.symbol,
          };
        }
        return acc;
      },
      {}
    );

    const monthlyPayments = await payment.aggregate([
      {
        $match: {
          $expr: {
            $and: [
              { $eq: ["$deleted_at", "null"] },
              {
                $gt: ["$created_at", graterThan],
              },
              {
                $lt: ["$created_at", lessThan],
              },
            ],
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$created_at" },
            month: { $month: "$created_at" },
          },
          totalAmount: { $sum: "$amount_in_inr" },
        },
      },
    ]);

    const fillMissingLastYearsMonths = (monthlysArray) => {
      const filledArray = [];
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear() - 1;
      const currentMonth = currentDate.getMonth() + 1; // Months are 0-indexed in JavaScript

      // Define the start and end months for the desired period (April of last year to March of this year)
      const startMonth = 3; // April of last year
      const endMonth = 2; // March of this year

      for (let i = 0; i < 12; i++) {
        let targetMonth = (currentMonth + i + startMonth) % 12; // Use modulo to handle wrapping around to the next year
        let targetYear = currentYear;

        if (targetMonth === 0) {
          // Adjust for JavaScript's 0-indexed months
          targetMonth = 12;
          targetYear--;
        }

        const foundMonth = monthlysArray.find(
          (item) =>
            item._id.year === targetYear && item._id.month === targetMonth
        );

        filledArray.push(foundMonth ? foundMonth.totalAmount : 0);
      }

      return filledArray;
    };

    const fillMissingMonths = (financialData) => {
      const filledArray = Array(12).fill(0);

      financialData.forEach((item) => {
        const { month } = item._id;
        const index = (month + 8) % 12;
        filledArray[index] = item.totalAmount.toFixed(2);
      });

      return filledArray;
    };

    const monthlyPaymentsArray = monthlyPayments.map((item) => item);

    const monthlyIncomeArray = fillMissingMonths(monthlyPaymentsArray);

    const monthlyExpenses = await expenses.aggregate([
      {
        $match: {
          $expr: {
            $and: [
              { $eq: ["$deleted_at", "null"] },
              {
                $gt: ["$created_at", graterThan],
              },
              {
                $lt: ["$created_at", lessThan],
              },
            ],
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$created_at" },
            month: { $month: "$created_at" },
          },
          totalAmount: { $sum: { $multiply: ["$amount", -1] } },
        },
      },
    ]);
    const expensesArray = monthlyExpenses.map((item) => item);
    const monthlyExpensesArray = fillMissingMonths(expensesArray);
    const lastYearPayments = fillMissingLastYearsMonths(monthlyPaymentsArray);
    const lastYeayExpenses = fillMissingLastYearsMonths(expensesArray);
    const lastYearTotalIncome = lastYearPayments.reduce(
      (accumulator, currentValue) => accumulator + currentValue,
      0
    );
    const totalIncome = monthlyIncomeArray.reduce(
      (accumulator, currentValue) => accumulator + currentValue,
      0
    );
    const totalExpense = monthlyExpensesArray.reduce(
      (accumulator, currentValue) => accumulator + Math.abs(currentValue),
      0
    );
    const lastYearTotalExpenses = lastYeayExpenses.reduce(
      (accumulator, currentValue) => accumulator + Math.abs(currentValue),
      0
    );

    let gainFromLastYear = 0;
    if (totalIncome && lastYearTotalIncome) {
      gainFromLastYear = (
        ((totalIncome - lastYearTotalIncome) / lastYearTotalIncome) *
        100
      ).toFixed(2);
    }

    let expenseFromLastYear = 0;
    if (totalExpense && lastYearTotalExpenses) {
      expenseFromLastYear = (
        ((totalExpense - lastYearTotalExpenses) / lastYearTotalExpenses) *
        100
      ).toFixed(2);
    }

    let profileReportArray = [];
    for (
      let i = 0;
      i < Math.max(monthlyIncomeArray.length, monthlyExpensesArray.length);
      i++
    ) {
      let incomeArray =
        i < monthlyIncomeArray.length ? monthlyIncomeArray[i] : 0;
      let expenseArray =
        i < monthlyExpensesArray.length ? Math.abs(monthlyExpensesArray[i]) : 0;
      profileReportArray.push(incomeArray - expenseArray);
    }

    let lastYearProfileReportArray = [];
    for (
      let i = 0;
      i < Math.max(lastYearPayments.length, lastYeayExpenses.length);
      i++
    ) {
      let incomeArray = i < lastYearPayments.length ? lastYearPayments[i] : 0;
      let expenseArray =
        i < lastYeayExpenses.length ? Math.abs(lastYeayExpenses[i]) : 0;
      lastYearProfileReportArray.push(incomeArray - expenseArray);
    }

    const thisYearProfit = profileReportArray.reduce(
      (accumulator, currentValue) => accumulator + currentValue,
      0
    );
    const lastYearProfit = lastYearProfileReportArray.reduce(
      (accumulator, currentValue) => accumulator + Math.abs(currentValue),
      0
    );

    let profitFromLastYear = 0;
    if (thisYearProfit && lastYearProfit) {
      profitFromLastYear = (
        ((thisYearProfit - lastYearProfit) / lastYearProfit) *
        100
      ).toFixed(2);
    }
    const formattedExpense = formattedCurrency(totalExpense);
    const formattedProfit = formattedCurrency(thisYearProfit);
    const formattedIncome = formattedCurrency(parseFloat(totalIncome));

    data = {
      totalSales,
      totalProfit: formattedProfit,
      totalDueAmount,
      profitFromLastYear,
      profileReportArray,
      totalExpense: formattedExpense,
      expenseFromLastYear,
      gainFromLastYear,
      totalIncome: formattedIncome,
      monthlyIncomeArray,
      monthlyExpensesArray,
    };

    return res.status(200).json({ data });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = apicontroller;
