require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');

const app = express();
app.use(cors());
app.use(express.json());

const mongoose = require('mongoose');

connectDB();

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/rooms', roomRoutes);

// Database Health & Live Status Check
app.get('/api/v1/db-status', async (req, res) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    let usersCount = 0;
    let roomsCount = 0;
    if (isConnected) {
      const User = require('./models/User');
      const Room = require('./models/Room');
      usersCount = await User.countDocuments();
      roomsCount = await Room.countDocuments();
    }
    res.json({
      connected: isConnected,
      database: mongoose.connection.name || 'synclearn_app',
      host: 'mongodb://localhost:27017',
      state: isConnected ? 'Connected' : 'Disconnected',
      usersCount,
      roomsCount
    });
  } catch (err) {
    res.status(500).json({ connected: false, error: err.message });
  }
});

// LAN / Wi-Fi Network Info endpoint for cross-device mobile sharing
const os = require('os');
app.get('/api/v1/network-info', (req, res) => {
  try {
    const interfaces = os.networkInterfaces();
    let lanIp = 'localhost';
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) {
          const lowerName = name.toLowerCase();
          if (lowerName.includes('wi-fi') || lowerName.includes('wireless') || lowerName.includes('wlan')) {
            lanIp = iface.address;
            break;
          } else if (lanIp === 'localhost' && !iface.address.startsWith('169.254')) {
            lanIp = iface.address;
          }
        }
      }
      if (lanIp !== 'localhost' && (name.toLowerCase().includes('wi-fi') || name.toLowerCase().includes('wireless'))) {
        break;
      }
    }
    res.json({ lanIp: lanIp || '10.216.84.64', clientPort: 5173, serverPort: PORT });
  } catch (e) {
    res.json({ lanIp: '10.216.84.64', clientPort: 5173, serverPort: PORT });
  }
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const syncHandler = require('./sockets/syncHandler');

io.on('connection', (socket) => {
  syncHandler(io, socket);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});

