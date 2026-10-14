// ── Curated Comprehensive 20-Question Banks for Popular Classroom Topics ──

export const TOPIC_QUESTION_BANKS = {
  webrtc: {
    name: "WebRTC & Real-Time Sync",
    questions: [
      {
        id: 1,
        question: "Which protocol is primarily used for real-time peer-to-peer audio, video, and data streaming in modern web browsers?",
        options: ["HTTP/2", "WebRTC", "FTP", "SMTP"],
        answer: 1,
        explanation: "WebRTC enables direct peer-to-peer audio, video, and arbitrary data streaming between browsers with ultra-low latency."
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
        explanation: "The signaling server mediates connection negotiation by exchanging SDP session metadata and ICE candidates before direct P2P streaming begins."
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
      },
      {
        id: 5,
        question: "What protocol format does WebRTC use to describe media capabilities, codecs, and network transport configurations?",
        options: ["JSON Schema", "SDP (Session Description Protocol)", "GraphQL Query", "XML WSDL"],
        answer: 1,
        explanation: "SDP (Session Description Protocol) provides a standardized string format for negotiating media capabilities, codecs, resolutions, and encryption parameters."
      },
      {
        id: 6,
        question: "Which transport protocol does WebRTC primarily employ under the hood for low-latency media transport?",
        options: ["TCP", "UDP (via SRTP)", "FTP", "WebSocket"],
        answer: 1,
        explanation: "WebRTC uses UDP via SRTP (Secure Real-time Transport Protocol) to minimize latency by avoiding head-of-line blocking."
      },
      {
        id: 7,
        question: "What is the purpose of Trickle ICE in modern WebRTC connection establishment?",
        options: [
          "To stream ICE candidates incrementally as they are discovered, speeding up call setup time",
          "To freeze user video frames during high packet loss",
          "To transcode 4K streams to 720p",
          "To disable NAT traversal security"
        ],
        answer: 0,
        explanation: "Trickle ICE sends ICE candidates incrementally over the signaling channel as soon as they are gathered, rather than waiting for all candidates to be collected."
      },
      {
        id: 8,
        question: "Which WebRTC API interface is used for bidirectional, low-latency arbitrary binary and text data exchange?",
        options: ["RTCPeerConnection.createOffer", "RTCDataChannel", "MediaStreamTrack", "AudioContext"],
        answer: 1,
        explanation: "RTCDataChannel enables peer-to-peer exchange of arbitrary data (binary or text) with options for reliable/unreliable and ordered/unordered delivery."
      },
      {
        id: 9,
        question: "What security layer is mandatory in WebRTC for authenticating peers and exchanging encryption keys for media?",
        options: ["DTLS (Datagram Transport Layer Security)", "WEP Encryption", "MD5 Hashing", "Basic HTTP Auth"],
        answer: 0,
        explanation: "WebRTC mandates DTLS for the cryptographic handshake that securely negotiates encryption keys used by SRTP for media."
      },
      {
        id: 10,
        question: "Which default audio codec is mandated by WebRTC standards for speech and high-fidelity music with dynamic bitrate scalability?",
        options: ["MP3", "Opus", "AAC-LC", "FLAC"],
        answer: 1,
        explanation: "Opus is the mandatory, highly versatile audio codec in WebRTC, dynamically scaling between 6 kbps and 510 kbps with low algorithmic delay."
      },
      {
        id: 11,
        question: "In a multi-party conference, how does a Selective Forwarding Unit (SFU) differ from a Mesh topology?",
        options: [
          "In an SFU, each client sends one upstream stream to the server which routes it to others, saving client upload bandwidth",
          "In an SFU, peers directly connect to every other participant without any central server",
          "An SFU decodes and re-encodes all video feeds into a single composited video stream",
          "An SFU does not support video streaming"
        ],
        answer: 0,
        explanation: "An SFU receives a single media stream from each client and forwards packet copies to other clients without transcoding, vastly reducing client uplink bandwidth compared to Mesh."
      },
      {
        id: 12,
        question: "What is the primary role of RTCP (RTP Control Protocol) in media streaming?",
        options: [
          "To carry the actual audio and video payload bytes",
          "To provide out-of-band statistics on packet loss, jitter, round-trip time, and reception quality",
          "To allocate domain names to web servers",
          "To render web canvas animations"
        ],
        answer: 1,
        explanation: "RTCP monitors transmission statistics (packet loss, round trip time, jitter) to allow senders to adapt bitrate and resolution dynamically."
      },
      {
        id: 13,
        question: "What does the `iceConnectionState` value `checking` signify in an `RTCPeerConnection`?",
        options: [
          "The connection has completely failed and cannot recover",
          "The ICE agent is testing candidate pairs to find a working media path",
          "The peer connection has been closed by the user",
          "The webcam hardware is powered down"
        ],
        answer: 1,
        explanation: "`checking` indicates that the ICE agent is actively sending STUN checks across candidate pairs to find a valid bidirectional connection."
      },
      {
        id: 14,
        question: "Which browser API is used to capture local user camera and microphone media streams?",
        options: ["navigator.mediaDevices.getUserMedia()", "document.createMediaStream()", "window.getWebcamBuffer()", "fetch('/api/camera')"],
        answer: 0,
        explanation: "`navigator.mediaDevices.getUserMedia({ audio: true, video: true })` requests user permission and returns a promise resolving to a `MediaStream`."
      },
      {
        id: 15,
        question: "What does Simulcast mean in modern WebRTC video architecture?",
        options: [
          "Sending the same audio stream on two different speakers",
          "The client encodes and transmits multiple resolutions/bitrates of the same video simultaneously to an SFU",
          "Broadcasting video over AM/FM radio frequencies",
          "Recording video directly to cloud storage"
        ],
        answer: 1,
        explanation: "Simulcast allows a sender to encode multiple streams (e.g. 1080p, 720p, 360p) so an SFU can selectively send appropriate resolutions based on each receiver's bandwidth."
      },
      {
        id: 16,
        question: "What is Jitter in real-time packet networks?",
        options: [
          "The total size of the video file in megabytes",
          "The statistical variation in packet transit delay over time",
          "The frequency of screen refresh in Hertz",
          "The volume level of audio input"
        ],
        answer: 1,
        explanation: "Jitter refers to packet delay variation; WebRTC uses an adaptive jitter buffer to smooth out playout timing."
      },
      {
        id: 17,
        question: "Which method on `RTCPeerConnection` generates the initial SDP offer to initiate a call?",
        options: ["createOffer()", "setRemoteDescription()", "addIceCandidate()", "connectToPeer()"],
        answer: 0,
        explanation: "`pc.createOffer()` produces an `RTCSessionDescription` containing the caller's supported codecs, media types, and transport options."
      },
      {
        id: 18,
        question: "What is an ICE Candidate?",
        options: [
          "A candidate database schema for SQL storage",
          "A network transport address (IP, port, and transport protocol) where a peer can potentially receive data",
          "An audio plugin for noise suppression",
          "A browser security extension"
        ],
        answer: 1,
        explanation: "An ICE candidate represents a specific potential network address (local host, STUN reflexive, or TURN relay) where the peer can be contacted."
      },
      {
        id: 19,
        question: "Which mechanism allows WebRTC to adapt video quality when network congestion or packet loss is detected?",
        options: [
          "BWE (Bandwidth Estimation) & Congestion Control (e.g., GCC or SCReAM)",
          "Restarting the computer operating system",
          "Reloading the web page automatically",
          "Switching from UDP to POP3"
        ],
        answer: 0,
        explanation: "Bandwidth Estimation algorithms (like Google Congestion Control) monitor delay and packet loss to instruct video encoders to throttle or boost bitrate."
      },
      {
        id: 20,
        question: "How does end-to-end encryption (E2EE) operate in WebRTC Insertable Streams?",
        options: [
          "The browser encrypts frames at the application layer before packetization, preventing middlebox SFUs from decrypting raw video",
          "It converts all audio into text transcripts",
          "It disables browser networking entirely",
          "It stores passwords in plaintext cookies"
        ],
        answer: 0,
        explanation: "Insertable Streams (Encoded Transform API) allow client apps to insert custom cryptographic transforms onto encoded media frames before transmission, ensuring end-to-end privacy."
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
        explanation: "`useEffect` tells React that your component needs to perform side effects after rendering (such as API calls, listeners, or timers)."
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
        explanation: "The Virtual DOM calculates minimal sets of real DOM mutations through reconciliation diffing, avoiding costly layout reflows."
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
        explanation: "Hooks must only be invoked at the top level to ensure React preserves hook state correctly across sequential renders."
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
        explanation: "`useMemo` caches the calculated value of an expensive operation so it is only recomputed when specified dependencies change."
      },
      {
        id: 5,
        question: "What is the key difference between `useCallback` and `useMemo` in React?",
        options: [
          "`useCallback` caches a function definition itself, while `useMemo` caches the returned result of calling a function",
          "`useCallback` only works with class components",
          "`useMemo` is used exclusively for asynchronous HTTP fetches",
          "They are exact aliases with no functional difference"
        ],
        answer: 0,
        explanation: "`useCallback(fn, deps)` is equivalent to `useMemo(() => fn, deps)`. It returns a memoized callback function instance."
      },
      {
        id: 6,
        question: "Why should `key` props be stable, unique, and assigned to elements in React list rendering?",
        options: [
          "To provide CSS classes for list item styling",
          "To help React identify which items have changed, added, or removed during list reconciliation",
          "To encrypt the data sent over network sockets",
          "To prevent the browser from closing the tab"
        ],
        answer: 1,
        explanation: "Keys give elements a stable identity, allowing React's reconciliation algorithm to match tree nodes and preserve component state across re-renders."
      },
      {
        id: 7,
        question: "What does `useRef` return, and what is its primary characteristic regarding re-renders?",
        options: [
          "A state variable that automatically triggers a component re-render when modified",
          "A mutable object `{ current: initialValue }` whose modification does NOT trigger a re-render",
          "A read-only DOM element that cannot be accessed",
          "A promise that resolves on window unload"
        ],
        answer: 1,
        explanation: "`useRef` returns a persistent mutable object whose `.current` property can be modified without causing component re-rendering."
      },
      {
        id: 8,
        question: "What is React Fiber in the context of React's internal architecture?",
        options: [
          "A hardware fiber-optic networking driver",
          "The complete rewrite of React's reconciliation engine enabling interruptible, priority-based asynchronous rendering",
          "A CSS styling library similar to Tailwind",
          "A relational database query optimizer"
        ],
        answer: 1,
        explanation: "React Fiber is React's core reconciliation algorithm that supports incremental rendering by pausing, prioritizing, or aborting units of work."
      },
      {
        id: 9,
        question: "When should the cleanup function returned by `useEffect` be executed?",
        options: [
          "Only when the browser window is closed",
          "Before the effect runs again and when the component unmounts",
          "During the initial HTML page download",
          "Whenever a child component receives props"
        ],
        answer: 1,
        explanation: "The cleanup function cleans up subscriptions, intervals, or event listeners before the effect re-runs or when the component unmounts."
      },
      {
        id: 10,
        question: "What is the purpose of React `useContext`?",
        options: [
          "To avoid 'prop drilling' by accessing global or shared state across components without passing props manually at every level",
          "To render 3D WebGL context canvases",
          "To manage database transactions in Node.js",
          "To execute background service workers"
        ],
        answer: 0,
        explanation: "`useContext` subscribes to a React context provider, allowing components at any depth to read context values without manual prop drilling."
      },
      {
        id: 11,
        question: "What happens in React 18 with Automatic Batching?",
        options: [
          "State updates inside promises, timeouts, and native event handlers are grouped together into a single re-render",
          "All components must be compiled using Webpack 4",
          "Only one state update is allowed per web session",
          "Components re-render once for every single setState call synchronously"
        ],
        answer: 0,
        explanation: "React 18 automatically batches multiple state updates together regardless of where they originate (fetch calls, setTimeout, etc.), reducing unnecessary renders."
      },
      {
        id: 12,
        question: "What is a 'Pure Component' or `React.memo` component?",
        options: [
          "A component that skips re-rendering if its props have not changed using shallow comparison",
          "A component that cannot contain any HTML tags",
          "A component written in pure assembly language",
          "A component that does not accept any props"
        ],
        answer: 0,
        explanation: "`React.memo` is a higher-order component that wraps a component to skip re-renders if its incoming props are shallowly equal."
      },
      {
        id: 13,
        question: "What is the core distinction between Controlled and Uncontrolled form inputs in React?",
        options: [
          "Controlled inputs have their current value managed by React state; uncontrolled inputs store their value in the DOM itself",
          "Controlled inputs can only accept numbers, while uncontrolled accept text",
          "Uncontrolled inputs are deprecated in modern HTML5",
          "Controlled inputs cannot have submit buttons"
        ],
        answer: 0,
        explanation: "In a controlled input, React state acts as the single source of truth (`value={state}` with `onChange`). In an uncontrolled input, the DOM manages the value accessed via a `ref`."
      },
      {
        id: 14,
        question: "What is the purpose of React `Suspense`?",
        options: [
          "To suspend user interaction during page crashes",
          "To display a fallback UI (like a spinner) while child components are loading code or asynchronous data",
          "To stop background audio playback",
          "To freeze user cookies"
        ],
        answer: 1,
        explanation: "`<Suspense fallback={<Loading />}>` coordinates loading states by displaying fallback indicators until asynchronous dependencies (like lazy-loaded components) resolve."
      },
      {
        id: 15,
        question: "Why should you never mutate state variables directly (e.g. `state.count = 5`) in React?",
        options: [
          "React will not detect the change because object references remain identical, preventing necessary UI re-renders",
          "It causes an immediate browser crash",
          "JavaScript syntax does not permit variable assignment",
          "It clears the browser history"
        ],
        answer: 0,
        explanation: "Direct mutation bypasses React's change detection because React relies on shallow equality checks of state references to trigger re-renders."
      },
      {
        id: 16,
        question: "What does the custom hook naming convention mandate in React?",
        options: [
          "Custom hook function names must start with the prefix `use` (e.g. `useOnlineStatus`)",
          "Custom hooks must end with `Component`",
          "Custom hooks must be named with uppercase roman numerals",
          "Custom hooks cannot return arrays or objects"
        ],
        answer: 0,
        explanation: "React relies on the `use` prefix so linters can automatically verify that the Rules of Hooks are respected inside custom hooks."
      },
      {
        id: 17,
        question: "What is an Error Boundary in React?",
        options: [
          "A class component implementing `componentDidCatch` or `getDerivedStateFromError` to catch JS errors in child component trees and render fallback UI",
          "A try/catch block inside a functional component body",
          "A firewall router for web requests",
          "A browser console debugger window"
        ],
        answer: 0,
        explanation: "Error Boundaries are React components that catch JavaScript errors anywhere in their child component tree, log them, and display fallback UI instead of crashing the whole app."
      },
      {
        id: 18,
        question: "What is the function of `useReducer` in React?",
        options: [
          "An alternative to `useState` that handles complex state logic via action dispatches and a reducer function `(state, action) => newState`",
          "To compress images before upload",
          "To reduce CPU clock speeds",
          "To minify JavaScript bundle sizes"
        ],
        answer: 0,
        explanation: "`useReducer` manages complex state transitions in a predictable, decoupled pattern similar to Redux using pure reducer functions."
      },
      {
        id: 19,
        question: "What is the primary benefit of code-splitting using `React.lazy()` and dynamic imports?",
        options: [
          "It splits large bundles into smaller on-demand chunks, improving initial page load time",
          "It encrypts the source code on the server",
          "It automatically translates JSX into Python",
          "It disables browser caching"
        ],
        answer: 0,
        explanation: "`React.lazy()` lets you render dynamic imports as regular components, loading JavaScript bundles only when the user navigates to that feature."
      },
      {
        id: 20,
        question: "What does React's `StrictMode` do in development mode?",
        options: [
          "It intentionally double-invokes component bodies, lifecycle methods, and effects to help surface unintended side effects and deprecated APIs",
          "It blocks all network requests in production",
          "It forces developers to use TypeScript exclusively",
          "It automatically deletes unused state variables"
        ],
        answer: 0,
        explanation: "StrictMode intentionally double-mounts components in development to ensure side effects are properly cleaned up and components are resilient to remounting."
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
          "Threads within the same process share address space and resources, while processes have isolated memory spaces",
          "Processes run in kernel mode only, while threads run exclusively in hardware firmware",
          "Threads cannot be scheduled independently by the OS scheduler"
        ],
        answer: 1,
        explanation: "A process represents an independent executing program with its own address space. Threads are lightweight execution units within a process that share code and data."
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
        explanation: "Aging gradually boosts the priority of processes waiting in the ready queue, ensuring they eventually execute."
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
        explanation: "Virtual memory maps process address spaces to physical RAM pages and disk swap space, providing memory protection, isolation, and contiguous address illusion."
      },
      {
        id: 5,
        question: "What is a Context Switch in operating systems?",
        options: [
          "Saving the CPU state (registers, program counter) of an active process and restoring another process's state to resume execution",
          "Changing the desktop wallpaper dynamically",
          "Switching from Wi-Fi to Ethernet",
          "Translating source code to machine assembly"
        ],
        answer: 0,
        explanation: "A context switch stores the state of a running process or thread so that execution can be resumed later, and loads the saved state for a new process."
      },
      {
        id: 6,
        question: "What hardware component is responsible for accelerating Virtual-to-Physical memory address translations?",
        options: ["Translation Lookaside Buffer (TLB)", "Direct Memory Access (DMA) Controller", "Audio DSP", "CMOS Battery"],
        answer: 0,
        explanation: "The TLB is a high-speed hardware cache inside the MMU that stores recent page-to-frame translations, reducing memory lookup cycles."
      },
      {
        id: 7,
        question: "What is a Race Condition in concurrent programming?",
        options: [
          "A situation where system behavior depends on the uncontrollable timing or interleaving of multiple concurrent threads accessing shared resources",
          "A competition between two CPU cores for benchmark scores",
          "A network speed test between client and server",
          "A fast context switch completed under 1 microsecond"
        ],
        answer: 0,
        explanation: "A race condition occurs when concurrent threads access and modify shared state without proper synchronization, causing non-deterministic results."
      },
      {
        id: 8,
        question: "What is the difference between a Mutex and a Counting Semaphore?",
        options: [
          "A Mutex provides exclusive locking (binary 0/1) with ownership; a Counting Semaphore allows a finite number of resources (count > 1) to be accessed concurrently",
          "A Semaphore can only be used in Python, while a Mutex is only in C",
          "A Mutex causes deadlocks automatically, while Semaphores prevent all bugs",
          "They are exact synonyms with identical semantics"
        ],
        answer: 0,
        explanation: "A Mutex is a locking mechanism with ownership (only the lock holder can unlock it). A Counting Semaphore maintains a counter for multi-unit resource allocation."
      },
      {
        id: 9,
        question: "What happens when a CPU experiences a 'Page Fault'?",
        options: [
          "The hardware interrupts execution because the requested virtual memory page is not currently mapped in physical RAM, prompting the OS to load it from disk",
          "The motherboard power supply shuts down",
          "The operating system reboots immediately",
          "The browser tab deletes its cookies"
        ],
        answer: 0,
        explanation: "A page fault is an exception raised by the MMU when a program accesses a page table entry whose present bit is 0, requiring the OS to bring the page from backing store."
      },
      {
        id: 10,
        question: "What is 'Thrashing' in an operating system's memory management?",
        options: [
          "A catastrophic state where the OS spends more time swapping pages in and out of disk than executing useful instructions",
          "High-speed disk defragmentation",
          "Deleting corrupted temporary files",
          "Overclocking the GPU processor"
        ],
        answer: 0,
        explanation: "Thrashing occurs when the working sets of active processes exceed physical RAM, causing constant page faults and severe system degradation."
      },
      {
        id: 11,
        question: "Which CPU scheduling algorithm gives the theoretically minimum average waiting time for a set of stationary processes?",
        options: ["Shortest Job First (SJF)", "First-Come First-Served (FCFS)", "Round Robin (RR)", "Random Selection"],
        answer: 0,
        explanation: "Shortest Job First (SJF) is provably optimal for minimizing average waiting time by scheduling processes with the shortest burst times first."
      },
      {
        id: 12,
        question: "What is the primary role of the PCB (Process Control Block)?",
        options: [
          "An OS kernel data structure storing all metadata about a process (PID, state, registers, memory limits, open file descriptors)",
          "A printed circuit board inside the laptop",
          "A power control unit for battery charging",
          "A network firewall rule table"
        ],
        answer: 0,
        explanation: "The PCB stores critical process information needed by the operating system to schedule, control, and suspend/resume the process."
      },
      {
        id: 13,
        question: "What is the key difference between User Mode and Kernel Mode execution?",
        options: [
          "User mode has restricted access to hardware and privileged CPU instructions, while Kernel mode has unrestricted access to system memory and hardware",
          "User mode can only run text editors",
          "Kernel mode is disabled in production operating systems",
          "There is no difference in instruction privilege levels"
        ],
        answer: 0,
        explanation: "Dual-mode operation protects the system by restricting user applications from executing privileged instructions (such as disabling interrupts or modifying page tables)."
      },
      {
        id: 14,
        question: "How does a user-space application transition into Kernel Mode to access I/O devices or memory?",
        options: [
          "By issuing a System Call (Syscall) via a software interrupt or trap instruction",
          "By directly reading CPU physical registers in JavaScript",
          "By restarting the computer power button",
          "By modifying the BIOS firmware"
        ],
        answer: 0,
        explanation: "A system call executes a trap instruction that switches the CPU from user mode to kernel mode, handing control to registered kernel handlers."
      },
      {
        id: 15,
        question: "What is a Zombie Process in Unix-like operating systems?",
        options: [
          "A process that has completed execution but still has an entry in the process table because its parent has not yet read its exit status via `wait()`",
          "A virus that attacks other network nodes",
          "A process running on an external USB flash drive",
          "A thread that has infinite memory allocation"
        ],
        answer: 0,
        explanation: "A zombie process has terminated but retains a PID and process table entry until the parent process calls `wait()` or `waitpid()`."
      },
      {
        id: 16,
        question: "What is an Orphan Process, and how does Unix handle it?",
        options: [
          "A process whose parent has terminated; it is automatically adopted by the `init` / `systemd` process (PID 1)",
          "A process that has no thread execution pool",
          "A file left behind after software deletion",
          "A corrupted hard disk partition"
        ],
        answer: 0,
        explanation: "When a parent terminates before its child, the child becomes an orphan and is adopted by PID 1 (`init`/`systemd`), which reaps its exit status."
      },
      {
        id: 17,
        question: "What is Banker's Algorithm used for in operating systems?",
        options: [
          "Deadlock Avoidance by testing for safe states before allocating requested resources",
          "Calculating credit card interest rates",
          "Encrypting online banking passwords",
          "Balancing CPU thermal throttling"
        ],
        answer: 0,
        explanation: "Dijkstra's Banker's Algorithm evaluates resource requests dynamically to ensure the system will remain in a 'safe state' with no possibility of deadlock."
      },
      {
        id: 18,
        question: "Which disk scheduling algorithm moves the disk arm across cylinders in one direction servicing requests, and then reverses direction like an elevator?",
        options: ["SCAN (Elevator Algorithm)", "FCFS", "SSTF (Shortest Seek Time First)", "Round Robin"],
        answer: 0,
        explanation: "The SCAN algorithm services requests while moving the disk head in one direction until it reaches the edge, then reverses direction."
      },
      {
        id: 19,
        question: "What is the role of an Inode in Unix/Linux file systems?",
        options: [
          "A data structure storing file metadata (file size, permissions, ownership, block locations) except the file name itself",
          "An internet protocol for routers",
          "An input device driver for keyboards",
          "A memory cache for graphics cards"
        ],
        answer: 0,
        explanation: "An inode stores all metadata and data block pointers of a file or directory; directory entries map human-readable names to inode numbers."
      },
      {
        id: 20,
        question: "What is the Critical Section Problem in multi-threaded programming?",
        options: [
          "Ensuring that when one process is executing in its critical section, no other process is allowed to execute in its own critical section modifying the same shared resource",
          "Allocating physical RAM to motherboards",
          "Fixing broken CPU fan sensors",
          "Downloading software updates safely"
        ],
        answer: 0,
        explanation: "The Critical Section problem requires designing protocols (satisfying Mutual Exclusion, Progress, and Bounded Waiting) so concurrent threads safely access shared resources."
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
      },
      {
        id: 5,
        question: "What is the difference between an INNER JOIN and a LEFT OUTER JOIN in SQL?",
        options: [
          "INNER JOIN returns only matching rows from both tables; LEFT JOIN returns all rows from the left table and matched rows from the right table (with NULLs where unmatched)",
          "LEFT JOIN only sorts data alphabetically",
          "INNER JOIN deletes non-matching rows from the database permanently",
          "There is no difference in result sets"
        ],
        answer: 0,
        explanation: "INNER JOIN preserves only records where the join predicate matches in both tables. LEFT OUTER JOIN keeps all records from the left table regardless."
      },
      {
        id: 6,
        question: "What is the CAP Theorem in distributed databases?",
        options: [
          "A distributed data store can simultaneously guarantee at most two out of Consistency, Availability, and Partition Tolerance",
          "A database must always use C, Assembly, and Python",
          "CPU, Address space, and Power must be balanced",
          "Queries can only return Columns, Attributes, and Primary keys"
        ],
        answer: 0,
        explanation: "Brewer's CAP theorem proves that in the presence of a network partition (P), a distributed system must choose between Consistency (C) and Availability (A)."
      },
      {
        id: 7,
        question: "What is a Foreign Key constraint in relational database management?",
        options: [
          "A field or collection of fields in one table that uniquely identifies a row of another table, enforcing referential integrity",
          "An encryption key generated in another foreign country",
          "A password used to connect to remote servers",
          "A temporary index deleted on session logout"
        ],
        answer: 0,
        explanation: "Foreign keys enforce referential integrity by ensuring that a value in a child table must match an existing primary key value in the referenced parent table."
      },
      {
        id: 8,
        question: "What is the highest transaction isolation level in SQL standards?",
        options: ["Serializable", "Repeatable Read", "Read Committed", "Read Uncommitted"],
        answer: 0,
        explanation: "Serializable is the highest isolation level; it completely prevents dirty reads, non-repeatable reads, and phantom reads by emulating sequential execution."
      },
      {
        id: 9,
        question: "What is a 'Dirty Read' in database concurrency?",
        options: [
          "When a transaction reads uncommitted data written by another concurrent transaction that may later be rolled back",
          "Reading data from a corrupted hard drive",
          "A query that contains SQL syntax errors",
          "Retrieving records that contain profanity"
        ],
        answer: 0,
        explanation: "A dirty read occurs when transaction A modifies a row and transaction B reads that row before transaction A commits. If A aborts, B's read is invalid."
      },
      {
        id: 10,
        question: "What is Database Sharding?",
        options: [
          "Horizontal partitioning of a database across multiple independent physical servers or instances",
          "Deleting old backup archives to free disk space",
          "Encrypting database tables with AES-256",
          "Creating multiple indexes on the same column"
        ],
        answer: 0,
        explanation: "Sharding splits a large dataset horizontally across multiple database nodes based on a shard key, enabling horizontal scaling."
      },
      {
        id: 11,
        question: "What is the difference between clustered and non-clustered indexes?",
        options: [
          "A clustered index determines the physical order of data rows on disk (only 1 per table); a non-clustered index stores pointers to physical rows",
          "Non-clustered indexes can only be created on integer columns",
          "Clustered indexes are stored in RAM only",
          "Non-clustered indexes are slower for all queries"
        ],
        answer: 0,
        explanation: "Because physical data can only be sorted in one order, a table can have only one clustered index. Non-clustered indexes contain index keys and row locators."
      },
      {
        id: 12,
        question: "What is the purpose of the SQL `HAVING` clause versus the `WHERE` clause?",
        options: [
          "`WHERE` filters individual rows before grouping; `HAVING` filters aggregated group records after `GROUP BY`",
          "`HAVING` only works on string columns",
          "`WHERE` can only be used with primary keys",
          "They are interchangeable with no operational difference"
        ],
        answer: 0,
        explanation: "`WHERE` applies predicates to individual rows prior to aggregation, while `HAVING` filters groups created by aggregate functions (e.g. `HAVING COUNT(*) > 5`)."
      },
      {
        id: 13,
        question: "What does the SQL command `TRUNCATE TABLE` do compared to `DELETE FROM table`?",
        options: [
          "`TRUNCATE` deallocates data pages quickly as a DDL operation without logging individual row deletions; `DELETE` is a DML operation that deletes row by row",
          "`TRUNCATE` deletes the table schema definition itself",
          "`DELETE` is faster than `TRUNCATE` for large tables",
          "`TRUNCATE` only removes the primary key index"
        ],
        answer: 0,
        explanation: "`TRUNCATE` is a DDL command that quickly removes all data by deallocating storage pages with minimal undo logging, whereas `DELETE` logs every row."
      },
      {
        id: 14,
        question: "What is a SQL View?",
        options: [
          "A virtual table based on the result-set of a stored SQL query, without storing data redundantly on disk",
          "A graphical chart rendered in the browser",
          "A physical hard drive partition",
          "A user interface dashboard template"
        ],
        answer: 0,
        explanation: "A View is a virtual table defined by a SQL query; it exposes structured data dynamically without duplicating underlying storage."
      },
      {
        id: 15,
        question: "What is the Write-Ahead Logging (WAL) mechanism used for in DBMS engines?",
        options: [
          "Recording transaction state changes to durable disk logs before applying them to database pages, ensuring crash recovery (Durability)",
          "Writing documentation before writing SQL code",
          "Logging user IP addresses for analytics",
          "Formatting output tables into HTML"
        ],
        answer: 0,
        explanation: "WAL guarantees durability and atomicity by ensuring all changes are recorded in sequential append-only log files on disk before dirty memory pages are flushed."
      },
      {
        id: 16,
        question: "In MongoDB, what is the Aggregation Pipeline?",
        options: [
          "A framework for multi-stage data processing where documents pass through stages (e.g. `$match`, `$group`, `$sort`, `$project`) to transform and compute results",
          "A network cable connecting database servers",
          "An index type for text search",
          "A backup tool for dumping collections to tar archives"
        ],
        answer: 0,
        explanation: "The Aggregation Pipeline processes collections through sequential filtering, grouping, reshaping, and calculation stages to output aggregated results."
      },
      {
        id: 17,
        question: "What is a Database Deadlock, and how does a DBMS resolve it?",
        options: [
          "Two or more transactions cyclically waiting for locks held by each other; the DBMS detects cycles in the wait-for graph and aborts/rolls back one transaction",
          "A damaged hard disk read/write head",
          "A database user forgetting their login password",
          "A server running out of physical power"
        ],
        answer: 0,
        explanation: "Deadlocks happen when transactions hold locks that others need in a cycle. The database engine detects this deadlock cycle and aborts the victim transaction."
      },
      {
        id: 18,
        question: "What is Database Connection Pooling, and why is it important?",
        options: [
          "Maintaining a cache of open database connections to reuse them across incoming client requests, avoiding costly connection handshake overhead",
          "Storing database backups in cloud buckets",
          "Combining multiple tables into a single column",
          "Sharing passwords between database users"
        ],
        answer: 0,
        explanation: "Establishing database connections requires TCP handshakes, TLS negotiation, and authentication. Connection pools reuse warm connections for low latency."
      },
      {
        id: 19,
        question: "What is an SQL Injection (SQLi) attack, and how is it prevented?",
        options: [
          "Malicious SQL fragments injected into input fields; prevented by using Parameterized Queries / Prepared Statements and ORM escaping",
          "Overheating of the database CPU",
          "Unauthorized download of CSV files over FTP",
          "Deleting backup drives physically"
        ],
        answer: 0,
        explanation: "SQL injection occurs when unvalidated user input is concatenated into SQL strings. Prepared statements separate query code from data parameters, eliminating SQLi."
      },
      {
        id: 20,
        question: "What is the purpose of Database Replication (e.g. Primary-Replica architecture)?",
        options: [
          "To provide high availability, fault tolerance, and horizontal read scaling by copying data across multiple server nodes",
          "To translate SQL into JavaScript code",
          "To reduce physical RAM requirements to zero",
          "To compress database tables into ZIP archives"
        ],
        answer: 0,
        explanation: "Replication copies data from a primary write node to one or more replica nodes, providing redundancy against server failure and distributing read query loads."
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
        explanation: "TCP uses a 3-way handshake and packet sequencing to guarantee reliable delivery, while UDP prioritizes speed and low latency without retransmission delays."
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
      },
      {
        id: 5,
        question: "What sequence of packets constitutes the standard TCP 3-Way Handshake?",
        options: ["SYN -> SYN-ACK -> ACK", "ACK -> SYN -> FIN", "DATA -> PING -> PONG", "HELO -> AUTH -> OK"],
        answer: 0,
        explanation: "The TCP handshake begins with the client sending a SYN packet, the server responding with SYN-ACK, and the client confirming with an ACK."
      },
      {
        id: 6,
        question: "What is the difference between an IPv4 address and an IPv6 address?",
        options: [
          "IPv4 is 32-bit (e.g. 192.168.1.1); IPv6 is 128-bit hexadecimal, providing a vastly larger address space",
          "IPv4 is encrypted, while IPv6 is unencrypted",
          "IPv6 only works inside satellite networks",
          "IPv4 uses MAC addresses, while IPv6 uses port numbers"
        ],
        answer: 0,
        explanation: "IPv4 uses 32-bit addresses (~4.3 billion addresses). IPv6 uses 128 bits, providing approximately 3.4 x 10^38 unique addresses to solve IPv4 exhaustion."
      },
      {
        id: 7,
        question: "What protocol is used by network devices to map an IP address to a physical MAC address on a local area network?",
        options: ["ARP (Address Resolution Protocol)", "DHCP", "ICMP", "BGP"],
        answer: 0,
        explanation: "ARP (Address Resolution Protocol) broadcasts requests on the local data link layer to discover the hardware MAC address associated with a given IP."
      },
      {
        id: 8,
        question: "What is the function of DHCP (Dynamic Host Configuration Protocol)?",
        options: [
          "Automatically assigning IP addresses, subnet masks, default gateways, and DNS servers to network devices joining the network",
          "Hosting dynamic HTML websites",
          "Routing internet packets between autonomous systems",
          "Encrypting Wi-Fi passwords"
        ],
        answer: 0,
        explanation: "DHCP eliminates manual network configuration by dynamically allocating IP addresses and network parameters to client devices upon connection."
      },
      {
        id: 9,
        question: "Which major improvement was introduced in HTTP/2 compared to HTTP/1.1?",
        options: [
          "Multiplexing multiple concurrent requests over a single TCP connection, HPACK header compression, and binary framing",
          "Switching from TCP to FTP",
          "Eliminating the need for SSL certificates",
          "Restricting web pages to text only"
        ],
        answer: 0,
        explanation: "HTTP/2 introduces a binary framing layer and multiplexing over a single TCP connection, eliminating head-of-line blocking present in HTTP/1.1."
      },
      {
        id: 10,
        question: "What transport protocol does HTTP/3 utilize instead of standard TCP?",
        options: ["QUIC (built on top of UDP)", "Raw IPX/SPX", "SCTP", "AppleTalk"],
        answer: 0,
        explanation: "HTTP/3 replaces TCP with QUIC, an encrypted UDP-based transport protocol that eliminates TCP head-of-line blocking and allows faster zero-RTT handshakes."
      },
      {
        id: 11,
        question: "What is the primary role of a Network Gateway / Router?",
        options: [
          "To forward data packets between different IP networks using routing tables to find the optimal path",
          "To amplify electrical Wi-Fi signals",
          "To convert AC power into DC power for laptops",
          "To compile JavaScript in routers"
        ],
        answer: 0,
        explanation: "Routers operate at Layer 3 (Network Layer) to route data packets between disparate networks by inspecting destination IP addresses and routing tables."
      },
      {
        id: 12,
        question: "What is Network Address Translation (NAT)?",
        options: [
          "A method of remapping one IP address space into another by modifying network address information in IP headers while in transit across a traffic routing device",
          "Translating English websites into other languages",
          "Converting audio signals into digital text",
          "Generating domain name SSL certificates"
        ],
        answer: 0,
        explanation: "NAT enables multiple private IP devices on a local area network (LAN) to share a single public IP address when communicating over the internet."
      },
      {
        id: 13,
        question: "What utility uses the ICMP (Internet Control Message Protocol) `Echo Request` and `Echo Reply` messages?",
        options: ["Ping", "SSH", "Telnet", "SCP"],
        answer: 0,
        explanation: "`ping` transmits ICMP Echo Request packets to a target host and measures round-trip time and packet loss based on ICMP Echo Replies."
      },
      {
        id: 14,
        question: "What is the Subnet Mask used for in IPv4 networking?",
        options: [
          "To divide an IP address into network portion and host portion (e.g. 255.255.255.0 identifies /24 network)",
          "To hide user passwords from hackers",
          "To throttle download speeds",
          "To filter spam emails"
        ],
        answer: 0,
        explanation: "A subnet mask separates the bits of an IP address into the network address portion and the specific host device portion."
      },
      {
        id: 15,
        question: "What happens during a TLS/SSL Handshake between browser and web server?",
        options: [
          "The client and server authenticate each other via digital certificates and negotiate shared symmetric session keys for encrypted data transfer",
          "The server downloads the client's hard drive files",
          "The router resets its physical IP configuration",
          "The user's screen resolution is synchronized"
        ],
        answer: 0,
        explanation: "The TLS handshake validates the server's public certificate, establishes cipher suites, and securely exchanges symmetric keys (AES) for encrypted communication."
      },
      {
        id: 16,
        question: "What is Flow Control in TCP, and how is it implemented?",
        options: [
          "Preventing a fast sender from overwhelming a slow receiver using the Sliding Receive Window (`rwnd`) mechanism",
          "Preventing DDoS attacks by blocking foreign IP addresses",
          "Regulating cooling fan speeds in network switches",
          "Balancing electrical currents in copper cables"
        ],
        answer: 0,
        explanation: "TCP Flow Control uses the advertised Receive Window (`rwnd`) in packet headers to inform the sender of available buffer space at the receiver."
      },
      {
        id: 17,
        question: "What is TCP Congestion Control, and which algorithms govern it?",
        options: [
          "Mechanisms (Slow Start, Congestion Avoidance, Fast Retransmit, Fast Recovery) that adjust sending rate based on network capacity to prevent packet collapse",
          "Blocking all video streams during peak hours",
          "Deleting corrupted packets from disk",
          "Using fiber cables instead of copper"
        ],
        answer: 0,
        explanation: "TCP Congestion Control maintains a Congestion Window (`cwnd`) that expands during successful delivery and throttles back upon packet loss."
      },
      {
        id: 18,
        question: "What does the Time to Live (TTL) field in an IPv4 packet header accomplish?",
        options: [
          "An 8-bit counter decremented by each router to prevent packets from looping endlessly in routing loops",
          "The battery life of the sender's device",
          "The timestamp when the email was drafted",
          "The expiration date of the domain registration"
        ],
        answer: 0,
        explanation: "TTL prevents packets from circulating indefinitely. Each router decrements TTL by 1; if TTL reaches 0, the packet is discarded and an ICMP Time Exceeded message is returned."
      },
      {
        id: 19,
        question: "What is a Denial of Service (DDoS) attack, and what distinguishes Distributed DoS?",
        options: [
          "An attack attempting to exhaust server bandwidth or resources; 'Distributed' means the flood traffic originates from a coordinated botnet of many compromised machines",
          "Physically unplugging network cables in a datacenter",
          "Writing infinite while loops in client JavaScript",
          "Stealing user passwords from browser cache"
        ],
        answer: 0,
        explanation: "A DDoS attack leverages thousands of distributed compromised hosts (a botnet) to overwhelm target network capacity or service resources."
      },
      {
        id: 20,
        question: "What protocol is responsible for routing traffic between Autonomous Systems (AS) across the global Internet backbone?",
        options: ["BGP (Border Gateway Protocol)", "RIP", "OSPF", "STP"],
        answer: 0,
        explanation: "BGP is the foundational path-vector routing protocol that directs traffic between autonomous internet service providers and corporate networks on the global internet."
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
        explanation: "Decorators are callable higher-order functions that wrap another function to transparently extend its functionality (such as logging, timing, or authentication)."
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
        explanation: "A shallow copy constructs a new compound object and inserts references to original nested elements. A deep copy recursively duplicates every object found."
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
        explanation: "Python predominantly uses reference counting for immediate deallocation when an object's reference counter hits zero, alongside a generational garbage collector for cyclic references."
      },
      {
        id: 5,
        question: "What is the Global Interpreter Lock (GIL) in CPython?",
        options: [
          "A mutex that prevents multiple native threads from executing Python bytecodes at once, ensuring CPython memory management safety",
          "A security encryption lock on user files",
          "A tool that prevents users from viewing source code",
          "A compiler optimization for faster loops"
        ],
        answer: 0,
        explanation: "The GIL is a mutex in CPython that serializes thread execution, meaning CPU-bound multithreaded code does not run in true parallel on multiple cores."
      },
      {
        id: 6,
        question: "What is the difference between a Generator function (using `yield`) and a regular function returning a list in Python?",
        options: [
          "Generators produce items lazily on demand one at a time using iterator protocol, saving massive memory compared to constructing full lists in RAM",
          "Generators execute 100 times slower than lists",
          "Generators can only yield strings, not integers",
          "Regular functions cannot return lists"
        ],
        answer: 0,
        explanation: "A generator function yields values one at a time upon iteration without loading the entire sequence into memory, enabling efficient processing of large streams."
      },
      {
        id: 7,
        question: "Which built-in Python data types are Mutable versus Immutable?",
        options: [
          "Lists, Dictionaries, and Sets are Mutable; Integers, Floats, Strings, and Tuples are Immutable",
          "All Python data types are mutable",
          "Tuples and Strings are mutable; Lists are immutable",
          "Only dictionaries are mutable"
        ],
        answer: 0,
        explanation: "Immutable types (integers, strings, tuples, frozensets) cannot have their contents changed after creation; mutable types (lists, dicts, sets) can be modified in-place."
      },
      {
        id: 8,
        question: "What is the difference between `==` and `is` in Python?",
        options: [
          "`==` checks for value equality (equivalence); `is` checks for object identity (whether two variables refer to the exact same memory address)",
          "`is` compares values; `==` compares data types",
          "`is` can only be used with numbers",
          "They are exact synonyms with identical operations"
        ],
        answer: 0,
        explanation: "`==` invokes `__eq__` to compare values, whereas `is` evaluates `id(a) == id(b)` to verify if both references point to the exact same object in memory."
      },
      {
        id: 9,
        question: "What is the purpose of `*args` and `**kwargs` in Python function definitions?",
        options: [
          "`*args` accepts an arbitrary number of positional arguments as a tuple; `**kwargs` accepts arbitrary keyword arguments as a dictionary",
          "They define pointer references like in C++",
          "They multiply the return values of functions",
          "They declare private instance variables"
        ],
        answer: 0,
        explanation: "`*args` collects extra positional arguments into a tuple, while `**kwargs` captures extra keyword arguments into a key-value dictionary."
      },
      {
        id: 10,
        question: "In Python OOP, what is Encapsulation?",
        options: [
          "Bundling data attributes and methods that manipulate that data into a single class while restricting direct external access using conventions (e.g. `_` or `__`)",
          "Converting Python code into executable EXE binaries",
          "Encrypting Python modules with passwords",
          "Compressing code files into ZIP packages"
        ],
        answer: 0,
        explanation: "Encapsulation restricts direct unauthorized modification of an object's internal state, exposing safe interaction through methods and properties."
      },
      {
        id: 11,
        question: "What is Method Overriding in Python object-oriented programming?",
        options: [
          "A subclass providing a specific implementation of a method that is already defined in its parent/base class",
          "Writing two functions with the same name in the same file",
          "Deleting a method from memory during execution",
          "Renaming a method using the `as` keyword"
        ],
        answer: 0,
        explanation: "Method overriding allows a child class to provide a customized version of a method inherited from a parent class to implement polymorphic behavior."
      },
      {
        id: 12,
        question: "What is the purpose of the `super()` built-in function in Python classes?",
        options: [
          "To delegate method calls to a parent or sibling class in the Method Resolution Order (MRO)",
          "To elevate user operating system permissions to Administrator",
          "To run functions at double CPU clock speeds",
          "To import third-party packages from PyPI"
        ],
        answer: 0,
        explanation: "`super()` returns a proxy object that delegates method calls to a parent class, ensuring proper initialization in single and multiple inheritance hierarchies."
      },
      {
        id: 13,
        question: "What does `__init__` versus `__new__` do in Python object creation?",
        options: [
          "`__new__` is the static constructor that creates and returns the new instance; `__init__` is the initializer that initializes the created instance's attributes",
          "`__init__` allocates hardware memory; `__new__` deletes it",
          "`__new__` is deprecated in Python 3",
          "They cannot be used in the same class"
        ],
        answer: 0,
        explanation: "`__new__` creates the instance object and returns it, after which Python automatically calls `__init__` with the newly created instance to set initial state."
      },
      {
        id: 14,
        question: "What is a Python Context Manager (using the `with` statement)?",
        options: [
          "An object that defines runtime context via `__enter__` and `__exit__` to ensure resources (like files or database locks) are cleanly acquired and released",
          "A graphical window for managing desktop icons",
          "A task manager plugin for monitoring RAM usage",
          "A tool for creating virtual environments"
        ],
        answer: 0,
        explanation: "Context managers guarantee cleanup operations (e.g. `file.close()`) are executed in `__exit__` even if exceptions occur inside the `with` block."
      },
      {
        id: 15,
        question: "What is a List Comprehension in Python?",
        options: [
          "A concise, readable syntax for creating new lists based on existing iterables: `[expr for item in iterable if condition]`",
          "A textbook chapter explaining arrays",
          "An AI model that summarizes text documents",
          "A tool that converts lists into CSV files"
        ],
        answer: 0,
        explanation: "List comprehensions provide an expressive, optimized C-speed syntax for transforming and filtering iterables into new lists."
      },
      {
        id: 16,
        question: "What is a Lambda function in Python?",
        options: [
          "A small anonymous function defined with the `lambda` keyword that contains a single expression evaluated and returned: `lambda x: x * 2`",
          "A cloud serverless function exclusively in AWS",
          "A Greek mathematical constant in the `math` module",
          "A function that runs in a separate thread"
        ],
        answer: 0,
        explanation: "Lambdas are anonymous inline functions that take arguments and return the evaluation of a single expression, often used with `map()`, `filter()`, or `sorted()`."
      },
      {
        id: 17,
        question: "What happens in a Python `try...except...finally` block?",
        options: [
          "`try` tests code for errors, `except` catches specific exceptions, and `finally` ALWAYS executes regardless of whether an exception occurred",
          "The `finally` block is skipped if an exception is thrown",
          "Only one `except` block is allowed per program",
          "The program shuts down immediately upon entering `try`"
        ],
        answer: 0,
        explanation: "The `finally` block is guaranteed to run after `try` and `except` blocks, making it essential for releasing system resources or closing files."
      },
      {
        id: 18,
        question: "What is Method Resolution Order (MRO) in Python multiple inheritance?",
        options: [
          "The deterministic order (computed using the C3 Linearization algorithm) in which Python searches base classes for methods and attributes",
          "Alphabetical ordering of functions in a class",
          "The order in which methods are written in the source code",
          "Sorting functions by execution duration"
        ],
        answer: 0,
        explanation: "Python uses the C3 Linearization algorithm to determine a class's MRO (`ClassName.__mro__`), preventing inconsistencies in diamond inheritance."
      },
      {
        id: 19,
        question: "What is the purpose of `@property` decorator in Python?",
        options: [
          "To define getter, setter, and deleter methods that allow a method to be accessed like a regular attribute while encapsulating validation logic",
          "To register a home address in database records",
          "To convert a class into a dictionary",
          "To protect variables from being garbage collected"
        ],
        answer: 0,
        explanation: "`@property` enables pythonic getters and setters, allowing attributes to be accessed with dot notation while executing underlying methods."
      },
      {
        id: 20,
        question: "What are Python 'Dunder' methods (e.g. `__str__`, `__repr__`, `__len__`, `__getitem__`)?",
        options: [
          "Special double-underscore methods that allow classes to hook into built-in Python operators, functions, and language behaviors (Operator Overloading)",
          "Functions that run during operating system boot",
          "Secret hidden passwords inside Python libraries",
          "Functions that can only be called from terminal command lines"
        ],
        answer: 0,
        explanation: "Dunder (double underscore) magic methods allow user-defined classes to emulate built-in types (e.g. `len(obj)` calls `obj.__len__()`)."
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
        explanation: "Supervised algorithms learn from training examples with explicit ground-truth labels, while unsupervised algorithms discover clusters or patterns without targets."
      },
      {
        id: 2,
        question: "In Machine Learning model evaluation, what is Overfitting?",
        options: [
          "When a model performs poorly on training data and fails to capture underlying patterns",
          "When a model memorizes training data noise and performs poorly on unseen test data",
          "When a model has too few parameters to learn simple features",
          "When training completes in under one second"
        ],
        answer: 1,
        explanation: "Overfitting occurs when a high-capacity model learns the training data too closely, resulting in high training accuracy but poor generalization to new data."
      },
      {
        id: 3,
        question: "Why is the ReLU (Rectified Linear Unit, `f(x) = max(0, x)`) activation function widely used in deep neural networks?",
        options: [
          "It mitigates the vanishing gradient problem for positive values and allows faster gradient descent convergence compared to Sigmoid",
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
          "To measure the quantitative error between model predictions and actual ground truth targets, providing gradients to guide optimization",
          "To allocate disk space for dataset storage",
          "To randomly shuffle training image labels",
          "To compress model parameters into ZIP format"
        ],
        answer: 0,
        explanation: "The loss function calculates a scalar quantifying the discrepancy between the network's prediction and desired label, which the optimizer seeks to minimize."
      },
      {
        id: 5,
        question: "What is Gradient Descent in machine learning?",
        options: [
          "An iterative first-order optimization algorithm that updates model parameters in the direction of steepest negative gradient of the loss function",
          "A sorting algorithm for image datasets",
          "A method of compressing neural network weights",
          "A hardware cooling technique for GPUs"
        ],
        answer: 0,
        explanation: "Gradient Descent iteratively steps model weights opposite to the gradient vector of the loss function with step size governed by the learning rate."
      },
      {
        id: 6,
        question: "What is the difference between Precision and Recall in classification metrics?",
        options: [
          "Precision is TP / (TP + FP) (accuracy of positive predictions); Recall is TP / (TP + FN) (ability to find all actual positive instances)",
          "Precision and Recall are always identical numbers",
          "Recall only measures negative cases",
          "Precision is the training duration in seconds"
        ],
        answer: 0,
        explanation: "Precision measures how many selected items are relevant, while Recall measures how many relevant items were successfully selected."
      },
      {
        id: 7,
        question: "What is the F1-Score in machine learning evaluation?",
        options: [
          "The harmonic mean of Precision and Recall, providing a balanced metric especially on imbalanced datasets",
          "The first loss calculation during epoch 1",
          "The formula one racing simulation speed",
          "The percentage of missing data columns"
        ],
        answer: 0,
        explanation: "F1-Score combines Precision and Recall via their harmonic mean (`2 * (P * R) / (P + R)`), giving a balanced measure on skewed class distributions."
      },
      {
        id: 8,
        question: "What is Backpropagation in artificial neural networks?",
        options: [
          "Applying the calculus chain rule backwards from the loss function through layers to compute partial derivatives of the loss with respect to each weight",
          "Rewinding the video stream to the beginning",
          "Deleting neural network layers during training",
          "Sending data packets back to the client"
        ],
        answer: 0,
        explanation: "Backpropagation efficiently computes gradients of the loss with respect to all network weights by propagating error signals backwards via the chain rule."
      },
      {
        id: 9,
        question: "What is the purpose of Regularization techniques (like L1 Lasso, L2 Ridge, and Dropout)?",
        options: [
          "To prevent overfitting by penalizing complex models and encouraging simpler, more generalizable representations",
          "To increase training loss to infinity",
          "To speed up GPU fan speeds",
          "To convert floating point numbers to integers"
        ],
        answer: 0,
        explanation: "Regularization constrains weight magnitudes (L1/L2) or randomly deactivates neurons during training (Dropout) to prevent co-adaptation and overfitting."
      },
      {
        id: 10,
        question: "What is the Bias-Variance Tradeoff?",
        options: [
          "The conflict where high bias causes underfitting (oversimplified assumptions) and high variance causes overfitting (sensitivity to training noise)",
          "Balancing CPU clock speed against RAM capacity",
          "Trading software licenses between companies",
          "Balancing network bandwidth against ping latency"
        ],
        answer: 0,
        explanation: "Total generalization error consists of bias, variance, and irreducible error. Optimal models balance low bias and low variance."
      },
      {
        id: 11,
        question: "In Deep Learning, what makes Convolutional Neural Networks (CNNs) specifically suited for computer vision?",
        options: [
          "Parameter sharing, translation equivariance, and local receptive fields that extract spatial hierarchies of features from images",
          "They only accept 1D text strings",
          "They do not use matrix multiplication",
          "They run without any training data"
        ],
        answer: 0,
        explanation: "CNNs use convolving filter kernels with shared weights across spatial dimensions to detect local patterns (edges, textures, objects) invariant to translation."
      },
      {
        id: 12,
        question: "What architecture revolutionized Natural Language Processing (NLP) by replacing sequential recurrent layers with Self-Attention?",
        options: ["The Transformer (Attention Is All You Need)", "Simple Recurrent Neural Network", "Perceptron", "K-Means Clustering"],
        answer: 0,
        explanation: "The Transformer architecture uses multi-head self-attention mechanisms to process tokens in parallel across full context lengths, powering modern LLMs."
      },
      {
        id: 13,
        question: "What is the Self-Attention mechanism in Transformer models?",
        options: [
          "Computing dynamic attention weights between all token pairs in a sequence using Query, Key, and Value dot-product matrices",
          "An attention timer for student study sessions",
          "A camera tracking algorithm that tracks user eye movements",
          "A neural network that deletes unused words from sentences"
        ],
        answer: 0,
        explanation: "Self-Attention computes `Softmax((Q * K^T) / sqrt(d_k)) * V`, enabling each token to attend to all other relevant tokens in the input context."
      },
      {
        id: 14,
        question: "What is Transfer Learning in modern AI development?",
        options: [
          "Taking a large pre-trained model (trained on vast datasets) and fine-tuning it on a specialized target domain with much less data and compute",
          "Transferring files over FTP between two AI servers",
          "Copying code from StackOverflow",
          "Moving machine learning textbooks between classrooms"
        ],
        answer: 0,
        explanation: "Transfer learning leverages knowledge and representations learned by foundation models during pre-training, fine-tuning them on downstream tasks with high efficiency."
      },
      {
        id: 15,
        question: "What is the Vanishing Gradient Problem in deep neural networks?",
        options: [
          "When gradients become exponentially small as they propagate backwards through many layers with saturating activations, halting weight updates in early layers",
          "When the GPU runs out of physical memory",
          "When all weights become exactly equal to 1.0",
          "When the training dataset is accidentally deleted"
        ],
        answer: 0,
        explanation: "When multiplying many small derivatives (e.g. from Sigmoid or Tanh activations) across deep layers, gradients shrink to near zero, preventing early layers from learning."
      },
      {
        id: 16,
        question: "What is Reinforcement Learning (RL)?",
        options: [
          "A paradigm where an Agent learns to take Actions in an Environment to maximize cumulative Reward via trial and error",
          "Training models on spreadsheet CSV data with regression",
          "Manually programming if/else rules for robots",
          "Compressing audio files using neural codecs"
        ],
        answer: 0,
        explanation: "In Reinforcement Learning, an agent interacts with an environment through state observations and actions, optimizing its policy to maximize cumulative expected rewards."
      },
      {
        id: 17,
        question: "What is Cross-Validation (e.g. K-Fold Cross-Validation)?",
        options: [
          "Splitting dataset into K equal subsets, training on K-1 folds and validating on the remaining fold K times, averaging performance to assess generalization",
          "Checking user passwords against two different databases",
          "Verifying Python code syntax with two linters",
          "Running the model on two different operating systems"
        ],
        answer: 0,
        explanation: "K-Fold Cross-Validation trains and tests models across K distinct splits of the data, providing a robust, variance-reduced estimate of generalization performance."
      },
      {
        id: 18,
        question: "What is an Epoch in machine learning training?",
        options: [
          "One complete forward and backward pass of the entire training dataset through the neural network",
          "A single calculation of a single weight parameter",
          "The timestamp when the model was created",
          "A measurement of network latency"
        ],
        answer: 0,
        explanation: "An epoch corresponds to one full iteration through all training samples in the dataset."
      },
      {
        id: 19,
        question: "What is Data Augmentation in training machine learning models?",
        options: [
          "Generating synthetic variations of training examples (e.g. rotations, crops, flips, color shifts) to artificially expand dataset diversity and prevent overfitting",
          "Purchasing extra hard disk drives for training",
          "Manually editing spreadsheet cells",
          "Converting PNG images to JPEG format"
        ],
        answer: 0,
        explanation: "Data augmentation applies label-preserving transformations to training inputs, exposing the model to wider visual variations and boosting test robustness."
      },
      {
        id: 20,
        question: "What is Hallucination in Large Language Models (LLMs)?",
        options: [
          "When an LLM generates syntactically convincing, confident text that is factually incorrect, unverifiable, or contradicts reality",
          "When the computer monitor flickers rapidly",
          "When the model's loss function reaches exactly zero",
          "When the server loses internet connectivity"
        ],
        answer: 0,
        explanation: "Hallucination refers to LLMs generating plausible-sounding but factually fabricated statements due to probabilistic next-token generation without verified truth grounding."
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
          "O(n²) when the chosen pivot consistently splits the array unevenly (e.g. already sorted array with naive first/last element pivot)",
          "O(1) constant time",
          "O(log n) logarithmic time"
        ],
        answer: 1,
        explanation: "If the pivot consistently partitions into subarrays of sizes 0 and n-1, recursion depth reaches n, resulting in worst-case O(n²) comparisons."
      },
      {
        id: 2,
        question: "Which abstract data structure operates on a Last-In, First-Out (LIFO) order of elements?",
        options: ["Queue", "Stack", "Priority Heap", "Linked List"],
        answer: 1,
        explanation: "A Stack enforces LIFO behavior, where the most recently pushed element is the first one popped (e.g. function call stacks, undo history)."
      },
      {
        id: 3,
        question: "What is the expected average time complexity of element lookup in a well-distributed Hash Table?",
        options: ["O(1) Constant Time", "O(n) Linear Time", "O(log n) Logarithmic Time", "O(n!) Factorial Time"],
        answer: 0,
        explanation: "Using a good hash function with low collision probability, bucket index calculation and element retrieval occur in O(1) constant average time."
      },
      {
        id: 4,
        question: "Which graph search algorithm is guaranteed to find the shortest path in a weighted graph with non-negative edge weights?",
        options: ["Dijkstra's Algorithm", "Depth First Search (DFS)", "Bubble Sort", "Kruskal's MST Algorithm"],
        answer: 0,
        explanation: "Dijkstra's algorithm uses a min-priority queue to iteratively explore vertices in order of minimal accumulated distance from the starting node."
      },
      {
        id: 5,
        question: "What is the worst-case time complexity of searching for an element in a balanced Binary Search Tree (such as an AVL or Red-Black Tree)?",
        options: ["O(log n)", "O(n)", "O(1)", "O(n²)"],
        answer: 0,
        explanation: "Self-balancing binary search trees maintain a maximum height proportional to log2(n), guaranteeing O(log n) search, insertion, and deletion."
      },
      {
        id: 6,
        question: "What is the difference between a Queue and a Stack?",
        options: [
          "A Queue is First-In, First-Out (FIFO); a Stack is Last-In, First-Out (LIFO)",
          "A Stack can only hold strings, while a Queue holds numbers",
          "Queues are stored on the hard drive, while Stacks are in RAM",
          "There is no structural difference"
        ],
        answer: 0,
        explanation: "Queues process items in the order they arrived (FIFO, e.g. printer spools), while Stacks process items in reverse order of arrival (LIFO)."
      },
      {
        id: 7,
        question: "What is the time complexity of MergeSort in all cases (worst, average, and best)?",
        options: ["O(n log n)", "O(n²)", "O(n)", "O(log n)"],
        answer: 0,
        explanation: "MergeSort recursively halves the array (depth log n) and performs linear merging (O(n)) at each level, guaranteeing O(n log n) time in all cases."
      },
      {
        id: 8,
        question: "What is the core difference between Dynamic Programming (DP) and standard Divide-and-Conquer?",
        options: [
          "Dynamic Programming solves problems with overlapping subproblems and optimal substructure by caching subproblem solutions (memoization or tabulation)",
          "Divide and conquer cannot use recursion",
          "Dynamic programming can only run on quantum computers",
          "Divide and conquer is only used for sorting numbers"
        ],
        answer: 0,
        explanation: "While both break problems into smaller subproblems, DP memoizes solutions to overlapping subproblems to avoid redundant recomputations (e.g. Fibonacci, Knapsack)."
      },
      {
        id: 9,
        question: "In graph theory, which traversal uses a Queue and visits nodes level-by-level in order of distance from the root?",
        options: ["Breadth-First Search (BFS)", "Depth-First Search (DFS)", "In-Order Traversal", "Topological Sort"],
        answer: 0,
        explanation: "BFS explores all neighbor nodes at the current depth before moving to nodes at the next depth level, using a FIFO queue."
      },
      {
        id: 10,
        question: "What is a Min-Heap (or Max-Heap) data structure?",
        options: [
          "A complete binary tree where the key at the root is the minimum (or maximum) among all keys in the tree, and the property recursively holds for all subtrees",
          "A disordered array of random elements",
          "A linked list with two head pointers",
          "A hash table with no hash function"
        ],
        answer: 0,
        explanation: "A binary heap satisfies the heap property, enabling O(1) retrieval of the minimum (or maximum) element and O(log n) insertions and extractions."
      },
      {
        id: 11,
        question: "What is the worst-case time complexity of inserting an element into a Hash Table that handles collisions via Chaining?",
        options: ["O(n) when all n keys hash to the exact same bucket", "O(1) in all circumstances", "O(log n)", "O(n!)"],
        answer: 0,
        explanation: "In the pathological worst case where all n keys produce identical hash codes, all elements chain into a single linked list, requiring O(n) search."
      },
      {
        id: 12,
        question: "What is an Adjacency Matrix versus an Adjacency List representation of a graph with V vertices and E edges?",
        options: [
          "Adjacency Matrix uses a V x V 2D matrix (O(V²) space); Adjacency List uses an array of lists storing only incident edges (O(V + E) space)",
          "Adjacency lists can only represent trees, not graphs",
          "Adjacency matrices are only used for 3D graphics",
          "Adjacency lists require O(V²) space"
        ],
        answer: 0,
        explanation: "Adjacency lists are space-efficient for sparse graphs (O(V + E)), while adjacency matrices provide O(1) edge lookup at the expense of O(V²) memory."
      },
      {
        id: 13,
        question: "What is the time complexity of Binary Search on a sorted array of size n?",
        options: ["O(log n)", "O(n)", "O(1)", "O(n log n)"],
        answer: 0,
        explanation: "Binary Search halves the search interval at each step, requiring at most log2(n) comparisons to find the target element."
      },
      {
        id: 14,
        question: "Which algorithm finds the Minimum Spanning Tree (MST) of a connected, undirected graph using a Greedy edge-selection strategy?",
        options: ["Kruskal's Algorithm (or Prim's Algorithm)", "Bellman-Ford Algorithm", "Floyd-Warshall Algorithm", "A* Search"],
        answer: 0,
        explanation: "Kruskal's algorithm sorts edges by weight and uses a Disjoint Set (Union-Find) to greedily add the lowest-weight edges that do not form a cycle."
      },
      {
        id: 15,
        question: "What is the purpose of the Two Pointers technique in algorithmic problem solving?",
        options: [
          "Using two index pointers iterating through a data structure (e.g. from opposite ends or at different speeds) to solve problems in O(n) time and O(1) space",
          "Allocating two mouse pointers on the screen",
          "Using double pointers `**ptr` in C++ memory management",
          "Duplicating an array to increase memory usage"
        ],
        answer: 0,
        explanation: "Two pointers iterate through collections in tandem (e.g. fast/slow for cycle detection, or left/right for sorted two-sum), reducing quadratic O(n²) loops to linear O(n)."
      },
      {
        id: 16,
        question: "What is a Trie (Prefix Tree) data structure primarily used for?",
        options: [
          "Efficient storage and retrieval of keys in a dataset of strings, enabling fast prefix lookup and autocomplete in O(L) time where L is string length",
          "Balancing mathematical equations",
          "Sorting floating point numbers",
          "Compressing video codecs"
        ],
        answer: 0,
        explanation: "A Trie stores strings character by character across a tree of nodes, allowing prefix matching, autocomplete, and dictionary lookups in time proportional to key length."
      },
      {
        id: 17,
        question: "What is the Space Complexity of Depth-First Search (DFS) on a graph implemented via recursion?",
        options: [
          "O(V) in the worst case to store the call stack up to the maximum recursion depth",
          "O(1) constant space in all cases",
          "O(V² * E)",
          "O(n!)"
        ],
        answer: 0,
        explanation: "In the worst case (a linear path graph), the recursive call stack for DFS will hold V frames, requiring O(V) auxiliary memory."
      },
      {
        id: 18,
        question: "What graph shortest-path algorithm can handle graphs with Negative edge weights and detect negative cycles?",
        options: ["Bellman-Ford Algorithm", "Dijkstra's Algorithm", "Breadth-First Search", "Binary Search"],
        answer: 0,
        explanation: "The Bellman-Ford algorithm relaxes all edges V-1 times and can accurately detect negative-weight cycles, which causes Dijkstra's algorithm to fail."
      },
      {
        id: 19,
        question: "What is an In-Order Traversal of a Binary Search Tree (BST) guaranteed to produce?",
        options: [
          "The elements in sorted ascending order",
          "The elements in reverse random order",
          "Only the leaf nodes of the tree",
          "The nodes grouped by tree level"
        ],
        answer: 0,
        explanation: "Because an in-order traversal visits Left Subtree -> Root -> Right Subtree, performing it on a valid BST always yields keys in non-decreasing sorted order."
      },
      {
        id: 20,
        question: "What is the amortized time complexity of inserting an element into a dynamic array (e.g. `vector` in C++, `ArrayList` in Java, or `list` in Python)?",
        options: [
          "Amortized O(1) constant time, despite occasional O(n) array resizing doubling operations",
          "Always strictly O(n) for every single push",
          "O(log n) logarithmic time",
          "O(n²)"
        ],
        answer: 0,
        explanation: "Dynamic arrays double their capacity when full. Because geometric doubling distributes the copying cost across many elements, the amortized cost per append is O(1)."
      }
    ]
  }
};

