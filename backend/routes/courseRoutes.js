const express = require("express");
const { getCourses, getCourseById, createCourse } = require("../controllers/courseController");

const router = express.Router();

router.get("/", getCourses);
router.get("/:id", getCourseById);
router.post("/", createCourse);

module.exports = router;