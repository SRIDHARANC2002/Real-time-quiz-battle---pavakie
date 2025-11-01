const express = require('express');
const MatchHistory = require('../models/MatchHistory');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Get user's match history
router.get('/:userId', authMiddleware, async (req, res) => {
  try {
    // Only allow users to see their own match history
    if (req.params.userId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const matches = await MatchHistory.find({ user: req.params.userId })
      .populate('room', 'name')
      .populate('user', 'username email')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

