const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
const authRoutes = require("./routes/auth.routes");
const inventoryRoutes = require("./routes/inventory.routes");
const pizzaRoutes = require("./routes/pizza.routes");
const orderRoutes = require("./routes/order.routes");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/pizza", pizzaRoutes);
app.use("/api/order", orderRoutes);

module.exports = app;
