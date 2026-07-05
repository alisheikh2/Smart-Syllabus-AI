// Pre-generated sample content shown when Gemini's free-tier quota is exhausted
module.exports = {
  course: {
    syllabus: [
      { week: "Week 1", topics: ["Introduction & Core Concepts", "Foundational Terminology"] },
      { week: "Week 2", topics: ["Key Principles", "Practical Applications"] },
      { week: "Week 3", topics: ["Advanced Concepts", "Case Studies"] },
    ],
    studyMaterial: {
      summary: "This is a sample study material shown while live AI generation is temporarily unavailable due to free-tier API limits.",
      keyConcepts: ["Core Concept A", "Core Concept B", "Core Concept C"],
      definitions: ["Term 1: definition example", "Term 2: definition example"],
      realWorldExamples: ["Example application 1", "Example application 2"],
      interviewQuestions: ["Sample interview question 1?", "Sample interview question 2?"],
      furtherReading: ["Suggested resource 1", "Suggested resource 2"],
    },
  },
  assessment: {
    mcqs: [
      { question: "Sample MCQ question?", options: ["Option A", "Option B", "Option C", "Option D"], correctAnswer: "Option A" },
    ],
    shortQuestions: [
      { question: "Sample short question?", modelAnswer: "Sample model answer." },
    ],
    longQuestions: [
      { question: "Sample essay question?", modelAnswer: "Sample detailed model answer.", difficulty: "Medium", bloomLevel: "Application" },
    ],
  },
  assignment: {
    questions: [
      {
        type: "mcq",
        question: "Sample MCQ question?",
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctAnswer: "Option A",
        marks: 1,
        difficulty: "Easy",
        bloomLevel: "Knowledge",
      },
      {
        type: "short",
        question: "Sample short answer question?",
        modelAnswer: "Sample model answer explaining the concept briefly.",
        marks: 5,
        difficulty: "Medium",
        bloomLevel: "Understanding",
      },
      {
        type: "long",
        question: "Sample essay/long question?",
        modelAnswer: "Sample detailed model answer covering the topic in depth.",
        marks: 10,
        difficulty: "Hard",
        bloomLevel: "Application",
      },
    ],
  },
};