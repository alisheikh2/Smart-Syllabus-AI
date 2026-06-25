const Assessment = require("../models/Assessment");
const Course = require("../models/Course");
const { generateAssessment, AIServiceUnavailableError } = require("../services/geminiService");
const { getCacheKey, getFromCache, setCache } = require("../middleware/cache");

const createAssessment = async (req, res) => {
  try {
    const email = req.user.email;
    const {
      courseId, mcqCount, mcqMarks, mcqBloom,
      shortCount, shortMarks, shortBloom,
      longCount, longMarks, longBloom,
      easyPercent, mediumPercent, hardPercent, weeks,
    } = req.body;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "courseId is required",
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // Restrict assessment creation to the course owner
    if (course.createdBy !== email) {
      return res.status(403).json({ success: false, message: "Not authorized for this course" });
    }

    const filteredSyllabus =
      weeks?.length > 0
        ? course.syllabus.filter((w) => weeks.includes(w.week))
        : course.syllabus;

    const cacheKey = getCacheKey("assessment", {
      courseId,
      mcqCount,   mcqBloom,
      shortCount, shortBloom,
      longCount,  longBloom,
      easyPercent, mediumPercent, hardPercent,
      weeks: (weeks || []).sort().join(","),
    });

    let aiResult = getFromCache(cacheKey);

    if (aiResult) {
      console.log("Assessment cache hit:", cacheKey);
    } else {
      console.log("Assessment cache miss, generating via Gemini:", cacheKey);
      aiResult = await generateAssessment({
        courseTitle:   course.title,
        syllabus:      filteredSyllabus,
        mcqCount:      mcqCount   || 0,
        mcqBloom:      mcqBloom   || "Knowledge",
        shortCount:    shortCount || 0,
        shortBloom:    shortBloom || "Understanding",
        longCount:     longCount  || 0,
        longBloom:     longBloom  || "Application",
        easyPercent:   easyPercent   ?? 30,
        mediumPercent: mediumPercent ?? 50,
        hardPercent:   hardPercent   ?? 20,
      });
      setCache(cacheKey, aiResult);
    }

    const totalMarks =
      (mcqCount   || 0) * (mcqMarks   || 0) +
      (shortCount || 0) * (shortMarks || 0) +
      (longCount  || 0) * (longMarks  || 0);

    const assessment = await Assessment.create({
      courseId,
      config: { mcqCount, mcqMarks, shortCount, shortMarks, longCount, longMarks },
      totalMarks,
      mcqs:           aiResult.mcqs,
      shortQuestions: aiResult.shortQuestions,
      longQuestions:  aiResult.longQuestions,
      createdBy:      email,
      coveredWeeks:   weeks || [],
      difficultyDistribution: { easyPercent, mediumPercent, hardPercent },
    });

    res.status(201).json({ success: true, assessment });
  } catch (error) {
    if (error instanceof AIServiceUnavailableError) {
      const statusCode = error.reason === "quota" ? 429 : 503;
      return res.status(statusCode).json({ success: false, message: error.message });
    }
    console.error("createAssessment error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAssessmentsByCourse = async (req, res) => {
  try {
    const email = req.user.email;
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // Only the course owner can view its assessments
    if (course.createdBy !== email) {
      return res.status(403).json({ success: false, message: "Not authorized for this course" });
    }

    const assessments = await Assessment.find({ courseId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, assessments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateAssessment = async (req, res) => {
  try {
    const email = req.user.email;
    const { id } = req.params;
    const { mcqs, shortQuestions, longQuestions } = req.body;

    const assessment = await Assessment.findById(id);
    if (!assessment) {
      return res.status(404).json({ success: false, message: "Assessment not found" });
    }

    // Resolve ownership through the parent course before allowing edits
    const course = await Course.findById(assessment.courseId);
    if (!course || course.createdBy !== email) {
      return res.status(403).json({ success: false, message: "Not authorized for this assessment" });
    }

    if (mcqs           !== undefined) assessment.mcqs           = mcqs;
    if (shortQuestions !== undefined) assessment.shortQuestions = shortQuestions;
    if (longQuestions  !== undefined) assessment.longQuestions  = longQuestions;

    await assessment.save();
    res.status(200).json({ success: true, assessment });
  } catch (error) {
    console.error("updateAssessment error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createAssessment, getAssessmentsByCourse, updateAssessment };