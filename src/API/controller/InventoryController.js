const session = require("express-session");
const mongoose = require("mongoose");
const express = require("express");
const Helper = require("../../utils/helper");
const helper = new Helper();
const MasterInventory = require("../../model/masterInventory");
const cpuInventory = require("../../model/cpuMasterInventory");
const inventory = require("../../model/inventoryItem");
const assignInventory = require("../../model/assignInventory");
const user = require("../../model/user");

const apicontroller = {};


apicontroller.addInventoryMaster = async (req, res) => {
  let sess = req.session;
  const user_id = req.user._id;

  try {
    const role_id = req.user.role_id.toString();
    const rolePerm = await helper.checkPermission(role_id, user_id, "Add Master Inventories");

    if (rolePerm.status) {
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
      res.status(201).json({ message: "Inventory Part added successfully" });
    } else {
      res.status(403).json({ status: false, message: "Permission denied." });
    }
  } catch (error) {
    console.error("Error adding inventory part:", error.message);
    res.status(500).json({ message: error.message });
  }
};

apicontroller.getInventoryMaster = async (req, res) => {
  const user_id = req.user._id;
  const role_id = req.user.role_id.toString();

  try {
    const rolePerm = await helper.checkPermission(role_id, user_id, "View Master Inventories");

    if (rolePerm.status) {
      let query = { deleted_at: "null" };

      // Check if there is a search query in the request
      if (req.query.search) {
        const searchRegex = new RegExp(req.query.search, 'i');
        query = {
          ...query,
          $or: [
            { key: searchRegex },
            { value: searchRegex },
            { description: searchRegex },
          ],
        };
      }
      // Pagination options
      const page = req.query.page ? parseInt(req.query.page) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit) : 10;
      const skip = (page - 1) * limit;
      const inventory = await MasterInventory.find(query)
        .skip(skip)
        .limit(limit);
      const total = await MasterInventory.countDocuments(query);
      const totalPages = Math.ceil(total / limit);
      totalData = await MasterInventory.find({ deleted_at: "null" })
      res.status(200).json({ totalData:totalData.length, totalPages, page, limit, inventory });
    } else {
      res.status(403).json({ status: false });
    }
  } catch (error) {
    console.error("Error fetching inventory data:", error.message);
    res.status(500).json(error.message);
  }
};

apicontroller.deleteInventoryMaster = async (req, res) => {
  const user_id = req.user._id;
  const role_id = req.user.role_id.toString();

  try {
    const rolePerm = await helper.checkPermission(role_id, user_id, "Delete Master Inventories");

    if (rolePerm.status) {
      const inventoryItemId = req.params.id;
      await MasterInventory.findByIdAndUpdate(inventoryItemId, {
        deleted_at: new Date(),
      });
      res.status(200).json({ message: "Item deleted successfully" });
    } else {
      res.status(403).json({ status: false, message: "Permission denied." });
    }
  } catch (error) {
    console.error("Error deleting inventory item:", error.message);
    res.status(500).json({ message: error.message });
  }
};

