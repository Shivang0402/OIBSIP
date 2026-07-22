const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    pizza: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pizza",
    },
    quantity: {
      type: Number,
      min: 1,
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
    totalPrice: {
      type: Number,
      required: true,
    },
    deliveryAddress: {
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

    orderStatus: {
      type: String,
      enum: ["Order Recevied", "In Kitchen", "On the way", "Delievered"],
      default: "Order Recevied",
    },

    razorpayPaymentId: {
      type: String,
    },
    razorpayOrderId: {
      type: String,
    },
    paymentStatus: {
      type: String,
      enum: ["Paid", "Pending", "Failed"],
      default: "Pending",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Order", orderSchema);
