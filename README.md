# 🚀 SmartSyllabusAI

SmartSyllabusAI is an AI-powered educational platform designed to help students generate structured course content, intelligent assessments, and render mathematical formulas efficiently.

## 🔗 Live Demo

[smart-syllabus-ai.vercel.app](https://smart-syllabus-ai.vercel.app)

## Demo

[Click here to watch the SmartSyllabusAI Demo Video](https://drive.google.com/file/d/1zHbMZPs6SzqVteGdJGf6D9mVreee47pK/view?usp=sharing)

## ✨ Features

### 🧠 AI-Powered Course Generation
Generate structured syllabi and learning material using AI.

### 📝 Smart Assessment System
Auto-generate quizzes, MCQs, and tests from course content.

### 📐 Math & Formula Rendering
KaTeX integration for clean mathematical equation rendering.

### 🛡️ Resilient AI Integration
Automatic retry with exponential backoff, multi-model fallback chain, and graceful degradation to sample content when API limits are hit — ensuring uptime even under free-tier constraints.

### ⚡ Performance Optimized
Uses LocalStorage caching for faster performance and reduced API calls.

---

## 🛠 Tech Stack

**Frontend:** React.js, Vite, Axios, KaTeX, Firebase Auth
**Backend:** Node.js, Express.js, MongoDB (Mongoose)
**AI:** Google Gemini API (with automatic model-fallback + retry-queue for rate-limit resilience)
**Auth:** Firebase Authentication + Firebase Admin SDK

---

## ⚙️ Setup Instructions

### 1. Clone Repository
git clone https://github.com/alisheikh2/Smart-Syllabus-AI.git
cd Smart-Syllabus-AI

### 2. Backend Setup
cd backend
npm install

# create .env with MONGO_URI, FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, GEMINI_API_KEY
npm run dev

### 3. Frontend Setup
cd ../frontend
npm install
npm run dev

App runs at: http://localhost:5173 (frontend) — connects to backend on http://localhost:5000

### 💡 Key Highlights
KaTeX-powered math rendering

Optimized caching system

Clean React architecture

### 🤝 Support

For bugs or feature requests, open an issue on GitHub.

### 👨‍💻 Developer

Ali