apicontroller.editInventoryMaster = async (req, res) => {
  const user_id = req.user._id;
  const role_id = req.user.role_id.toString();

  try {
    const rolePerm = await helper.checkPermission(role_id, user_id, "Update Master Inventories");

    if (rolePerm.status) {
      const itemId = req.params.id;
      const { key, value, description, icon } = req.body;
      if (!key || !value || !description) {
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
    console.error("Error updating inventory item:", error.message);
    res.status(500).json({ message: error.message });
  }
};

apicontroller.getEditInventoryMaster = async (req, res) => {
  const user_id = req.user._id;
  const role_id = req.user.role_id.toString();

  try {
    const rolePerm = await helper.checkPermission(role_id, user_id, "Update Master Inventories");

    if (rolePerm.status) {
      const itemId = req.params.id;
      const masterInventoryData = await MasterInventory.findOne({ _id: itemId, deleted_at: "null" });

      if (!masterInventoryData) {
        return res.status(404).json({ status: false, message: "Item not found." });
      }
      res.status(200).json({ masterInventoryData });
    } else {
      res.status(403).json({ status: false, message: "Permission denied." });
    }
  } catch (error) {
    console.error("Error fetching inventory itemBy id:", error.message);
    res.status(500).json({ message: error.message });
  }
};

apicontroller.AddcpuMasterInventory = async (req, res) => {
  const user_id = req.user._id;
  const role_id = req.user.role_id.toString();

  try {
    const rolePerm = await helper.checkPermission(role_id, user_id, "Add CPU master Item");

    if (rolePerm.status) {
      const { value, description } = req.body;
      const key = req.body.key.toUpperCase().trim();
      if (!key || !value || !description) {
        return res.status(400).json({ message: "Invalid input. Please provide all required fields." });
      }
      await cpuInventory.create({
        key,
        value: value,
        description: description,
      });

      res.status(201).json({ message: "CPU masterInventory Part added successfully" });
    } else {
      res.status(403).json({ status: false, message: "Permission denied." });
    }
  } catch (error) {
    console.error("Error adding CPU masterInventory part:", error.message);
    res.status(400).json({ message: error.message });
  }
};

apicontroller.getcpuMasterInventory = async (req, res) => {
  const user_id = req.user._id;
  const role_id = req.user.role_id.toString();


  try {
    const rolePerm = await helper.checkPermission(role_id, user_id, "View CPU master Item");

    if (rolePerm.status) {
      let query = { deleted_at: "null" };

      if (req.query.search) {
        const searchRegex = new RegExp(req.query.search, 'i');
        query = {
          ...query,
          $or: [
            { key: searchRegex },
            { value: searchRegex },
            { description: searchRegex },
          ],
        };
      }
      // Pagination options
      const page = req.query.page ? parseInt(req.query.page) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit) : 10;
      const skip = (page - 1) * limit;
      const cpuMasterInventoryData = await cpuInventory
        .find(query)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit);
      const total = await cpuInventory.countDocuments(query);
      const totalPages = Math.ceil(total / limit);
      const CPUTotal=await cpuInventory.find({deleted_at:"null"})
      res.status(200).json({ totalData :CPUTotal.length ,totalPages, page, limit, cpuMasterInventoryData });
    } else {
      res.status(403).json({ status: false, message: "Permission denied." });
    }
  } catch (error) {
    console.error("Error fetching CPU masterInventory data:", error.message);
    res.status(500).json({ error: error.message });
  }
};

