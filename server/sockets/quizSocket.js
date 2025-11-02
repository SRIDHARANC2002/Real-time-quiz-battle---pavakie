const Room = require('../models/Room');
const MatchHistory = require('../models/MatchHistory');
const defaultQuestions = require('../utils/quizQuestions');

// Store player scores per room (in-memory for real-time updates)
const roomScores = new Map(); // roomId -> { userId: score }

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join room via socket
    socket.on('join-room', async (data) => {
      const { roomId, userId, username } = data;

      // Check room capacity based on room type
      const room = await Room.findById(roomId);
      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      // Check if room is full
      const currentPlayers = room.participants.length + 1; // +1 for host
      const maxPlayers = room.roomType === '1v1' ? 2 : 10; // 1v1 allows max 2 players, multiplayer allows up to 10

      if (currentPlayers >= maxPlayers) {
        socket.emit('error', { message: `Room is full. ${room.roomType === '1v1' ? '1v1 rooms' : 'Multiplayer rooms'} can have maximum ${maxPlayers} players.` });
        return;
      }

      socket.join(roomId);
      console.log(`User ${username} (${socket.id}) joined room ${roomId}`);

      // Initialize scores for room if needed
      if (!roomScores.has(roomId)) {
        roomScores.set(roomId, new Map());
      }
      roomScores.get(roomId).set(userId, 0);

      // Add user to participants if not already there
      if (!room.participants.includes(userId)) {
        room.participants.push(userId);
        await room.save();
      }

      // Get updated room info and send to client
      const updatedRoom = await Room.findById(roomId).populate('host', 'username').populate('participants', 'username');
      if (updatedRoom) {
        const players = Array.from(roomScores.get(roomId).entries()).map(([id, score]) => {
          const isHost = id === updatedRoom.host._id.toString();
          const participant = updatedRoom.participants.find(p => p._id.toString() === id);
          return {
            userId: id,
            score: score,
            name: isHost ? updatedRoom.host.username : (participant?.username || 'Player')
          };
        });

        // Send current room state
        socket.emit('room-joined', {
          room: {
            _id: updatedRoom._id,
            name: updatedRoom.name,
            roomType: updatedRoom.roomType,
            host: updatedRoom.host._id,
            participants: updatedRoom.participants,
            quiz: updatedRoom.quiz
          },
          players: players
        });

        // Broadcast updated player list to all in room
        io.to(roomId).emit('scoreUpdate', players);
        io.to(roomId).emit('roomStatus', updatedRoom.quiz.isActive ? 'active' : 'waiting');

        // Auto-start quiz for 1v1 rooms when exactly 2 players are present
        if (updatedRoom.roomType === '1v1' && updatedRoom.participants.length === 1 && !updatedRoom.quiz.isActive) {
          // Start the quiz automatically
          updatedRoom.quiz.isActive = true;
          updatedRoom.quiz.currentQuestion = 0;
          await updatedRoom.save();

          const firstQuestion = {
            text: updatedRoom.quiz.questions[0].question,
            options: updatedRoom.quiz.questions[0].options.map((opt, idx) => ({
              id: idx,
              text: opt
            })),
            questionNumber: 1,
            totalQuestions: updatedRoom.quiz.questions.length
          };

          io.to(roomId).emit('quiz-started', firstQuestion);
          io.to(roomId).emit('roomStatus', 'active');
        }
      }
    });

    // Create room with custom or default questions
    socket.on('createRoom', async (data) => {
      const { roomName, roomType, userId, quiz } = data;
      try {
        // Use custom quiz if provided, otherwise use default questions
        let roomQuiz;
        if (quiz && quiz.questions && quiz.questions.length > 0) {
          roomQuiz = {
            questions: quiz.questions,
            currentQuestion: 0,
            isActive: false
          };
        } else {
          roomQuiz = {
            questions: defaultQuestions.map((q, idx) => ({
              question: q.question,
              options: q.options,
              correctAnswer: q.correctAnswer
            })),
            currentQuestion: 0,
            isActive: false
          };
        }

        const room = await Room.create({
          name: roomName,
          roomType: roomType || 'multiplayer',
          host: userId,
          quiz: roomQuiz
        });

        // Initialize scores
        roomScores.set(room._id.toString(), new Map());
        roomScores.get(room._id.toString()).set(userId, 0);

        socket.emit('roomCreated', { roomId: room._id.toString(), room });
      } catch (error) {
        console.error('Error creating room:', error);
        socket.emit('error', { message: 'Failed to create room' });
      }
    });

    // Start quiz
    socket.on('start-quiz', async (roomId) => {
      const room = await Room.findById(roomId);
      if (room && !room.quiz.isActive) {
        room.quiz.isActive = true;
        room.quiz.currentQuestion = 0;
        await room.save();

        // Reset scores for new quiz
        if (roomScores.has(roomId)) {
          roomScores.get(roomId).forEach((score, userId) => {
            roomScores.get(roomId).set(userId, 0);
          });
        }

        const firstQuestion = {
          text: room.quiz.questions[0].question,
          options: room.quiz.questions[0].options.map((opt, idx) => ({
            id: idx,
            text: opt
          })),
          questionNumber: 1,
          totalQuestions: room.quiz.questions.length
        };

        const roomWithUsers = await Room.findById(roomId).populate('host', 'username').populate('participants', 'username');
        const players = Array.from(roomScores.get(roomId).entries()).map(([id, score]) => {
          const isHost = id === roomWithUsers.host._id.toString();
          const participant = roomWithUsers.participants.find(p => p._id.toString() === id);
          return {
            userId: id,
            score: score,
            name: isHost ? roomWithUsers.host.username : (participant?.username || 'Player')
          };
        });

        io.to(roomId).emit('quiz-started', firstQuestion);
        io.to(roomId).emit('roomStatus', 'active');
        io.to(roomId).emit('scoreUpdate', players);
      }
    });

    // Next question
    socket.on('next-question', async (roomId) => {
      const room = await Room.findById(roomId);
      if (room && room.quiz.currentQuestion < room.quiz.questions.length - 1) {
        room.quiz.currentQuestion++;
        await room.save();

        const question = room.quiz.questions[room.quiz.currentQuestion];
        const questionData = {
          text: question.question,
          options: question.options.map((opt, idx) => ({
            id: idx,
            text: opt
          })),
          questionNumber: room.quiz.currentQuestion + 1,
          totalQuestions: room.quiz.questions.length
        };

        io.to(roomId).emit('new-question', questionData);
      } else {
        // Quiz ended - save match history for all players
        const room = await Room.findById(roomId).populate('host', 'username').populate('participants', 'username');
        if (room) {
          const finalScores = roomScores.get(roomId) || new Map();
          
          // Save match history for all players
          const matchHistoryPromises = Array.from(finalScores.entries()).map(([userId, score]) => {
            return MatchHistory.findOneAndUpdate(
              { user: userId, room: roomId, createdAt: { $gte: new Date(Date.now() - 60000) } }, // Match if created within last minute (same quiz)
              {
                user: userId,
                room: roomId,
                score: score,
                totalQuestions: room.quiz.questions.length,
              },
              { upsert: true, new: true }
            );
          });

          await Promise.all(matchHistoryPromises);

          const finalPlayers = Array.from(finalScores.entries()).map(([id, score]) => {
            const isHost = id === room.host._id.toString();
            const participant = room.participants.find(p => p._id.toString() === id);
            return {
              userId: id,
              score: score,
              name: isHost ? room.host.username : (participant?.username || 'Player')
            };
          });

          room.quiz.isActive = false;
          await room.save();

          io.to(roomId).emit('quiz-ended', { players: finalPlayers });
          io.to(roomId).emit('roomStatus', 'finished');
        }
      }
    });

    // Submit answer
    socket.on('submit-answer', async (data) => {
      const { roomId, answer, userId } = data;
      const room = await Room.findById(roomId);
      
      if (room && room.quiz.isActive) {
        const currentQuestion = room.quiz.questions[room.quiz.currentQuestion];
        const isCorrect = parseInt(answer) === currentQuestion.correctAnswer;

        // Update score in memory
        if (!roomScores.has(roomId)) {
          roomScores.set(roomId, new Map());
        }
        const currentScore = roomScores.get(roomId).get(userId) || 0;
        roomScores.get(roomId).set(userId, isCorrect ? currentScore + 10 : currentScore);

        // Send result to submitting player
        socket.emit('answer-result', { isCorrect });

        // Broadcast updated scores to all players in room
        const roomWithUsers = await Room.findById(roomId).populate('host', 'username').populate('participants', 'username');
        const players = Array.from(roomScores.get(roomId).entries()).map(([id, score]) => {
          const isHost = id === room.host.toString();
          const participant = roomWithUsers.participants.find(p => p._id.toString() === id);
          return {
            userId: id,
            score: score,
            name: isHost ? room.host.username : (participant?.username || 'Player')
          };
        });

        io.to(roomId).emit('scoreUpdate', players);
      }
    });

    // Alternative answer event (for compatibility)
    socket.on('answer', async (data) => {
      await socket.emit('submit-answer', data);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};
