require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
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
    console.log(`User connected: ${socket.id}`);
  });
  io.on("disconnect", () => {
    consolelog(`User disconnected: ${socket.id}`);
  });

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};
startServer();
