const Assessment = require("../models/Assessment");
const Course = require("../models/Course");
const { generateAssessment } = require("../services/geminiService");

const createAssessment = async (req, res) => {
  try {
    const {
      courseId,
      email,
      mcqCount,
      mcqMarks,
      mcqBloom,
      shortCount,
      shortMarks,
      shortBloom,
      longCount,
      longMarks,
      longBloom,
      easyPercent,
      mediumPercent,
      hardPercent,
      weeks,
    } = req.body;

    if (!courseId || !email) {
      return res.status(400).json({ success: false, message: "courseId and email are required" });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    const filteredSyllabus =
      weeks && weeks.length > 0
        ? course.syllabus.filter((w) => weeks.includes(w.week))
        : course.syllabus;

    const aiResult = await generateAssessment({
      courseTitle: course.title,
      syllabus: filteredSyllabus,
      mcqCount: mcqCount || 0,
      mcqBloom: mcqBloom || "Knowledge",
      shortCount: shortCount || 0,
      shortBloom: shortBloom || "Understanding",
      longCount: longCount || 0,
      longBloom: longBloom || "Application",
      easyPercent: easyPercent ?? 30,
      mediumPercent: mediumPercent ?? 50,
      hardPercent: hardPercent ?? 20,
    });
    
    const totalMarks =
      (mcqCount || 0) * (mcqMarks || 0) +
      (shortCount || 0) * (shortMarks || 0) +
      (longCount || 0) * (longMarks || 0);

    const assessment = await Assessment.create({
      courseId,
      config: { mcqCount, mcqMarks, shortCount, shortMarks, longCount, longMarks },
      totalMarks,
      mcqs: aiResult.mcqs,
      shortQuestions: aiResult.shortQuestions,
      longQuestions: aiResult.longQuestions,
      createdBy: email,
      coveredWeeks: weeks || [],
      difficultyDistribution: { easyPercent, mediumPercent, hardPercent },
    });

    res.status(201).json({ success: true, assessment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAssessmentsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const assessments = await Assessment.find({ courseId }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, assessments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createAssessment, getAssessmentsByCourse };