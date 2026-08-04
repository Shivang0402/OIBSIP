const Order = require("../models/orderModel");
const Pizza = require("../models/pizzaModel");
const Inventory = require("../models/inventoryModel");
const razorpay = require("../config/razorpay");
const crypto = require("crypto");
const { getIO } = require("../socket/socket");

const generateOrderNumber = () => {
  const suffix = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `PZ-${suffix}`;
};

const validateIngredients = async (items) => {
  const requirements = {};
  const addRequirement = (category, name, quantity) => {
    const key = `${category}:${name}`;
    if (!requirements[key]) {
      requirements[key] = { category, name, quantity: 0 };
    }
    requirements[key].quantity += quantity;
  };

  for (const item of items) {
    const quantity = Number(item.quantity);
    const vegetables = Array.isArray(item.vegetables) ? item.vegetables : [];
    addRequirement("base", item.base, quantity);
    addRequirement("sauce", item.sauce, quantity);
    addRequirement("cheese", item.cheese, quantity);
    for (const vegetable of vegetables) {
      addRequirement("vegetable", vegetable, quantity);
    }
  }

  const inventoryDocs = {};
  for (const entry of Object.values(requirements)) {
    const doc = await Inventory.findOne({
      name: entry.name,
      category: entry.category,
      isAvailable: true,
    });
    if (!doc) {
      return {
        error: { status: 404, message: `${entry.name} is not available.` },
      };
    }
    if (doc.stock < entry.quantity) {
      return {
        error: {
          status: 400,
          message: `Not enough ${entry.name} in stock.`,
        },
      };
    }
    inventoryDocs[`${entry.category}:${entry.name}`] = doc;
  }

  return { data: { requirements, inventoryDocs } };
};

const placeOrder = async (req, res) => {
  const { items, deliveryAddress } = req.body;

  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      message: "Unauthorized user.",
    });
  }

  try {
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "At least one pizza is required.",
      });
    }

    const resolvedItems = [];

    for (const item of items) {
      const quantity = Number(item.quantity);
      if (!quantity || quantity < 1) {
        return res.status(400).json({
          message: "Quantity must be at least 1.",
        });
      }

      if (!item.base || !item.sauce || !item.cheese) {
        return res.status(400).json({
          message: "Base, sauce, and cheese are required for every item.",
        });
      }

      const vegetables = Array.isArray(item.vegetables) ? item.vegetables : [];

      if (item.pizzaId) {
        const pizza = await Pizza.findById(item.pizzaId);
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
        resolvedItems.push({
          pizzaId: pizza._id,
          isCustom: false,
          pizzaSnapshot: {
            name: pizza.name,
            description: pizza.description,
            image: pizza.image,
            price: pizza.price,
          },
          quantity,
          customization: {
            base: item.base,
            sauce: item.sauce,
            cheese: item.cheese,
            vegetables,
          },
          totalPrice: pizza.price * quantity,
        });
      } else {
        const unitPrice = Number(item.unitPrice);
        if (!unitPrice || unitPrice <= 0) {
          return res.status(400).json({
            message: "Invalid pizza price.",
          });
        }
        resolvedItems.push({
          pizzaId: null,
          isCustom: true,
          pizzaSnapshot: {
            name: "Custom Pizza",
            description: "Your custom-built pizza",
            image: "",
            price: unitPrice,
          },
          quantity,
          customization: {
            base: item.base,
            sauce: item.sauce,
            cheese: item.cheese,
            vegetables,
          },
          totalPrice: unitPrice * quantity,
        });
      }
    }

    const { error } = await validateIngredients(items);
    if (error) {
      return res.status(error.status).json({
        message: error.message,
      });
    }

    const totalPrice = resolvedItems.reduce(
      (sum, item) => sum + item.pizzaSnapshot.price * item.quantity,
      0,
    );

    let order = null;
    for (let attempt = 0; attempt < 3 && !order; attempt++) {
      const orderNumber = generateOrderNumber();
      const exists = await Order.exists({ orderNumber });
      if (exists) {
        continue;
      }
      order = await Order.create({
        user: userId,
        orderNumber,
        items: resolvedItems,
        totalPrice,
        deliveryAddress,
        paymentStatus: "Pending",
        orderStatus: "Pending",
      });
    }

    if (!order) {
      return res.status(500).json({
        message: "Unable to generate a unique order number. Please try again.",
      });
    }

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

