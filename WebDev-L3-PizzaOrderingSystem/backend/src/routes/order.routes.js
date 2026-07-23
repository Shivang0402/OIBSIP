const express = require("express");
const router = express.Router();

const {
  placeOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  verifyPayment,
} = require("../controllers/order.controller");
const { authMiddleware, authorize } = require("../middlewares/authMiddleware");

router.post(
  "/placeOrder",
  authMiddleware,
  authorize("user", "admin"),
  placeOrder,
); //user

router.post(
  "/verifyPayment",
  authMiddleware,
  authorize("user", "admin"),
  verifyPayment,
);

router.get("/getOrders", authMiddleware, authorize("user", "admin"), getOrders);
router.get(
  "/getOrders/:id",
  authMiddleware,
  authorize("user", "admin"),
  getOrderById,
);
router.post(
  "/updateStatus/:id",
  authMiddleware,
  authorize("admin"),
  updateOrderStatus,
);
module.exports = router;
