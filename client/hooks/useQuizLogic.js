import { useState, useEffect } from 'react';
import { useSocket } from './useSocket';

export default function useQuizLogic(roomId) {
  const { socket } = useSocket();
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    socket.on('quizStart', (quizQuestions) => {
      setQuestions(quizQuestions);
      setCurrentQuestionIndex(0);
      setTimeLeft(30);
    });

    socket.on('nextQuestion', () => {
      setCurrentQuestionIndex((prev) => prev + 1);
      setTimeLeft(30);
    });

    socket.on('answerResult', (isCorrect) => {
      if (isCorrect) {
        setScore((prev) => prev + 10);
      }
    });

    return () => {
      socket.off('quizStart');
      socket.off('nextQuestion');
      socket.off('answerResult');
    };
  }, [socket]);

  const submitAnswer = (answer) => {
    socket.emit('submitAnswer', { answer, roomId });
  };

  return {
    currentQuestion: questions[currentQuestionIndex],
    score,
    timeLeft,
    submitAnswer,
  };
};
