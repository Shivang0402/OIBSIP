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
  authorize("admin", "user"), // User allowed as of now to test updateInventory, to be changed after creating an admin account.
  updateInventory,
);

router.post(
  "/addInventory",
  authMiddleware,
  authorize("admin", "user"), // User allowed as of now to test addInventory, to be changed after creating an admin account.
  addInventory,
);

router.get(
  "/getInventory",
  authMiddleware,
  authorize("admin", "user"), // User allowed as of now to test getInventory, to be changed after creating an admin account.
  getInventory,
);

router.get(
  "/stats",
  authMiddleware,
  authorize("admin", "user"), // User allowed as of now to test getInventoryStats, to be changed after creating an admin account.
  getInventoryStats,
);

module.exports = router;
