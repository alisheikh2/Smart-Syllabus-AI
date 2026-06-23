const express = require("express");
const {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
} = require("../controllers/courseController");
const { aiLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

router.get("/",      getCourses);           // ✅ No limit — DB only
router.get("/:id",   getCourseById);        // ✅ No limit — DB only
router.post("/",     aiLimiter, createCourse);  // ✅ AI limit — Gemini call
router.patch("/:id", updateCourse);         // ✅ No limit — DB only

module.exports = router;