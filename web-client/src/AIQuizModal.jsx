import React, { useState, useEffect } from 'react';
import './AIQuizModal.css';

// Pre-built question banks fallback if transcription is short
const FALLBACK_QUESTION_BANKS = [
  {
    id: 1,
    question: "Which protocol is primarily used for real-time peer-to-peer audio/video streaming in web browsers?",
    options: ["HTTP/2", "WebRTC", "FTP", "SMTP"],
    answer: 1,
    explanation: "WebRTC (Web Real-Time Communication) provides direct P2P audio, video, and data streaming between browsers."
  },
  {
    id: 2,
    question: "In WebRTC architecture, what role does the Signaling Server play?",
    options: [
      "Transcoding video streams",
      "Exchanging SDP offers/answers and ICE candidates",
      "Storing persistent video recordings",
      "Encrypting end-to-end user data"
    ],
    answer: 1,
    explanation: "Signaling servers coordinate connection setup by exchanging SDP metadata and ICE candidates before direct P2P streaming starts."
  },
  {
    id: 3,
    question: "What is the primary function of a STUN server?",
    options: [
      "Relay all media when direct connection fails",
      "Discover the public IP address and NAT mapping of a client",
      "Compress audio frames using Opus",
      "Authenticate user passwords"
    ],
    answer: 1,
    explanation: "STUN (Session Traversal Utilities for NAT) allows a client to find its own public IP and port behind NAT."
  },
  {
    id: 4,
    question: "Which WebSocket library event triggers when a remote peer disconnects?",
    options: ["socket.on('disconnect')", "socket.emit('leave')", "socket.kill()", "socket.drop()"],
    answer: 0,
    explanation: "Socket.IO emits the 'disconnect' event on socket teardown or network loss."
  }
];

