const express = require("express");
const { connectDb } = require("./config/db");
const app = express();
// const connect = require("./config/db");
connectDb();

// app.use(cors());
app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());
module.exports = app;
