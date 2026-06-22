const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const courseRoutes = require("./routes/courseRoutes");
const assessmentRoutes = require("./routes/assessmentRoutes");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/assessments", assessmentRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "SmartSyllabus AI Backend Running",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});