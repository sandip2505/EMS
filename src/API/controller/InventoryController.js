const session = require("express-session");
const moment = require("moment");
const mongoose = require("mongoose");
const express = require("express");
const ejs = require("ejs");
const BSON = require("bson");
const Helper = require("../../utils/helper");
const helper = new Helper();
const MasterInventory = require("../../model/masterInventory");
const cpuInventory = require("../../model/cpuMasterInventory");

const fs = require("fs");

const path = require("path");

const apicontroller = {};

apicontroller.AddInventory = async (req, res) => {
  try {
    const {
      company_name,
      company_email,
      company_telephone,
      country_code,
      state,
      city,
      address_street_1,
      address_street_2,
      zip,
      gstin,
      ac_no,
      ifsc_code,
      swift_code,
      cgst,
      sgst,
      igst,
      pan_no,
      cin,
    } = req.body;

    const newInventory = await inventory.create({
      company_name,
    });

    res.status(201).json({ InventoryData: newInventory });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

apicontroller.getInventory = async (req, res) => {
  try {
    const inventoryData = await inventory
      .find({ deleted_at: null })
      .sort({ createdAt: -1 });
    res.status(200).json({ inventoryData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

apicontroller.UpdateInventory = async (req, res) => {
  try {
    const _id = req.params.id;
    const updatedInventory = await inventory.findByIdAndUpdate(
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
        updated_at: new Date(),
      },
      { new: true }
    );

    if (!updatedInventory) {
      return res.status(404).json({ message: "inventory not found" });
    }

    res.json({ updatedInventory });
  } catch (error) {
    console.error("Error updating customer:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

apicontroller.DeleteInventory = async (req, res) => {
  try {
    const _id = req.params.id;
    const updatedInventory = await inventory.findByIdAndUpdate(
      _id,
      {
        deleted_at: new Date(),
      },
      { new: true }
    );

    if (!updatedInventory) {
      return res.status(404).json({ message: "inventory not found" });
    }

    res.json({ message: "inventory deleted successfully" });
  } catch (error) {
    console.error("Error updating customer:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

apicontroller.addInventoryMaster = async (req, res) => {
  try {
    const key = req.body.key.toUpperCase().trim();
      await MasterInventory.create({
        key: key,
        value: req.body.value,
        description: req.body.description,
        icon: req.body.icon,
      });
      res.status(201).json({ message: "Inventory Part added successfully" });
    
    
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

apicontroller.getInventoryMaster = async (req, res) => {
  try {
    const inventory = await MasterInventory.find({ deleted_at: "null" });
    res.status(200).json({ inventory });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
apicontroller.deleteInventoryMaster = async (req, res) => {
  try {
    const id = req.params.id;
    await MasterInventory.findByIdAndUpdate(id, {
      deleted_at: new Date(),
    });
    res.status(200).json({ message: "Item deleted Successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

apicontroller.editInventoryMaster = async (req, res) => {
  try {
    const id = req.params.id;
    const { key, value ,description,icon} = req.body;

    await MasterInventory.findByIdAndUpdate(id, {
      key,
      value,
      description,
      icon,
    });
    res.status(200).json({ message: "Item updated Successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

apicontroller.getEditInventoryMaster = async (req, res) => {
  try {
    const id = req.params.id;
    const MasterInventoryData = await MasterInventory.findOne({ _id: id, deleted_at: "null" });
    res.status(200).json({ MasterInventoryData });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};





apicontroller.AddcpuMasterInventory = async (req, res) => {
  try {
  
    const key = req.body.key.toUpperCase().trim();
  
      await cpuInventory.create({
        key: key,
        value: req.body.value,
        description: req.body.description,
      });
      res.status(201).json({ message: "CPU masterInventory Part added successfully" });
    
  } catch (error) {
    console.error(error);
    
    res.status(400).json({ message: error.message });
  }
};


apicontroller.getcpuMasterInventory = async (req, res) => {
  try {
    const cpuMasterInventoryData = await cpuInventory
      .find({ deleted_at: "null" })
      .sort({ createdAt: -1 });
    res.status(200).json({ cpuMasterInventoryData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
 }


 apicontroller.getcpuData = async (req, res) => {
   try {
     const cpuData = await cpuInventory.aggregate([
       {
         $match: {
           deleted_at: "null"
         }
       },
       {
         $group: {
           _id: "$key",
           data: {
             $push: {
               value: "$value",
               _id: "$_id",
               description: "$description"
             }
           }
         }
       },
       {
         $replaceRoot: {
           newRoot: {
             $arrayToObject: [
               [{
                 k: "$_id",
                 v: "$data"
               }]
             ]
           }
         }
       }
     ]);
 
     res.status(200).json({ cpuData });
   } catch (error) {
     console.error(error);
     res.status(500).json({ error: "Internal Server Error" });
   }
 };
 

apicontroller.geteditcpuMasterInventory = async (req, res) => {
  try {
    const id = req.params.id;
    const cpuMasterInventoryData = await cpuInventory.findOne({ _id: id, deleted_at: "null" });
    res.status(200).json({ cpuMasterInventoryData });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
 }
 apicontroller.editcpuMasterInventory = async (req, res) => {
  try {
    const id = req.params.id;
    const { key, value ,description} = req.body;
    await cpuInventory.findByIdAndUpdate(id, {
      key,
      value,
      description,
    });
    res.status(200).json({ message: "Item updated Successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
 };
 apicontroller.deletecpuMasterInventory = async (req, res) => {
  try {
    const id = req.params.id;
    await cpuInventory.findByIdAndUpdate(id, {
      deleted_at: new Date(),
    });
    res.status(200).json({ message: "Item deleted Successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
 };

 apicontroller.addAssignInventory= async (req, res) => {
  try {
    const { inventory_id, project_id, quantity, uom, rate, cgst, sgst, igst } =
      req.body;
    const newAssignInventory = await assignInventory.create({
      inventory_id,
      project_id,
      quantity,
      uom,
      rate,
      cgst,
      sgst,
      igst,
    });

    res.status(201).json({ AssignInventoryData: newAssignInventory });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}



module.exports = apicontroller;
