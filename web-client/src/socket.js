import { io } from 'socket.io-client';

// Dynamic socket URL:
// Connects to window.location.origin so that on localhost, Same Wi-Fi (LAN IP), or Public Tunnel (ngrok / mobile data):
// Vite's proxy automatically routes /socket.io with WebSockets to the Node.js backend on port 5000!
const getSocketUrl = () => {
  if (typeof window === 'undefined') return 'http://localhost:5000';
  return window.location.origin;
};

export const socket = io(getSocketUrl(), {
  autoConnect: false,
  transports: ['websocket', 'polling'],
});