const express = require("express");
const router = express.Router();

const { placeOrder } = require("../controllers/order.controller");
const { authMiddleware, authorize } = require("../middlewares/authMiddleware");

router.post("/placeOrder", authMiddleware, authorize("user"), placeOrder);

module.exports = router;
