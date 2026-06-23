const Assignment = require("../models/Assignment");
const Course = require("../models/Course");
const { generateAssignment, AIServiceUnavailableError } = require("../services/geminiService");
const { getCacheKey, getFromCache, setCache } = require("../middleware/cache");

const createAssignment = async (req, res) => {
  try {
    const {
      courseId, email, title, questionCount, questionType,
      totalMarks, dueDate, weeks, bloomLevel,
      easyPercent, mediumPercent, hardPercent,
    } = req.body;

    if (!courseId || !email || !title) {
      return res.status(400).json({
        success: false,
        message: "courseId, email and title are required",
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    const filteredSyllabus =
      weeks?.length > 0
        ? course.syllabus.filter((w) => weeks.includes(w.week))
        : course.syllabus;

    // ✅ Cache check
    const cacheKey = getCacheKey("assignment", {
      courseId,
      questionCount,
      questionType,
      bloomLevel,
      easyPercent, mediumPercent, hardPercent,
      weeks: (weeks || []).sort().join(","),
    });

    let aiResult = getFromCache(cacheKey);

    if (aiResult) {
      console.log("✅ Assignment cache hit");
    } else {
      console.log("🔄 Assignment cache miss — calling Gemini");
      aiResult = await generateAssignment({
        courseTitle:   course.title,
        syllabus:      filteredSyllabus,
        questionCount: questionCount || 5,
        questionType:  questionType  || "mixed",
        bloomLevel:    bloomLevel    || "Understanding",
        easyPercent:   easyPercent   ?? 30,
        mediumPercent: mediumPercent ?? 50,
        hardPercent:   hardPercent   ?? 20,
      });
      setCache(cacheKey, aiResult);
    }

    const assignment = await Assignment.create({
      courseId,
      title,
      totalMarks:    totalMarks || 0,
      dueDate:       dueDate    || null,
      questions:     aiResult.questions,
      createdBy:     email,
      coveredWeeks:  weeks || [],
      difficultyDistribution: { easyPercent, mediumPercent, hardPercent },
    });

    res.status(201).json({ success: true, assignment });
  } catch (error) {
    if (error instanceof AIServiceUnavailableError) {
      const statusCode = error.reason === "quota" ? 429 : 503;
      return res.status(statusCode).json({ success: false, message: error.message });
    }
    console.error("createAssignment error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAssignmentsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const assignments = await Assignment.find({ courseId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, assignments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { questions } = req.body;

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: "Assignment not found" });
    }

    if (questions !== undefined) assignment.questions = questions;
    await assignment.save();

    res.status(200).json({ success: true, assignment });
  } catch (error) {
    console.error("updateAssignment error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    await Assignment.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Assignment deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createAssignment,
  getAssignmentsByCourse,
  updateAssignment,
  deleteAssignment,
};