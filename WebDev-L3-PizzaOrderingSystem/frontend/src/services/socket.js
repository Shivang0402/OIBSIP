import { io } from 'socket.io-client';
import { getToken } from './session';

let socket = null;

export function getSocket() {
  if (socket) return socket;
  socket = io(window.location.origin, {
    auth: { token: getToken() },
    transports: ['websocket', 'polling'],
  });
  return socket;
}

export function subscribeToOrderStatus(orderId, callback) {
  const s = getSocket();
  const handler = (payload) => {
    if (payload && payload.orderId === orderId) {
      callback(payload.status);
    }
  };
  s.on('orderStatusUpdated', handler);
  return () => {
    s.off('orderStatusUpdated', handler);
  };
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