// ── Smart Dynamic 20-Question Synthesizer for ANY Custom Topic Discussed in Class ──
export function generateCustomTopicQuestions(topicName, transcription = '') {
  const cleanTopic = (topicName || 'Classroom Subject').trim();
  const cleanNotes = (transcription || '').trim();
  const notesSnippet = cleanNotes.length > 20 
    ? cleanNotes.split(/[.?!]/)[0].slice(0, 60)
    : `${cleanTopic} conceptual paradigms`;

  // 20 diverse, educational question archetypes
  const archetypes = [
    {
      question: `What is the primary foundational concept and purpose of "${cleanTopic}"?`,
      options: [
        `Establishing a structured, reliable, and standardized methodology for implementing ${cleanTopic}`,
        `Bypassing data validation protocols to maximize unmonitored throughput`,
        `Deprecating modular design standards in favor of monolithic script files`,
        `Eliminating system error handling to reduce code size`
      ],
      answer: 0,
      explanation: `The foundational objective of "${cleanTopic}" is to provide a structured, efficient, and reliable framework for addressing core domain problems.`
    },
    {
      question: `In today's lecture on "${cleanTopic}", which mechanism was emphasized as critical for operational integrity?`,
      options: [
        `Unrestricted concurrent state mutations without synchronization`,
        `Automated validation, state synchronization, and component coordination`,
        `Hardcoding configuration parameters into binary files`,
        `Disabling exception boundaries in production workflows`
      ],
      answer: 1,
      explanation: `Modern architectures for "${cleanTopic}" prioritize systematic state validation, predictability, and coordinated component synchronization.`
    },
    {
      question: `When deploying solutions in "${cleanTopic}", what is widely recognized as an industry best practice?`,
      options: [
        `Maintaining modular decoupling, clear error boundaries, and observable metrics`,
        `Coupling business logic directly into UI presentation components`,
        `Disabling automated testing pipelines to speed up delivery`,
        `Running untrusted user input directly in execution contexts`
      ],
      answer: 0,
      explanation: `Decoupled modules, defensive error handling, and end-to-end observability are hallmarks of robust "${cleanTopic}" engineering.`
    },
    {
      question: `According to the lecture discussion (${notesSnippet}), how is high performance preserved in "${cleanTopic}"?`,
      options: [
        `Through algorithmic optimization, intelligent caching, and minimal latency overhead`,
        `By inserting synchronous blocking loops across worker threads`,
        `By duplicating identical network payloads across all client buffers`,
        `By disabling asynchronous task queues completely`
      ],
      answer: 0,
      explanation: `Performance in "${cleanTopic}" is sustained by eliminating computational bottlenecks, leveraging caching layers, and minimizing latency.`
    },
    {
      question: `What is the principal architectural risk associated with poor state management in "${cleanTopic}"?`,
      options: [
        `Race conditions, stale memory reads, and non-deterministic application behavior`,
        `Hardware motherboard capacitor discharge`,
        `Immediate loss of optical fiber connectivity`,
        `Forced downgrade of monitor refresh rates`
      ],
      answer: 0,
      explanation: `Unsynchronized or disorganized state leads to race conditions, inconsistencies, and unpredictable bugs in "${cleanTopic}".`
    },
    {
      question: `Which data flow pattern is considered optimal for maintaining scalability in "${cleanTopic}"?`,
      options: [
        `Unidirectional data flow with predictable state mutations and decoupled subscribers`,
        `Bidirectional circular data dependencies with global mutable variables`,
        `Direct memory writes from client UI to raw disk sectors`,
        `Completely static hardcoded responses with no runtime updates`
      ],
      answer: 0,
      explanation: `Unidirectional data flow enforces predictable state transitions and makes debugging, testing, and scaling "${cleanTopic}" straightforward.`
    },
    {
      question: `When implementing security and access controls in "${cleanTopic}", what principle should be strictly enforced?`,
      options: [
        `Principle of Least Privilege and rigorous input sanitization`,
        `Granting root administrative permissions to all guest connections`,
        `Storing sensitive tokens in plain text in public client scripts`,
        `Disabling cryptographic handshakes on external networks`
      ],
      answer: 0,
      explanation: `Security in "${cleanTopic}" requires restricting component privileges to the bare minimum necessary and sanitizing all inputs.`
    },
    {
      question: `In the lifecycle of a "${cleanTopic}" workflow, at which phase should resource deallocation occur?`,
      options: [
        `During the teardown/cleanup phase to prevent memory leaks and dangling sockets`,
        `Immediately before the initialization handshake begins`,
        `Never, leaving resources allocated until operating system reboot`,
        `Exclusively during user login`
      ],
      answer: 0,
      explanation: `Proper teardown ensures open sockets, file handles, and memory allocations in "${cleanTopic}" are safely reclaimed.`
    },
    {
      question: `What is a common trade-off when optimizing for ultra-low latency in "${cleanTopic}"?`,
      options: [
        `Trading excessive retransmission guarantees or compression depth for immediate throughput`,
        `Permanently losing all database storage capabilities`,
        `Requiring human manual intervention for every packet`,
        `Disabling all CPU multi-core operations`
      ],
      answer: 0,
      explanation: `Low latency often requires balancing heavy lossless compression or retransmissions against immediate packet dispatch.`
    },
    {
      question: `How does fault tolerance contribute to high availability in "${cleanTopic}" architectures?`,
      options: [
        `By providing automated failover, retry backoff strategies, and graceful degradation`,
        `By terminating the whole system whenever a single non-critical error occurs`,
        `By preventing any client from reconnecting after a timeout`,
        `By deleting all application logs upon error`
      ],
      answer: 0,
      explanation: `Fault tolerance allows "${cleanTopic}" systems to withstand component failures without interrupting overall classroom or service availability.`
    },
    {
      question: `Which testing methodology is most effective for verifying edge cases in "${cleanTopic}"?`,
      options: [
        `Automated unit, integration, and stress testing with boundary condition assertions`,
        `Manual ad-hoc testing with only happy-path scenarios`,
        `Deploying directly to production without any test execution`,
        `Deleting failing test cases from the test runner`
      ],
      answer: 0,
      explanation: `Comprehensive automated test suites ensure that edge cases, network drops, and unexpected inputs in "${cleanTopic}" are handled safely.`
    },
    {
      question: `What role does telemetry and logging play in monitoring "${cleanTopic}" during live sessions?`,
      options: [
        `Providing observable operational metrics to detect latency spikes, dropouts, and errors in real time`,
        `Slow down execution speed to conserve battery power`,
        `Replace relational databases with text log files entirely`,
        `Prevent students from asking questions`
      ],
      answer: 0,
      explanation: `Telemetry provides live visibility into health indicators, error rates, and connection performance across "${cleanTopic}".`
    },
    {
      question: `In distributed environments, how is data consistency preserved across nodes in "${cleanTopic}"?`,
      options: [
        `Using consensus protocols, optimistic concurrency controls, or conflict-free replicated data types`,
        `Allowing nodes to overwrite each other arbitrarily without timestamps`,
        `Disconnecting all network nodes from each other`,
        `Assuming all client clocks are synchronized to zero nanoseconds`
      ],
      answer: 0,
      explanation: `Distributed "${cleanTopic}" implementations use consensus algorithms or CRDTs to resolve conflicting concurrent updates reliably.`
    },
    {
      question: `What is the consequence of tight coupling between sub-components in "${cleanTopic}"?`,
      options: [
        `Refactoring and testing become difficult because changes in one module trigger unintended cascading breakages`,
        `The application automatically becomes 10x faster`,
        `Memory usage drops to zero`,
        `Source code files become immune to bugs`
      ],
      answer: 0,
      explanation: `Tight coupling reduces code maintainability, hinders unit testing, and makes independent feature evolution difficult in "${cleanTopic}".`
    },
    {
      question: `When handling asynchronous events in "${cleanTopic}", which pattern prevents callback hell and unhandled rejections?`,
      options: [
        `Async/Await syntax paired with centralized error-handling boundaries and Promise chaining`,
        `Deeply nested synchronous while-loops`,
        `Disabling all asynchronous event listeners`,
        `Writing all code inside a single global variable`
      ],
      answer: 0,
      explanation: `Async/await with structured error boundaries provides clean, readable, and resilient asynchronous control flow in "${cleanTopic}".`
    },
    {
      question: `What is the primary motivation for introducing caching layers into "${cleanTopic}" systems?`,
      options: [
        `To serve frequent read requests quickly without incurring expensive computation or repetitive database queries`,
        `To permanently delete the primary database`,
        `To bypass user authentication checks`,
        `To duplicate memory usage unnecessarily`
      ],
      answer: 0,
      explanation: `Caching frequently accessed records or computations reduces latency and protects backend services in "${cleanTopic}" from overload.`
    },
    {
      question: `How should unexpected boundary inputs be handled by "${cleanTopic}" API endpoints?`,
      options: [
        `Validated against a strict schema and rejected with informative error status codes if malformed`,
        `Silently ignored while continuing execution with undefined values`,
        `Crashing the server process immediately`,
        `Executing arbitrary commands contained in the input`
      ],
      answer: 0,
      explanation: `Robust endpoints in "${cleanTopic}" validate inputs against schemas and return clear error codes instead of failing silently.`
    },
    {
      question: `What optimization strategy minimizes network bandwidth consumption in "${cleanTopic}"?`,
      options: [
        `Payload compression, incremental delta updates, and debounced event dispatching`,
        `Transmitting entire database snapshots on every user keystroke`,
        `Disabling all network packet encryption`,
        `Increasing payload size by adding redundant padding bytes`
      ],
      answer: 0,
      explanation: `Delta synchronization, payload compression, and event debouncing minimize bandwidth utilization in "${cleanTopic}".`
    },
    {
      question: `In modern software development, what makes "${cleanTopic}" particularly relevant and impactful?`,
      options: [
        `It addresses critical real-world demands for scalable, real-time, interactive, and reliable computing solutions`,
        `It requires no computer hardware to run`,
        `It makes all future programming languages obsolete`,
        `It only works on paper notebooks`
      ],
      answer: 0,
      explanation: `Mastering "${cleanTopic}" empowers students and developers to construct resilient, high-throughput applications in contemporary tech stacks.`
    },
    {
      question: `Which key takeaway summarizes the core principle of mastering "${cleanTopic}" from today's lecture?`,
      options: [
        `Balancing theoretical domain principles with practical architectural discipline, continuous testing, and observable performance`,
        `Memorizing arbitrary variable names without understanding data flow`,
        `Ignoring system constraints in favor of quick temporary fixes`,
        `Avoiding software updates and modern tooling`
      ],
      answer: 0,
      explanation: `Real mastery of "${cleanTopic}" combines sound algorithmic principles, clean design patterns, defensive programming, and rigorous testing.`
    }
  ];

  return archetypes.map((item, idx) => ({
    id: idx + 1,
    question: item.question,
    options: item.options,
    answer: item.answer,
    explanation: item.explanation
  }));
}

