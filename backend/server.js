const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB        = require("./config/db");
const userRoutes       = require("./routes/userRoutes");
const courseRoutes     = require("./routes/courseRoutes");
const assessmentRoutes = require("./routes/assessmentRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");
const { aiLimiter, globalLimiter } = require("./middleware/rateLimiter");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

// Global limiter — sab routes
app.use(globalLimiter);

app.use("/api/users", userRoutes);

// ✅ FIX: AI limiter sirf POST routes par
// GET (fetch data) par limit nahi
app.use("/api/courses",     courseRoutes);
app.use("/api/assessments", assessmentRoutes);
app.use("/api/assignments", assignmentRoutes);

app.get("/", (req, res) => {
  res.json({ success: true, message: "SmartSyllabus AI Backend Running" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));