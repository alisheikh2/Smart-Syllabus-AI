const { GoogleGenAI, Type } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * 🔁 Retry wrapper for Gemini (handles 503 / overload)
 */
async function callGeminiWithRetry(fn, retries = 5) {
  let delay = 1000;

  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      const is503 =
        err?.status === 503 ||
        err?.message?.includes("UNAVAILABLE") ||
        err?.message?.includes("high demand");

      if (!is503 || i === retries - 1) throw err;

      console.warn(`⚠ Gemini busy. Retry ${i + 1}/${retries} in ${delay}ms`);
      await new Promise(r => setTimeout(r, delay));
      delay *= 2;
    }
  }
}

/**
 * 🧹 HARD CLEAN: removes ALL math / LaTeX garbage
 */
function stripMathArtifacts(text = "") {
  return text
    .replace(/\$/g, "")
    .replace(/\\begin\{[^}]*\}/g, "")
    .replace(/\\end\{[^}]*\}/g, "")
    .replace(/\\cdot/g, " dot ")
    .replace(/\\times/g, " x ")
    .replace(/\\frac/g, " fraction ")
    .replace(/\\lambda/g, "lambda")
    .replace(/\\neq/g, "!=")
    .replace(/\\leq/g, "<=")
    .replace(/\\geq/g, ">=")
    .replace(/\\mathbf/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * 🧠 SAFE JSON PARSER
 */
function safeJsonParse(rawText) {
  let cleaned = rawText.replace(/```json/g, "").replace(/```/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    try {
      return JSON.parse(
        cleaned
          .replace(/\n/g, "\\n")
          .replace(/\r/g, "\\r")
          .replace(/\t/g, "\\t")
      );
    } catch (e) {
      console.error("❌ RAW RESPONSE:", rawText);
      throw new Error("AI returned invalid JSON");
    }
  }
}

/**
 * 📘 COURSE PROMPT
 */
function buildPrompt({ topic, audience, duration, difficulty }) {
  return `
You are an expert curriculum designer.

Topic: ${topic}
Audience: ${audience}
Duration: ${duration}
Difficulty: ${difficulty}

RULES:
- No LaTeX, no $, no math symbols
- Use only plain text
- matrices: [[1,2],[3,4]]
- vectors: (1,2,3)
- dot product: u dot v

Return ONLY valid JSON:
{
  "syllabus": [
    { "week": "Week 1", "topics": ["topic1"] }
  ],
  "studyMaterial": {
    "summary": "text",
    "keyConcepts": [],
    "definitions": [],
    "realWorldExamples": [],
    "interviewQuestions": [],
    "furtherReading": []
  }
}
`;
}

/**
 * 📝 ASSESSMENT PROMPT
 */
function buildAssessmentPrompt(params) {
  return `
You are an expert exam setter.

Course: ${params.courseTitle}
Syllabus: ${JSON.stringify(params.syllabus)}

Rules:
- NO LaTeX
- NO math symbols
- Plain text only

Generate:
MCQs: ${params.mcqCount}
Short: ${params.shortCount}
Long: ${params.longCount}

Difficulty:
Easy ${params.easyPercent}%
Medium ${params.mediumPercent}%
Hard ${params.hardPercent}%

Return ONLY JSON.
`;
}

/**
 * 📘 GENERATE COURSE
 */
async function generateCourse({ topic, audience, duration, difficulty }) {
  const prompt = buildPrompt({ topic, audience, duration, difficulty });

  const response = await callGeminiWithRetry(() =>
    ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            syllabus: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  week: { type: Type.STRING },
                  topics: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ["week", "topics"],
              },
            },
            studyMaterial: {
              type: Type.OBJECT,
              properties: {
                summary: { type: Type.STRING },
                keyConcepts: { type: Type.ARRAY, items: { type: Type.STRING } },
                definitions: { type: Type.ARRAY, items: { type: Type.STRING } },
                realWorldExamples: { type: Type.ARRAY, items: { type: Type.STRING } },
                interviewQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
                furtherReading: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: [
                "summary",
                "keyConcepts",
                "definitions",
                "realWorldExamples",
                "interviewQuestions",
                "furtherReading",
              ],
            },
          },
          required: ["syllabus", "studyMaterial"],
        },
      },
    })
  );

  const parsed = safeJsonParse(response.text);

  if (Array.isArray(parsed.studyMaterial)) {
    parsed.studyMaterial = parsed.studyMaterial[0] || {};
  }

  if (parsed.studyMaterial?.summary) {
    parsed.studyMaterial.summary = stripMathArtifacts(parsed.studyMaterial.summary);
  }

  return parsed;
}

/**
 * 🧪 GENERATE ASSESSMENT
 */
async function generateAssessment(params) {
  const prompt = buildAssessmentPrompt(params);

  const response = await callGeminiWithRetry(() =>
    ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mcqs: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctAnswer: { type: Type.STRING },
                  difficulty: { type: Type.STRING },
                  bloomLevel: { type: Type.STRING },
                },
                required: [
                  "question",
                  "options",
                  "correctAnswer",
                  "difficulty",
                  "bloomLevel",
                ],
              },
            },
            shortQuestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  modelAnswer: { type: Type.STRING },
                  difficulty: { type: Type.STRING },
                  bloomLevel: { type: Type.STRING },
                },
                required: [
                  "question",
                  "modelAnswer",
                  "difficulty",
                  "bloomLevel",
                ],
              },
            },
            longQuestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  modelAnswer: { type: Type.STRING },
                  difficulty: { type: Type.STRING },
                  bloomLevel: { type: Type.STRING },
                },
                required: [
                  "question",
                  "modelAnswer",
                  "difficulty",
                  "bloomLevel",
                ],
              },
            },
          },
          required: ["mcqs", "shortQuestions", "longQuestions"],
        },
      },
    })
  );

  const parsed = safeJsonParse(response.text);

  parsed.mcqs = parsed.mcqs || [];
  parsed.shortQuestions = parsed.shortQuestions || [];
  parsed.longQuestions = parsed.longQuestions || [];

  // sanitize everything
  parsed.mcqs.forEach(q => {
    q.question = stripMathArtifacts(q.question);
    q.options = (q.options || []).map(stripMathArtifacts);
  });

  parsed.shortQuestions.forEach(q => {
    q.question = stripMathArtifacts(q.question);
    q.modelAnswer = stripMathArtifacts(q.modelAnswer);
  });

  parsed.longQuestions.forEach(q => {
    q.question = stripMathArtifacts(q.question);
    q.modelAnswer = stripMathArtifacts(q.modelAnswer);
  });

  return parsed;
}

module.exports = {
  generateCourse,
  generateAssessment,
};