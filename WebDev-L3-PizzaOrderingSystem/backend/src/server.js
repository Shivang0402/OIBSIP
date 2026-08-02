require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const app = require("./app");
const connectDb = require("./config/db");
const { setIO } = require("../src/socket/socket");
const PORT = process.env.PORT || 5000;
require("../src/cron/checkLowStock");

const startServer = async () => {
  await connectDb();

  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  setIO(io);
  io.on("connection", (socket) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
      console.log(`Socket ${socket.id} connected without token`);
      return;
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.join(`user_${payload.id}`);
      console.log(`User ${payload.id} connected: ${socket.id}`);
    } catch {
      console.log(`Socket ${socket.id} rejected (invalid token)`);
    }

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};
startServer();
