const mongoose = require("mongoose");
const connectDb = async (req, res) => {
  try {
    const connectDb = await mongoose.connect("mongodb://localhost:27017/users");
    console.log("Database connected successfully");
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};
module.exports = {
  connectDb,
};
