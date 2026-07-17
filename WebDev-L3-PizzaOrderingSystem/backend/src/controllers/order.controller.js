const Order = require("../models/orderModel");
const Pizza = require("../models/pizzaModel");
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
    const orders = await Order.find({
      user: req.user.id,
    });
    if (orders.length == 0) {
      return res.status(404).json({
        message: "You do not have any orders yet.",
      });
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
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

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
module.exports = {
  placeOrder,
  getOrders,
  getOrderById,
};