apicontroller.getcpuData = async (req, res) => {
  const user_id = req.user._id;
  const role_id = req.user.role_id.toString();

  try {
    const rolePerm = await helper.checkPermission(role_id, user_id, "View CPU master Item");

    if (rolePerm.status) {
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
    console.error("Error fetching CPU data:", error.message);
    res.status(500).json({ error: error.message });
  }
};

apicontroller.geteditcpuMasterInventory = async (req, res) => {
  const user_id = req.user._id;
  const role_id = req.user.role_id.toString();

  try {
    const rolePerm = await helper.checkPermission(role_id, user_id, "Update CPU master Item");

    if (rolePerm.status) {
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
    console.error("Error fetching CPU masterInventory item:", error.message);
    res.status(500).json({ error: error.message });
  }
};

apicontroller.editcpuMasterInventory = async (req, res) => {
  const user_id = req.user._id;
  const role_id = req.user.role_id.toString();

  try {
    const rolePerm = await helper.checkPermission(role_id, user_id, "Update CPU master Item");

    if (rolePerm.status) {
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
    console.error("Error:  CPU Inventory Item updated", error.message);
    res.status(500).json({ error: error.message });
  }
};

apicontroller.deletecpuMasterInventory = async (req, res) => {
  const user_id = req.user._id;
  const role_id = req.user.role_id.toString();

  try {
    const rolePerm = await helper.checkPermission(role_id, user_id, "Delete CPU master Item");

    if (rolePerm.status) {
      const itemId = req.params.id;

      await cpuInventory.findByIdAndUpdate(itemId, {
        deleted_at: new Date(),
      });

      res.status(200).json({ message: "Item deleted successfully" });
    } else {
      res.status(403).json({ status: false, message: "Permission denied." });
    }
  } catch (error) {
    console.error("Error deleting CPU masterInventory item:", error.message);
    res.status(500).json({ error: error.message });
  }
};

apicontroller.addInventoryItem = async (req, res) => {
  const user_id = req.user._id;
  const role_id = req.user.role_id.toString();

  try {
    const rolePerm = await helper.checkPermission(role_id, user_id, "Add Creation of Inventories");

    if (rolePerm.status) {
      const { inventoryItemID, name, description, uniqueID, cpu_data, main_key } = req.body.payload;

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
    console.error("Error adding InventoryItem part:", error.message);
    res.status(500).json({ error: error.message });
  }
};

apicontroller.getInventoryItem = async (req, res) => {
  let sess = req.session;
  const user_id = req.user._id;
  const role_id = req.user.role_id.toString();

  helper
    .checkPermission(role_id, user_id, "View Creation of Inventories")
    .then(async (rolePerm) => {
      if (rolePerm.status) {


        try {
          const searchString = req.query.search;
          const regexPattern = new RegExp(searchString, 'i');
          // Pagination options
          const page = req.query.page ? parseInt(req.query.page) : 1;
          const limit = req.query.limit ? parseInt(req.query.limit) : 10;
          const skip = (page - 1) * limit;
          const InventoryItemData = await inventory.aggregate([
            {
              $match: {
                $and: [
                  { deleted_at: "null" },
                  {
                    $or: [
                      { name: { $regex: regexPattern } },
                      { description: { $regex: regexPattern } },
                      { unique_id: { $regex: regexPattern } },
                    ],
                  },
                ],
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
                is_userAssigned: 1,
                cpu_data: {
                  $cond: {
                    if: { $gt: [{ $size: "$cpu_data" }, 0] },
                    then: "$cpu_data",
                    else: "$$REMOVE",
                  },
                },
              },
            },
            { $skip: skip },
            { $limit: limit },
          ]);
          const total = await inventory.countDocuments(regexPattern);
          const totalPages = Math.ceil(total / limit);
         const totalData = await inventory.find({ deleted_at: "null" })
          res.status(200).json({ totalData:totalData.length, totalPages, limit, page, InventoryItemData: InventoryItemData });
        } catch (error) {
          console.error("Error fetching InventoryItem data:", error.message);
          res.status(500).json({ error: error.message });
        }
      } else {
        res.json({ status: false });
      }
    })
    .catch((error) => {
      console.error("Error fetching InventoryItem data:", error.message);
      res.status(403).json(error.message);
    });

}

apicontroller.getEditInventoryItem = async (req, res) => {
  let sess = req.session;
  const user_id = req.user._id;
  const role_id = req.user.role_id.toString();

  helper
    .checkPermission(role_id, user_id, "Update Creation of Inventories")
    .then(async (rolePerm) => {
      if (rolePerm.status) {
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
                main_key: 1,
                updated_at: 1,
                deleted_at: 1,
                created_at: 1,
                cpu_data: 1,
              },
            },
          ]);
          if (InventoryItemData.length > 0) {
            res.status(200).json({ InventoryItemData: InventoryItemData });
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
        res.json({ status: false, message: "Permission denied." });
      }
    })
    .catch((error) => {
      res.status(403).json(error);
    });

}

apicontroller.editInventoryItem = async (req, res) => {
  const user_id = req.user._id;
  const role_id = req.user.role_id.toString();

  try {
    const rolePerm = await helper.checkPermission(role_id, user_id, "Update Creation of Inventories");

    if (rolePerm.status) {
      const id = req.params.id;
      const oldCpuData = await inventory.findOne({ _id: id });

      if (oldCpuData.cpu_data.length > 0) {
        await revertAssignCpuData(oldCpuData.cpu_data);
      }

      const { inventoryItemID, name, description, uniqueID, cpu_data } = req.body.payload;

      await updateInventoryItem(id, inventoryItemID, name, description, uniqueID, cpu_data);
      if (cpu_data) {
        await assignCpuData(cpu_data);
      }

      res.status(200).json({ message: "Item updated Successfully" });
    } else {
      res.json({ status: false, message: "Permission denied." });
    }
  } catch (error) {
    console.error("Error updating InventoryItem item:", error.message);
    res.status(403).json(error.message);
  }
};

async function revertAssignCpuData(oldCpuData) {
  const RevertedAssignData = await cpuInventory.updateMany({ _id: { $in: oldCpuData } }, { $set: { is_assigned: 0 } });
}

async function updateInventoryItem(id, inventoryItemID, name, description, uniqueID, cpu_data) {
  const updateInventoryItem = await inventory.findByIdAndUpdate(id, {
    inventory_item_id: inventoryItemID,
    name,
    description,
    unique_id: uniqueID,
    cpu_data,
  });
}

async function assignCpuData(cpu_data) {
  const AssignCpuData = await cpuInventory.updateMany({ _id: { $in: cpu_data } }, { $set: { is_assigned: 1 } });
}

apicontroller.deleteInventoryItem = async (req, res) => {
  let sess = req.session;
  const user_id = req.user._id;
  const role_id = req.user.role_id.toString();

  helper
    .checkPermission(role_id, user_id, "Delete Creation of Inventories")
    .then(async (rolePerm) => {
      if (rolePerm.status) {
        try {
          const InventoryItemData = await inventory.findOne({ _id: req.params.id });
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
        res.json({ status: false, message: "Permission denied." });
      }
    })
    .catch((error) => {
      console.error("Error deleting InventoryItem item:", error.message);
      res.status(403).json(error.message);
    });
};

apicontroller.mainInventoryItem = async (req, res) => {
  try {
    const { _id: user_id, role_id } = req.user;

    const rolePerm = await helper.checkPermission(role_id.toString(), user_id, "View Creation of Inventories");

    if (rolePerm.status) {
      const mainInventoryItem = await inventory.find({ deleted_at: "null", is_userAssigned: 0 });

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
    console.error("Error fetching mainInventoryItem data:", error.message);
    res.status(403).json(error.message);
  }
}

apicontroller.getInventoryItemData = async (req, res) => {
  let sess = req.session;
  const user_id = req.user._id;
  const role_id = req.user.role_id.toString();

  helper
    .checkPermission(role_id, user_id, "View Creation of Inventories")
    .then(async (rolePerm) => {
      if (rolePerm.status) {
        try {
          const id = req.params.id;
          const InventoryItemData = await inventory.find({ _id: id, deleted_at: "null" });
          res.status(200).json({ InventoryItemData });
        } catch (error) {
          res.status(400).json({ message: error.message });
        }
      } else {
        res.json({ status: false, message: "Permission denied." });
      }
    })
    .catch((error) => {
      res.status(403).json(error);
    });

}

apicontroller.addAssignInventory = async (req, res) => {
  const user_id = req.user._id;
  const role_id = req.user.role_id.toString();

  try {
    const rolePerm = await helper.checkPermission(role_id, user_id, "Add Assign Inventory");

    if (rolePerm.status) {
      const { user_id, inventoryItem_id } = req.body;

      const newAssignInventory = await assignInventory.create({
        user_id,
        inventoryItem_id,
      });
      const InventoryItemData = await inventory.updateMany({ _id: { $in: inventoryItem_id } }, { $set: { is_userAssigned: 1 } });
      res.status(201).json({ AssignInventoryData: newAssignInventory });
    } else {
      res.status(403).json({ status: false, message: "Permission denied." });
    }
  } catch (error) {
    console.error("Error adding AssignInventory part:", error.message);
    res.status(500).json({ error: error.message });
  }
};

apicontroller.getAssignInventory = async (req, res) => {
  const user_id = req.user._id;
  const role_id = req.user.role_id.toString();

  try {
    const rolePerm = await helper.checkPermission(role_id, user_id, "View Assign Inventory");

    if (rolePerm.status) {
      const searchString = req.query.search;
      const regexPattern = new RegExp(searchString, 'i');
      // Pagination options
      const page = req.query.page ? parseInt(req.query.page) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit) : 10;
      const skip = (page - 1) * limit;
      const AssignInventoryData = await assignInventory.aggregate([

        {
          $lookup: {
            from: "users",
            localField: "user_id",
            foreignField: "_id",
            as: "UserData",
          },
        },
        {
          $lookup: {
            from: "inventoryitems",
            localField: "inventoryItem_id",
            foreignField: "_id",
            as: "InventoryItemData",
          },
        },
        {
          $match: {
            deleted_at: "null",
            $or: [
              { "UserData.user_name": { $regex: regexPattern } },
              { "InventoryItemData.name": { $regex: regexPattern } },
            ],
          },
        },
        {
          $addFields: {
            UserData: {
              $map: {
                input: "$UserData",
                as: "user",
                in: {
                  _id: "$$user._id",
                  emp_code: "$$user.emp_code",
                  firstname: "$$user.firstname",
                  user_name: "$$user.user_name",
                  middle_name: "$$user.middle_name",
                  last_name: "$$user.last_name",
                },
              },
            },
            InventoryItemData: {
              $arrayToObject: {
                $map: {
                  input: "$InventoryItemData",
                  as: "item",
                  in: {
                    k: "$$item.main_key",
                    v: {
                      _id: "$$item._id",
                      name: "$$item.name",
                      description: "$$item.description",
                      unique_id: "$$item.unique_id",
                      main_key: "$$item.main_key",
                    },
                  },
                },
              },
            },
          },
        },
        {
          $project: {
            _id: 1,
            UserData: {
              $cond: {
                if: { $gt: [{ $size: "$UserData" }, 1] },
                then: "$UserData",
                else: { $arrayElemAt: ["$UserData", 0] },
              },
            },
            InventoryItemData: 1,
          },
        },
        { $skip: skip },
        { $limit: limit },
      ]);
      const total = await assignInventory.countDocuments();
      const totalPages = Math.ceil(total / limit);
     const totalData = await assignInventory.find({ deleted_at: "null" })
      res.status(200).json({totalData:totalData.length, totalPages, page, limit, AssignInventoryData });
    } else {
      res.status(403).json({ status: false, message: "Permission denied." });
    }
  } catch (error) {
    console.error("Error fetching AssignInventory data:", error.message);
    res.status(500).json({ error: error.message });
  }
}

apicontroller.editAssignInventory = async (req, res) => {
  const user_id = req.user._id;
  const role_id = req.user.role_id.toString();

  try {
    const rolePerm = await helper.checkPermission(role_id, user_id, "Update Assign Inventory");

    if (rolePerm.status) {
      const id = req.params.id;
      const OldAssignInventory = await assignInventory.findOne({ _id: id });
      const revertAssignInventory = await inventory.updateMany({ _id: { $in: OldAssignInventory.inventoryItem_id } }, { $set: { is_userAssigned: 0 } });

      const { user_id, inventoryItem_id } = req.body;
      await assignInventory.findByIdAndUpdate(id, {
        user_id,
        inventoryItem_id,
      });
      const InventoryItemData = await inventory.updateMany({ _id: { $in: inventoryItem_id } }, { $set: { is_userAssigned: 1 } });

      res.status(200).json({ message: "Item updated Successfully" });
    } else {
      res.json({ status: false, message: "Permission denied." });
    }
  } catch (error) {
    console.error("Error updating AssignInventory item:", error.message);
    res.status(403).json(error.message);
  }
}

apicontroller.getEditAssignInventory = async (req, res) => {
  const user_id = req.user._id;
  const role_id = req.user.role_id.toString();

  try {
    const rolePerm = await helper.checkPermission(role_id, user_id, "Update Assign Inventory");

    if (rolePerm.status) {
      const id = req.params.id;

      const AssignInventoryData = await assignInventory.aggregate([
        {
          $match: {
            _id: mongoose.Types.ObjectId(id),
            deleted_at: "null",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "user_id",
            foreignField: "_id",
            as: "UserData",
          },
        },
        {
          $lookup: {
            from: "inventoryitems",
            localField: "inventoryItem_id",
            foreignField: "_id",
            as: "InventoryItemData",
          },
        },
        {
          $addFields: {
            UserData: {
              $map: {
                input: "$UserData",
                as: "user",
                in: {
                  _id: "$$user._id",
                  emp_code: "$$user.emp_code",
                  firstname: "$$user.firstname",
                  user_name: "$$user.user_name",
                  middle_name: "$$user.middle_name",
                  last_name: "$$user.last_name",
                },
              },
            },
            InventoryItemData: {
              $arrayToObject: {
                $map: {
                  input: "$InventoryItemData",
                  as: "item",
                  in: {
                    k: "$$item.main_key",
                    v: {
                      _id: "$$item._id",
                      name: "$$item.name",
                      description: "$$item.description",
                      unique_id: "$$item.unique_id",
                      main_key: "$$item.main_key",
                    },
                  },
                },
              },
            },
          },
        },
        {
          $project: {
            _id: 1,
            UserData: {
              $cond: {
                if: { $gt: [{ $size: "$UserData" }, 1] },
                then: "$UserData",
                else: { $arrayElemAt: ["$UserData", 0] },
              },
            },
            InventoryItemData: 1,
          },
        },
      ])

      res.status(200).json({ AssignInventoryData });
    } else {
      res.status(401).json({ status: false, message: "Permission denied." });
    }
  } catch (error) {
    console.error('Error fetching AssignInventory item:', error.message);
    res.status(500).json(error.message);
  }
}

apicontroller.deleteAssignInventory = async (req, res) => {
  const user_id = req.user._id;
  const role_id = req.user.role_id.toString();

  try {
    const rolePerm = await helper.checkPermission(role_id, user_id, "Delete Assign Inventory");

    if (rolePerm.status) {
      const id = req.params.id;
      const OldAssignInventory = await assignInventory.findOne({ _id: id });
      const revertAssignInventory = await inventory.updateMany({ _id: { $in: OldAssignInventory.inventoryItem_id } }, { $set: { is_userAssigned: 0 } });
      await assignInventory.findByIdAndUpdate(id, {
        deleted_at: new Date(),
      });

      res.status(200).json({ message: "Item deleted Successfully" });
    } else {
      res.json({ status: false });
    }
  } catch (error) {
    console.error("Error deleting AssignInventory item:", error.message);
    res.status(403).json(error.message);
  }
}

apicontroller.users_list = async (req, res) => {
  try {
    const AssignInventoryData = await assignInventory.find({ deleted_at: { $eq: "null" } });

    const user_id = await Promise.all(AssignInventoryData.map(async (item) => item.user_id));

    const UserData = await user.find(
      { _id: { $nin: user_id }, deleted_at: { $eq: "null" } },
      { firstname: 1, middle_name: 1, last_name: 1, emp_code: 1 }
    );

    res.status(200).json({ UserData });
  } catch (error) {
    console.error('Error fetching users list:', error.message);
    res.status(500).json({ error: error.message });
  }
};




module.exports = apicontroller;
