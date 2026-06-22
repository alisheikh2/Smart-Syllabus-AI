import jsPDF from "jspdf";

const PAGE_WIDTH = 210; // A4 width in mm
const MARGIN = 18;
const MAX_WIDTH = PAGE_WIDTH - MARGIN * 2;
const PAGE_HEIGHT = 297; // A4 height in mm
const BOTTOM_LIMIT = PAGE_HEIGHT - 20;

function createDoc() {
  return new jsPDF({ unit: "mm", format: "a4" });
}

function addHeader(doc, title, subtitle) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(title, MARGIN, 22);

  if (subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(110, 110, 110);
    doc.text(subtitle, MARGIN, 30);
    doc.setTextColor(20, 20, 20);
  }

  doc.setDrawColor(220, 220, 220);
  doc.line(MARGIN, 35, PAGE_WIDTH - MARGIN, 35);

  return 45; // next Y position
}

function checkPageBreak(doc, y, neededSpace = 10) {
  if (y + neededSpace > BOTTOM_LIMIT) {
    doc.addPage();
    return 20;
  }
  return y;
}

function writeWrappedText(doc, text, x, y, options = {}) {
  const { fontSize = 11, lineHeight = 6, maxWidth = MAX_WIDTH - (x - MARGIN) } = options;
  doc.setFontSize(fontSize);
  const lines = doc.splitTextToSize(text, maxWidth);

  lines.forEach((line) => {
    y = checkPageBreak(doc, y, lineHeight);
    doc.text(line, x, y);
    y += lineHeight;
  });

  return y;
}

function writeSectionTitle(doc, text, y) {
  y = checkPageBreak(doc, y, 14);
  y += 4;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(124, 92, 255);
  doc.text(text, MARGIN, y);
  doc.setTextColor(20, 20, 20);
  doc.setFont("helvetica", "normal");
  return y + 8;
}

export function generateSyllabusPDF(course) {
  const doc = createDoc();
  let y = addHeader(doc, course.title, `${course.duration || ""}  ·  ${course.difficulty || ""}`);

  y = writeSectionTitle(doc, "Syllabus", y);

  course.syllabus?.forEach((week) => {
    y = checkPageBreak(doc, y, 12);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(week.week, MARGIN, y);
    doc.setFont("helvetica", "normal");
    y += 6;

    week.topics?.forEach((topic) => {
      y = writeWrappedText(doc, `•  ${topic}`, MARGIN + 4, y, { fontSize: 11, lineHeight: 6 });
    });

    y += 4;
  });

  doc.save(`${course.title.replace(/\s+/g, "_")}_Syllabus.pdf`);
}

export function generateStudyMaterialPDF(course) {
  const doc = createDoc();
  let y = addHeader(doc, course.title, "Study Material");

  const sm = course.studyMaterial || {};

  if (sm.summary) {
    y = writeSectionTitle(doc, "Summary", y);
    y = writeWrappedText(doc, sm.summary, MARGIN, y);
    y += 4;
  }

  const renderList = (label, items) => {
    if (!items || items.length === 0) return;
    y = writeSectionTitle(doc, label, y);
    items.forEach((item) => {
      y = writeWrappedText(doc, `•  ${item}`, MARGIN, y);
    });
    y += 4;
  };

  renderList("Key Concepts", sm.keyConcepts);
  renderList("Definitions", sm.definitions);
  renderList("Real-World Examples", sm.realWorldExamples);
  renderList("Interview Questions", sm.interviewQuestions);
  renderList("Further Reading", sm.furtherReading);

  doc.save(`${course.title.replace(/\s+/g, "_")}_Study_Material.pdf`);
}

export function generateQuestionPaperPDF(course, assessment) {
  const doc = createDoc();
  let y = addHeader(
    doc,
    course.title,
    `Question Paper  ·  Total Marks: ${assessment.totalMarks}`
  );

  if (assessment.mcqs?.length > 0) {
    y = writeSectionTitle(doc, `Section A — Multiple Choice (${assessment.config.mcqMarks} marks each)`, y);

    assessment.mcqs.forEach((mcq, i) => {
      y = writeWrappedText(doc, `${i + 1}. ${mcq.question}`, MARGIN, y, { fontSize: 11 });
      mcq.options?.forEach((opt, oi) => {
        y = writeWrappedText(
          doc,
          `${String.fromCharCode(65 + oi)}. ${opt}`,
          MARGIN + 6,
          y,
          { fontSize: 10.5, lineHeight: 5.5 }
        );
      });
      y += 3;
    });
  }

  if (assessment.shortQuestions?.length > 0) {
    y = writeSectionTitle(doc, `Section B — Short Questions (${assessment.config.shortMarks} marks each)`, y);
    assessment.shortQuestions.forEach((q, i) => {
      y = writeWrappedText(doc, `${i + 1}. ${q.question}`, MARGIN, y, { fontSize: 11 });
      y += 3;
    });
  }

  if (assessment.longQuestions?.length > 0) {
    y = writeSectionTitle(doc, `Section C — Long Questions (${assessment.config.longMarks} marks each)`, y);
    assessment.longQuestions.forEach((q, i) => {
      y = writeWrappedText(doc, `${i + 1}. ${q.question}`, MARGIN, y, { fontSize: 11 });
      y += 3;
    });
  }

  doc.save(`${course.title.replace(/\s+/g, "_")}_Question_Paper.pdf`);
}

export function generateAnswerKeyPDF(course, assessment) {
  const doc = createDoc();
  let y = addHeader(
    doc,
    course.title,
    `Answer Key  ·  Total Marks: ${assessment.totalMarks}`
  );

  if (assessment.mcqs?.length > 0) {
    y = writeSectionTitle(doc, "Section A — Multiple Choice", y);
    assessment.mcqs.forEach((mcq, i) => {
      y = writeWrappedText(doc, `${i + 1}. ${mcq.correctAnswer}`, MARGIN, y, { fontSize: 11 });
    });
    y += 4;
  }

  if (assessment.shortQuestions?.length > 0) {
    y = writeSectionTitle(doc, "Section B — Short Questions", y);
    assessment.shortQuestions.forEach((q, i) => {
      y = writeWrappedText(doc, `${i + 1}. ${q.question}`, MARGIN, y, { fontSize: 11 });
      y = writeWrappedText(doc, q.modelAnswer, MARGIN + 6, y, { fontSize: 10.5, lineHeight: 5.5 });
      y += 3;
    });
  }

  if (assessment.longQuestions?.length > 0) {
    y = writeSectionTitle(doc, "Section C — Long Questions", y);
    assessment.longQuestions.forEach((q, i) => {
      y = writeWrappedText(doc, `${i + 1}. ${q.question}`, MARGIN, y, { fontSize: 11 });
      y = writeWrappedText(doc, q.modelAnswer, MARGIN + 6, y, { fontSize: 10.5, lineHeight: 5.5 });
      y += 3;
    });
  }

  doc.save(`${course.title.replace(/\s+/g, "_")}_Answer_Key.pdf`);
}