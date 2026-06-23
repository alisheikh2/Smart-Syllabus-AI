const express = require("express");
const {
  createAssessment,
  getAssessmentsByCourse,
  updateAssessment,
} = require("../controllers/assessmentController");
const { aiLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

router.post("/",                aiLimiter, createAssessment);  // ✅ AI limit
router.get("/course/:courseId", getAssessmentsByCourse);       // ✅ No limit
router.patch("/:id",            updateAssessment);             // ✅ No limit

module.exports = router;