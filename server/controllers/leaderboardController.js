const MatchHistory = require('../models/MatchHistory');

exports.getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await MatchHistory.aggregate([
      {
        $group: {
          _id: '$user',
          totalScore: { $sum: '$score' },
          totalMatches: { $sum: 1 },
          averageScore: { $avg: '$score' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $project: {
          username: '$user.username',
          totalScore: 1,
          totalMatches: 1,
          averageScore: 1,
        },
      },
      {
        $sort: { totalScore: -1 },
      },
    ]);

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
