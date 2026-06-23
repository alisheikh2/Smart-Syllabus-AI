const { GoogleGenAI, Type } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ─────────────────────────────────────────────
// 🚦 REQUEST QUEUE (RPM throttle)
// ─────────────────────────────────────────────
// MAX_CONCURRENT : kitne Gemini calls ek saath chal sakte hain
// MIN_GAP_MS     : do consecutive starts ke beech minimum gap
//                  4000ms → ~15 starts/min → safe under 15 RPM free tier

const MAX_CONCURRENT = 3;
const MIN_GAP_MS = 4000;

const queue = {
  _pending: [],      // { fn, resolve, reject }
  _running: 0,
  _lastStart: 0,
  _drainScheduled: false,
  _drainTimer: null,

  enqueue(fn) {
    return new Promise((resolve, reject) => {
      this._pending.push({ fn, resolve, reject });
      this._drain();
    });
  },

  // ✅ FIX: Single drain path via microtask to avoid race conditions
  _scheduleNextDrain() {
    if (this._drainScheduled) return;
    this._drainScheduled = true;
    Promise.resolve().then(() => {
      this._drainScheduled = false;
      this._drain();
    });
  },

  _drain() {
    if (this._running >= MAX_CONCURRENT || this._pending.length === 0) return;

    const now = Date.now();
    const sinceLastStart = now - this._lastStart;
    const waitNeeded = Math.max(0, MIN_GAP_MS - sinceLastStart);

    if (waitNeeded > 0) {
      if (!this._drainTimer) {
        this._drainTimer = setTimeout(() => {
          this._drainTimer = null;
          this._drain();
        }, waitNeeded);
      }
      return;
    }

    const item = this._pending.shift();
    this._running++;
    this._lastStart = Date.now();

    item.fn()
      .then(item.resolve)
      .catch(item.reject)
      .finally(() => {
        this._running--;
        // ✅ FIX: Use single scheduled drain instead of direct call
        this._scheduleNextDrain();
      });

    // Try to fill remaining capacity (MIN_GAP_MS will pace starts)
    this._drain();
  },
};

// ─────────────────────────────────────────────
// Custom Error Class
// ─────────────────────────────────────────────
class AIServiceUnavailableError extends Error {
  constructor(reason, cause) {
    const message =
      reason === "overloaded"
        ? "Our AI service is experiencing high demand right now. Please try again in a few minutes."
        : reason === "quota"
        ? "We've hit our usage limit for now. Please try again shortly."
        : "Something went wrong generating your content. Please try again.";

    super(message);
    this.name = "AIServiceUnavailableError";
    this.reason = reason; // "overloaded" | "quota" | "unknown"
    this.cause = cause;
  }
}

// ─────────────────────────────────────────────
// Model Chain + Retry Config
// ─────────────────────────────────────────────
const MODEL_CHAIN = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.5-pro"];
const RETRIES_FOR_503 = 3;
const RETRIES_FOR_429 = 2;

// ✅ FIX: Robust retry delay parsing — handles "90s", "90", edge cases
function getServerRetryDelayMs(err) {
  try {
    const details =
      err?.error?.details ||
      err?.details ||
      err?.response?.error?.details;

    if (!Array.isArray(details)) return null;

    const retryInfo = details.find((d) => d["@type"]?.includes("RetryInfo"));
    if (!retryInfo?.retryDelay) return null;

    const raw = String(retryInfo.retryDelay).trim();

    // Matches "90s", "1.5s", or plain "90" (seconds assumed)
    const secondsMatch = raw.match(/^(\d+(?:\.\d+)?)s?$/);
    if (secondsMatch) {
      const seconds = parseFloat(secondsMatch[1]);
      // Sanity check: between 1s and 5 minutes
      if (seconds >= 1 && seconds <= 300) {
        return seconds * 1000;
      }
    }

    return null;
  } catch (_) {
    return null;
  }
}

