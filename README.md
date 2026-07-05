# 🚀 SmartSyllabusAI

SmartSyllabusAI is a full-stack, AI-powered educational platform that helps teachers and students generate structured course syllabi, study material, assessments, and assignments — complete with clean math/formula rendering.

Built with the MERN stack, Firebase Authentication, and Google's Gemini API, with production-grade resilience (retry logic, model fallback, and graceful degradation) baked into the AI integration layer.

---

## 🔗 Live Demo

**[smart-syllabus-ai.vercel.app](https://smart-syllabus-ai.vercel.app)**

🎥 [Watch the video walkthrough](https://drive.google.com/file/d/1zHbMZPs6SzqVteGdJGf6D9mVreee47pK/view?usp=sharing)

> ⚠️ This project uses Gemini's **free-tier API**, which has a limited rate/quota. If live generation is slow, the app automatically falls back to sample content rather than showing an error — see [Resilient AI Integration](#️-resilient-ai-integration) below.

---

## ✨ Features

### 🧠 AI-Powered Course Generation
Generate a complete, structured syllabus and study material (summaries, key concepts, definitions, real-world examples, interview questions, further reading) for any topic, audience, and difficulty level.

### 📝 Smart Assessment & Assignment System
Auto-generate MCQs, short-answer, and long/essay questions from a course's syllabus, with configurable difficulty distribution and Bloom's Taxonomy levels.

### 📐 Math & Formula Rendering
KaTeX-based rendering for clean, readable mathematical notation across generated content.

### 🛡️ Resilient AI Integration
- **Multi-model fallback chain** — automatically retries across multiple Gemini models if one is overloaded or rate-limited
- **Exponential backoff + request queue** — throttles calls to stay within free-tier rate limits
- **Graceful degradation** — if the AI is completely unavailable, the app serves pre-generated sample content (clearly flagged with `isFallback`) instead of failing, so the user experience is never broken

### ⚡ Performance Optimized
Server-side response caching for repeated generation requests, reducing redundant AI calls and speeding up response times.

### 🔐 Secure Authentication
Firebase Authentication on the client, verified server-side via Firebase Admin SDK on every protected request.

### 📄 Export to PDF
Generated syllabi, assessments, and assignments can be exported as PDFs for offline use.

---

## 🛠 Tech Stack

| Layer              | Technology                                                          |
|--------------------|----------------------------------------------------------------------|
| **Frontend**       | React 19, Vite, React Router, Tailwind CSS, Axios                    |
| **Backend**        | Node.js, Express 5, MongoDB (Mongoose)                                |
| **AI**             | Google Gemini API (`@google/genai`) with custom retry/fallback layer |
| **Auth**           | Firebase Authentication (client) + Firebase Admin SDK (server)       |
| **Math Rendering** | KaTeX, react-katex                                                    |
| **PDF Export**     | jsPDF                                                                  |
| **Security**       | express-rate-limit, CORS, environment-based secrets                   |

---

## 📂 Project Structure

```
Smart-Syllabus-AI/
├── backend/
│   ├── config/          # DB connection
│   ├── controllers/     # Route handlers (course, assessment, assignment, user)
│   ├── data/            # Fallback sample content for AI outages
│   ├── middleware/      # Auth, rate limiting, caching
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routes
│   ├── services/        # Gemini AI integration (retry, fallback, prompts)
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/  # Reusable UI + editable content blocks
    │   ├── config/      # Firebase client config
    │   ├── context/     # Auth context/provider
    │   ├── hooks/       # Custom hooks
    │   ├── pages/       # Home, CourseDetail, Analytics
    │   ├── services/    # API service layer
    │   └── utils/       # PDF generation, helpers
    └── vite.config.js
```

---

## ⚙️ Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/alisheikh2/Smart-Syllabus-AI.git
cd Smart-Syllabus-AI
```

### 2. Backend setup
```bash
cd backend
npm install
```

Create a `.env` file in `backend/` with:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_service_account_email
FIREBASE_PRIVATE_KEY="your_firebase_private_key"
```
> Get the Firebase values from **Firebase Console → Project Settings → Service Accounts → Generate new private key**.

Run the backend:
```bash
npm run dev
```

### 3. Frontend setup
```bash
cd ../frontend
npm install
```

Create a `.env` file in `frontend/` with:
```
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```
> Get these from **Firebase Console → Project Settings → General → Your apps → SDK setup and configuration**.

Run the frontend:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`, connecting to the backend at `http://localhost:5000`.

---

## 🧩 Key Engineering Highlights

- **Resilience-first AI layer** — retry-with-backoff, multi-model fallback, request throttling, and sample-content degradation, so the app stays usable even on a free-tier API quota
- **Clean separation of concerns** — routes → controllers → services → models, matching production backend conventions
- **Server-verified auth** — every protected route validates the Firebase ID token server-side rather than trusting the client
- **Ownership-based authorization** — users can only view/edit their own courses, assessments, and assignments

---

## 🤝 Support

For bugs or feature requests, please open an issue on GitHub.

## 👨‍💻 Developer

**Ali** — [GitHub](https://github.com/alisheikh2)
