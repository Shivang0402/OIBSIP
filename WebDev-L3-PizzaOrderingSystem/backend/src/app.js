const express = require("express");
const app = express();
const authRoutes = require("./routes/auth.routes");
const inventoryRoutes = require("./routes/inventory.routes");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/inventory", inventoryRoutes);

module.exports = app;
