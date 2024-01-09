const setting = require("../../model/companySetting");
const Settings = require("../../model/settings");
const logger = require("../../utils/logger");
const PaymentMode = require("../../model/paymentmode");
const session = require("express-session");
const moment = require("moment");
const mongoose = require("mongoose");
const express = require("express");
const ejs = require("ejs");
const BSON = require("bson");
const Helper = require("../../utils/helper");
const helper = new Helper();

const fs = require("fs");

const path = require("path");

const apicontroller = {};

apicontroller.AddSetting = async (req, res) => {
  const user_name = req.user.firstname + " " + req.user.last_name;
  try {
    const _id = req.body._id;
    const existingSetting = await setting.countDocuments();
    if (existingSetting > 0) {
      const updatedSetting = await setting.findOneAndUpdate({ _id }, req.body, {
        new: true,
      });
      logger.info({
        message: `<a href="settings"><span>Company Settings</a> Updated By ${user_name}</span>`,
        meta: { user_id: `${req.user._id}`, type: "Update Company Setting" },
      });
      res.status(200).json({ SettingData: updatedSetting });
    } else {
      const newSetting = await setting.create(req.body);
      res.status(201).json({ SettingData: newSetting });
      logger.info({
        message: `<a href="settings"><span>Company Settings</a> Created By ${user_name}</span>`,
        meta: { user_id: `${req.user._id}`, type: "Update Company Setting" },
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
apicontroller.getSetting = async (req, res) => {
  try {
    let settingData = await setting.findOne();
    let data = settingData;
    res.status(200).json({ settingData: data });
  } catch (error) {
    console.error(error,"------Error------");
    res.status(500).json({ error: err.message });
  }
};

apicontroller.getSettingData = async function (req, res) {
  const key = req.body.key.split(",");
  let logoArray = [];

  for (let i = 0; i < key.length; i++) {
    const settingData = await Settings.find({ key: key[i] }).select(
      "-_id value"
    );
    settingData.map((data) => {
      logoArray.push(data.value);
    });
  }
  return res.json(logoArray);
};

apicontroller.paymentmode = async function (req, res) {
  const paymentmode = await PaymentMode.find();
  return res.json(paymentmode);
};

module.exports = apicontroller;
