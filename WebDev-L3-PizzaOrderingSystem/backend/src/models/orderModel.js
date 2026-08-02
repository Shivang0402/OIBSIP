const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    pizzaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pizza",
      default: null,
    },
    isCustom: {
      type: Boolean,
      default: false,
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
        default: "",
      },
      price: {
        type: Number,
        required: true,
      },
    },
    quantity: {
      type: Number,
      min: 1,
      required: true,
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
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      sparse: true,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    items: {
      type: [orderItemSchema],
      default: [],
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
      enum: ["Pending", "Order Received", "In Kitchen", "Sent to Delivery", "Cancelled"],
      default: "Pending",
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
    paidAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Order", orderSchema);
