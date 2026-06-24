const express = require("express");
const {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
} = require("../controllers/courseController");
const { aiLimiter } = require("../middleware/rateLimiter");
const verifyToken = require("../middleware/auth");  // ← NEW

const router = express.Router();

router.get("/",      verifyToken, getCourses);              // ← verifyToken ADD
router.get("/:id",   verifyToken, getCourseById);           // ← verifyToken ADD
router.post("/",     verifyToken, aiLimiter, createCourse); // ← verifyToken ADD
router.patch("/:id", verifyToken, updateCourse);            // ← verifyToken ADD

module.exports = router;