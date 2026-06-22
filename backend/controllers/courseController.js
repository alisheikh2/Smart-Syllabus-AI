const Course = require("../models/Course");
const { generateCourse } = require("../services/geminiService");

const getCourses = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const courses = await Course.find({ createdBy: email }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    res.status(200).json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createCourse = async (req, res) => {
  try {
    const { topic, audience, duration, difficulty, email } = req.body;

    if (!topic || !audience || !duration || !difficulty || !email) {
      return res.status(400).json({
        success: false,
        message: "Topic, audience, duration, difficulty and email are all required",
      });
    }

    const aiResult = await generateCourse({ topic, audience, duration, difficulty });

    const course = await Course.create({
      title: topic,
      duration,
      difficulty,
      syllabus: aiResult.syllabus,
      studyMaterial: aiResult.studyMaterial,
      createdBy: email,
    });

    res.status(201).json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getCourses, getCourseById, createCourse };