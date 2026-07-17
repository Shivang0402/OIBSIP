const express = require("express");
const router = express.Router();

const {
  placeOrder,
  getOrders,
  getOrderById,
} = require("../controllers/order.controller");
const { authMiddleware, authorize } = require("../middlewares/authMiddleware");

router.post("/placeOrder", authMiddleware, authorize("user"), placeOrder);
router.get("/getOrders", authMiddleware, authorize("user"), getOrders);
router.get("/getOrders/:id", authMiddleware, authorize("user"), getOrderById);
module.exports = router;
