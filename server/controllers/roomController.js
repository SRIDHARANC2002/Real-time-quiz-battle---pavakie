const Room = require('../models/Room');
const MatchHistory = require('../models/MatchHistory');


exports.createRoom = async (req, res) => {
  const { name, quiz } = req.body;

  try {
    const roomQuiz = quiz || {
      questions: defaultQuestions.map((q, idx) => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer
      })),
      currentQuestion: 0,
      isActive: false
    };

    const room = await Room.create({
      name,
      host: req.user._id,
      quiz: roomQuiz,
    });

    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.joinRoom = async (req, res) => {
  const { roomId } = req.params;

  try {
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (!room.participants.includes(req.user._id)) {
      room.participants.push(req.user._id);
      await room.save();
    }

    res.json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRooms = async (req, res) => {
  try {
    const rooms = await Room.find().populate('host', 'username').populate('participants', 'username');
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.submitAnswer = async (req, res) => {
  const { roomId, answer } = req.body;

  try {
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const currentQuestion = room.quiz.questions[room.quiz.currentQuestion];
    const isCorrect = answer === currentQuestion.correctAnswer;

    // Update score or match history here
    // This is a simplified version

    res.json({ isCorrect });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
