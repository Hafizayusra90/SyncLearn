const Room = require('../models/Room');

const createRoom = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Room title is required' });
    }
    
    // Using req.user.id which comes from the auth middleware
    const room = await Room.create({
      title,
      instructorId: req.user.id
    });
    
    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRooms = async (req, res) => {
  try {
    // Populate instructorId so we can see the instructor's name and email
    const rooms = await Room.find({ isActive: true }).populate('instructorId', 'name email');
    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createRoom, getRooms };
