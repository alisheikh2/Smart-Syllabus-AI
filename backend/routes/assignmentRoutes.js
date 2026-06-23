const express = require("express");
const {
  createAssignment,
  getAssignmentsByCourse,
  updateAssignment,
  deleteAssignment,
} = require("../controllers/assignmentController");
const { aiLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

router.post("/",                aiLimiter, createAssignment);  // ✅ AI limit
router.get("/course/:courseId", getAssignmentsByCourse);       // ✅ No limit
router.patch("/:id",            updateAssignment);             // ✅ No limit
router.delete("/:id",          deleteAssignment);             // ✅ No limit

module.exports = router;