export default function AIQuizModal({
  isOpen,
  onClose,
  isHost,
  transcription = "",
  socket,
  roomId,
  userName = "Student",
  activeQuizData,
  onQuizPublished
}) {
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Derive questions from transcription or fallback
  const generateQuestionsFromLecture = () => {
    setIsGenerating(true);
    setTimeout(() => {
      let generated = [];
      const cleanText = (transcription || "").trim();

      if (cleanText.length > 50) {
        const sentences = cleanText
          .split(/[.?!]/)
          .map(s => s.trim())
          .filter(s => s.length > 20);

        if (sentences.length >= 2) {
          const sample = sentences.slice(0, 3);
          generated = sample.map((sentence, idx) => {
            const words = sentence.split(" ");
            const targetWord = words.find(w => w.length > 5) || words[1] || "Key Concept";
            return {
              id: idx + 1,
              question: `According to today's lecture discussion: "${sentence.slice(0, 85)}..." What was emphasized?`,
              options: [
                `${targetWord} core implementation`,
                "Legacy monolithic architecture",
                "Non-standard HTTP requests",
                "Manual synchronization"
              ],
              answer: 0,
              explanation: `Directly referenced during lecture context: "${sentence}".`
            };
          });
        }
      }

      if (generated.length === 0) {
        generated = FALLBACK_QUESTION_BANKS;
      }

      setQuestions(generated);
      setUserAnswers({});
      setIsSubmitted(false);
      setScore(0);
      setIsGenerating(false);
    }, 450);
  };

  useEffect(() => {
    if (activeQuizData && activeQuizData.questions) {
      setQuestions(activeQuizData.questions);
      setUserAnswers({});
      setIsSubmitted(false);
      setScore(0);
    } else if (questions.length === 0) {
      generateQuestionsFromLecture();
    }
  }, [activeQuizData]);

  useEffect(() => {
    if (!socket) return;
    const handleScoreUpdate = (data) => {
      setLeaderboard(prev => {
        const filtered = prev.filter(item => item.userName !== data.userName);
        return [...filtered, data].sort((a, b) => b.score - a.score);
      });
    };

    socket.on('student-score-submitted', handleScoreUpdate);
    return () => {
      socket.off('student-score-submitted', handleScoreUpdate);
    };
  }, [socket]);

  if (!isOpen) return null;

  const handleSelectOption = (questionId, optionIndex) => {
    if (isSubmitted) return;
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleSubmitQuiz = () => {
    let calculated = 0;
    questions.forEach(q => {
      if (userAnswers[q.id] === q.answer) {
        calculated += 1;
      }
    });
    setScore(calculated);
    setIsSubmitted(true);

    if (socket && roomId) {
      socket.emit('submit-quiz-score', {
        roomId,
        studentName: userName,
        score: calculated,
        total: questions.length
      });
    }
  };

  const handlePublishQuiz = () => {
    if (socket && roomId) {
      socket.emit('publish-quiz', {
        roomId,
        quiz: {
          title: "Lecture Pop Quiz",
          questions,
          publishedAt: new Date().toLocaleTimeString()
        }
      });
      if (onQuizPublished) onQuizPublished(questions);
    }
  };

  return (
    <div className="ai-quiz-backdrop" onClick={onClose}>
      <div className="ai-quiz-modal" onClick={e => e.stopPropagation()}>
        <div className="quiz-modal-header">
          <div className="quiz-header-title">
            <span className="quiz-badge">AI Powered</span>
            <h3>📝 Lecture Pop Quiz & Assessment</h3>
          </div>
          <button className="quiz-close-btn" onClick={onClose} title="Close">×</button>
        </div>

        <div className="quiz-modal-body">
          {isSubmitted && (
            <div className="quiz-result-card">
              <div className="result-trophy">
                {score === questions.length ? '🏆' : score >= questions.length / 2 ? '🎉' : '📚'}
              </div>
              <div className="result-score-big">
                {score} / {questions.length}
              </div>
              <div className="result-feedback">
                {score === questions.length
                  ? "Outstanding! You mastered this lecture's concepts!"
                  : score >= questions.length / 2
                  ? "Good job! Review the explanations below to improve."
                  : "Keep practicing! Check the lecture notes and review."}
              </div>
            </div>
          )}

          {questions.map((q, idx) => {
            const selectedOpt = userAnswers[q.id];
            return (
              <div key={q.id} className="quiz-question-card">
                <div className="quiz-question-num">Question {idx + 1} of {questions.length}</div>
                <div className="quiz-question-text">{q.question}</div>

                <div className="quiz-options-grid">
                  {q.options.map((opt, optIdx) => {
                    let btnClass = "quiz-option-btn";
                    if (selectedOpt === optIdx) btnClass += " selected";
                    if (isSubmitted) {
                      if (optIdx === q.answer) btnClass += " correct";
                      else if (selectedOpt === optIdx) btnClass += " wrong";
                    }

                    return (
                      <button
                        key={optIdx}
                        className={btnClass}
                        disabled={isSubmitted}
                        onClick={() => handleSelectOption(q.id, optIdx)}
                      >
                        <span className="option-letter">{String.fromCharCode(65 + optIdx)}.</span>
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {isSubmitted && q.explanation && (
                  <div className="quiz-explanation-box">
                    <strong>💡 Explanation: </strong>{q.explanation}
                  </div>
                )}
              </div>
            );
          })}

          {leaderboard.length > 0 && (
            <div className="quiz-leaderboard">
              <div className="leaderboard-title">
                <span>🏅 Live Classroom Leaderboard</span>
                <span>{leaderboard.length} Submissions</span>
              </div>
              {leaderboard.map((entry, i) => (
                <div key={i} className="leaderboard-item">
                  <span>#{i + 1} {entry.studentName || entry.userName}</span>
                  <span className="student-score-badge">{entry.score} / {entry.total} ({entry.percentage || Math.round((entry.score / entry.total) * 100)}%)</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="quiz-modal-footer">
          <div>
            {isHost && (
              <button
                className="btn-secondary-action"
                onClick={generateQuestionsFromLecture}
                disabled={isGenerating}
              >
                {isGenerating ? "⚡ Generating..." : "🔄 Re-generate from Notes"}
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {isHost && (
              <button
                className="btn-primary-action"
                onClick={handlePublishQuiz}
                title="Broadcast this quiz to all students in room"
                style={{ background: '#10b981' }}
              >
                🚀 Launch to Students
              </button>
            )}

            {!isSubmitted ? (
              <button
                className="btn-primary-action"
                onClick={handleSubmitQuiz}
                disabled={Object.keys(userAnswers).length === 0}
              >
                Submit Answers ({Object.keys(userAnswers).length}/{questions.length})
              </button>
            ) : (
              <button className="btn-secondary-action" onClick={onClose}>
                Done / Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
