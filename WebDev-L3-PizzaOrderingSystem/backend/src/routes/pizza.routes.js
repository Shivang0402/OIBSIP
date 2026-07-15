const express = require("express");
const router = express.Router();
const { addPizza, getPizza } = require("../controllers/pizza.controller");
const { authMiddleware, authorize } = require("../middlewares/authMiddleware");

router.post("/addPizza", authMiddleware, authorize("user", "admin"), addPizza);
router.get("/getPizza", authMiddleware, authorize("user", "admin"), getPizza);

module.exports = router;
