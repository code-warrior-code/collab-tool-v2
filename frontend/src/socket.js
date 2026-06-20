import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket = null;

// Opens (or reuses) the single Socket.io connection for the app, authenticated
// with the same JWT used for REST calls. Matches backend/sockets/index.js,
// which expects the token on `socket.handshake.auth.token`.
export function connectSocket(token) {
  if (!token) return null;

  if (socket && socket.auth?.token === token) {
    if (!socket.connected) socket.connect();
    return socket;
  }

  if (socket) {
    socket.disconnect();
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    autoConnect: true,
    transports: ['websocket', 'polling']
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function getSocket() {
  return socket;
}
