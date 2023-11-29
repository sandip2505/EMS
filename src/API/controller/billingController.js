const project = require("../../model/createProject");
const permission = require("../../model/addpermissions");
const Role = require("../../model/roles");
const user = require("../../model/user");
const customer = require("../../model/customer");
const session = require("express-session");
const request = require("request");

const mongoose = require("mongoose");
const express = require("express");
const ejs = require("ejs");
var network = require("network");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const BSON = require("bson");
const axios = require("axios");
const sendUserEmail = require("../../utils/sendemail");
const Helper = require("../../utils/helper");
const helper = new Helper();
const os = require("os");
const pdf = require("html-pdf");
const fs = require("fs");
const moment = require("moment");
const bcrypt = require("bcryptjs");

const path = require("path");
const winston = require("winston");

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

        if (userData[0].roleData[0].role_name === "Admin") {
          res.status(200).json({ userdata, roleData, user_token });
         
        } else {
          res.status(401).json({ Error: "you are unauthorized" });
        }
      } else {
        res.status(401).json({ passwordError: "Incorrect password" });
      }
    }
  } catch (error) {
    console.log("error", error);
  }
};

apicontroller.addCustomer = async (req, res) => {
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
      shipping: {
        name: req.body.shipping.name,
        address_street_1: req.body.shipping.address_street_1,
        address_street_2: req.body.shipping.address_street_2,
        city: req.body.shipping.city,
        state: req.body.shipping.state,
        country_id: req.body.shipping.country_id,
        zip: req.body.shipping.zip,
        phone: req.body.shipping.phone,
        gstin: req.body.shipping.gstin,
      },
    });
    res.status(200).json(customerData);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

apicontroller.getCustomers = async (req, res) => {

  const page = parseInt(req.query.page) || 1;
  const limit = req.query.limit ? parseInt(req.query.limit) : 0;
  const skip = (page - 1) * limit;

  const searchParams = {
    name: { $regex: new RegExp(req.query.name, 'i') },
    contact_name: { $regex: new RegExp(req.query.contact_name, 'i') },
    phone: { $regex: new RegExp(req.query.phone, 'i') },
    deleted_at: "null",
  };

  Object.keys(searchParams).forEach((key) =>
    searchParams[key] === undefined || searchParams[key] === null
      ? delete searchParams[key]
      : {}
  );

  try {
   
    const totalItems = await customer.countDocuments(searchParams);

    const totalPages = Math.ceil(totalItems / limit);

    const customerData = await customer
      .find(searchParams)
      .skip(skip)
      .limit(limit);

      res.json({
      page,
      limit, 
      totalPages, 
      totalItems,
      customerData,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal  Server Error' });
  }

  
};

apicontroller.editCustomers = async (req, res) => {
  const _id = req.params.id;
  const CustomerData = await customer.findOne({ _id: _id });
  res.json({ CustomerData });
};

apicontroller.UpdateCustomers = async (req, res) => {
  try {
    const _id = req.params.id;
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
        shipping: {
          name: req.body.shipping.name,
          address_street_1: req.body.shipping.address_street_1,
          address_street_2: req.body.shipping.address_street_2,
          city: req.body.shipping.city,
          state: req.body.shipping.state,
          country_id: req.body.shipping.country_id,
          zip: req.body.shipping.zip,
          phone: req.body.shipping.phone,
          gstin: req.body.shipping.gstin,
        },
        updated_at: new Date(),
      },
      { new: true }
    );

    if (!updatedCustomer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    console.log("Updated Customer:", updatedCustomer);
    res.json({ updatedCustomer });
  } catch (error) {
    console.error("Error updating customer:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

apicontroller.DeleteCustomers = async (req, res) => {
  const _id = req.params.id;

    const CustomerData = await customer.findByIdAndUpdate(
      _id,
      { deleted_at: new Date() },
      { new: true }
    );
    res.json({CustomerData });
};

apicontroller.MultiDeleteCustomers = async (req, res) => {
  const customer_id = req.body.customer_id;
  const CustomerData = await customer.updateMany(
    { _id: { $in: customer_id } },
    { $set: { deleted_at: Date() } },
    { new: true }
  );
  res.json({ message :'Multiple Data has been deleted', CustomerData });
};

apicontroller.SearchCustomers = async (req, res) => {
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
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

apicontroller.projectslisting = async (req, res) => {
 const projectData = await project.find({ deleted_at: "null" });
  res.json({ projectData });
};

apicontroller.restore = async (req, res) => {
  try {
    const projectData = await customer.updateMany(
      {},
      { $set: { deleted_at: "null" } } 
      );
      
      res.json("Data has been restored");
    } catch (error) {
      console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

apicontroller.getCustomerProjects = async (req, res) => {

  try {
    const customerData = await customer.findOne({ _id: req.params.id });

   const customerProjects = customerData.project_id = customerData.project_id.map((project) =>
      mongoose.Types.ObjectId(project)
    );  
    
    const Projects = await project.find({ _id: customerProjects });
   
    res.json({Projects});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }

};

module.exports = apicontroller;
