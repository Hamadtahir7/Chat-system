// src/config/socket.js
import io from 'socket.io-client';

// Get Socket URL from environment or detect from hostname
const getSocketURL = () => {
  // Always auto-detect the backend URL from current hostname
  // This allows frontend running on localhost:3000 or 10.17.86.43:3000 to reach backend on same IP:5000
  const host = window.location.hostname;
  const socketUrl = `http://${host}:5000`;
  console.log(`🔌 Socket URL: ${socketUrl} (detected from hostname: ${host})`);
  return socketUrl;
};

const SOCKET_URL = getSocketURL();
console.log('🔌 Socket Configuration loaded');

let socket = null;

export const initSocket = (token) => {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    auth: {
      token,
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket.id);
  });

  socket.on('disconnect', () => {
    console.log('❌ Socket disconnected');
  });

  socket.on('error', (error) => {
    console.error('🔴 Socket error:', error);
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
