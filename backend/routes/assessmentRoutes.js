const express = require("express");
const { createAssessment, getAssessmentsByCourse } = require("../controllers/assessmentController");

const router = express.Router();

router.post("/", createAssessment);
router.get("/course/:courseId", getAssessmentsByCourse);

module.exports = router;