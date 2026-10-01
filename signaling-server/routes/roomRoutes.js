const express = require('express');
const router = express.Router();
const { createRoom, getRooms } = require('../controllers/roomController');
const { protect } = require('../middleware/auth');

const Room = require('../models/Room');

// Public room registration / pre-announcement from instructor
router.post('/register', async (req, res) => {
  try {
    const { roomId, title, instructorName, instructorEmail } = req.body;
    if (!roomId) {
      return res.status(400).json({ message: 'roomId is required' });
    }
    const cleanId = String(roomId).trim();
    const updated = await Room.findOneAndUpdate(
      { roomId: cleanId },
      {
        $set: {
          roomId: cleanId,
          title: title || 'Live Classroom',
          instructorName: instructorName || 'Instructor',
          ...(instructorEmail ? { instructorEmail } : {}),
          isActive: true
        }
      },
      { upsert: true, new: true }
    );
    res.json({ success: true, room: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Public room info query by roomId or 9-digit code
router.get('/:roomId/info', async (req, res) => {
  try {
    const rawId = req.params.roomId;
    if (!rawId) return res.status(400).json({ message: 'roomId required' });
    const cleanId = String(rawId).trim();
    const altId = cleanId.replace(/-/g, '');
    
    let room = await Room.findOne({
      $or: [
        { roomId: cleanId },
        { roomId: altId },
        { roomId: new RegExp(`^${cleanId}$`, 'i') }
      ]
    }).lean();

    if (room && room.instructorName) {
      return res.json({
        success: true,
        roomId: room.roomId,
        title: room.title || 'Live Classroom',
        instructorName: room.instructorName,
        isActive: room.isActive
      });
    }

    res.json({
      success: false,
      message: 'Room not found in database',
      instructorName: 'Instructor'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.route('/').post(protect, createRoom).get(protect, getRooms);

module.exports = router;
