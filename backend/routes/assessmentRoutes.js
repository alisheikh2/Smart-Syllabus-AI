const express = require("express");
const {
  createAssessment,
  getAssessmentsByCourse,
  updateAssessment,
} = require("../controllers/assessmentController");
const { aiLimiter } = require("../middleware/rateLimiter");
const verifyToken = require("../middleware/auth");  // ← NEW

const router = express.Router();

router.post("/",                verifyToken, aiLimiter, createAssessment);
router.get("/course/:courseId", verifyToken, getAssessmentsByCourse);
router.patch("/:id",            verifyToken, updateAssessment);

module.exports = router;