import { io } from 'socket.io-client';

// Node.js Backend Server URL (dynamically adapts to current host, e.g. Wi-Fi LAN IP on other laptops/mobile or localhost on PC)
const hostname = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : 'localhost';
export const API_BASE = `http://${hostname}:5000`;
export const SOCKET_URL = API_BASE;

export const socket = io(SOCKET_URL, {
  autoConnect: false, // Prevents automatic connection on page load
});