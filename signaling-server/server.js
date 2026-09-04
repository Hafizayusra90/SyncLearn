const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST"],
  },
});
io.on('connection', (socket) => {
  console.log('⚡ User Connected:', socket.id);

  // Join Room Event
  socket.on('join-room', ({ roomId, userId }) => {
    socket.join(roomId);
    console.log(`👤 User ${userId} joined Room: ${roomId}`);
    socket.to(roomId).emit('user-connected', userId);
  });

  // Real-time Canvas Drawing Event
  socket.on('draw-stroke', (data) => {
    socket.to(data.roomId).emit('draw-stroke', data);
  });

  // Clear Canvas Event
  socket.on('clear-canvas', (data) => {
    socket.to(data.roomId).emit('clear-canvas');
  });

  // Disconnect Event
  socket.on('disconnect', () => {
    console.log('❌ User Disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});