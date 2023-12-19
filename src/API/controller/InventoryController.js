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
const inventory = require("../../model/inventoryItem");
const assignInventory = require("../../model/assignInventory");

const fs = require("fs");

const path = require("path");

const apicontroller = {};



apicontroller.addInventoryMaster = async (req, res) => {
  let sess = req.session;
  const user_id = req.user._id;

  try {
    const role_id = req.user.role_id.toString();
    const rolePerm = await helper.checkPermission(role_id, user_id, "View Holidays");

    if (rolePerm.status === true) {
      const { key, value, description, icon } = req.body;

      if (!key || !value || !description || !icon) {
        return res.status(400).json({ message: "Invalid input. Please provide all required fields." });
      }

      const upperCaseKey = key.toUpperCase().trim();
      await MasterInventory.create({
        key: upperCaseKey,
        value,
        description,
        icon,
      });

      console.log("Inventory Part added successfully");
      res.status(201).json({  message: "Inventory Part added successfully" });
    } else {
      res.status(403).json({ status:false, message: "Permission denied." });
    }
  } catch (error) {
    console.error("Error adding inventory part:", error.message);
    res.status(500).json({ message: "Internal server error." });
  }
};


apicontroller.getInventoryMaster = async (req, res) => {
  const user_id = req.user._id;
  const role_id = req.user.role_id.toString();

  try {
    const rolePerm = await helper.checkPermission(role_id, user_id, "View Holidays");

    if (rolePerm.status === true) {
      const inventory = await MasterInventory.find({ deleted_at: "null" });
      res.status(200).json({ inventory });
    } else {
      res.status(403).json({ status: false });
    }
  } catch (error) {
    res.status(500).send(error); 
  }
};

