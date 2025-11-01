import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { SocketProvider } from '../context/SocketContext';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import Home from '../pages/Home';
import CreateRoom from '../pages/CreateRoom';
import JoinRoom from '../pages/JoinRoom';
import QuizRoom from '../pages/QuizRoom';
import Leaderboard from '../pages/Leaderboard';
import MatchHistory from '../pages/MatchHistory';
import NotFound from '../pages/NotFound';
import Navbar from '../Components/Navbar';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

const AppRouter = () => {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/create-room" element={<ProtectedRoute><CreateRoom /></ProtectedRoute>} />
            <Route path="/join-room" element={<ProtectedRoute><JoinRoom /></ProtectedRoute>} />
            <Route path="/quiz-room/:roomId" element={<ProtectedRoute><QuizRoom /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
            <Route path="/match-history" element={<ProtectedRoute><MatchHistory /></ProtectedRoute>} />
            <Route path="/" element={<Navigate to="/home" />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
};

export default AppRouter;
