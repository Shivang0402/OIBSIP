const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    pizza: {
      type: monggose.Schema.ObjectId,
      ref: "Pizza",
    },
    quantity: {
      type: Number,
      min: 0,
    },
    pizzaSnapshot: {
      name: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      image: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
    },
    customization: {
      base: {
        type: String,
        required: true,
      },
      sauce: {
        type: String,
        required: true,
      },
      cheese: {
        type: String,
        required: true,
      },
      vegetables: [
        {
          type: String,
        },
      ],
    },
    price: {
      type: Number,
      required: true,
    },
    orderAddress: {
      street: {
        type: String,
      },
      area: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      pincode: {
        type: Number,
        required: true,
      },
    },
    paymentStatus: {
      type: String,
      enum: ["Paid", "Pending", "Failed"],
    },

    orderStatus: {
      type: String,
      enum: ["Order Recevied", "In Kitchen", "On The Way", "Delievered"],
      default: "Order Received",
    },
  },
  { timestamps: true },
);
module.exports = mongoose.model("Order", "orderSchema");
