const express = require("express");
const {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
} = require("../controllers/courseController");
const { aiLimiter } = require("../middleware/rateLimiter");
const verifyToken = require("../middleware/auth");

const router = express.Router();

router.get("/",      verifyToken, getCourses);
router.get("/:id",   verifyToken, getCourseById);
router.post("/",     verifyToken, aiLimiter, createCourse);
router.patch("/:id", verifyToken, updateCourse);

module.exports = router;