apicontroller.deleteInventoryMaster = async (req, res) => {
  const user_id = req.user._id;
  const role_id = req.user.role_id.toString();

  try {
    const rolePerm = await helper.checkPermission(role_id, user_id, "View Holidays");

    if (rolePerm.status === true) {
      const inventoryItemId = req.params.id;
      await MasterInventory.findByIdAndUpdate(inventoryItemId, {
        deleted_at: new Date(),
      });
      res.status(200).json({ message: "Item deleted successfully" });
    } else {
      res.status(403).json({ status: false, message: "Permission denied." });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error." });
  }
};

apicontroller.editInventoryMaster = async (req, res) => {
  const user_id = req.user._id;
  const role_id = req.user.role_id.toString();

  try {
    const rolePerm = await helper.checkPermission(role_id, user_id, "View Holidays");

    if (rolePerm.status === true) {
      const itemId = req.params.id;
      const { key, value, description, icon } = req.body;
      if (!key || !value || !description || !icon) {
        return res.status(400).json({ message: "Invalid input. Please provide all required fields." });
      }

      await MasterInventory.findByIdAndUpdate(itemId, {
        key,
        value,
        description,
        icon,
      });

      res.status(200).json({ message: "Item updated successfully" });
    } else {
      res.status(403).json({ status: false, message: "Permission denied." });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error." });
  }
};


apicontroller.getEditInventoryMaster = async (req, res) => {
  const user_id = req.user._id;
  const role_id = req.user.role_id.toString();

  try {
    const rolePerm = await helper.checkPermission(role_id, user_id, "View Holidays");

    if (rolePerm.status === true) {
      const itemId = req.params.id;
      const masterInventoryData = await MasterInventory.findOne({ _id: itemId, deleted_at: "null" });
      res.status(200).json({ masterInventoryData });
    } else {
      res.status(403).json({ status: false, message: "Permission denied." });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


apicontroller.AddcpuMasterInventory = async (req, res) => {
  const user_id = req.user._id;
  const role_id = req.user.role_id.toString();

  try {
    const rolePerm = await helper.checkPermission(role_id, user_id, "View Holidays");

    if (rolePerm.status === true) {
      const key = req.body.key.toUpperCase().trim();

      await cpuInventory.create({
        key,
        value: req.body.value,
        description: req.body.description,
      });

      res.status(201).json({ message: "CPU masterInventory Part added successfully" });
    } else {
      res.status(403).json({ status: false, message: "Permission denied." });
    }
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};



apicontroller.getcpuMasterInventory = async (req, res) => {
  const user_id = req.user._id;
  const role_id = req.user.role_id.toString();

  try {
    const rolePerm = await helper.checkPermission(role_id, user_id, "View Holidays");

    if (rolePerm.status === true) {
      const cpuMasterInventoryData = await cpuInventory
        .find({ deleted_at: "null" })
        .sort({ createdAt: -1 });

      res.status(200).json({ cpuMasterInventoryData });
    } else {
      res.status(403).json({ status: false, message: "Permission denied." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};



apicontroller.getcpuData = async (req, res) => {
  const user_id = req.user._id;
  const role_id = req.user.role_id.toString();

  try {
    const rolePerm = await helper.checkPermission(role_id, user_id, "View Holidays");

    if (rolePerm.status === true) {
      const cpuData = await cpuInventory.aggregate([
        {
          $match: {
            deleted_at: "null",
            is_assigned: 0,
          },
        },
        {
          $group: {
            _id: "$key",
            data: {
              $push: {
                value: "$value",
                _id: "$_id",
                description: "$description",
              },
            },
          },
        },
        {
          $replaceRoot: {
            newRoot: {
              $arrayToObject: [
                [
                  {
                    k: "$_id",
                    v: "$data",
                  },
                ],
              ],
            },
          },
        },
      ]);

      res.status(200).json({ cpuData });
    } else {
      res.status(403).json({ status: false, message: "Permission denied." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

 
apicontroller.geteditcpuMasterInventory = async (req, res) => {
  const user_id = req.user._id;
  const role_id = req.user.role_id.toString();

  try {
    const rolePerm = await helper.checkPermission(role_id, user_id, "View Holidays");

    if (rolePerm.status === true) {
      const itemId = req.params.id;
      const cpuMasterInventoryData = await cpuInventory.findOne({ _id: itemId, deleted_at: "null" });

      if (cpuMasterInventoryData) {
        res.status(200).json({ cpuMasterInventoryData });
      } else {
        res.status(404).json({ message: "CPU masterInventory not found." });
      }
    } else {
      res.status(403).json({ status: false, message: "Permission denied." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

apicontroller.editcpuMasterInventory = async (req, res) => {
  const user_id = req.user._id;
  const role_id = req.user.role_id.toString();

  try {
    const rolePerm = await helper.checkPermission(role_id, user_id, "View Holidays");

    if (rolePerm.status === true) {
      const itemId = req.params.id;
      const { value, description } = req.body;
      const key = req.body.key.toUpperCase().trim();
      await cpuInventory.findByIdAndUpdate(itemId, {
        key,
        value,
        description,
      });

      res.status(200).json({ message: "Item updated successfully" });
    } else {
      res.status(403).json({ status: false, message: "Permission denied." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};


apicontroller.deletecpuMasterInventory = async (req, res) => {
  const user_id = req.user._id;
  const role_id = req.user.role_id.toString();

  try {
    const rolePerm = await helper.checkPermission(role_id, user_id, "View Holidays");

    if (rolePerm.status === true) {
      const itemId = req.params.id;

      await cpuInventory.findByIdAndUpdate(itemId, {
        deleted_at: new Date(),
      });

      res.status(200).json({ message: "Item deleted successfully" });
    } else {
      res.status(403).json({ status: false, message: "Permission denied." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};


apicontroller.addInventoryItem = async (req, res) => {
  const user_id = req.user._id;
  const role_id = req.user.role_id.toString();

  try {
    const rolePerm = await helper.checkPermission(role_id, user_id, "View Holidays");

    if (rolePerm.status === true) {
      const { inventoryItemID, name, description, uniqueID, cpu_data ,main_key } = req.body.payload;

      const InventoryItem = await inventory.create({
        inventory_item_id: inventoryItemID,
        name: name,
        description: description,
        unique_id: uniqueID,
        cpu_data: cpu_data,
        main_key: main_key,
      });

      const cpuData = await cpuInventory.updateMany(
        { _id: { $in: cpu_data } },
        { $set: { is_assigned: 1 } }
      );

      res.status(201).json({ message: "InventoryItem Part added successfully" });
    } else {
      res.status(403).json({ status: false, message: "Permission denied." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};


apicontroller.getInventoryItem = async (req, res) => {
  let sess = req.session;
  const user_id = req.user._id;
  const role_id = req.user.role_id.toString();

  helper
    .checkPermission(role_id, user_id, "View Holidays")
    .then(async (rolePerm) => {
      if (rolePerm.status == true) {
        try {
    
          const InventoryItemData = await inventory.aggregate([
            {
              $match: {
                deleted_at: "null",
              },
            },
            {
              $lookup: {
                from: "cpumasterinventories",
                localField: "cpu_data",
                foreignField: "_id",
                as: "CPUData",
              },
            },
            {
              $addFields: {
                cpu_data: {
                  $cond: {
                    if: { $gt: [{ $size: "$cpu_data" }, 0] },
                    then: {
                      $map: {
                        input: "$cpu_data",
                        as: "cpuId",
                        in: {
                          $mergeObjects: [
                            {
                              $arrayElemAt: [
                                {
                                  $filter: {
                                    input: "$CPUData",
                                    cond: { $eq: ["$$this._id", "$$cpuId"] },
                                  },
                                },
                                0,
                              ],
                            },
                            {
                              _id: "$$cpuId",
                            },
                          ],
                        },
                      },
                    },
                    else: "$cpu_data",
                  },
                },
              },
            },
            {
              $project: {
                _id: 1,
                inventory_item_id: 1,
                name: 1,
                description: 1,
                unique_id: 1,
                updated_at: 1,
                deleted_at: 1,
                created_at: 1,
                cpu_data: {
                  $cond: {
                    if: { $gt: [{ $size: "$cpu_data" }, 0] },
                    then: "$cpu_data",
                    else: "$$REMOVE",
                  },
                },
              },
            },
          ]);
          
          res.status(200).json({ InventoryItemData:InventoryItemData });
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: error.message });
        }
      } else {
        res.json({ status: false });
      }
    })
    .catch((error) => {
      res.status(403).send(error);
    });

 }

  apicontroller.getEditInventoryItem = async (req, res) => {
    let sess = req.session;
    const user_id = req.user._id;
    const role_id = req.user.role_id.toString();
  
    helper
      .checkPermission(role_id, user_id, "View Holidays")
      .then(async (rolePerm) => {
        if (rolePerm.status == true) {
          try {
            const inventory_id = req.params.id;
            const InventoryItemData = await inventory.aggregate([
              {
                $match: {
                  _id: mongoose.Types.ObjectId(inventory_id),
                  deleted_at: "null",
                },
              },
              {
                $lookup: {
                  from: "cpumasterinventories",
                  localField: "cpu_data",
                  foreignField: "_id",
                  as: "CPUData",
                },
              },
              {
                $addFields: {
                  cpu_data: {
                    $map: {
                      input: "$cpu_data",
                      as: "cpuId",
                      in: {
                        $mergeObjects: [
                          {
                            $arrayElemAt: [
                              {
                                $filter: {
                                  input: "$CPUData",
                                  cond: { $eq: ["$$this._id", "$$cpuId"] },
                                },
                              },
                              0,
                            ],
                          },
                          {
                            _id: "$$cpuId",
                          },
                        ],
                      },
                    },
                  },
                },
              },
              {
                $project: {
                  _id: 1,
                  inventory_item_id: 1,
                  name: 1,
                  description: 1,
                  unique_id: 1,
                  updated_at: 1,
                  deleted_at: 1,
                  created_at: 1,
                  cpu_data: 1,
                },
              },
            ]);
          if (InventoryItemData.length > 0) {
            res.status(200).json({ InventoryItemData:InventoryItemData });
          } else {
            res.status(200).json({ message: "No data found" });
          }
      
            // const id = req.params.id;
            // const InventoryItemData = await inventory.findOne({ _id: id, deleted_at: "null" });
            // res.status(200).json({ InventoryItemData });
          } catch (error) {
            res.status(400).json({ message: error.message });
          }
        } else {
          res.json({ status: false });
        }
      })
      .catch((error) => {
        res.status(403).send(error);
      });

  }

  apicontroller.editInventoryItem = async (req, res) => {
    const user_id = req.user._id;
    const role_id = req.user.role_id.toString();
  
    try {
      const rolePerm = await helper.checkPermission(role_id, user_id, "View Holidays");
  
      if (rolePerm.status === true) {
        const id = req.params.id;
        const oldCpuData = await inventory.findOne({ _id: id  });

        if (oldCpuData.cpu_data.length > 0) {
          await revertAssignCpuData(oldCpuData.cpu_data);
        }
  
        const { inventoryItemID, name, description, uniqueID, cpu_data } = req.body.payload;

      console.log(cpu_data,"cpu_data56s6a54s5a4s65a4")
        await updateInventoryItem(id, inventoryItemID, name, description, uniqueID, cpu_data);
        if (cpu_data) {
          await assignCpuData(cpu_data);
        }
  
        res.status(200).json({ message: "Item updated Successfully" });
      } else {
        res.json({ status: false });
      }
    } catch (error) {
      console.error(error);
      res.status(403).send(error.message);
    }
  };
  
  async function revertAssignCpuData(oldCpuData) {
   const RevertedAssignData = await cpuInventory.updateMany({ _id: { $in: oldCpuData } }, { $set: { is_assigned: 0 } });
    console.log(RevertedAssignData,"Reverted AssignCpuData");
  }
  
  async function updateInventoryItem(id, inventoryItemID, name, description, uniqueID, cpu_data) {
   const updateInventoryItem= await inventory.findByIdAndUpdate(id, {
      inventory_item_id: inventoryItemID,
      name,
      description,
      unique_id: uniqueID,
      cpu_data,
    });
    console.log(updateInventoryItem,"Updated InventoryItem");
  }
  
  async function assignCpuData(cpu_data) {
    console.log(cpu_data,"assignCpuData cpu_data")
   const AssignCpuData= await cpuInventory.updateMany({ _id: { $in: cpu_data } }, { $set: { is_assigned: 1 } });
    console.log(AssignCpuData,"Assigned CpuData");
  }
  

  apicontroller.deleteInventoryItem = async (req, res) => {
    let sess = req.session;
    const user_id = req.user._id;
    const role_id = req.user.role_id.toString();
  
    helper
      .checkPermission(role_id, user_id, "View Holidays")
      .then(async (rolePerm) => {
        if (rolePerm.status == true) {
          try {
            const InventoryItemData = await inventory.findOne({ _id: req.params.id });
            console.log(InventoryItemData.cpu_data,"InventoryItemData")
            if (InventoryItemData.cpu_data.length > 0) {
              await revertAssignCpuData(InventoryItemData.cpu_data);
            }
            const id = req.params.id;
            await inventory.findByIdAndUpdate(id, {
              deleted_at: new Date(),
            });
            res.status(200).json({ message: "Item deleted Successfully" });
          } catch (error) {
            res.status(400).json({ message: error.message });
          }
        } else {
          res.json({ status: false });
        }
      })
      .catch((error) => {
        res.status(403).send(error);
      });
  };

  apicontroller.mainInventoryItem = async (req, res) => {
    try {
      const { _id: user_id, role_id } = req.user;
  
      const rolePerm = await helper.checkPermission(role_id.toString(), user_id, "View Holidays");
  
      if (rolePerm.status) {
        const mainInventoryItem = await inventory.find({ deleted_at: "null" });

        // Group the data by main_key
        const groupedData = mainInventoryItem.reduce((acc, item) => {
          const key = item.main_key;
          if (!acc[key]) {
            acc[key] = [];
          }
          acc[key].push(item);
          return acc;
        }, {});
        
        // Convert the grouped data into an array of objects
        const groupedArray = Object.entries(groupedData).map(([key, value]) => ({
          [key]: value,
        }));
        
        res.status(200).json({ mainInventoryItem: groupedArray });
        
        
      } else {
        res.json({ status: false, message: "Permission denied." });
      }
    } catch (error) {
      res.status(403).send(error.message);
    }
  }

  apicontroller.getInventoryItemData = async (req, res) => {
    let sess = req.session;
    const user_id = req.user._id;
    const role_id = req.user.role_id.toString();
  
    helper
      .checkPermission(role_id, user_id, "View Holidays")
      .then(async (rolePerm) => {
        if (rolePerm.status == true) {
          try {
            // const inventory_id = req.params.id;
            // const InventoryItemData = await inventory.aggregate([
            //   {
            //     $match: {
            //       _id: mongoose.Types.ObjectId(inventory_id),
            //       deleted_at: "null",
            //     },
            //   },
            //   {
            //     $lookup: {
            //       from: "cpumasterinventories",
            //       localField: "cpu_data",
            //       foreignField: "_id",
            //       as: "CPUData",
            //     },
            //   },
            //   {
            //     $addFields: {
            //       cpu_data: {
            //         $map: {
            //           input: "$cpu_data",
            //           as: "cpuId",
            //           in: {
            //             $mergeObjects: [
            //               {
            //                 $arrayElemAt: [
            //                   {
            //                     $filter: {
            //                       input: "$CPUData",
            //                       cond: { $eq: ["$$this._id", "$$cpuId"] },
            //                     },
            //                   },
            //                   0,
            //                 ],
            //               },
            //               {
            //                 _id: "$$cpuId",
            //               },
            //             ],
            //           },
            //         },
            //       },
            //     },
            //   },
            //   {
            //     $project: {
            //       _id: 1,
            //       inventory_item_id: 1,
            //       name: 1,
            //       description: 1,
            //       unique_id: 1,
            //       updated_at: 1,
            //       deleted_at: 1,
            //       created_at: 1,
            //       cpu_data: 1,
            //     },
            //   },
            // ]);
          
            // res.status(200).json({ InventoryItemData:InventoryItemData });
      
            const id = req.params.id;
            const InventoryItemData = await inventory.find({ _id: id, deleted_at: "null" });
            res.status(200).json({ InventoryItemData });
          } catch (error) {
            res.status(400).json({ message: error.message });
          }
        } else {
          res.json({ status: false });
        }
      })
      .catch((error) => {
        res.status(403).send(error);
      });

  }


  apicontroller.addAssignInventory = async (req, res) => {
    const user_id = req.user._id;
    const role_id = req.user.role_id.toString();
  
    try {
      const rolePerm = await helper.checkPermission(role_id, user_id, "View Holidays");
  
      if (rolePerm.status === true) {
        const {user_id, inventoryItem_id  } = req.body;
  
        const newAssignInventory = await assignInventory.create({
          user_id,
          inventoryItem_id,
        });
        const InventoryItemData = await inventory.updateMany( { _id: { $in: inventoryItem_id } }, { $set: { is_userAssigned: 1 } } );
       
        res.status(201).json({ AssignInventoryData: newAssignInventory });
      } else {
        res.status(403).json({ status: false, message: "Permission denied." });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  };

  apicontroller.getAssignInventory = async (req, res) => {
    const user_id = req.user._id;
    const role_id = req.user.role_id.toString();
  
    try {
      const rolePerm = await helper.checkPermission(role_id, user_id, "View Holidays");
  
      if (rolePerm.status === true) {
        const AssignInventoryData = await assignInventory.find({ deleted_at: "null" }).populate("inventoryItem_id").populate("user_id");
        res.status(200).json({ AssignInventoryData });
      } else {
        res.status(403).json({ status: false, message: "Permission denied." });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  }

module.exports = apicontroller;
