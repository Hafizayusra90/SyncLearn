import { io } from 'socket.io-client';

// Node.js Backend Server URL
const SOCKET_URL = 'http://localhost:5000';

export const socket = io(SOCKET_URL, {
  autoConnect: false, // Prevents automatic connection on page load
});