// ─────────────────────────────────────────────
// 🔁 Retry + Model Fallback Wrapper
// ─────────────────────────────────────────────
// ✅ FIX: Only the actual API call is queued (not the whole retry loop)
//         This frees the queue slot between retries so other requests
//         can proceed instead of waiting behind a retrying request.
async function callGeminiWithRetry(buildRequest) {
  let lastError;
  let lastErrorReason = "unknown";

  for (const model of MODEL_CHAIN) {
    let delay = 1000;
    let attempt = 0;

    // ✅ FIX: Use correct per-error-type max retries (no Math.max confusion)
    const maxRetries = Math.max(RETRIES_FOR_503, RETRIES_FOR_429); // outer bound

    while (attempt < maxRetries) {
      try {
        // ✅ FIX: Queue only the actual Gemini call
        return await queue.enqueue(() =>
          ai.models.generateContent(buildRequest(model))
        );
      } catch (err) {
        lastError = err;

        const is503 =
          err?.status === 503 ||
          err?.message?.includes("UNAVAILABLE") ||
          err?.message?.includes("high demand");

        const is429 =
          err?.status === 429 ||
          err?.message?.includes("429") ||
          err?.message?.toLowerCase().includes("quota") ||
          err?.message?.toLowerCase().includes("rate limit") ||
          err?.message?.toLowerCase().includes("resource_exhausted");

        lastErrorReason = is503 ? "overloaded" : is429 ? "quota" : "unknown";

        // Non-retryable error → throw immediately
        if (!is503 && !is429) throw err;

        // ✅ FIX: Each error type uses its own retry limit correctly
        const maxRetriesForThisError = is429 ? RETRIES_FOR_429 : RETRIES_FOR_503;

        if (attempt >= maxRetriesForThisError - 1) {
          console.warn(
            `⚠ ${model} exhausted after ${maxRetriesForThisError} retries (${
              is429 ? "429" : "503"
            }). Trying next model…`
          );
          break; // move to next model
        }

        const waitTime = is429
          ? (getServerRetryDelayMs(err) ?? Math.max(delay, 5000))
          : delay;

        console.warn(
          `⚠ ${model} ${is429 ? "rate limited" : "busy"}. Retry ${
            attempt + 1
          }/${maxRetriesForThisError} in ${Math.round(waitTime)}ms`
        );

        await new Promise((r) => setTimeout(r, waitTime));
        delay *= 2;
        attempt++;
      }
    }
  }

  console.error("❌ All models exhausted. Last error:", lastError?.message || lastError);
  throw new AIServiceUnavailableError(lastErrorReason, lastError);
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
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

// ✅ FIX: Safer JSON parse — only escape actual control characters,
//         not content newlines inside model answers
function safeJsonParse(rawText) {
  let cleaned = rawText
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (_) {
    try {
      // Only escape true control characters, preserve intentional content
      const escaped = cleaned.replace(/[\x00-\x1F\x7F]/g, (ch) => {
        const map = { "\n": "\\n", "\r": "\\r", "\t": "\\t" };
        return map[ch] ?? "";
      });
      return JSON.parse(escaped);
    } catch (e) {
      console.error("❌ RAW RESPONSE:", rawText);
      throw new Error("AI returned invalid JSON");
    }
  }
}

// ─────────────────────────────────────────────
// Schemas
// ─────────────────────────────────────────────
const COURSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    syllabus: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          week:   { type: Type.STRING },
          topics: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["week", "topics"],
      },
    },
    studyMaterial: {
      type: Type.OBJECT,
      properties: {
        summary:            { type: Type.STRING },
        keyConcepts:        { type: Type.ARRAY, items: { type: Type.STRING } },
        definitions:        { type: Type.ARRAY, items: { type: Type.STRING } },
        realWorldExamples:  { type: Type.ARRAY, items: { type: Type.STRING } },
        interviewQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
        furtherReading:     { type: Type.ARRAY, items: { type: Type.STRING } },
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
};

const MCQ_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    mcqs: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question:      { type: Type.STRING },
          options:       { type: Type.ARRAY, items: { type: Type.STRING } },
          correctAnswer: { type: Type.STRING },
          difficulty:    { type: Type.STRING },
          bloomLevel:    { type: Type.STRING },
        },
        required: ["question", "options", "correctAnswer", "difficulty", "bloomLevel"],
      },
    },
  },
  required: ["mcqs"],
};

