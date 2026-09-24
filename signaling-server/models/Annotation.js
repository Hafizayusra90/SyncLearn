const mongoose = require('mongoose');

const annotationSchema = new mongoose.Schema({
  videoId: { type: String, required: true },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  timestamp: { type: Number, required: true }, // Specific timestamp ($t=n$) for doubt
  type: { type: String, enum: ['text', 'audio'], required: true },
  content: { type: String, required: true } // Transcription or typed text
}, { timestamps: true });

module.exports = mongoose.model('Annotation', annotationSchema);
