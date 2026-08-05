const express = require("express");
const router = express.Router();
const {
  addPizza,
  getPizza,
  getPizzaById,
  updatePizza,
  deletePizza,
} = require("../controllers/pizza.controller");
const { authMiddleware, authorize } = require("../middlewares/authMiddleware");

router.post("/addPizza", authMiddleware, authorize("admin"), addPizza);

router.get("/getPizza", getPizza);

router.get("/getPizza/:id", getPizzaById);

router.patch("/updatePizza/:id", authMiddleware, authorize("admin"), updatePizza);

router.delete("/deletePizza/:id", authMiddleware, authorize("admin"), deletePizza);

module.exports = router;
