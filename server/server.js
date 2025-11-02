require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const matchHistoryRoutes = require('./routes/matchHistoryRoutes');
const quizRoutes = require('./routes/quizRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ['https://quizbattle-alpha.vercel.app', 'http://localhost:5173', 'http://localhost:5174', 'https://real-time-quiz-battle-pavakie.onrender.com'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Connect to database
connectDB();

// Middleware
app.use(cors({ origin: ['https://quizbattle-alpha.vercel.app', 'http://localhost:5173', 'http://localhost:5174', 'https://real-time-quiz-battle-pavakie.onrender.com'] }));
app.use(express.json());
app.use(errorHandler);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/match-history', matchHistoryRoutes);
app.use('/api/quiz', quizRoutes);

// Socket.io
require('./sockets/quizSocket')(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
