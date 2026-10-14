# 📱 SyncLearn Mobile & Remote Access Documentation
## (Mobile par kisi bhi Network / Wi-Fi / 4G Data par chalane ki Mukammal Tafseelat)

---

## 📌 1. Background & Masla Kya Tha?

Jab aap apne computer par project run karte hain, toh wo `http://localhost:5173` aur `http://localhost:5000` par chalta hai:
* **Masla 1 (Localhost ki Pabandi):** `localhost` sirf usi computer ke andar chalta hai. Mobile phone ya internet par mojood kisi doosre device ko nahi pata ke aapka "localhost" kahan hai.
* **Masla 2 (Mobile Camera / Mic Permission):** Modern mobile browsers (Google Chrome, Apple Safari) security ki wajah se **Camera aur Microphone ki permission sirf HTTPS (Secure SSL)** par dete hain. Simple `http://` par mobile camera block kar deta hai.
* **Masla 3 (Multi-Port & Firewalls):** Agar mobile se connect karna ho toh frontend (5173) aur backend (5000) dono ko router firewall se guzarna parta hai, jo normal Wi-Fi ya Mobile Data par block ho jata hai.

In tamaam masail ko hal karne ke liye **Secure Reverse Tunneling** (ngrok) ka istemal kiya gaya.

---

## ⚙️ 2. Yeh Install Kese Hota Hai? (Installation Process)

Is setup ke liye **`ngrok`** tool use hota hai. 

### Step 1: ngrok Tool ko Install Karna
ngrok ko install karne ke 3 asaan tareeqay hotay hain:

* **Tareeqa A (Windows Package Manager - Recommended):**
  PowerShell / Command Prompt me yeh command chalaein:
  ```powershell
  winget install ngrok/ngrok
  ```
  *(Aapke computer me ngrok version 3.27.0 pehle se installed tha).*

* **Tareeqa B (Node.js npm se):**
  ```bash
  npm install -g ngrok
  ```

* **Tareeqa C (Official Website se):**
  1. [ngrok.com/download](https://ngrok.com/download) par ja kar Windows ke liye `.zip` download karein.
  2. Use extract karke `ngrok.exe` run karein.

---

### Step 2: ngrok ka Free Account & AuthToken Setup
ngrok use karne ke liye ek free authtoken chahiye hota hai:
1. [https://dashboard.ngrok.com/signup](https://dashboard.ngrok.com/signup) par free account banaya jata hai.
2. Dashboard me **"Your Authtoken"** copy kiya jata hai.
3. Terminal me yeh command chala kar token save kar diya jata hai:
   ```bash
   ngrok config add-authtoken <AAPKA_AUTHTOKEN>
   ```
   *Yeh token aapke PC me is path par save ho jata hai:*  
   `C:\Users\PMLS\AppData\Local\ngrok\ngrok.yml` *(Aapke system me yeh token pehle se active aur saved tha).*

---

## 🔗 3. Yeh Link Kese Aaya? (How the Link was Generated)

Humne terminal me yeh single command run ki:
```bash
ngrok http 5173
```

### 🧠 Yeh Kaam Kese Karta Hai? (Under the Hood Architecture)

```
[Student Mobile (4G / Any Wi-Fi)]
              │
              ▼ (Encrypted HTTPS Request)
 [ngrok Global Cloud Server]
   (e.g., https://0fbb-103-26-83-91.ngrok-free.app)
              │
              ▼ (Secure Tunnel)
  [Aapka Laptop / PC (Port 5173 - Vite Frontend)]
              │
              ▼ (Vite Reverse Proxy)
  [Node.js Backend & Socket.IO (Port 5000)]
```

1. **Vite Server Start Hua:** Aapka web frontend port `5173` par listen kar raha hai.
2. **Tunnel Establish Hua:** `ngrok http 5173` command aapke PC se ngrok ke global cloud servers tak ek secure encrypted tunnel banati hai.
3. **Public HTTPS Link Generate Hua:** ngrok ke cloud server ne ek unique public web link provide kiya:
   👉 **`https://0fbb-103-26-83-91.ngrok-free.app`**
4. **Vite Proxy:** Humne `web-client/vite.config.js` me proxy aur `allowedHosts: true` add kiya:
   - Jab student mobile par link open karta hai, toh Vite web page load karta hai.
   - Jab student chat, video ya quiz join karta hai, toh `/socket.io` aur `/api` requests Vite automatically peeche port `5000` (Node.js server) par forward kar deta hai.
   - Student ke mobile ko port 5000 ka pata hone ki zaroorat hi nahi parti!

---

## 🚀 4. Aagey (Future me) Khud Run Karne ka Tareeqa

Jab bhi aap apna project dobara start karein:

### Terminal 1 (Backend Server):
```bash
cd c:\Users\PMLS\Desktop\SyncLearn-Web
node server.js
```

### Terminal 2 (Frontend Client):
```bash
cd c:\Users\PMLS\Desktop\SyncLearn-Web\web-client
npm run dev
```

### Terminal 3 (Public Tunnel):
```bash
cd c:\Users\PMLS\Desktop\SyncLearn-Web\web-client
npm run tunnel:ngrok
```
*(Ya seedha command likhein: `ngrok http 5173`)*

Terminal 3 me screen par **Forwarding** ke samne aane wala link (e.g. `https://xxxx-xx-xx-xx.ngrok-free.app`) copy karein aur students ko bhej dein!

---

## 💡 5. Mufeed Nakaat (Important Tips)

1. **Pehli Dafa Warning Page:** ngrok free tier pehli dafa browser me ek security page dikhata hai. Mobile par bas neelay button **"Visit Site"** par tap karna hota hai, uske baad website direct open ho jati hai.
2. **Camera & Microphone:** HTTPS link ki wajah se mobile browser student se Camera aur Microphone ki permission mangega. **"Allow"** karne par live video streaming shuru ho jayegi.
3. **Different Wi-Fi / Data:** Student dunya me kahin bhi kisi bhi network ya mobile SIM data par ho, yeh link khul jayega.