const markPaymentFailed = async (req, res) => {
  try {
    const query =
      req.user.role === "admin"
        ? { _id: req.params.id }
        : { _id: req.params.id, user: req.user.id };

    const order = await Order.findOne(query);

    if (!order) {
      return res.status(404).json({
        message: "Order not found.",
      });
    }

    if (order.paymentStatus === "Paid") {
      return res.status(400).json({
        message: "This order is already paid.",
      });
    }

    order.paymentStatus = "Failed";
    await order.save();

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const retryPayment = async (req, res) => {
  try {
    const query =
      req.user.role === "admin"
        ? { _id: req.params.id }
        : { _id: req.params.id, user: req.user.id };

    const order = await Order.findOne(query);

    if (!order) {
      return res.status(404).json({
        message: "Order not found.",
      });
    }

    if (order.paymentStatus === "Paid") {
      return res.status(400).json({
        message: "This order is already paid.",
      });
    }

    if (!order.razorpayOrderId) {
      const razorpayOrder = await razorpay.orders.create({
        amount: order.totalPrice * 100,
        currency: "INR",
        receipt: order._id.toString(),
      });
      order.razorpayOrderId = razorpayOrder.id;
      await order.save();
    }

    return res.status(200).json({
      success: true,
      order,
      razorpayOrderId: order.razorpayOrderId,
      amount: order.totalPrice * 100,
      currency: "INR",
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

    const orderItems =
      order.items && order.items.length > 0
        ? order.items.map((item) => ({
            base: item.customization.base,
            sauce: item.customization.sauce,
            cheese: item.customization.cheese,
            vegetables: item.customization.vegetables || [],
            quantity: item.quantity || 1,
          }))
        : order.customization
          ? [
              {
                base: order.customization.base,
                sauce: order.customization.sauce,
                cheese: order.customization.cheese,
                vegetables: order.customization.vegetables || [],
                quantity: order.quantity || 1,
              },
            ]
          : [];

    if (orderItems.length === 0) {
      order.paymentStatus = "Failed";
      order.orderStatus = "Cancelled";
      await order.save();

      return res.status(400).json({
        message: "Order has no items to verify.",
      });
    }

    const { error, data } = await validateIngredients(orderItems);
    if (error) {
      order.paymentStatus = "Failed";
      order.orderStatus = "Cancelled";
      await order.save();

      return res.status(400).json({
        message: error.message,
      });
    }

    for (const entry of Object.values(data.requirements)) {
      const inventoryDoc = data.inventoryDocs[`${entry.category}:${entry.name}`];
      inventoryDoc.stock -= entry.quantity;
      if (inventoryDoc.stock === 0) {
        inventoryDoc.isAvailable = false;
      }
      await inventoryDoc.save();
    }

    order.paymentStatus = "Paid";
    order.orderStatus = "Order Received";
    order.razorpayPaymentId = razorpay_payment_id;
    order.paidAt = Date.now();
    await order.save();

    const io = getIO();
    io.to(`user_${order.user.toString()}`).emit("orderStatusUpdated", {
      orderId: order._id,
      status: order.orderStatus,
    });

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
    const io = getIO();
    io.to(`user_${order.user.toString()}`).emit("orderStatusUpdated", {
      orderId: order._id,
      status: order.orderStatus,
    });
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
  markPaymentFailed,
  retryPayment,
  verifyPayment,
  getOrders,
  getOrderById,
  updateOrderStatus,
};
