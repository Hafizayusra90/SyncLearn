const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  socialLogin,
  forgotPassword,
  forgotEmail,
  updateProfile,
  getAllUsers
} = require('../controllers/authController');

router.get('/users-list', getAllUsers);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/social', socialLogin);
router.post('/forgot-password', forgotPassword);
router.post('/forgot-email', forgotEmail);
router.put('/profile', updateProfile);

module.exports = router;
