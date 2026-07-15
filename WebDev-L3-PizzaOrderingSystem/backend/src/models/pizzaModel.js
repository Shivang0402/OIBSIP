const mongoose = require("mongoose");
const PizzaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    prize: {
      type: Number,
      required: true,
      min: 0,
    },
    image: {
      type: String,
      required: true,
      trim: true,
      default: "",
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Pizza", PizzaSchema);
