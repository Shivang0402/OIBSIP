const mongoose = require("mongoose");
const inventorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      enum: ["base", "sauce", "cheese", "vegetable"],
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    threshold: {
      type: Number,
      required: true,
      min: 0,
      default: 10,
    },
    unit: {
      type: String,
      required: true,
      enum: ["pieces", "kg", "litre", "packets"],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamp: true },
);

module.exports = mongoose.model("Inventory", inventorySchema);
