const express = require('express');
const { createRoom, joinRoom, getRooms, submitAnswer } = require('../controllers/roomController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/', createRoom);
router.get('/', getRooms);
router.post('/:roomId/join', joinRoom);
router.post('/:roomId/answer', submitAnswer);

module.exports = router;
