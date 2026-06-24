const express = require("express");
const {
  createAssignment,
  getAssignmentsByCourse,
  updateAssignment,
  deleteAssignment,
} = require("../controllers/assignmentController");
const { aiLimiter } = require("../middleware/rateLimiter");
const verifyToken = require("../middleware/auth");  // ← NEW

const router = express.Router();

router.post("/",                verifyToken, aiLimiter, createAssignment);
router.get("/course/:courseId", verifyToken, getAssignmentsByCourse);
router.patch("/:id",            verifyToken, updateAssignment);
router.delete("/:id",           verifyToken, deleteAssignment);

module.exports = router;