import { io } from 'socket.io-client';

// Node.js Backend Server URL (dynamically adapts to current host, e.g. 10.216.84.64 on mobile / LAN or localhost on PC)
const hostname = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : 'localhost';
const SOCKET_URL = `http://${hostname}:5000`;

export const socket = io(SOCKET_URL, {
  autoConnect: false, // Prevents automatic connection on page load
});