const Course = require("../models/Course");
const { generateCourse, AIServiceUnavailableError } = require("../services/geminiService");
const { getCacheKey, getFromCache, setCache } = require("../middleware/cache");

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

    // ✅ Cache check — same params pe Gemini call skip karo
    const cacheKey = getCacheKey("course", { topic, audience, duration, difficulty });
    let aiResult   = getFromCache(cacheKey);

    if (aiResult) {
      console.log("✅ Cache hit:", cacheKey);
    } else {
      console.log("🔄 Cache miss — calling Gemini");
      aiResult = await generateCourse({ topic, audience, duration, difficulty });
      setCache(cacheKey, aiResult);
    }

    const course = await Course.create({
      title:         topic,
      duration,
      difficulty,
      syllabus:      aiResult.syllabus,
      studyMaterial: aiResult.studyMaterial,
      createdBy:     email,
    });

    res.status(201).json({ success: true, course });
  } catch (error) {
    if (error instanceof AIServiceUnavailableError) {
      const statusCode = error.reason === "quota" ? 429 : 503;
      return res.status(statusCode).json({ success: false, message: error.message });
    }
    console.error("createCourse error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { syllabus, studyMaterial } = req.body;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    if (syllabus      !== undefined) course.syllabus      = syllabus;
    if (studyMaterial !== undefined) course.studyMaterial = studyMaterial;

    course.markModified("syllabus");
    course.markModified("studyMaterial");
    await course.save();

    res.status(200).json({ success: true, course });
  } catch (error) {
    console.error("updateCourse error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getCourses, getCourseById, createCourse, updateCourse };