const SHORT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    shortQuestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question:    { type: Type.STRING },
          modelAnswer: { type: Type.STRING },
          difficulty:  { type: Type.STRING },
          bloomLevel:  { type: Type.STRING },
        },
        required: ["question", "modelAnswer", "difficulty", "bloomLevel"],
      },
    },
  },
  required: ["shortQuestions"],
};

const LONG_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    longQuestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question:    { type: Type.STRING },
          modelAnswer: { type: Type.STRING },
          difficulty:  { type: Type.STRING },
          bloomLevel:  { type: Type.STRING },
        },
        required: ["question", "modelAnswer", "difficulty", "bloomLevel"],
      },
    },
  },
  required: ["longQuestions"],
};

// ─────────────────────────────────────────────
// Prompts
// ─────────────────────────────────────────────
function buildCoursePrompt({ topic, audience, duration, difficulty }) {
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

Return ONLY valid JSON matching the provided schema.
`;
}

function buildAssessmentPartPrompt(type, params) {
  const countMap = {
    mcq:   { label: "MCQs",                 count: params.mcqCount   },
    short: { label: "Short questions",      count: params.shortCount },
    long:  { label: "Long/essay questions", count: params.longCount  },
  };
  const { label, count } = countMap[type];

  return `
You are an expert exam setter.

Course: ${params.courseTitle}
Syllabus: ${JSON.stringify(params.syllabus)}

Rules:
- NO LaTeX, NO math symbols, plain text only

Generate EXACTLY ${count} ${label}.

Difficulty split:
  Easy   ${params.easyPercent}%
  Medium ${params.mediumPercent}%
  Hard   ${params.hardPercent}%

Return ONLY valid JSON matching the provided schema.
`;
}

// ─────────────────────────────────────────────
// 📘 Generate Course
// ─────────────────────────────────────────────
async function generateCourse({ topic, audience, duration, difficulty }) {
  const prompt = buildCoursePrompt({ topic, audience, duration, difficulty });

  const response = await callGeminiWithRetry((model) => ({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: COURSE_SCHEMA,
    },
  }));

  const parsed = safeJsonParse(response.text);

  if (Array.isArray(parsed.studyMaterial)) {
    parsed.studyMaterial = parsed.studyMaterial[0] || {};
  }
  if (parsed.studyMaterial?.summary) {
    parsed.studyMaterial.summary = stripMathArtifacts(parsed.studyMaterial.summary);
  }

  return parsed;
}

// ─────────────────────────────────────────────
// 🧪 Generate Assessment (3 parallel calls)
// ─────────────────────────────────────────────
// ✅ FIX: Promise.allSettled instead of Promise.all so one failure
//         doesn't silently kill the entire assessment.
//         Partial results are returned with a warning.
async function generateAssessment(params) {
  const [mcqResult, shortResult, longResult] = await Promise.allSettled([
    callGeminiWithRetry((model) => ({
      model,
      contents: buildAssessmentPartPrompt("mcq", params),
      config: {
        responseMimeType: "application/json",
        responseSchema: MCQ_SCHEMA,
      },
    })),
    callGeminiWithRetry((model) => ({
      model,
      contents: buildAssessmentPartPrompt("short", params),
      config: {
        responseMimeType: "application/json",
        responseSchema: SHORT_SCHEMA,
      },
    })),
    callGeminiWithRetry((model) => ({
      model,
      contents: buildAssessmentPartPrompt("long", params),
      config: {
        responseMimeType: "application/json",
        responseSchema: LONG_SCHEMA,
      },
    })),
  ]);

  // ── Safe parser: logs failure, returns empty array as fallback ──
  const failures = [];

  function safeExtract(result, key, label) {
    if (result.status === "fulfilled") {
      try {
        return safeJsonParse(result.value.text)[key] || [];
      } catch (e) {
        failures.push(`${label}: JSON parse failed — ${e.message}`);
        return [];
      }
    }
    failures.push(`${label}: ${result.reason?.message || "unknown error"}`);
    return [];
  }

  const parsed = {
    mcqs:           safeExtract(mcqResult,   "mcqs",           "MCQ"),
    shortQuestions: safeExtract(shortResult, "shortQuestions", "Short"),
    longQuestions:  safeExtract(longResult,  "longQuestions",  "Long"),
  };

  if (failures.length > 0) {
    console.warn("⚠ Assessment partial failures:", failures);
  }

  // If every section is empty, something is seriously wrong → throw
  const totalQuestions =
    parsed.mcqs.length + parsed.shortQuestions.length + parsed.longQuestions.length;

  if (totalQuestions === 0) {
    throw new AIServiceUnavailableError(
      "unknown",
      new Error(`All assessment sections failed: ${failures.join("; ")}`)
    );
  }

  // ── Strip math artifacts ──
  parsed.mcqs.forEach((q) => {
    q.question = stripMathArtifacts(q.question);
    q.options  = (q.options || []).map(stripMathArtifacts);
  });
  parsed.shortQuestions.forEach((q) => {
    q.question    = stripMathArtifacts(q.question);
    q.modelAnswer = stripMathArtifacts(q.modelAnswer);
  });
  parsed.longQuestions.forEach((q) => {
    q.question    = stripMathArtifacts(q.question);
    q.modelAnswer = stripMathArtifacts(q.modelAnswer);
  });

  return parsed;
}
// ─────────────────────────────────────────────
// Assignment Schema
// ─────────────────────────────────────────────
const ASSIGNMENT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type:          { type: Type.STRING },
          question:      { type: Type.STRING },
          options:       { type: Type.ARRAY, items: { type: Type.STRING } },
          correctAnswer: { type: Type.STRING },
          modelAnswer:   { type: Type.STRING },
          marks:         { type: Type.NUMBER },
          difficulty:    { type: Type.STRING },
          bloomLevel:    { type: Type.STRING },
        },
        required: ["type", "question", "difficulty", "bloomLevel", "marks"],
      },
    },
  },
  required: ["questions"],
};

// ─────────────────────────────────────────────
// Assignment Prompt
// ─────────────────────────────────────────────
function buildAssignmentPrompt(params) {
  const typeInstructions = {
    mcq:   "All questions must be MCQs with 4 options and a correct answer.",
    short: "All questions must be short answer questions with model answers.",
    long:  "All questions must be long/essay questions with detailed model answers.",
    mixed: "Mix of MCQ, short, and long questions.",
  };

  return `
You are an expert assignment creator.

Course: ${params.courseTitle}
Syllabus: ${JSON.stringify(params.syllabus)}

Rules:
- NO LaTeX, NO math symbols, plain text only
- Bloom's Level focus: ${params.bloomLevel}
- Question type: ${typeInstructions[params.questionType] || typeInstructions.mixed}

Generate EXACTLY ${params.questionCount} questions.

Difficulty split:
  Easy   ${params.easyPercent}%
  Medium ${params.mediumPercent}%
  Hard   ${params.hardPercent}%

For each question set:
  - type: "mcq" | "short" | "long"
  - marks: appropriate (mcq=1, short=5, long=10)
  - For MCQs: include options array and correctAnswer
  - For short/long: include modelAnswer

Return ONLY valid JSON matching the provided schema.
`;
}

// ─────────────────────────────────────────────
// 📋 GENERATE ASSIGNMENT
// ─────────────────────────────────────────────
async function generateAssignment(params) {
  const response = await callGeminiWithRetry((model) => ({
    model,
    contents: buildAssignmentPrompt(params),
    config: {
      responseMimeType: "application/json",
      responseSchema: ASSIGNMENT_SCHEMA,
    },
  }));

  const parsed = safeJsonParse(response.text);
  const questions = parsed.questions || [];

  // Strip math artifacts
  questions.forEach((q) => {
    q.question = stripMathArtifacts(q.question || "");
    if (q.modelAnswer) q.modelAnswer = stripMathArtifacts(q.modelAnswer);
    if (q.options)     q.options     = q.options.map(stripMathArtifacts);
  });

  return { questions };
}

// ─────────────────────────────────────────────
// Exports — generateAssignment add karo
// ─────────────────────────────────────────────
module.exports = {
  generateCourse,
  generateAssessment,
  generateAssignment,   // ✅ NEW
  AIServiceUnavailableError,
};
// ─────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────
