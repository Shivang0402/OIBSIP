const express = require("express");
const router = express.Router();

const {
  placeOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
} = require("../controllers/order.controller");
const { authMiddleware, authorize } = require("../middlewares/authMiddleware");

router.post("/placeOrder", authMiddleware, authorize("user"), placeOrder); //user
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
