const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema(
  {
    orderId: {},
  },
  { tiemstamps: true },
);
module.exports = mongoose.model("Order", "orderSchema");
