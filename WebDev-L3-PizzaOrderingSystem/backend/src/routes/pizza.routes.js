const express = require("express");
const router = express.Router();
const addPizza = require("../controllers/pizza.controller");
const { authMiddleware, authorize } = require("../middlewares/authMiddleware");

router.post("/addPizza", authMiddleware, authorize("user", "admin"), addPizza);

module.exports = router;
