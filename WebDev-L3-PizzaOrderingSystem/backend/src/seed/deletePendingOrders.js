require("dotenv").config();
const connectDb = require("../config/db");
const Order = require("../models/orderModel");

const run = async () => {
  try {
    await connectDb();
    const result = await Order.deleteMany({ paymentStatus: "Pending" });
    console.log(`Deleted ${result.deletedCount} pending order(s).`);
  } catch (error) {
    console.error("Delete failed:", error);
    process.exitCode = 1;
  } finally {
    const mongoose = require("mongoose");
    await mongoose.disconnect();
  }
};

run();
