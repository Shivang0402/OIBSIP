const express = require("express");
const router = express.Router();
const {
  addPizza,
  getPizza,
  updatePizza,
} = require("../controllers/pizza.controller");
const { authMiddleware, authorize } = require("../middlewares/authMiddleware");

router.post("/addPizza", authMiddleware, authorize("user", "admin"), addPizza);
router.get("/getPizza", authMiddleware, authorize("user", "admin"), getPizza);
router.patch(
  "/updatePizza/:id",
  authMiddleware,
  authorize("admin", "user"),
  updatePizza,
);

module.exports = router;
