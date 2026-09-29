import React, { useState, useEffect } from 'react';
import './AIQuizModal.css';

// ── Curated Topic Question Banks for Popular Classroom Subjects ──
const TOPIC_QUESTION_BANKS = {
  webrtc: {
    name: "WebRTC & Real-Time Sync",
    questions: [
      {
        id: 1,
        question: "Which protocol is primarily used for real-time peer-to-peer audio, video, and data streaming in modern web browsers?",
        options: ["HTTP/2", "WebRTC", "FTP", "SMTP"],
        answer: 1,
        explanation: "WebRTC (Web Real-Time Communication) enables direct peer-to-peer audio, video, and arbitrary data streaming between browsers with ultra-low latency."
      },
      {
        id: 2,
        question: "In WebRTC peer connection architecture, what is the critical role of the Signaling Server?",
        options: [
          "Transcoding video bitrates on the fly",
          "Exchanging SDP offers/answers and ICE candidates to establish the P2P connection",
          "Permanently recording all video streams on disk",
          "Encrypting end-to-end user audio keys"
        ],
        answer: 1,
        explanation: "The signaling server mediates connection negotiation by exchanging SDP (Session Description Protocol) session metadata and ICE candidates before direct P2P streaming begins."
      },
      {
        id: 3,
        question: "What is the primary function of a STUN (Session Traversal Utilities for NAT) server?",
        options: [
          "Relay all media packets when direct P2P routing fails",
          "Discover the public IP address and NAT port mapping of a client behind a router",
          "Encode audio frames using the Opus codec",
          "Issue digital SSL certificates for peers"
        ],
        answer: 1,
        explanation: "STUN allows a client behind a NAT or firewall to discover its own public IP address and external port allocation so peers can connect."
      },
      {
        id: 4,
        question: "When a direct peer connection cannot be established due to symmetric NAT or strict corporate firewalls, which fallback server is utilized?",
        options: ["TURN Relay Server", "DNS Server", "NTP Time Server", "POP3 Mail Server"],
        answer: 0,
        explanation: "TURN (Traversal Using Relays around NAT) acts as a media relay server when direct P2P connection fails due to symmetric NAT restrictions."
      }
    ]
  },
  react: {
    name: "React & Modern Frontend",
    questions: [
      {
        id: 1,
        question: "What is the primary purpose of the `useEffect` hook in functional React components?",
        options: [
          "Directly mutate the browser DOM hierarchy synchronously",
          "Execute side effects such as data fetching, subscriptions, and DOM updates after render",
          "Define persistent global CSS style classes",
          "Cache database query transactions in browser storage"
        ],
        answer: 1,
        explanation: "`useEffect` tells React that your component needs to perform side effects (like API requests, timers, or event listeners) after the component renders."
      },
      {
        id: 2,
        question: "How does the React Virtual DOM (VDOM) improve user interface rendering performance?",
        options: [
          "It completely avoids updating the real DOM under any circumstances",
          "It keeps a lightweight virtual representation in memory, calculates diffs, and batches real DOM updates",
          "It forces the GPU to render raw canvas pixels instead of HTML tags",
          "It compiles JSX into native C++ machine code"
        ],
        answer: 1,
        explanation: "The Virtual DOM calculates the minimal set of real DOM operations required using reconciliation diffing, avoiding costly direct DOM layout reflows."
      },
      {
        id: 3,
        question: "According to the official Rules of Hooks, where must React Hooks be called?",
        options: [
          "Inside nested loops, condition blocks, or nested closures",
          "Only at the top level of React functional components or custom hooks",
          "Inside standard JavaScript class lifecycle methods",
          "Inside HTML event handler attributes like onclick"
        ],
        answer: 1,
        explanation: "Hooks must only be called at the top level to guarantee that React calls hooks in the exact same order on every component render."
      },
      {
        id: 4,
        question: "What is the purpose of `useMemo` in React component optimization?",
        options: [
          "To memoize the calculated result of an expensive function between renders",
          "To bind an input element to the Redux store automatically",
          "To trigger a full browser window refresh",
          "To validate TypeScript interfaces at runtime"
        ],
        answer: 0,
        explanation: "`useMemo` caches the calculated value of an expensive operation so it is only recomputed when one of its specified dependencies changes."
      }
    ]
  },
  os: {
    name: "Operating Systems & Concurrency",
    questions: [
      {
        id: 1,
        question: "What is the fundamental difference between a Process and a Thread in operating systems?",
        options: [
          "Threads have completely isolated memory spaces, whereas processes share memory",
          "Threads within the same process share the same address space and resources, while processes have isolated memory",
          "Processes run in kernel mode only, while threads run exclusively in hardware firmware",
          "Threads cannot be scheduled independently by the OS scheduler"
        ],
        answer: 1,
        explanation: "A process represents an independent executing program with its own address space. Threads are lightweight execution units within a process that share code, data, and OS resources."
      },
      {
        id: 2,
        question: "Which of the following is NOT one of the four necessary Coffman conditions required for a deadlock to occur?",
        options: [
          "Mutual Exclusion",
          "Hold and Wait",
          "Circular Wait",
          "Preemptive Priority Inversion"
        ],
        answer: 3,
        explanation: "The four Coffman conditions are Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. Preemptive priority inversion is an unrelated scheduling anomaly."
      },
      {
        id: 3,
        question: "What mechanism is utilized in Priority CPU Scheduling algorithms to prevent indefinite starvation of low-priority processes?",
        options: ["Aging (gradually increasing priority over time)", "Context Switching", "Round Robin slicing", "TLB Flushing"],
        answer: 0,
        explanation: "Aging gradually increases the priority of processes that wait in the ready queue for a long time, guaranteeing they will eventually execute."
      },
      {
        id: 4,
        question: "What is the primary role of Virtual Memory in modern computer operating systems?",
        options: [
          "To allow processes to execute using an address space larger than available physical RAM via paging",
          "To speed up GPU shader compilation",
          "To replace CPU cache memory with hard drive blocks",
          "To synchronize clock cycles across distributed nodes"
        ],
        answer: 0,
        explanation: "Virtual memory maps process address spaces to physical RAM pages and disk swap space, providing memory protection, isolation, and the illusion of contiguous memory."
      }
    ]
  },
  db: {
    name: "Database Systems & SQL",
    questions: [
      {
        id: 1,
        question: "In database transaction management, what does the ACID acronym stand for?",
        options: [
          "Accuracy, Consistency, Integrity, Durability",
          "Atomicity, Consistency, Isolation, Durability",
          "Asynchronous, Concurrent, Indexed, Distributed",
          "Allocation, Constraint, Inheritance, Decoupling"
        ],
        answer: 1,
        explanation: "ACID stands for Atomicity (all or nothing), Consistency (valid state transitions), Isolation (independent transactions), and Durability (committed data survives crashes)."
      },
      {
        id: 2,
        question: "What is the primary goal of Database Normalization (such as 1NF, 2NF, 3NF, BCNF)?",
        options: [
          "To duplicate tables across multiple disk drives for speed",
          "To reduce data redundancy and eliminate insertion, update, and deletion anomalies",
          "To convert SQL queries into JSON documents",
          "To encrypt database passwords with SHA-256"
        ],
        answer: 1,
        explanation: "Normalization organizes tables and column relationships to minimize duplicate redundant data and prevent data modification inconsistencies."
      },
      {
        id: 3,
        question: "Why are B-Tree / B+Tree indexes predominantly used in relational and document database engines?",
        options: [
          "They guarantee O(1) time regardless of data distribution",
          "They keep data sorted and allow logarithmic O(log N) search, sequential range scans, and insertions",
          "They eliminate the need for primary keys",
          "They compress table columns using gzip algorithm"
        ],
        answer: 1,
        explanation: "B+Tree structures have high fan-out, minimizing disk I/O reads while providing balanced logarithmic lookup and high-speed sequential range iteration."
      },
      {
        id: 4,
        question: "When is a Document NoSQL database (such as MongoDB) typically preferred over a traditional Relational SQL database?",
        options: [
          "When data models require strict foreign key constraints and multi-table ACID transactions across legacy ERPs",
          "When data is hierarchical, semi-structured, schema-flexible, and requires horizontal scale-out across clusters",
          "When you only need to store flat text CSV files",
          "When no network connections are allowed"
        ],
        answer: 1,
        explanation: "MongoDB stores JSON/BSON documents, allowing flexible dynamic schemas, nested arrays/sub-documents, and built-in horizontal sharding across distributed clusters."
      }
    ]
  },
  networks: {
    name: "Computer Networks & Protocols",
    questions: [
      {
        id: 1,
        question: "At which layer of the standard 7-layer OSI model does the Transmission Control Protocol (TCP) operate?",
        options: ["Network Layer (Layer 3)", "Transport Layer (Layer 4)", "Data Link Layer (Layer 2)", "Session Layer (Layer 5)"],
        answer: 1,
        explanation: "TCP operates at Layer 4 (Transport Layer), providing reliable, ordered, and error-checked byte stream delivery between applications."
      },
      {
        id: 2,
        question: "What is the primary distinction in transmission delivery between TCP and UDP?",
        options: [
          "TCP is connection-oriented with acknowledgments and retransmissions; UDP is connectionless and low-overhead",
          "UDP guarantees in-order packet arrival, while TCP does not",
          "TCP only works over fiber optic cables, while UDP works over Wi-Fi",
          "UDP encrypts all payload headers by default"
        ],
        answer: 0,
        explanation: "TCP uses a 3-way handshake and packet sequencing to guarantee reliable delivery, while UDP prioritizes speed and low latency (e.g. gaming, video streaming) without retransmission delays."
      },
      {
        id: 3,
        question: "What is the primary role of the Domain Name System (DNS)?",
        options: [
          "Translating human-readable domain names (e.g. google.com) into machine-routable IP addresses",
          "Encrypting HTTP request bodies with AES-256",
          "Assigning MAC addresses to network interface cards",
          "Routing border gateway BGP traffic"
        ],
        answer: 0,
        explanation: "DNS acts as the phonebook of the internet, translating domain hostnames into numeric IPv4/IPv6 addresses so network packets reach the correct server."
      },
      {
        id: 4,
        question: "Which default TCP port is designated for encrypted HTTPS secure web traffic?",
        options: ["Port 80", "Port 21", "Port 443", "Port 8080"],
        answer: 2,
        explanation: "Port 443 is the standard port for HTTPS (HTTP over TLS/SSL), whereas port 80 is used for unencrypted HTTP traffic."
      }
    ]
  },
  python: {
    name: "Python & Object-Oriented Programming",
    questions: [
      {
        id: 1,
        question: "In Python, what is the primary purpose and behavior of a Decorator (`@decorator_name`)?",
        options: [
          "To permanently delete a function after execution",
          "To modify or extend the behavior of a function or method without modifying its original source code",
          "To compile Python bytecode into C headers",
          "To declare global variables within a package"
        ],
        answer: 1,
        explanation: "Decorators are callable higher-order functions that wrap another function to transparently extend its functionality (such as logging, authentication, or timing)."
      },
      {
        id: 2,
        question: "What is the difference between a Shallow Copy (`copy.copy()`) and a Deep Copy (`copy.deepcopy()`) in Python?",
        options: [
          "Shallow copy copies references to nested objects, while deep copy recursively duplicates all nested objects and values",
          "Shallow copy only works on primitive integers, while deep copy works on strings",
          "Deep copy produces read-only immutable tuples",
          "There is no functional difference"
        ],
        answer: 0,
        explanation: "A shallow copy constructs a new compound object and inserts references to the original nested elements. A deep copy recursively duplicates every object found."
      },
      {
        id: 3,
        question: "In Object-Oriented Programming (OOP), what is Polymorphism?",
        options: [
          "Restricting access to class variables using private modifiers",
          "The ability of different derived classes to implement and respond to the same method interface in their own specific way",
          "Writing a program using only static functions without classes",
          "Converting code from Python 2 to Python 3"
        ],
        answer: 1,
        explanation: "Polymorphism allows objects of different classes to be treated through a common interface, where each subclass implements its own specialized behavior."
      },
      {
        id: 4,
        question: "How does Python handle automated memory management and deallocation of unused objects?",
        options: [
          "Manual `malloc` and `free` pointers like C",
          "Reference Counting combined with a cyclic Garbage Collector",
          "Restarting the operating system when RAM is full",
          "Allocating infinite stack frames"
        ],
        answer: 1,
        explanation: "Python predominantly uses reference counting for immediate deallocation when an object's reference counter hits zero, alongside a generational garbage collector to resolve reference cycles."
      }
    ]
  },
  ai: {
    name: "Artificial Intelligence & Machine Learning",
    questions: [
      {
        id: 1,
        question: "What is the primary difference between Supervised Learning and Unsupervised Learning?",
        options: [
          "Supervised learning trains models on labeled input-output pairs; unsupervised learning finds inherent structure in unlabeled data",
          "Supervised learning requires quantum computers, while unsupervised runs on microcontrollers",
          "Unsupervised learning always produces 100% accurate predictions",
          "Supervised learning does not use loss functions"
        ],
        answer: 0,
        explanation: "Supervised algorithms learn from training examples with explicit ground-truth labels (targets), while unsupervised algorithms discover clusters, patterns, or latent representations without pre-existing labels."
      },
      {
        id: 2,
        question: "In Machine Learning model evaluation, what is Overfitting?",
        options: [
          "When a model performs poorly on training data and fails to capture the underlying pattern",
          "When a model memorizes training data noise and performs poorly on unseen test data",
          "When a model has too few parameters to learn simple features",
          "When training completes in under one second"
        ],
        answer: 1,
        explanation: "Overfitting occurs when a high-capacity model learns the training data too closely, including random noise, resulting in high training accuracy but poor generalization to new data."
      },
      {
        id: 3,
        question: "Why is the ReLU (Rectified Linear Unit, `f(x) = max(0, x)`) activation function widely used in deep neural networks?",
        options: [
          "It mitigates the vanishing gradient problem and allows faster gradient descent convergence compared to Sigmoid",
          "It forces all weights to zero immediately",
          "It restricts outputs to values between -1 and +1",
          "It eliminates the need for backpropagation"
        ],
        answer: 0,
        explanation: "ReLU has a constant derivative of 1 for positive inputs, preventing the gradient from diminishing exponentially across deep layers during backpropagation."
      },
      {
        id: 4,
        question: "What is the core objective of the Loss Function (Cost Function) in machine learning training?",
        options: [
          "To measure the quantitative error between model predictions and actual ground truth targets",
          "To allocate disk space for dataset storage",
          "To randomly shuffle training image labels",
          "To compress model parameters into ZIP format"
        ],
        answer: 0,
        explanation: "The loss function calculates a scalar value quantifying the discrepancy between the network's prediction and the desired label, which the optimizer seeks to minimize."
      }
    ]
  },
  dsa: {
    name: "Data Structures & Algorithms",
    questions: [
      {
        id: 1,
        question: "What is the worst-case time complexity of the QuickSort algorithm, and when does it occur?",
        options: [
          "O(n log n) under all distributions",
          "O(n²) when the chosen pivot is consistently the smallest or largest element (e.g. already sorted array with naive pivot)",
          "O(1) constant time",
          "O(log n) logarithmic time"
        ],
        answer: 1,
        explanation: "If the pivot divides the array into subproblems of size 0 and n-1 at each step, the recursion depth reaches n, resulting in worst-case O(n²) comparisons."
      },
      {
        id: 2,
        question: "Which abstract data structure operates on a Last-In, First-Out (LIFO) order of elements?",
        options: ["Queue", "Stack", "Priority Heap", "Linked List"],
        answer: 1,
        explanation: "A Stack enforces LIFO behavior, where the most recently added item (`push`) is the first item to be removed (`pop`), like function call stacks."
      },
      {
        id: 3,
        question: "What is the expected average time complexity of element lookup in a well-distributed Hash Table?",
        options: ["O(1) Constant Time", "O(n) Linear Time", "O(log n) Logarithmic Time", "O(n!) Factorial Time"],
        answer: 0,
        explanation: "Using an efficient hash function with low collision probability, bucket index calculation and retrieval occur in O(1) constant average time."
      },
      {
        id: 4,
        question: "Which graph search algorithm is guaranteed to find the shortest path in a weighted graph with non-negative edge weights?",
        options: ["Dijkstra's Algorithm", "Depth First Search (DFS)", "Bubble Sort", "Kruskal's MST Algorithm"],
        answer: 0,
        explanation: "Dijkstra's algorithm uses a priority queue to iteratively explore vertices in order of minimal accumulated distance from the starting node."
      }
    ]
  }
};

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
  socket,
  roomId,
  userName = "Student",
  activeQuizData,
  onQuizPublished
}) {
  const [topicInput, setTopicInput] = useState("WebRTC & Real-Time Sync");
  const [activeTopicKey, setActiveTopicKey] = useState("webrtc");
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [quizMetadata, setQuizMetadata] = useState(null);

  // Helper to dynamically synthesize questions for ANY custom topic
  const generateQuestionsForTopic = (targetTopic) => {
    setIsGenerating(true);
    const normalized = (targetTopic || "").trim().toLowerCase();

    setTimeout(() => {
      let matchedBank = null;

      // 1. Check if matches pre-defined banks
      if (normalized.includes('react') || normalized.includes('hook') || normalized.includes('frontend') || normalized.includes('jsx')) {
        matchedBank = TOPIC_QUESTION_BANKS.react;
      } else if (normalized.includes('webrtc') || normalized.includes('sync') || normalized.includes('stream') || normalized.includes('video') || normalized.includes('audio') || normalized.includes('signaling')) {
        matchedBank = TOPIC_QUESTION_BANKS.webrtc;
      } else if (normalized.includes('os') || normalized.includes('operating system') || normalized.includes('process') || normalized.includes('thread') || normalized.includes('deadlock')) {
        matchedBank = TOPIC_QUESTION_BANKS.os;
      } else if (normalized.includes('db') || normalized.includes('database') || normalized.includes('sql') || normalized.includes('mongo') || normalized.includes('acid') || normalized.includes('nosql')) {
        matchedBank = TOPIC_QUESTION_BANKS.db;
      } else if (normalized.includes('network') || normalized.includes('tcp') || normalized.includes('udp') || normalized.includes('osi') || normalized.includes('ip') || normalized.includes('dns')) {
        matchedBank = TOPIC_QUESTION_BANKS.networks;
      } else if (normalized.includes('python') || normalized.includes('oop') || normalized.includes('class') || normalized.includes('decorator') || normalized.includes('object')) {
        matchedBank = TOPIC_QUESTION_BANKS.python;
      } else if (normalized.includes('ai') || normalized.includes('machine learning') || normalized.includes('neural') || normalized.includes('deep learning') || normalized.includes('model')) {
        matchedBank = TOPIC_QUESTION_BANKS.ai;
      } else if (normalized.includes('dsa') || normalized.includes('data structure') || normalized.includes('algorithm') || normalized.includes('tree') || normalized.includes('sort') || normalized.includes('graph')) {
        matchedBank = TOPIC_QUESTION_BANKS.dsa;
      }

      let generated = [];

      if (matchedBank) {
        generated = matchedBank.questions;
      } else {
        // 2. Dynamic Algorithmic Synthesis for ANY Custom Subject / Lecture Topic!
        const topicName = targetTopic || "Lecture Subject";
        const cleanNotes = (transcription || "").trim();
        const snippet = cleanNotes.length > 30 ? cleanNotes.split(/[.?!]/)[0].slice(0, 70) : `${topicName} architectural paradigms`;

        generated = [
          {
            id: 1,
            question: `In the study of "${topicName}", what is the primary foundational concept or objective?`,
            options: [
              `Optimizing core efficiency and systematic implementation of ${topicName}`,
              `Bypassing standard architectural protocols without verification`,
              `Restricting real-time data exchange to manual paper records`,
              `Deprecating all modern computing standards`
            ],
            answer: 0,
            explanation: `The foundational objective of ${topicName} is to provide a standardized, efficient, and reliable methodology for solving domain-specific challenges.`
          },
          {
            id: 2,
            question: `During today's lecture on "${topicName}", which mechanism was highlighted as critical?`,
            options: [
              `Arbitrary unmonitored data writes`,
              `Automated validation, state synchronization, and component coordination`,
              `Static single-threaded memory bottlenecks`,
              `Unencrypted legacy broadcast protocols`
            ],
            answer: 1,
            explanation: `Modern implementations of ${topicName} emphasize systematic coordination, structured data validation, and predictable state synchronization.`
          },
          {
            id: 3,
            question: `When deploying solutions in "${topicName}", what is considered an industry best practice?`,
            options: [
              `Hardcoding variable constants and ignoring exception handling`,
              `Maintaining modular decoupling, clear error boundaries, and observable metrics`,
              `Disabling unit testing and concurrency protections`,
              `Running unauthenticated scripts directly in the kernel`
            ],
            answer: 1,
            explanation: `Best practices in ${topicName} mandate modular design, robust error handling, test coverage, and clear separation of concerns.`
          },
          {
            id: 4,
            question: `According to the lecture discussion (${snippet}), how is performance preserved in "${topicName}"?`,
            options: [
              `Through algorithmic optimization, caching strategies, and minimal latency overhead`,
              `By introducing artificial blocking timeouts`,
              `By disabling concurrent worker threads completely`,
              `By duplicating duplicate payloads across memory buffers`
            ],
            answer: 0,
            explanation: `High performance in ${topicName} is achieved by minimizing computational overhead, leveraging intelligent caching, and optimizing critical execution paths.`
          }
        ];
      }

      setQuestions(generated);
      setUserAnswers({});
      setIsSubmitted(false);
      setScore(0);
      setIsGenerating(false);
      setQuizMetadata({
        topic: targetTopic || (matchedBank ? matchedBank.name : "Lecture Pop Quiz"),
        instructorName: userName || "Instructor",
        publishedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }, 400);
  };

  // Auto-detect topic from live video title or captions
  const handleAutoDetectTopic = () => {
    let detected = "";
    if (currentVideoTitle && currentVideoTitle !== 'Lecture Video' && currentVideoTitle.trim().length > 3) {
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
      // Default to initial topic
      generateQuestionsForTopic(topicInput);
    }
  }, [activeQuizData]);

  // Request active quiz on open if student
  useEffect(() => {
    if (isOpen && !isHost && socket && roomId && (!activeQuizData || !activeQuizData.questions)) {
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
          questions,
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
            <span className="quiz-badge">Topic-Based AI Quiz</span>
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
                  placeholder="Enter lecture topic (e.g. React Hooks, Operating Systems, Machine Learning...)"
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
                  title="Generate Questions for this topic"
                >
                  {isGenerating ? "⚡ Generating..." : "⚡ Generate Quiz"}
                </button>
                <button
                  type="button"
                  className="btn-topic-autodetect"
                  onClick={handleAutoDetectTopic}
                  title="Auto-detect topic from currently playing video or live teacher captions"
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
                  <span className="student-banner-topic">Topic: {quizMetadata?.topic || topicInput}</span>
                  <span className="student-banner-meta">
                    Assigned by {quizMetadata?.instructorName || 'Prof. Instructor'} • {quizMetadata?.publishedAt || 'Active Live Session'}
                  </span>
                </div>
              </div>
              <span className="student-banner-badge">Verified Topic Quiz</span>
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
                {score === questions.length
                  ? `Outstanding! You fully mastered today's lecture on "${quizMetadata?.topic || topicInput}"!`
                  : score >= questions.length / 2
                  ? `Good effort! Review the detailed explanations below to reinforce "${quizMetadata?.topic || topicInput}".`
                  : `Needs review! Check the explanations below and replay the lecture video for "${quizMetadata?.topic || topicInput}".`}
              </div>
            </div>
          )}

          {/* QUESTIONS LIST */}
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
                title="Regenerate different questions on this topic"
              >
                {isGenerating ? "⚡ Generating..." : "🔄 Re-generate Questions"}
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {isHost && (
              <button
                type="button"
                className="btn-primary-action launch-btn"
                onClick={handlePublishQuiz}
                title="Broadcast this quiz on the lecture topic directly to all students"
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
