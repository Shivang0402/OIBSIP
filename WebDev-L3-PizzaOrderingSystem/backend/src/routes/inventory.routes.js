const express = require("express");
const router = express.Router();
const {
  addInventory,
  getInventory,
  updateInventory,
  getInventoryStats,
} = require("../controllers/inventory.controller");
const { authMiddleware, authorize } = require("../middlewares/authMiddleware");

router.patch(
  "/updateInventory/:id",
  authMiddleware,
  authorize("admin"),
  updateInventory,
);

router.post("/addInventory", authMiddleware, authorize("admin"), addInventory);

router.get("/getInventory", authMiddleware, authorize("admin"), getInventory);

router.get("/stats", authMiddleware, authorize("admin"), getInventoryStats);

module.exports = router;
