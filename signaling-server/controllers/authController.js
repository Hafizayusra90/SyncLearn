const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// ── In-Memory fallback store (used when MongoDB is offline) ──────────────────
const memoryUsers = [];

const isDbConnected = () => mongoose.connection.readyState === 1;

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'synclearn_fallback_secret', { expiresIn: '30d' });
};

// Password validator: min 8 chars, at least one special character
const isValidPassword = (password) => {
  if (!password || typeof password !== 'string') return false;
  if (password.length < 8) return false;
  const specialCharRegex = /[!@#$%^&*(),.?":{}|<>_\-+=\\[\]`~]/;
  return specialCharRegex.test(password);
};

// ── Register ─────────────────────────────────────────────────────────────────
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, recoveryEmail } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide full name, email, and password.' });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters long and contain at least one special character (e.g. @, #, $, %, !).'
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanRecovery = recoveryEmail ? recoveryEmail.toLowerCase().trim() : '';

    // ── Try MongoDB first ──
    if (isDbConnected()) {
      const User = require('../models/User');
      const userExists = await User.findOne({ email: cleanEmail });
      if (userExists) {
        return res.status(400).json({ message: 'An account with this email already exists. Please Sign In instead.' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const user = await User.create({
        name: name.trim(),
        email: cleanEmail,
        recoveryEmail: cleanRecovery,
        password: hashedPassword,
        role: role || 'student',
        lastLogin: new Date()
      });

      console.log(`💾 Successfully saved new ${user.role} to MongoDB: ${user.name} (${user.email})`);

      return res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        recoveryEmail: user.recoveryEmail,
        role: user.role,
        avatar: user.avatar || '',
        token: generateToken(user._id),
        source: 'mongodb'
      });
    }

    // ── In-Memory fallback ──
    const existing = memoryUsers.find(u => u.email === cleanEmail);
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const fakeId = 'mem_' + Date.now();

    const newUser = {
      _id: fakeId,
      id: fakeId,
      name: name.trim(),
      email: cleanEmail,
      recoveryEmail: cleanRecovery,
      password: hashedPassword,
      role: role || 'student',
      lastLogin: new Date()
    };
    memoryUsers.push(newUser);

    console.log(`📝 [In-Memory] Registered user: ${cleanEmail} as ${role || 'student'}`);

    return res.status(201).json({
      _id: fakeId,
      name: newUser.name,
      email: newUser.email,
      recoveryEmail: newUser.recoveryEmail,
      role: newUser.role,
      token: generateToken(fakeId),
      source: 'memory'
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ── Login ─────────────────────────────────────────────────────────────────────
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // ── Try MongoDB first ──
    if (isDbConnected()) {
      const User = require('../models/User');
      const user = await User.findOne({ email: cleanEmail });
      if (!user) {
        return res.status(404).json({
          message: 'No account found with this email. Please switch to "Sign Up" to register.'
        });
      }

      if (await bcrypt.compare(password, user.password)) {
        // Update lastLogin in MongoDB
        await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });
        console.log(`✅ [MongoDB] Login: ${cleanEmail} (${user.role}) - lastLogin updated`);

        return res.json({
          _id: user.id,
          name: user.name,
          email: user.email,
          recoveryEmail: user.recoveryEmail || '',
          role: user.role,
          avatar: user.avatar || '',
          token: generateToken(user._id),
          source: 'mongodb'
        });
      }
      return res.status(401).json({ message: 'Incorrect password. Please try again.' });
    }

    // ── In-Memory fallback ──
    const user = memoryUsers.find(u => u.email === cleanEmail);
    if (!user) {
      return res.status(404).json({
        message: 'No account found with this email. Please switch to "Sign Up" to register.'
      });
    }

    if (await bcrypt.compare(password, user.password)) {
      console.log(`🔐 [In-Memory] Login: ${cleanEmail} as ${user.role}`);
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        recoveryEmail: user.recoveryEmail || '',
        role: user.role,
        token: generateToken(user._id),
        source: 'memory'
      });
    }

    return res.status(401).json({ message: 'Incorrect password' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Social Login (Google / GitHub) ────────────────────────────────────────────
const socialLogin = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const cleanEmail = email.toLowerCase().trim();

    if (isDbConnected()) {
      const User = require('../models/User');
      let user = await User.findOne({ email: cleanEmail });
      if (!user) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('social_oauth_login!123', salt);
        user = await User.create({
          name: name || (role === 'instructor' ? 'Instructor' : 'Student'),
          email: cleanEmail,
          password: hashedPassword,
          role: role || 'student',
          lastLogin: new Date()
        });
        console.log(`💾 Saved new social ${user.role} to MongoDB: ${user.name} (${user.email})`);
      } else {
        await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });
      }
      return res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        recoveryEmail: user.recoveryEmail || '',
        role: user.role,
        token: generateToken(user._id),
        source: 'mongodb'
      });
    }

    return res.json({
      _id: 'mem_' + Date.now(),
      name: name || 'Student',
      email: cleanEmail,
      role: role || 'student',
      token: generateToken('mem_' + Date.now()),
      source: 'memory'
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Forgot Password / Reset Password ──────────────────────────────────────────
const forgotPassword = async (req, res) => {
  try {
    const { emailOrRecovery, newPassword } = req.body;
    if (!emailOrRecovery || !newPassword) {
      return res.status(400).json({ message: 'Please provide your account email (or recovery email) and new password.' });
    }

    if (!isValidPassword(newPassword)) {
      return res.status(400).json({
        message: 'New password must be at least 8 characters long and contain at least one special character (e.g. @, #, $, %, !).'
      });
    }

    const cleanInput = emailOrRecovery.toLowerCase().trim();

    if (isDbConnected()) {
      const User = require('../models/User');
      const user = await User.findOne({
        $or: [
          { email: cleanInput },
          { recoveryEmail: cleanInput }
        ]
      });

      if (!user) {
        return res.status(404).json({
          message: 'No account found matching this email or recovery email.'
        });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      user.lastLogin = new Date();
      await user.save();

      console.log(`🔑 Password reset successfully in MongoDB for: ${user.email}`);
      return res.json({
        message: `Password reset successfully for ${user.email}! You can now sign in.`,
        email: user.email
      });
    }

    return res.json({ message: 'Password updated (demo mode).' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ── Forgot Email (Lookup via Recovery Email) ──────────────────────────────────
const forgotEmail = async (req, res) => {
  try {
    const { recoveryEmail } = req.body;
    if (!recoveryEmail) {
      return res.status(400).json({ message: 'Please provide your registered recovery email.' });
    }

    const cleanRecovery = recoveryEmail.toLowerCase().trim();

    if (isDbConnected()) {
      const User = require('../models/User');
      const users = await User.find({ recoveryEmail: cleanRecovery });

      if (!users || users.length === 0) {
        return res.status(404).json({
          message: 'No accounts found linked to this recovery email. Please check the spelling.'
        });
      }

      const accounts = users.map(u => ({
        name: u.name,
        email: u.email,
        role: u.role
      }));

      console.log(`🔍 Forgot email query for recovery: ${cleanRecovery} -> found ${accounts.length} user(s)`);
      return res.json({
        message: 'Account found successfully!',
        accounts
      });
    }

    return res.status(404).json({ message: 'No accounts found.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Update Profile & Recovery Email ───────────────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const { email, name, recoveryEmail, avatar } = req.body;
    if (!email) return res.status(400).json({ message: 'Account email is required.' });

    const cleanEmail = email.toLowerCase().trim();
    if (isDbConnected()) {
      const User = require('../models/User');
      const updated = await User.findOneAndUpdate(
        { email: cleanEmail },
        {
          ...(name ? { name: name.trim() } : {}),
          ...(recoveryEmail !== undefined ? { recoveryEmail: recoveryEmail.toLowerCase().trim() } : {}),
          ...(avatar !== undefined ? { avatar } : {})
        },
        { new: true }
      );

      if (!updated) return res.status(404).json({ message: 'User not found in database.' });

      return res.json({
        message: 'Profile updated and saved to MongoDB!',
        user: {
          _id: updated._id,
          name: updated.name,
          email: updated.email,
          recoveryEmail: updated.recoveryEmail,
          role: updated.role,
          avatar: updated.avatar || ''
        }
      });
    }

    const memUser = memoryUsers.find(u => u.email === cleanEmail);
    if (memUser) {
      if (name) memUser.name = name.trim();
      if (recoveryEmail !== undefined) memUser.recoveryEmail = recoveryEmail.toLowerCase().trim();
      if (avatar !== undefined) memUser.avatar = avatar;
    }

    return res.json({
      message: 'Profile updated.',
      user: {
        email: cleanEmail,
        name: name || cleanEmail.split('@')[0],
        recoveryEmail: recoveryEmail || '',
        avatar: avatar || ''
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Get All Users (for DB verification) ───────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    if (isDbConnected()) {
      const User = require('../models/User');
      const users = await User.find({}, '-password').sort({ createdAt: -1 });
      return res.json({
        success: true,
        database: mongoose.connection.name || 'synclearn_app',
        totalUsers: users.length,
        users
      });
    } else {
      return res.json({
        success: true,
        database: 'memory_fallback',
        totalUsers: memoryUsers.length,
        users: memoryUsers.map(u => ({ name: u.name, email: u.email, role: u.role, recoveryEmail: u.recoveryEmail }))
      });
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  socialLogin,
  forgotPassword,
  forgotEmail,
  updateProfile,
  getAllUsers,
  isValidPassword
};
