const express = require("express");
const router = express.Router();
const {
  addPizza,
  getPizza,
  getPizzaById,
  updatePizza,
} = require("../controllers/pizza.controller");
const { authMiddleware, authorize } = require("../middlewares/authMiddleware");

router.post("/addPizza", authMiddleware, authorize("user", "admin"), addPizza);

router.get("/getPizza", authMiddleware, authorize("user", "admin"), getPizza);

router.get(
  "/getPizza/:id",
  authMiddleware,
  authorize("user", "admin"),
  getPizzaById,
);

router.patch(
  "/updatePizza/:id",
  authMiddleware,
  authorize("admin", "user"),
  updatePizza,
);

module.exports = router;
