# 📦 SyncLearn — Dependencies & Installation Documentation
## (Complete Guide to All Packages, Libraries, Tools & Extensions)

This document provides a comprehensive breakdown of all software, tools, backend dependencies, frontend dependencies, and recommended developer extensions used in the **SyncLearn Web Application**.

---

## ⚡ 1. Quick Start Installation Commands

Agar aap naye system par project setup kar rahe hain, toh sirf yeh commands chalani hain:

### A. Backend Setup
```bash
cd signaling-server
npm install
```

### B. Frontend Setup
```bash
cd web-client
npm install
```

---

## 🖥️ 2. System Level Prerequisites & Tools

| Tool / Software | Version | Purpose in SyncLearn | Installation Command / Link |
| :--- | :--- | :--- | :--- |
| **Node.js** | `>= 20.x` (Tested on `v22.20.0`) | JavaScript runtime environment jo backend chalata hai aur frontend build karta hai. | [nodejs.org](https://nodejs.org/) |
| **npm** | `>= 10.x` | Node package manager jo tamaam libraries download karta hai. | Comes bundled with Node.js |
| **MongoDB Community** | `>= 7.0` | Local database engine (`mongodb://127.0.0.1:27017/synclearn_app`) jo users, passwords, rooms aur sessions persist karta hai. | [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community) |
| **ngrok** | `v3.27.0` | Secure public HTTPS reverse tunnel jo mobile phones (4G/5G data aur outside Wi-Fi) ko connect karta hai aur camera/mic access deta hai. | `winget install ngrok/ngrok` |
| **Git** | Latest | Version control aur source code management. | [git-scm.com](https://git-scm.com/) |

---

## ⚙️ 3. Backend Dependencies (`signaling-server`)

Location: `signaling-server/package.json`  
Install Command: `npm install <package-name>`

| Package Name | Version | Role & Functionality in SyncLearn |
| :--- | :--- | :--- |
| **`express`** | `^5.2.1` | **Main Web Framework:** RESTful APIs handle karta hai (User registration, login, profile update, room creation, lecture listing, database status). |
| **`socket.io`** | `^4.8.3` | **Real-Time WebSocket Engine:** WebRTC signaling (offers, answers, ICE candidates), live chat, synchronized video playback, doubt pinning, whiteboard draw events, and real-time AI quiz broadcast. |
| **`mongoose`** | `^9.10.0` | **MongoDB ODM (Object Data Modeling):** Database schemas define karta hai (`User.js`, `Room.js`) aur CRUD operations ko strictly validate karta hai. |
| **`bcryptjs`** | `^3.0.3` | **Password Security:** User passwords ko irreversible cryptographic hashes me convert karta hai taake plaintext passwords leak na hon. |
| **`jsonwebtoken`** | `^9.0.3` | **Authentication Tokens (JWT):** User login hone par digital signature token issue karta hai jo API requests ko authenticate karta hai. |
| **`multer`** | `^2.4.0` | **File Upload Engine:** Class me instructor dwara upload kiye gaye lecture PDFs, PPTs, aur user profile avatars ko `uploads/` folder me save karta hai. |
| **`cors`** | `^2.8.6` | **Cross-Origin Resource Sharing:** Web client aur backend ke darmiyan secure HTTP requests allow karta hai. |
| **`dotenv`** | `^17.4.2` | **Environment Config:** `.env` file se sensitive secrets (`PORT`, `MONGO_URI`, `JWT_SECRET`) ko memory me load karta hai. |
| **`nodemon`** *(devDependencies)* | `^3.1.14` | **Developer Utility:** Backend file save karte hi server ko automatically restart karta hai taake bar bar terminal me restart na karna pare. |

---

## 🎨 4. Frontend Dependencies (`web-client`)

Location: `web-client/package.json`  
Install Command: `npm install <package-name>`

| Package Name | Version | Role & Functionality in SyncLearn |
| :--- | :--- | :--- |
| **`react`** | `^19.2.8` | **Core UI Library:** Component-based reactive interfaces (Dashboard, Live Class, Quiz Modal, Video Player, Whiteboard). |
| **`react-dom`** | `^19.2.8` | **DOM Renderer:** React virtual DOM ko browser ke HTML document me efficiently render karta hai. |
| **`react-router-dom`** | `^7.18.3` | **Client-Side Routing:** Single Page Application (SPA) navigation bina page refresh kiye (`/`, `/auth`, `/dashboard`, `/room/:roomId`, `/profile`, `/summary`, `/about`, `/features`, `/demo`). |
| **`socket.io-client`** | `^4.8.3` | **WebSocket Client:** Browser ko backend signaling server se connect rakhta hai taake real-time data foran transfer ho. |
| **`simple-peer`** | `^9.11.1` | **WebRTC Wrapper:** Peer-to-peer audio aur video calls create karta hai without complex native WebRTC boilerplate. |
| **`lucide-react`** | `^1.37.0` | **Modern Icon Set:** Application ke saare icons (Microphone, Camera, Screen Share, Chat, End Call, Quiz, Whiteboard Tools, Settings, Chevron arrows). |
| **`jspdf`** | `^4.2.1` | **Client-side PDF Generator:** Meeting khatam hone par authentic student attendance sheet aur summary report direct download karne ke liye. |
| **`buffer`** | `^6.0.3` | **Browser Polyfill:** WebRTC streaming (`simple-peer`) ke liye Node.js `Buffer` capability browser me provide karta hai. |
| **`events`** | `^3.3.0` | **Browser Polyfill:** WebRTC ke EventEmitters ko modern browser environment me smoothly chalata hai. |
| **`vite`** *(devDependencies)* | `^8.2.2` | **Build Tool & Dev Server:** Instant HMR (Hot Module Replacement), fast Rollup bundling, Reverse Proxying (`/api`, `/socket.io`), aur `allowedHosts` management. |
| **`@vitejs/plugin-react`** *(devDependencies)* | `^6.1.0` | **React Fast Refresh:** Vite ke andar React JSX aur state preservation support deta hai. |
| **`oxlint`** *(devDependencies)* | `^1.79.0` | **Next-gen Linter:** Code quality, syntax correctness, aur potential bugs ko detect karta hai. |

---

## 🏗️ 5. Architectural Flow (Dependencies Interaction)

```
[Mobile Device / Web Browser]
          │
          │ (React 19 + Lucide Icons + React-Router-Dom)
          ▼
    [web-client]
          │
          ├── Simple-Peer  ───► (WebRTC P2P Video/Audio Streaming)
          ├── jsPDF        ───► (Direct Attendance PDF Download)
          └── Socket.io-Client
                    │
                    ▼ (Vite Proxy: Port 5173 ──► Port 5000)
             [signaling-server]
                    │
                    ├── Express.js (REST API Endpoints)
                    ├── Socket.IO (Signaling, Chat, AI Quiz, Whiteboard)
                    ├── Multer (Lecture Material Uploads)
                    ├── Bcryptjs & JWT (Auth & Passwords)
                    └── Mongoose
                            │
                            ▼
                    [MongoDB Database]
                     (synclearn_app)
```

---

## 🧩 6. Recommended VS Code Extensions

Agar aap Visual Studio Code use kar rahe hain, toh yeh extensions download karna recommended hai:

1. **ES7+ React/Redux/React-Native snippets** (`dsznajder.es7-react-js-snippets`):
   - Fast React functional components aur hooks autocomplete karne ke liye (`rfce`, `rafce`).
2. **Prettier - Code Formatter** (`esbenp.prettier-vscode`):
   - Har dafa file save karne par code indentations aur spacing ko perfect format karta hai.
3. **MongoDB for VS Code** (`mongodb.mongodb-vscode`):
   - VS Code ke sidebar se direct `synclearn_app` database, `users` collection aur `rooms` collection dekhne ke liye.
4. **Thunder Client** (`rangav.vscode-thunder-client`):
   - Postman ki tarah bina VS Code chhoray `/api/v1/db-status` ya Auth APIs test karne ke liye.

---

## 🛠️ 7. Troubleshooting & FAQ

### Q1: Agar `npm install` me peer dependency conflict aaye?
```bash
npm install --legacy-peer-deps
```

### Q2: Agar `simple-peer` me `global` ya `Buffer` error aaye?
Yeh problem humne `web-client/vite.config.js` me solve kar di hai:
```javascript
define: {
  global: 'window',
  'process.env': {},
},
resolve: {
  alias: {
    events: 'events',
  },
}
```

### Q3: Agar Tunnel start karni ho?
`web-client` directory me command chalayein:
```bash
npm run tunnel:ngrok
```
