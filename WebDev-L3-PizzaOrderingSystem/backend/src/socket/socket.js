let io;
const setIO = (SocketIO) => {
  io = SocketIO;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io has not been initialized.");
  }
  return io;
};

module.exports = {
  setIO,
  getIO,
};
