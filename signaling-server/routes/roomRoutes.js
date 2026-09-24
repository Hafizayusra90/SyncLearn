const express = require('express');
const router = express.Router();
const { createRoom, getRooms } = require('../controllers/roomController');
const { protect } = require('../middleware/auth');

router.route('/').post(protect, createRoom).get(protect, getRooms);

module.exports = router;
