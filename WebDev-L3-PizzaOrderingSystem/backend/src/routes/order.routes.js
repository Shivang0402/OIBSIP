const express = require("express");
const router = express.Router();

const { placeOrder, getOrders } = require("../controllers/order.controller");
const { authMiddleware, authorize } = require("../middlewares/authMiddleware");

router.post("/placeOrder", authMiddleware, authorize("user"), placeOrder);
router.get("/getOrders", authMiddleware, authorize("user"), getOrders);
module.exports = router;
