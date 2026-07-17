const express = require("express");
const router = express.Router();

const {
  placeOrder,
  getOrders,
  getOrderById,
  getAllOrders,
} = require("../controllers/order.controller");
const { authMiddleware, authorize } = require("../middlewares/authMiddleware");

router.post("/placeOrder", authMiddleware, authorize("user"), placeOrder);
router.get("/getOrders", authMiddleware, authorize("user"), getOrders); //user
router.get("/getOrders/:id", authMiddleware, authorize("user"), getOrderById); //user
router.get(
  "/getAllOrders",
  authMiddleware,
  authorize("user", "admin"),
  getAllOrders,
); //admin
module.exports = router;
