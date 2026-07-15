const Inventory = require("../models/inventoryModel");

const addInventory = async (req, res) => {
  const { name, category, stock, threshold, unit } = req.body;
  try {
    if (!name || !category || stock == null || threshold == null || !unit) {
      return res.status(400).json({
        message: "All filelds are required",
      });
    }
    const existingInventory = await Inventory.findOne({
      name: name.toLowerCase(),
      category: category,
    });

    if (existingInventory) {
      return res.status(400).json({
        message: "Item already exists. Update Stock, if needed.",
        inventory,
      });
    }

    const inventory = await Inventory.create({
      name,
      category,
      stock,
      threshold,
      unit,
    });

    return res.status(201).json({
      message: "Item added sucessfully",
      inventory,
    });
  } catch (error) {
    return res.status(500).json({
      message: message.error,
    });
  }
};

const getInventory = async (req, res) => {
  const { category } = req.query;
  let inventory;
  try {
    if (category) {
      inventory = await Inventory.find({ category });

      if (!inventory.length > 0) {
        return res.status(404).json({
          message: "Category does not exist.",
        });
      } else {
        return res.status(201).json({
          inventory,
        });
      }
    } else {
      inventory = await Inventory.find();
      return res.status(201).json({
        inventory,
      });
      if (!inventory) {
        return res.status(404).json({
          message: "No items in inventory.",
        });
      }
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateInventory = async (req, res) => {
  const { id } = req.params;
  const { stock, threshold, isAvailable } = req.body;

  try {
    const inventory = await Inventory.findById(id);
    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Item does not exist",
      });
    }

    if (stock !== undefined) {
      inventory.stock = stock;
    }
    if (threshold !== undefined) {
      inventory.threshold = threshold;
    }
    if (isAvailable !== undefined) {
      inventory.isAvailable = isAvailable;
    }
    await inventory.save();

    return res.status(201).json({
      message: "Item updated successfully.",
      inventory,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { addInventory, getInventory, updateInventory };