// ── Master Helper: Returns Guaranteed 20 Questions for ANY Topic ──
export function get20QuestionsForTopic(targetTopic, transcription = '') {
  const normalized = (targetTopic || '').trim().toLowerCase();

  // 1. Check if matches pre-defined banks
  if (normalized.includes('react') || normalized.includes('hook') || normalized.includes('frontend') || normalized.includes('jsx') || normalized.includes('redux')) {
    return { topic: 'React & Modern Frontend', questions: TOPIC_QUESTION_BANKS.react.questions };
  }
  if (normalized.includes('webrtc') || normalized.includes('sync') || normalized.includes('stream') || normalized.includes('video') || normalized.includes('audio') || normalized.includes('signaling') || normalized.includes('ice') || normalized.includes('stun') || normalized.includes('turn')) {
    return { topic: 'WebRTC & Real-Time Sync', questions: TOPIC_QUESTION_BANKS.webrtc.questions };
  }
  if (normalized.includes('os') || normalized.includes('operating system') || normalized.includes('process') || normalized.includes('thread') || normalized.includes('deadlock') || normalized.includes('paging') || normalized.includes('concurrency')) {
    return { topic: 'Operating Systems & Concurrency', questions: TOPIC_QUESTION_BANKS.os.questions };
  }
  if (normalized.includes('db') || normalized.includes('database') || normalized.includes('sql') || normalized.includes('mongo') || normalized.includes('nosql') || normalized.includes('acid') || normalized.includes('postgres') || normalized.includes('mysql')) {
    return { topic: 'Database Systems & SQL', questions: TOPIC_QUESTION_BANKS.db.questions };
  }
  if (normalized.includes('network') || normalized.includes('tcp') || normalized.includes('udp') || normalized.includes('osi') || normalized.includes('ip') || normalized.includes('dns') || normalized.includes('http') || normalized.includes('tls') || normalized.includes('packet')) {
    return { topic: 'Computer Networks & Protocols', questions: TOPIC_QUESTION_BANKS.networks.questions };
  }
  if (normalized.includes('python') || normalized.includes('oop') || normalized.includes('class') || normalized.includes('decorator') || normalized.includes('object oriented') || normalized.includes('django') || normalized.includes('flask')) {
    return { topic: 'Python & Object-Oriented Programming', questions: TOPIC_QUESTION_BANKS.python.questions };
  }
  if (normalized.includes('ai') || normalized.includes('machine learning') || normalized.includes('neural') || normalized.includes('deep learning') || normalized.includes('transformer') || normalized.includes('model') || normalized.includes('artificial intelligence') || normalized.includes('nlp') || normalized.includes('llm')) {
    return { topic: 'Artificial Intelligence & Machine Learning', questions: TOPIC_QUESTION_BANKS.ai.questions };
  }
  if (normalized.includes('dsa') || normalized.includes('data structure') || normalized.includes('algorithm') || normalized.includes('tree') || normalized.includes('sort') || normalized.includes('graph') || normalized.includes('heap') || normalized.includes('stack') || normalized.includes('queue') || normalized.includes('linked list') || normalized.includes('dynamic programming')) {
    return { topic: 'Data Structures & Algorithms', questions: TOPIC_QUESTION_BANKS.dsa.questions };
  }

  // 2. Custom Topic Generation: Guaranteed 20 Questions
  const formattedTopic = targetTopic?.trim() || 'Classroom Lecture';
  return {
    topic: formattedTopic,
    questions: generateCustomTopicQuestions(formattedTopic, transcription)
  };
}
