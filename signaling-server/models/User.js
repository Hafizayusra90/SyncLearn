const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, index: true },
  recoveryEmail: { type: String, default: '' },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'instructor'], default: 'student' },
  avatar: { type: String, default: '' },
  lastLogin: { type: Date }
}, { timestamps: true });

// Compound unique index: allows same email to register separately as student AND instructor
userSchema.index({ email: 1, role: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema);
