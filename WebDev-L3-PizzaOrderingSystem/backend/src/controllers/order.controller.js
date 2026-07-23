const Order = require("../models/orderModel");
const Pizza = require("../models/pizzaModel");
const Inventory = require("../models/inventoryModel");
const razorpay = require("../config/razorpay");
const crypto = require("crypto");

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

  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      message: "Unauthorized user.",
    });
  }

  try {
    if (!quantity || Number(quantity) < 1) {
      return res.status(400).json({
        message: "Quantity must be at least 1.",
      });
    }

    if (!pizzaId || !base || !sauce || !cheese) {
      return res.status(400).json({
        message: "Pizza, base, sauce, and cheese are required.",
      });
    }

    const pizza = await Pizza.findById(pizzaId);
    if (!pizza) {
      return res.status(404).json({
        message: "Pizza does not exist.",
      });
    }

    if (!pizza.isAvailable) {
      return res.status(400).json({
        message: "Pizza is not available at the moment.",
      });
    }

    const selectedVegetables = Array.isArray(vegetables) ? vegetables : [];

    const validateInventory = async (name, category) => {
      return Inventory.findOne({
        name,
        category,
        isAvailable: true,
      });
    };

    const baseInventory = await validateInventory(base, "base");
    if (!baseInventory) {
      return res.status(404).json({
        message: "Selected base is not available.",
      });
    }

    const sauceInventory = await validateInventory(sauce, "sauce");
    if (!sauceInventory) {
      return res.status(404).json({
        message: "Selected sauce is not available.",
      });
    }

    const cheeseInventory = await validateInventory(cheese, "cheese");
    if (!cheeseInventory) {
      return res.status(404).json({
        message: "Selected cheese is not available.",
      });
    }

    const vegetableDocuments = [];
    for (const vegetable of selectedVegetables) {
      const vegetableInventory = await validateInventory(
        vegetable,
        "vegetable",
      );
      if (!vegetableInventory) {
        return res.status(404).json({
          message: `${vegetable} is not available.`,
        });
      }
      vegetableDocuments.push(vegetableInventory);
    }

    if (baseInventory.stock < quantity) {
      return res.status(400).json({
        message: `Not enough ${baseInventory.name} in stock.`,
      });
    }

    if (sauceInventory.stock < quantity) {
      return res.status(400).json({
        message: `Not enough ${sauceInventory.name} in stock.`,
      });
    }

    if (cheeseInventory.stock < quantity) {
      return res.status(400).json({
        message: `Not enough ${cheeseInventory.name} in stock.`,
      });
    }

    for (const vegetableInventory of vegetableDocuments) {
      if (vegetableInventory.stock < quantity) {
        return res.status(400).json({
          message: `Not enough ${vegetableInventory.name} in stock.`,
        });
      }
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
        vegetables: selectedVegetables,
      },
      deliveryAddress,
      totalPrice,
      paymentStatus: "Pending",
      orderStatus: "Pending",
    });

    const razorpayOrder = await razorpay.orders.create({
      amount: order.totalPrice * 100,
      currency: "INR",
      receipt: order._id.toString(),
    });

    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    return res.status(201).json({
      success: true,
      message: "Order created successfully. Complete payment to confirm it.",
      order,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_API_KEY,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({
      message: "Missing Razorpay payment data.",
    });
  }

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  try {
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        message: "Invalid payment signature.",
      });
    }

    const order = await Order.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found.",
      });
    }

    if (order.paymentStatus === "Paid") {
      return res.status(200).json({
        message: "Payment already verified.",
      });
    }

    const customization = order.customization || {};
    const quantity = order.quantity || 1;

    const baseInventory = await Inventory.findOne({
      name: customization.base,
      category: "base",
      isAvailable: true,
    });

    const sauceInventory = await Inventory.findOne({
      name: customization.sauce,
      category: "sauce",
      isAvailable: true,
    });

    const cheeseInventory = await Inventory.findOne({
      name: customization.cheese,
      category: "cheese",
      isAvailable: true,
    });

    const vegetableDocuments = [];
    for (const vegetable of customization.vegetables || []) {
      const vegetableInventory = await Inventory.findOne({
        name: vegetable,
        category: "vegetable",
        isAvailable: true,
      });

      if (!vegetableInventory) {
        order.paymentStatus = "Failed";
        order.orderStatus = "Cancelled";
        await order.save();

        return res.status(400).json({
          message: `${vegetable} inventory is no longer available.`,
        });
      }

      vegetableDocuments.push(vegetableInventory);
    }

    if (!baseInventory || !sauceInventory || !cheeseInventory) {
      order.paymentStatus = "Failed";
      order.orderStatus = "Cancelled";
      await order.save();

      return res.status(400).json({
        message: "One or more selected ingredients are no longer available.",
      });
    }

    if (baseInventory.stock < quantity) {
      order.paymentStatus = "Failed";
      order.orderStatus = "Cancelled";
      await order.save();

      return res.status(400).json({
        message: `Not enough ${baseInventory.name} in stock.`,
      });
    }

    if (sauceInventory.stock < quantity) {
      order.paymentStatus = "Failed";
      order.orderStatus = "Cancelled";
      await order.save();

      return res.status(400).json({
        message: `Not enough ${sauceInventory.name} in stock.`,
      });
    }

    if (cheeseInventory.stock < quantity) {
      order.paymentStatus = "Failed";
      order.orderStatus = "Cancelled";
      await order.save();

      return res.status(400).json({
        message: `Not enough ${cheeseInventory.name} in stock.`,
      });
    }

    for (const vegetableInventory of vegetableDocuments) {
      if (vegetableInventory.stock < quantity) {
        order.paymentStatus = "Failed";
        order.orderStatus = "Cancelled";
        await order.save();

        return res.status(400).json({
          message: `Not enough ${vegetableInventory.name} in stock.`,
        });
      }
    }

    baseInventory.stock -= quantity;
    sauceInventory.stock -= quantity;
    cheeseInventory.stock -= quantity;

    for (const vegetableInventory of vegetableDocuments) {
      vegetableInventory.stock -= quantity;
      if (vegetableInventory.stock === 0) {
        vegetableInventory.isAvailable = false;
      }
    }

    if (baseInventory.stock === 0) {
      baseInventory.isAvailable = false;
    }

    if (sauceInventory.stock === 0) {
      sauceInventory.isAvailable = false;
    }

    if (cheeseInventory.stock === 0) {
      cheeseInventory.isAvailable = false;
    }

    await baseInventory.save();
    await sauceInventory.save();
    await cheeseInventory.save();

    for (const vegetableInventory of vegetableDocuments) {
      await vegetableInventory.save();
    }

    order.paymentStatus = "Paid";
    order.orderStatus = "Confirmed";
    order.razorpayPaymentId = razorpay_payment_id;
    order.paidAt = Date.now();
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully.",
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getOrders = async (req, res) => {
  try {
    let orders;

    if (req.user.role === "admin") {
      orders = await Order.find().sort({ createdAt: -1 });
    } else {
      orders = await Order.find({
        user: req.user.id,
      }).sort({ createdAt: -1 });
    }

    if (!orders.length) {
      return res.status(200).json({
        orders: [],
        message: "No orders found.",
      });
    }

    return res.status(200).json({
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

    if (!order) {
      return res.status(404).json({
        message: "Order not found.",
      });
    }

    return res.status(200).json({
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
  try {
    const { orderStatus } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found.",
      });
    }

    return res.status(200).json({
      orderStatus: order.orderStatus,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  placeOrder,
  verifyPayment,
  getOrders,
  getOrderById,
  updateOrderStatus,
};
