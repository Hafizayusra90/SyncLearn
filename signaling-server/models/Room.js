const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  socketId: { type: String },
  userName: { type: String, default: 'Student' },
  userRole: { type: String, default: 'student' },
  joinedAt: { type: Date, default: Date.now }
}, { _id: false });

const roomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true, index: true },
  title: { type: String, default: 'Live Classroom' },
  instructorName: { type: String, default: 'Instructor' },
  instructorEmail: { type: String },
  instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true },
  studentsCount: { type: Number, default: 0 },
  participants: [participantSchema],
  endedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);

