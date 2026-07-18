const Order = require("../models/orderModel");
const Pizza = require("../models/pizzaModel");
const Inventory = require("../models/inventoryModel");
const placeOrder = async (req, res) => {
  const {
    pizzaId,
    quantity,
    base,
    sauce,
    cheese,
    vegetables,
    deliveryAddress,
  } = req.body;

  const userId = req.user.id;

  try {
    if (!quantity || quantity < 1) {
      return res.status(400).json({
        message: "Quantity must be at least 1.",
      });
    }
    const pizza = await Pizza.findById(pizzaId);

    if (!pizza) {
      return res.status(404).json({
        message: "Pizza does not exist",
      });
    }
    if (!pizza.isAvailable) {
      return res.status(404).json({
        message: "Pizza is not available at the moment",
      });
    }

    const validateInventory = (name, category) => {
      return Inventory.findOne({
        name,
        category,
        isAvailable: true,
      });
    };

    const baseInventory = await validateInventory(base, "base");
    if (!baseInventory) {
      return res.status(404).json({
        message: "Selected base is not availabe. ",
      });
    }
    const sauceInventory = await validateInventory(sauce, "sauce");
    if (!sauceInventory) {
      return res.status(404).json({
        message: "Selected sauce is not availabe. ",
      });
    }

    const cheeseInventory = await validateInventory(cheese, "cheese");
    if (!cheeseInventory) {
      return res.status(404).json({
        message: "Selected cheese is not availabe. ",
      });
    }

    const vegetableDocument = [];
    for (const vegetable of vegetables) {
      const vegetableInventory = await validateInventory(
        vegetable,
        "vegetable",
      );
      if (!vegetableInventory) {
        return res.status(404).json({
          message: `${vegetable} is not availabe.`,
        });
      }
      vegetableDocument.push(vegetableInventory);
    }

    if (baseInventory.quanitity < quantity) {
      return res
        .status(400)
        .json({ message: `${baseInventory.name} is out of stock` });
    }
    if (sauceInventory.quanitity < quantity) {
      return res
        .status(400)
        .json({ message: `${sauceInventory.name} is out of stock` });
    }
    if (cheeseInventory.quantity < quantity) {
      return res
        .status(400)
        .json({ message: `${cheeseInventory.name} is out of stock` });
    }

    for (const vegetableInventory of vegetableDocument) {
      if (vegetableInventory.quanitity < quantity) {
        return res
          .status(400)
          .json({ message: `${vegetableInventory.name} is out of stock` });
      }
    }

    baseInventory.quanitity -= quantity;
    sauceInventory.quanitity -= quantity;
    cheeseInventory.quanitity -= quantity;

    for (const vegetableInventory of vegetableDocument) {
      vegetableInventory.quanitity -= quantity;
    }

    if (baseInventory.quantity === 0) {
      baseInventory.isAvailable = false;
    }
    if (sauceInventory.quantity === 0) {
      sauceInventory.isAvailable = false;
    }
    if (cheeseInventory.quantity === 0) {
      baseInventory.isAvailable = false;
    }
    for (const vegetableInventory of vegetableDocument) {
      if (vegetableInventory.quanitity === 0) {
        vegetableInventory.isAvailable = false;
      }
    }

    await baseInventory.save();
    await sauceInventory.save();
    await cheeseInventory.save();
    for (const vegetableInventory of vegetableDocument) {
      await vegetableInventory.save();
    }

    const totalPrice = pizza.price * quantity;

    const order = await Order.create({
      user: userId,
      pizza: pizza._id,
      pizzaSnapshot: {
        name: pizza.name,
        description: pizza.description,
        image: pizza.image,
        price: pizza.price,
      },
      quantity,
      customization: {
        base,
        sauce,
        cheese,
        vegetables,
      },
      deliveryAddress,
      totalPrice,
    });

    return res.status(201).json({
      success: true,
      message: "Order placed",
      order,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const getOrders = async (req, res) => {
  try {
    let order;

    if (req.user.role === "admin") {
      orders = await Order.find();

      if (orders.length == 0) {
        return res.status(404).json({
          message: "No current orders.",
        });
      }
    } else {
      orders = await Order.find({
        user: req.user.id,
      });

      if (orders.length == 0) {
        return res.status(404).json({
          message: "You do not have any orders.",
        });
      }
    }
    return res.status(201).json({
      orders,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    let order;

    if (req.user.role === "admin") {
      order = await Order.findOne({
        _id: req.params.id,
      });
    } else {
      order = await Order.findOne({
        _id: req.params.id,
        user: req.user.id,
      });
    }
    return res.status(201).json({
      order,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.name,
      message: error.message,
    });
  }
};
const updateOrderStatus = async (req, res) => {
  const { orderStatus } = req.body;

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { orderStatus },

    {
      new: true,
      runValidators: true,
    },
  );
  return res.status(201).json({
    orderStatus: order.orderStatus,
  });
};

module.exports = {
  placeOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
};
