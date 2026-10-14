import React, { useState, useEffect } from 'react';
import './AIQuizModal.css';
import { get20QuestionsForTopic } from './quizQuestionBanks';

// Quick Topic Chips for Instant Selection
const TOPIC_PRESETS = [
  { key: 'webrtc', label: '🌐 WebRTC & Media Sync' },
  { key: 'react', label: '⚛️ React & State Hooks' },
  { key: 'os', label: '💻 Operating Systems' },
  { key: 'db', label: '🗄️ Database & SQL' },
  { key: 'networks', label: '🔗 Computer Networks' },
  { key: 'python', label: '🐍 Python & OOP' },
  { key: 'ai', label: '🤖 AI & Machine Learning' },
  { key: 'dsa', label: '🌲 Data Structures & Algo' }
];

export default function AIQuizModal({
  isOpen,
  onClose,
  isHost,
  transcription = "",
  currentVideoTitle = "",
  currentLectureTopic = "",
  roomHostName = "Instructor",
  socket,
  roomId,
  userName = "Student",
  activeQuizData,
  onQuizPublished
}) {
  const getInitialTopic = () => {
    return (
      activeQuizData?.topic ||
      (currentLectureTopic && currentLectureTopic.trim()) ||
      (currentVideoTitle && currentVideoTitle !== 'Lecture Video' && currentVideoTitle.trim()) ||
      "WebRTC & Real-Time Sync"
    );
  };

  const [topicInput, setTopicInput] = useState(getInitialTopic);
  const [activeTopicKey, setActiveTopicKey] = useState("");
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [quizMetadata, setQuizMetadata] = useState(null);

  // Generate 20 questions for the selected/entered topic
  const generateQuestionsForTopic = (targetTopic) => {
    setIsGenerating(true);
    const chosenTopic = (targetTopic || topicInput || currentLectureTopic || "WebRTC & Real-Time Sync").trim();

    setTimeout(() => {
      const result = get20QuestionsForTopic(chosenTopic, transcription);
      setQuestions(result.questions);
      setTopicInput(result.topic || chosenTopic);
      setUserAnswers({});
      setIsSubmitted(false);
      setScore(0);
      setIsGenerating(false);

      const metadata = {
        topic: result.topic || chosenTopic,
        instructorName: isHost ? (userName || "Instructor") : (roomHostName || "Instructor"),
        totalQuestions: result.questions.length,
        publishedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setQuizMetadata(metadata);

      // If instructor generated, broadcast immediately to the entire classroom!
      if (isHost && socket && roomId) {
        socket.emit('set-room-topic', {
          roomId,
          topic: result.topic || chosenTopic
        });

        const payload = {
          roomId,
          quiz: {
            id: 'quiz_' + Date.now(),
            topic: result.topic || chosenTopic,
            title: `Quiz: ${result.topic || chosenTopic}`,
            questions: result.questions,
            totalQuestions: result.questions.length,
            instructorName: userName || "Instructor",
            publishedAt: metadata.publishedAt
          }
        };
        socket.emit('publish-quiz', payload);
        if (onQuizPublished) onQuizPublished(payload.quiz);
      }
    }, 200);
  };

  // Auto-detect topic from live video title, current lecture topic, or captions
  const handleAutoDetectTopic = () => {
    let detected = "";
    if (currentLectureTopic && currentLectureTopic.trim().length > 2) {
      detected = currentLectureTopic.trim();
    } else if (currentVideoTitle && currentVideoTitle !== 'Lecture Video' && currentVideoTitle.trim().length > 3) {
      detected = currentVideoTitle.replace(/[|•\-_].*$/, '').trim();
    } else if (transcription && transcription.trim().length > 15) {
      const words = transcription.trim().split(" ");
      detected = words.slice(0, 4).join(" ");
    } else {
      detected = "WebRTC & Real-Time Sync";
    }

    setTopicInput(detected);
    generateQuestionsForTopic(detected);
  };

  // Update topic when currentLectureTopic prop changes (e.g. from room entrance or backend fetch)
  useEffect(() => {
    if (currentLectureTopic && currentLectureTopic.trim() && !activeQuizData) {
      setTopicInput(currentLectureTopic.trim());
      if (questions.length === 0) {
        generateQuestionsForTopic(currentLectureTopic.trim());
      }
    }
  }, [currentLectureTopic]);

  // Sync active quiz broadcasted by instructor
  useEffect(() => {
    if (activeQuizData && activeQuizData.questions && activeQuizData.questions.length > 0) {
      setQuestions(activeQuizData.questions);
      setTopicInput(activeQuizData.topic || "Lecture Pop Quiz");
      setQuizMetadata(activeQuizData);
      setUserAnswers({});
      setIsSubmitted(false);
      setScore(0);
    } else if (questions.length === 0) {
      // Initialize with 20 questions based on the class topic
      generateQuestionsForTopic(topicInput || currentLectureTopic);
    }
  }, [activeQuizData]);

  // Listen directly for room-quiz-published on socket inside modal for instant real-time reload
  useEffect(() => {
    if (!socket) return;
    const handleDirectQuizPublished = (quiz) => {
      if (quiz && quiz.questions && quiz.questions.length > 0) {
        setQuestions(quiz.questions);
        setTopicInput(quiz.topic || "Lecture Pop Quiz");
        setQuizMetadata(quiz);
        setUserAnswers({});
        setIsSubmitted(false);
        setScore(0);
      }
    };

    socket.on('room-quiz-published', handleDirectQuizPublished);
    return () => {
      socket.off('room-quiz-published', handleDirectQuizPublished);
    };
  }, [socket]);

  // Request active quiz on open if student
  useEffect(() => {
    if (isOpen && !isHost && socket && roomId) {
      socket.emit('request-active-quiz', { roomId });
    }
  }, [isOpen, isHost, socket, roomId]);

  // Listen for live student score submissions on room leaderboard
  useEffect(() => {
    if (!socket) return;
    const handleScoreUpdate = (data) => {
      setLeaderboard(prev => {
        const filtered = prev.filter(item => item.studentName !== data.studentName);
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
        total: questions.length,
        percentage: Math.round((calculated / questions.length) * 100),
        topic: quizMetadata?.topic || topicInput
      });
    }
  };

  const handlePublishQuiz = () => {
    if (socket && roomId) {
      const payload = {
        roomId,
        quiz: {
          id: 'quiz_' + Date.now(),
          topic: topicInput,
          title: `Quiz: ${topicInput}`,
          questions, // all 20 questions
          totalQuestions: questions.length,
          instructorName: userName || 'Instructor',
          publishedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      };
      socket.emit('publish-quiz', payload);
      setQuizMetadata(payload.quiz);
      if (onQuizPublished) onQuizPublished(payload.quiz);
    }
  };

  return (
    <div className="ai-quiz-backdrop" onClick={onClose}>
      <div className="ai-quiz-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="quiz-modal-header">
          <div className="quiz-header-title">
            <span className="quiz-badge">20-QUESTION AI QUIZ</span>
            <h3>📝 {isHost ? 'AI Lecture Quiz Maker' : `Live Assessment: ${quizMetadata?.topic || topicInput}`}</h3>
          </div>
          <button className="quiz-close-btn" onClick={onClose} title="Close">×</button>
        </div>

        {/* Modal Body */}
        <div className="quiz-modal-body">

          {/* INSTRUCTOR TOPIC SELECTOR & CONTROL BAR */}
          {isHost ? (
            <div className="quiz-topic-control-bar">
              <div className="quiz-topic-input-row">
                <div className="quiz-topic-label-wrap">
                  <span className="topic-target-icon">🎯</span>
                  <span className="topic-target-title">Lecture Topic:</span>
                </div>
                <input
                  type="text"
                  className="quiz-topic-input"
                  placeholder="Enter lecture topic (e.g. WebRTC, React Hooks, Operating Systems, AI...)"
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') generateQuestionsForTopic(topicInput);
                  }}
                />
                <button
                  type="button"
                  className="btn-topic-generate"
                  onClick={() => generateQuestionsForTopic(topicInput)}
                  disabled={isGenerating || !topicInput.trim()}
                  title="Generate 20 Questions and launch to student classroom"
                >
                  {isGenerating ? "⚡ Generating (20 Qs)..." : "⚡ Generate & Send Quiz (20 Qs)"}
                </button>
                <button
                  type="button"
                  className="btn-topic-autodetect"
                  onClick={handleAutoDetectTopic}
                  title="Auto-detect topic from class entrance topic, video, or captions"
                >
                  🔍 Auto-Detect
                </button>
              </div>

              {/* Quick Topic Chips */}
              <div className="quiz-topic-chips-scroll">
                <span className="chips-label">Quick Topics:</span>
                {TOPIC_PRESETS.map(preset => (
                  <button
                    key={preset.key}
                    type="button"
                    className={`quiz-topic-chip ${activeTopicKey === preset.key && topicInput === preset.label.replace(/^.*? /, '') ? 'active' : ''}`}
                    onClick={() => {
                      const cleanLabel = preset.label.replace(/^.*? /, '');
                      setActiveTopicKey(preset.key);
                      setTopicInput(cleanLabel);
                      generateQuestionsForTopic(cleanLabel);
                    }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* STUDENT TOPIC BANNER */
            <div className="quiz-student-banner">
              <div className="student-banner-left">
                <span className="student-banner-icon">🎯</span>
                <div className="student-banner-text">
                  <span className="student-banner-topic">Topic: {quizMetadata?.topic || topicInput || currentLectureTopic}</span>
                  <span className="student-banner-meta">
                    Assigned by {quizMetadata?.instructorName || roomHostName || 'Instructor'} • {questions.length} Questions • {quizMetadata?.publishedAt || 'Active Live Session'}
                  </span>
                </div>
              </div>
              <span className="student-banner-badge">Verified 20-Q Quiz</span>
            </div>
          )}

          {/* RESULTS CARD (Shown After Submission) */}
          {isSubmitted && (
            <div className="quiz-result-card">
              <div className="result-trophy">
                {score === questions.length ? '🏆' : score >= questions.length / 2 ? '🎉' : '📚'}
              </div>
              <div className="result-score-big">
                {score} / {questions.length}
              </div>
              <div className="result-percentage">
                {Math.round((score / questions.length) * 100)}% Accuracy on "{quizMetadata?.topic || topicInput}"
              </div>
              <div className="result-feedback">
                {score >= 18
                  ? `Outstanding! You have mastered the lecture on "${quizMetadata?.topic || topicInput}"!`
                  : score >= 10
                  ? `Good effort! Review the conceptual explanations below to reinforce "${quizMetadata?.topic || topicInput}".`
                  : `Needs review! Check the explanations below and revisit lecture notes on "${quizMetadata?.topic || topicInput}".`}
              </div>
            </div>
          )}

          {/* QUESTIONS LIST (All 20 Questions) */}
          <div className="quiz-questions-list">
            {questions.map((q, idx) => {
              const selectedOpt = userAnswers[q.id];
              return (
                <div key={q.id} className="quiz-question-card">
                  <div className="quiz-question-header-row">
                    <span className="quiz-question-num">Question {idx + 1} of {questions.length}</span>
                    <span className="quiz-question-topic-tag">📌 {quizMetadata?.topic || topicInput}</span>
                  </div>
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
                      <strong>💡 Conceptual Explanation: </strong>{q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* CLASSROOM LIVE LEADERBOARD */}
          {leaderboard.length > 0 && (
            <div className="quiz-leaderboard">
              <div className="leaderboard-title">
                <span>🏅 Live Classroom Leaderboard ({quizMetadata?.topic || topicInput})</span>
                <span>{leaderboard.length} Submission(s)</span>
              </div>
              {leaderboard.map((entry, i) => (
                <div key={i} className="leaderboard-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="leaderboard-rank">#{i + 1}</span>
                    <span className="leaderboard-name">{entry.studentName}</span>
                  </div>
                  <span className="student-score-badge">
                    {entry.score} / {entry.total} ({entry.percentage || Math.round((entry.score / entry.total) * 100)}%)
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="quiz-modal-footer">
          <div>
            {isHost && (
              <button
                type="button"
                className="btn-secondary-action"
                onClick={() => generateQuestionsForTopic(topicInput)}
                disabled={isGenerating}
                title="Regenerate 20 different questions on this topic and broadcast"
              >
                {isGenerating ? "⚡ Generating..." : "🔄 Re-generate & Broadcast (20 Qs)"}
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {isHost && (
              <button
                type="button"
                className="btn-primary-action launch-btn"
                onClick={handlePublishQuiz}
                title="Broadcast this 20-question quiz on the lecture topic directly to all students"
              >
                🚀 Launch Quiz to Classroom
              </button>
            )}

            {!isSubmitted ? (
              <button
                type="button"
                className="btn-primary-action"
                onClick={handleSubmitQuiz}
                disabled={Object.keys(userAnswers).length === 0}
              >
                Submit Answers ({Object.keys(userAnswers).length}/{questions.length})
              </button>
            ) : (
              <button type="button" className="btn-secondary-action" onClick={onClose}>
                Done / Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
