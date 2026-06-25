const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
require("dotenv").config();

const connectDB        = require("./config/db");
const userRoutes       = require("./routes/userRoutes");
const courseRoutes     = require("./routes/courseRoutes");
const assessmentRoutes = require("./routes/assessmentRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");
const { aiLimiter, globalLimiter } = require("./middleware/rateLimiter");

const app = express();

//Firebase Admin Initialize
admin.initializeApp({
  credential: admin.cert({
    projectId:   process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
});

connectDB();

app.use(cors({
  origin: "https://smart-syllabus-ai.vercel.app",
  methods: ["GET", "POST", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],  // ← Authorization ADD
}));
app.use(express.json());
app.set("trust proxy", 1);

// Global limiter
app.use(globalLimiter);

app.use("/api/users",       userRoutes);
app.use("/api/courses",     courseRoutes);
app.use("/api/assessments", assessmentRoutes);
app.use("/api/assignments", assignmentRoutes);

app.get("/", (req, res) => {
  res.json({ success: true, message: "SmartSyllabus AI Backend Running" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));