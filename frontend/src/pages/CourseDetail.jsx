import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCourseById, updateCourse } from "../services/courseService";
import {
  createAssessment,
  getAssessmentsByCourse,
  updateAssessment,
} from "../services/assessmentService";
import {
  createAssignment,
  getAssignmentsByCourse,
  updateAssignment,
  deleteAssignment,
} from "../services/assignmentService";
import { useAuth } from "../hooks/useAuth";
import AssessmentFormModal from "../components/AssessmentFormModal";
import AssignmentFormModal from "../components/AssignmentFormModal";
import EditableSyllabus from "../components/EditableSyllabus";
import EditableStudyMaterial from "../components/EditableStudyMaterial";
import EditableAssessment from "../components/EditableAssessment";
import EditableAssignment from "../components/EditableAssignment";
import Toast from "../components/Toast";
import {
  generateSyllabusPDF,
  generateStudyMaterialPDF,
  generateQuestionPaperPDF,
  generateAnswerKeyPDF,
  generateAssignmentPDF,
  generateAssignmentAnswerKeyPDF,
} from "../utils/pdfGenerator";

// ─────────────────────────────────────────────
const DownloadIcon = () => (
  <svg
    className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-y-0.5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

// ─────────────────────────────────────────────
function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // ── Course ──
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ── Tabs ──
  const [activeTab, setActiveTab] = useState("syllabus");

  // ── Edit mode ──
  const [editMode, setEditMode] = useState(false);

  // ── Assessment ──
  const [assessments, setAssessments] = useState([]);
  const [loadingAssessments, setLoadingAssessments] = useState(true);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [generatingAssessment, setGeneratingAssessment] = useState(false);
  const [activeAssessment, setActiveAssessment] = useState(null);
  const [activeAssessmentView, setActiveAssessmentView] = useState("paper");

  // ── Assignment ──
  const [assignments, setAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [generatingAssignment, setGeneratingAssignment] = useState(false);
  const [activeAssignment, setActiveAssignment] = useState(null);
  const [assignmentView, setAssignmentView] = useState("paper");

  // ── Toasts ──
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // ─────────────────────────────────────────────
  // Load course
  // ─────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;
    const loadCourse = async () => {
      try {
        const data = await getCourseById(id);
        if (isMounted) {
          const c = data.course;
          if (Array.isArray(c.studyMaterial))
            c.studyMaterial = c.studyMaterial[0] || {};
          setCourse(c);
        }
      } catch {
        if (isMounted) setError("Course not found.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadCourse();
    return () => {
      isMounted = false;
    };
  }, [id]);

  // ─────────────────────────────────────────────
  // Load assessments
  // ─────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const data = await getAssessmentsByCourse(id);
        if (isMounted) {
          setAssessments(data.assessments);
          // ✅ Latest assessment default active
          if (data.assessments.length > 0) {
            setActiveAssessment(data.assessments[0]);
          }
        }
      } catch (err) {
        console.error("Failed to load assessments:", err.message);
      } finally {
        if (isMounted) setLoadingAssessments(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [id]);

  // ─────────────────────────────────────────────
  // Load assignments
  // ─────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const data = await getAssignmentsByCourse(id);
        if (isMounted) {
          setAssignments(data.assignments);
          if (data.assignments.length > 0)
            setActiveAssignment(data.assignments[0]);
        }
      } catch (err) {
        console.error("Failed to load assignments:", err.message);
      } finally {
        if (isMounted) setLoadingAssignments(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [id]);

  // ─────────────────────────────────────────────
  // Handlers — Course edits
  // ─────────────────────────────────────────────
  const handleSaveSyllabus = async (updatedSyllabus) => {
    try {
      const data = await updateCourse(id, { syllabus: updatedSyllabus });
      setCourse((prev) => ({ ...prev, syllabus: data.course.syllabus }));
      setSuccessMsg("Syllabus saved!");
    } catch {
      setErrorMsg("Failed to save syllabus. Try again.");
    }
  };

  const handleSaveStudyMaterial = async (updatedSm) => {
    try {
      const data = await updateCourse(id, { studyMaterial: updatedSm });
      setCourse((prev) => ({
        ...prev,
        studyMaterial: data.course.studyMaterial,
      }));
      setSuccessMsg("Study material saved!");
    } catch {
      setErrorMsg("Failed to save study material. Try again.");
    }
  };

  // ─────────────────────────────────────────────
  // Handlers — Assessment
  // ─────────────────────────────────────────────
  const refreshAssessments = async () => {
    try {
      const data = await getAssessmentsByCourse(id);
      setAssessments(data.assessments);
      // ✅ Naya generate hua to wo active ho
      if (data.assessments.length > 0) {
        setActiveAssessment(data.assessments[0]);
      }
    } catch (err) {
      console.error("Failed to refresh assessments:", err.message);
    }
  };

  const handleSaveAssessment = async (updates) => {
    try {
      const data = await updateAssessment(activeAssessment._id, updates);
      setAssessments((prev) =>
        prev.map((a) => (a._id === activeAssessment._id ? data.assessment : a)),
      );
      // ✅ Active assessment bhi update karo
      setActiveAssessment(data.assessment);
      setSuccessMsg("Assessment saved!");
    } catch {
      setErrorMsg("Failed to save assessment. Try again.");
    }
  };

  const handleGenerateAssessment = async (formData) => {
    setGeneratingAssessment(true);
    try {
      await createAssessment({ ...formData, courseId: id, email: user.email });
      await refreshAssessments();
      setShowAssessmentModal(false);
      setActiveAssessmentView("paper");
      setSuccessMsg("Assessment generated!");
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || "Failed to generate assessment.",
      );
    } finally {
      setGeneratingAssessment(false);
    }
  };

  // ─────────────────────────────────────────────
  // Handlers — Assignment
  // ─────────────────────────────────────────────
  const refreshAssignments = async () => {
    try {
      const data = await getAssignmentsByCourse(id);
      setAssignments(data.assignments);
      return data.assignments;
    } catch (err) {
      console.error("Failed to refresh assignments:", err.message);
      return [];
    }
  };

  const handleGenerateAssignment = async (formData) => {
    setGeneratingAssignment(true);
    try {
      const data = await createAssignment({
        ...formData,
        courseId: id,
        email: user.email,
      });
      const updated = await refreshAssignments();
      const created =
        updated.find((a) => a._id === data.assignment._id) || data.assignment;
      setActiveAssignment(created);
      setAssignmentView("paper");
      setShowAssignmentModal(false);
      setSuccessMsg("Assignment created!");
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || "Failed to generate assignment.",
      );
    } finally {
      setGeneratingAssignment(false);
    }
  };

  const handleSaveAssignment = async (updates) => {
    try {
      const data = await updateAssignment(activeAssignment._id, updates);
      setAssignments((prev) =>
        prev.map((a) => (a._id === activeAssignment._id ? data.assignment : a)),
      );
      setActiveAssignment(data.assignment);
      setSuccessMsg("Assignment saved!");
    } catch {
      setErrorMsg("Failed to save assignment. Try again.");
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (!window.confirm("Delete this assignment?")) return;
    try {
      await deleteAssignment(assignmentId);
      const updated = await refreshAssignments();
      setActiveAssignment(updated[0] || null);
      setSuccessMsg("Assignment deleted.");
    } catch {
      setErrorMsg("Failed to delete assignment.");
    }
  };

  // ─────────────────────────────────────────────
  // Loading / Error screens
  // ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#15132B]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-[#7C5CFF]/30 border-t-[#7C5CFF] rounded-full animate-spin" />
          <span className="text-[#A9A4C2] text-xs font-medium tracking-widest uppercase">
            Loading
          </span>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#15132B]">
        <div className="text-center">
          <p className="text-white font-medium mb-4">
            {error || "Course not found."}
          </p>
          <button
            onClick={() => navigate("/")}
            className="text-[#7C5CFF] hover:text-[#9B82FF] text-sm font-medium"
          >
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // Derived
  // ─────────────────────────────────────────────
  const tabs = [
    { id: "syllabus", label: "Syllabus" },
    { id: "material", label: "Study material" },
    { id: "assessment", label: "Assessment" },
    { id: "assignment", label: "Assignments" },
  ];

  const downloadButtonClass =
    "group flex items-center gap-2 bg-gradient-to-r from-white/[0.08] to-white/[0.04] " +
    "hover:from-[#7C5CFF]/20 hover:to-[#7C5CFF]/10 border border-white/10 " +
    "hover:border-[#7C5CFF]/40 text-[#A9A4C2] hover:text-white text-xs font-medium " +
    "px-4 py-2.5 rounded-xl transition-all duration-200 hover:shadow-md " +
    "hover:shadow-violet-500/10 hover:-translate-y-0.5 active:scale-[0.97]";

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#15132B] ruled-bg">
      {/* Blob */}
      <div
        className="absolute w-[480px] h-[480px] rounded-full blob-a opacity-15 blur-3xl pointer-events-none"
        style={{
          background: "radial-gradient(circle, #7C5CFF, transparent 70%)",
          top: "-10%",
          right: "-10%",
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-8">
        {/* ── Back ── */}
        <button
          onClick={() => navigate("/")}
          className="rise-in text-[#A9A4C2] hover:text-white text-sm font-medium mb-6 flex items-center gap-2 transition-colors duration-200"
        >
          ← Back to dashboard
        </button>

        {/* ── Course title + Edit toggle ── */}
        <div
          className="rise-in mb-8 flex items-start justify-between gap-4"
          style={{ animationDelay: "0.05s" }}
        >
          <div>
            <h1 className="font-display text-3xl font-bold text-white mb-3">
              {course.title}
            </h1>
            <div className="flex gap-2">
              {course.duration && (
                <span className="text-xs text-[#A9A4C2] bg-white/5 px-3 py-1.5 rounded-md">
                  {course.duration}
                </span>
              )}
              {course.difficulty && (
                <span className="text-xs text-[#A9A4C2] bg-white/5 px-3 py-1.5 rounded-md">
                  {course.difficulty}
                </span>
              )}
            </div>
          </div>

          {/* Edit toggle */}
          <button
            onClick={() => setEditMode((prev) => !prev)}
            className={`shrink-0 text-sm font-medium px-4 py-2 rounded-xl border transition-all duration-200 ${
              editMode
                ? "bg-[#7C5CFF]/20 border-[#7C5CFF]/50 text-[#7C5CFF]"
                : "bg-white/[0.06] border-white/10 text-[#A9A4C2] hover:text-white hover:border-white/20"
            }`}
          >
            {editMode ? "✎ Editing" : "✎ Edit"}
          </button>
        </div>

        {/* ── Tabs ── */}
        <div
          className="rise-in flex gap-1 border-b border-white/10 mb-6 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0"
          style={{ animationDelay: "0.1s" }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-5 py-3 text-sm font-medium whitespace-nowrap shrink-0 transition-colors duration-200 ${
                activeTab === tab.id
                  ? "text-white"
                  : "text-[#A9A4C2] hover:text-white"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#7C5CFF] rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════
            SYLLABUS TAB
        ══════════════════════════════════════ */}
        {activeTab === "syllabus" && (
          <div className="fade-in">
            <div className="flex justify-end mb-4">
              <button
                onClick={() => generateSyllabusPDF(course)}
                className={downloadButtonClass}
              >
                <DownloadIcon />
                Download PDF
              </button>
            </div>

            {editMode ? (
              <EditableSyllabus
                syllabus={course.syllabus}
                onChange={handleSaveSyllabus}
              />
            ) : (
              <div className="flex flex-col gap-3">
                {course.syllabus?.map((week, index) => (
                  <div
                    key={index}
                    className="bg-[#FAF8F3]/[0.06] border border-white/10 rounded-2xl p-5"
                  >
                    <h3 className="text-white font-medium mb-2">{week.week}</h3>
                    <ul className="flex flex-col gap-1.5">
                      {week.topics?.map((topic, i) => (
                        <li
                          key={i}
                          className="text-[#A9A4C2] text-sm flex items-start gap-2"
                        >
                          <span className="text-[#7C5CFF] mt-1">•</span>
                          {topic}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════
            STUDY MATERIAL TAB
        ══════════════════════════════════════ */}
        {activeTab === "material" && course.studyMaterial && (
          <div className="fade-in">
            <div className="flex justify-end mb-4">
              <button
                onClick={() => generateStudyMaterialPDF(course)}
                className={downloadButtonClass}
              >
                <DownloadIcon />
                Download PDF
              </button>
            </div>

            {editMode ? (
              <EditableStudyMaterial
                studyMaterial={course.studyMaterial}
                onChange={handleSaveStudyMaterial}
              />
            ) : (
              <div className="bg-[#FAF8F3]/[0.06] border border-white/10 rounded-2xl p-6 flex flex-col gap-6">
                {course.studyMaterial.summary && (
                  <div>
                    <h4 className="text-white font-medium mb-2 text-sm">
                      Summary
                    </h4>
                    <p className="text-[#A9A4C2] text-sm leading-relaxed">
                      {course.studyMaterial.summary}
                    </p>
                  </div>
                )}
                {[
                  { key: "keyConcepts", label: "Key concepts" },
                  { key: "definitions", label: "Definitions" },
                  { key: "realWorldExamples", label: "Real-world examples" },
                  { key: "interviewQuestions", label: "Interview questions" },
                  { key: "furtherReading", label: "Further reading" },
                ].map(({ key, label }) =>
                  course.studyMaterial[key]?.length > 0 ? (
                    <div key={key}>
                      <h4 className="text-white font-medium mb-2 text-sm">
                        {label}
                      </h4>
                      <ul className="flex flex-col gap-1.5">
                        {course.studyMaterial[key].map((item, i) => (
                          <li
                            key={i}
                            className="text-[#A9A4C2] text-sm flex items-start gap-2"
                          >
                            <span className="text-[#7C5CFF] mt-1">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null,
                )}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════
            ASSESSMENT TAB
        ══════════════════════════════════════ */}
        {activeTab === "assessment" && (
          <div className="fade-in">
            {loadingAssessments ? (
              <div className="flex items-center gap-3 text-[#A9A4C2] text-sm">
                <div className="w-4 h-4 border-2 border-[#7C5CFF]/30 border-t-[#7C5CFF] rounded-full animate-spin" />
                Loading assessments...
              </div>
            ) : assessments.length === 0 ? (
              /* ── Empty state ── */
              <div className="bg-[#FAF8F3]/[0.04] border border-white/10 rounded-2xl p-10 text-center">
                <p className="text-white font-medium mb-1">No assessment yet</p>
                <p className="text-[#A9A4C2] text-sm mb-5">
                  Set up your question counts and marks to generate one.
                </p>
                <button
                  onClick={() => setShowAssessmentModal(true)}
                  className="bg-gradient-to-r from-[#7C5CFF] to-[#6845E8] text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 hover:shadow-lg hover:shadow-violet-500/30"
                >
                  + Generate assessment
                </button>
              </div>
            ) : (
              <div className="flex gap-4 flex-col md:flex-row">
                {/* ── Left: Assessment history list ── */}
                <div className="md:w-56 shrink-0 flex flex-col gap-2">
                  {/* Generate new */}
                  <button
                    onClick={() => setShowAssessmentModal(true)}
                    className="w-full bg-gradient-to-r from-[#7C5CFF] to-[#6845E8] text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 hover:shadow-lg hover:shadow-violet-500/30 mb-1"
                  >
                    + New assessment
                  </button>

                  {/* History list */}
                  {assessments.map((a, idx) => (
                    <button
                      key={a._id}
                      onClick={() => {
                        setActiveAssessment(a);
                        setActiveAssessmentView("paper");
                      }}
                      className={`text-left px-4 py-3 rounded-xl border text-sm transition-all duration-200 ${
                        activeAssessment?._id === a._id
                          ? "bg-[#7C5CFF]/20 border-[#7C5CFF]/50 text-white"
                          : "bg-white/[0.04] border-white/10 text-[#A9A4C2] hover:text-white hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="font-medium text-xs truncate">
                          {idx === 0
                            ? "Latest"
                            : `Version ${assessments.length - idx}`}
                        </p>
                        {idx === 0 && (
                          <span className="text-[10px] bg-[#7C5CFF]/30 text-[#7C5CFF] px-1.5 py-0.5 rounded-md font-medium shrink-0">
                            NEW
                          </span>
                        )}
                      </div>
                      <p className="text-xs opacity-60">{a.totalMarks} marks</p>
                      {/* MCQ / Short / Long count */}
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {a.config?.mcqCount > 0 && (
                          <span className="text-[10px] text-[#7C5CFF] bg-[#7C5CFF]/10 px-1.5 py-0.5 rounded">
                            {a.config.mcqCount} MCQ
                          </span>
                        )}
                        {a.config?.shortCount > 0 && (
                          <span className="text-[10px] text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded">
                            {a.config.shortCount} SQ
                          </span>
                        )}
                        {a.config?.longCount > 0 && (
                          <span className="text-[10px] text-pink-400 bg-pink-400/10 px-1.5 py-0.5 rounded">
                            {a.config.longCount} LQ
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] opacity-40 mt-1">
                        {new Date(a.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </button>
                  ))}
                </div>

                {/* ── Right: Active assessment detail ── */}
                {activeAssessment && (
                  <div className="flex-1 min-w-0">
                    {/* Meta header */}
                    <div className="bg-[#FAF8F3]/[0.06] border border-white/10 rounded-2xl p-4 mb-4">
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex gap-2 flex-wrap">
                          <span className="text-xs text-[#A9A4C2] bg-white/5 px-2 py-0.5 rounded-md">
                            Total: {activeAssessment.totalMarks} marks
                          </span>
                          {activeAssessment.config?.mcqCount > 0 && (
                            <span className="text-xs text-[#7C5CFF] bg-[#7C5CFF]/10 px-2 py-0.5 rounded-md">
                              {activeAssessment.config.mcqCount} MCQs
                              {activeAssessment.config.mcqMarks
                                ? ` × ${activeAssessment.config.mcqMarks}`
                                : ""}
                            </span>
                          )}
                          {activeAssessment.config?.shortCount > 0 && (
                            <span className="text-xs text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-md">
                              {activeAssessment.config.shortCount} Short
                              {activeAssessment.config.shortMarks
                                ? ` × ${activeAssessment.config.shortMarks}`
                                : ""}
                            </span>
                          )}
                          {activeAssessment.config?.longCount > 0 && (
                            <span className="text-xs text-pink-400 bg-pink-400/10 px-2 py-0.5 rounded-md">
                              {activeAssessment.config.longCount} Long
                              {activeAssessment.config.longMarks
                                ? ` × ${activeAssessment.config.longMarks}`
                                : ""}
                            </span>
                          )}
                          <span className="text-xs text-[#A9A4C2]/50 bg-white/5 px-2 py-0.5 rounded-md">
                            {new Date(
                              activeAssessment.createdAt,
                            ).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Edit mode */}
                    {editMode ? (
                      <EditableAssessment
                        assessment={activeAssessment}
                        onSave={handleSaveAssessment}
                      />
                    ) : (
                      <>
                        {/* View switch + download */}
                        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                          <div className="flex gap-2">
                            {["paper", "key"].map((v) => (
                              <button
                                key={v}
                                onClick={() => setActiveAssessmentView(v)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                  activeAssessmentView === v
                                    ? "bg-[#7C5CFF] text-white"
                                    : "bg-white/[0.06] text-[#A9A4C2] hover:text-white"
                                }`}
                              >
                                {v === "paper"
                                  ? "Question paper"
                                  : "Answer key"}
                              </button>
                            ))}
                          </div>
                          <button
                            onClick={() =>
                              activeAssessmentView === "paper"
                                ? generateQuestionPaperPDF(
                                    course,
                                    activeAssessment,
                                  )
                                : generateAnswerKeyPDF(course, activeAssessment)
                            }
                            className={downloadButtonClass}
                          >
                            <DownloadIcon />
                            Download{" "}
                            {activeAssessmentView === "paper"
                              ? "Question Paper"
                              : "Answer Key"}
                          </button>
                        </div>

                        {/* ── Question paper view ── */}
                        {activeAssessmentView === "paper" && (
                          <div className="bg-[#FAF8F3]/[0.06] border border-white/10 rounded-2xl p-6 flex flex-col gap-6">
                            {activeAssessment.mcqs?.length > 0 && (
                              <div>
                                <h4 className="text-white font-medium mb-3 text-sm">
                                  Section A — Multiple choice (
                                  {activeAssessment.config?.mcqMarks || 1} marks
                                  each)
                                </h4>
                                <div className="flex flex-col gap-6">
                                  {activeAssessment.mcqs.map((mcq, i) => (
                                    <div
                                      key={i}
                                      className="border-b border-white/5 pb-4 last:border-0"
                                    >
                                      <p className="text-[#A9A4C2] text-base font-medium mb-3">
                                        {i + 1}. {mcq.question}
                                      </p>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-4">
                                        {mcq.options?.map((opt, oi) => (
                                          <div
                                            key={oi}
                                            className="text-[#A9A4C2]/80 text-sm"
                                          >
                                            <span className="font-semibold mr-1">
                                              {String.fromCharCode(65 + oi)}.
                                            </span>
                                            {opt}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {activeAssessment.shortQuestions?.length > 0 && (
                              <div>
                                <h4 className="text-white font-medium mb-3 text-sm">
                                  Section B — Short questions (
                                  {activeAssessment.config?.shortMarks || 5}{" "}
                                  marks each)
                                </h4>
                                <div className="flex flex-col gap-3 pl-2">
                                  {activeAssessment.shortQuestions.map(
                                    (q, i) => (
                                      <div
                                        key={i}
                                        className="text-[#A9A4C2] text-sm leading-relaxed"
                                      >
                                        {i + 1}. {q.question}
                                      </div>
                                    ),
                                  )}
                                </div>
                              </div>
                            )}

                            {activeAssessment.longQuestions?.length > 0 && (
                              <div>
                                <h4 className="text-white font-medium mb-3 text-sm">
                                  Section C — Long questions (
                                  {activeAssessment.config?.longMarks || 10}{" "}
                                  marks each)
                                </h4>
                                <div className="flex flex-col gap-3 pl-2">
                                  {activeAssessment.longQuestions.map(
                                    (q, i) => (
                                      <div
                                        key={i}
                                        className="text-[#A9A4C2] text-sm leading-relaxed"
                                      >
                                        {i + 1}. {q.question}
                                      </div>
                                    ),
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* ── Answer key view ── */}
                        {activeAssessmentView === "key" && (
                          <div className="bg-[#FAF8F3]/[0.06] border border-white/10 rounded-2xl p-6 flex flex-col gap-6">
                            {activeAssessment.mcqs?.length > 0 && (
                              <div>
                                <h4 className="text-white font-medium mb-3 text-sm">
                                  Section A — Multiple choice
                                </h4>
                                <div className="flex flex-col gap-2 pl-2">
                                  {activeAssessment.mcqs.map((mcq, i) => (
                                    <p
                                      key={i}
                                      className="text-[#A9A4C2] text-sm"
                                    >
                                      <span className="text-white">
                                        {i + 1}.
                                      </span>{" "}
                                      <span className="text-[#7C5CFF] font-medium">
                                        {mcq.correctAnswer}
                                      </span>
                                    </p>
                                  ))}
                                </div>
                              </div>
                            )}

                            {activeAssessment.shortQuestions?.length > 0 && (
                              <div>
                                <h4 className="text-white font-medium mb-3 text-sm">
                                  Section B — Short questions
                                </h4>
                                <div className="flex flex-col gap-4 pl-2">
                                  {activeAssessment.shortQuestions.map(
                                    (q, i) => (
                                      <div key={i}>
                                        <p className="text-white text-sm mb-1">
                                          {i + 1}. {q.question}
                                        </p>
                                        <div className="text-[#A9A4C2] text-sm pl-4 border-l border-[#7C5CFF]/30 py-0.5">
                                          {q.modelAnswer}
                                        </div>
                                      </div>
                                    ),
                                  )}
                                </div>
                              </div>
                            )}

                            {activeAssessment.longQuestions?.length > 0 && (
                              <div>
                                <h4 className="text-white font-medium mb-3 text-sm">
                                  Section C — Long questions
                                </h4>
                                <div className="flex flex-col gap-4 pl-2">
                                  {activeAssessment.longQuestions.map(
                                    (q, i) => (
                                      <div key={i}>
                                        <p className="text-white text-sm mb-1">
                                          {i + 1}. {q.question}
                                        </p>
                                        <div className="text-[#A9A4C2] text-sm pl-4 border-l border-[#7C5CFF]/30 py-0.5 leading-relaxed">
                                          {q.modelAnswer}
                                        </div>
                                      </div>
                                    ),
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════
            ASSIGNMENT TAB
        ══════════════════════════════════════ */}
        {activeTab === "assignment" && (
          <div className="fade-in">
            {loadingAssignments ? (
              <div className="flex items-center gap-3 text-[#A9A4C2] text-sm">
                <div className="w-4 h-4 border-2 border-[#7C5CFF]/30 border-t-[#7C5CFF] rounded-full animate-spin" />
                Loading assignments...
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {/* Top bar */}
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-medium text-sm">
                    {assignments.length > 0
                      ? `${assignments.length} assignment${assignments.length > 1 ? "s" : ""}`
                      : "No assignments yet"}
                  </h3>
                  <button
                    onClick={() => setShowAssignmentModal(true)}
                    className="bg-gradient-to-r from-[#7C5CFF] to-[#6845E8] text-white px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 hover:shadow-lg hover:shadow-violet-500/30"
                  >
                    + New assignment
                  </button>
                </div>

                {/* Empty state */}
                {assignments.length === 0 ? (
                  <div className="bg-[#FAF8F3]/[0.04] border border-white/10 rounded-2xl p-10 text-center">
                    <div className="text-4xl mb-3">📋</div>
                    <p className="text-white font-medium mb-1">
                      No assignments yet
                    </p>
                    <p className="text-[#A9A4C2] text-sm mb-5">
                      Create an assignment from your course syllabus.
                    </p>
                    <button
                      onClick={() => setShowAssignmentModal(true)}
                      className="bg-gradient-to-r from-[#7C5CFF] to-[#6845E8] text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 hover:shadow-lg hover:shadow-violet-500/30"
                    >
                      + Create assignment
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-4 flex-col md:flex-row">
                    {/* ── Left: assignment list ── */}
                    <div className="md:w-56 shrink-0 flex flex-col gap-2">
                      {assignments.map((a) => (
                        <button
                          key={a._id}
                          onClick={() => {
                            setActiveAssignment(a);
                            setAssignmentView("paper");
                          }}
                          className={`text-left px-4 py-3 rounded-xl border text-sm transition-all duration-200 ${
                            activeAssignment?._id === a._id
                              ? "bg-[#7C5CFF]/20 border-[#7C5CFF]/50 text-white"
                              : "bg-white/[0.04] border-white/10 text-[#A9A4C2] hover:text-white hover:border-white/20"
                          }`}
                        >
                          <p className="font-medium truncate">{a.title}</p>
                          <p className="text-xs opacity-60 mt-0.5">
                            {a.questions?.length || 0} questions ·{" "}
                            {a.totalMarks} marks
                          </p>
                          {a.dueDate && (
                            <p className="text-xs opacity-50 mt-0.5">
                              Due:{" "}
                              {new Date(a.dueDate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                          )}
                        </button>
                      ))}
                    </div>

                    {/* ── Right: active assignment detail ── */}
                    {activeAssignment && (
                      <div className="flex-1 min-w-0">
                        {/* Meta header */}
                        <div className="bg-[#FAF8F3]/[0.06] border border-white/10 rounded-2xl p-5 mb-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h4 className="text-white font-medium text-base mb-2">
                                {activeAssignment.title}
                              </h4>
                              <div className="flex gap-2 flex-wrap">
                                <span className="text-xs text-[#A9A4C2] bg-white/5 px-2 py-0.5 rounded-md">
                                  {activeAssignment.questions?.length || 0}{" "}
                                  questions
                                </span>
                                <span className="text-xs text-[#A9A4C2] bg-white/5 px-2 py-0.5 rounded-md">
                                  {activeAssignment.totalMarks} marks
                                </span>
                                {activeAssignment.dueDate && (
                                  <span className="text-xs text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md">
                                    Due:{" "}
                                    {new Date(
                                      activeAssignment.dueDate,
                                    ).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
                                  </span>
                                )}
                                {activeAssignment.coveredWeeks?.length > 0 && (
                                  <span className="text-xs text-[#7C5CFF] bg-[#7C5CFF]/10 px-2 py-0.5 rounded-md">
                                    {activeAssignment.coveredWeeks.join(", ")}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Delete */}
                            <button
                              onClick={() =>
                                handleDeleteAssignment(activeAssignment._id)
                              }
                              className="text-[#FF6B5E]/60 hover:text-[#FF6B5E] text-xs px-3 py-1.5 rounded-lg border border-transparent hover:border-[#FF6B5E]/30 hover:bg-[#FF6B5E]/10 transition-all duration-200 shrink-0"
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        {/* Edit mode */}
                        {editMode ? (
                          <EditableAssignment
                            assignment={activeAssignment}
                            onSave={handleSaveAssignment}
                          />
                        ) : (
                          <>
                            {/* View switch + PDF download */}
                            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                              <div className="flex gap-2">
                                {["paper", "key"].map((v) => (
                                  <button
                                    key={v}
                                    onClick={() => setAssignmentView(v)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                      assignmentView === v
                                        ? "bg-[#7C5CFF] text-white"
                                        : "bg-white/[0.06] text-[#A9A4C2] hover:text-white"
                                    }`}
                                  >
                                    {v === "paper" ? "Questions" : "Answer key"}
                                  </button>
                                ))}
                              </div>

                              <button
                                onClick={() =>
                                  assignmentView === "paper"
                                    ? generateAssignmentPDF(
                                        course,
                                        activeAssignment,
                                      )
                                    : generateAssignmentAnswerKeyPDF(
                                        course,
                                        activeAssignment,
                                      )
                                }
                                className={downloadButtonClass}
                              >
                                <DownloadIcon />
                                Download{" "}
                                {assignmentView === "paper"
                                  ? "Assignment"
                                  : "Answer Key"}
                              </button>
                            </div>

                            {/* Questions view */}
                            {assignmentView === "paper" && (
                              <div className="bg-[#FAF8F3]/[0.06] border border-white/10 rounded-2xl p-5 flex flex-col gap-5">
                                {activeAssignment.questions?.filter(
                                  (q) => q.type === "mcq",
                                ).length > 0 && (
                                  <div>
                                    <h4 className="text-white font-medium mb-3 text-sm">
                                      Section A — Multiple Choice
                                    </h4>
                                    <div className="flex flex-col gap-5">
                                      {activeAssignment.questions
                                        .filter((q) => q.type === "mcq")
                                        .map((q, i) => (
                                          <div
                                            key={i}
                                            className="border-b border-white/5 pb-4 last:border-0"
                                          >
                                            <p className="text-[#A9A4C2] text-sm font-medium mb-2">
                                              {i + 1}. {q.question}
                                              <span className="ml-2 text-[#A9A4C2]/40 text-xs font-normal">
                                                ({q.marks} mark
                                                {q.marks !== 1 ? "s" : ""})
                                              </span>
                                            </p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 pl-3">
                                              {q.options?.map((opt, oi) => (
                                                <div
                                                  key={oi}
                                                  className="text-[#A9A4C2]/80 text-xs"
                                                >
                                                  <span className="font-semibold mr-1">
                                                    {String.fromCharCode(
                                                      65 + oi,
                                                    )}
                                                    .
                                                  </span>
                                                  {opt}
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        ))}
                                    </div>
                                  </div>
                                )}

                                {activeAssignment.questions?.filter(
                                  (q) => q.type === "short",
                                ).length > 0 && (
                                  <div>
                                    <h4 className="text-white font-medium mb-3 text-sm">
                                      Section B — Short Questions
                                    </h4>
                                    <div className="flex flex-col gap-3 pl-2">
                                      {activeAssignment.questions
                                        .filter((q) => q.type === "short")
                                        .map((q, i) => (
                                          <div
                                            key={i}
                                            className="text-[#A9A4C2] text-sm leading-relaxed"
                                          >
                                            {i + 1}. {q.question}
                                            <span className="ml-2 text-[#A9A4C2]/40 text-xs">
                                              ({q.marks} marks)
                                            </span>
                                          </div>
                                        ))}
                                    </div>
                                  </div>
                                )}

                                {activeAssignment.questions?.filter(
                                  (q) => q.type === "long",
                                ).length > 0 && (
                                  <div>
                                    <h4 className="text-white font-medium mb-3 text-sm">
                                      Section C — Long Questions
                                    </h4>
                                    <div className="flex flex-col gap-3 pl-2">
                                      {activeAssignment.questions
                                        .filter((q) => q.type === "long")
                                        .map((q, i) => (
                                          <div
                                            key={i}
                                            className="text-[#A9A4C2] text-sm leading-relaxed"
                                          >
                                            {i + 1}. {q.question}
                                            <span className="ml-2 text-[#A9A4C2]/40 text-xs">
                                              ({q.marks} marks)
                                            </span>
                                          </div>
                                        ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Answer key view */}
                            {assignmentView === "key" && (
                              <div className="bg-[#FAF8F3]/[0.06] border border-white/10 rounded-2xl p-5 flex flex-col gap-5">
                                {activeAssignment.questions?.filter(
                                  (q) => q.type === "mcq",
                                ).length > 0 && (
                                  <div>
                                    <h4 className="text-white font-medium mb-3 text-sm">
                                      Section A — Multiple Choice
                                    </h4>
                                    <div className="flex flex-col gap-2 pl-2">
                                      {activeAssignment.questions
                                        .filter((q) => q.type === "mcq")
                                        .map((q, i) => (
                                          <p
                                            key={i}
                                            className="text-[#A9A4C2] text-sm"
                                          >
                                            <span className="text-white">
                                              {i + 1}.
                                            </span>{" "}
                                            <span className="text-[#7C5CFF] font-medium">
                                              {q.correctAnswer}
                                            </span>
                                          </p>
                                        ))}
                                    </div>
                                  </div>
                                )}

                                {activeAssignment.questions?.filter(
                                  (q) => q.type === "short",
                                ).length > 0 && (
                                  <div>
                                    <h4 className="text-white font-medium mb-3 text-sm">
                                      Section B — Short Questions
                                    </h4>
                                    <div className="flex flex-col gap-4 pl-2">
                                      {activeAssignment.questions
                                        .filter((q) => q.type === "short")
                                        .map((q, i) => (
                                          <div key={i}>
                                            <p className="text-white text-sm mb-1">
                                              {i + 1}. {q.question}
                                            </p>
                                            <div className="text-[#A9A4C2] text-sm pl-4 border-l border-blue-400/30 py-0.5 leading-relaxed">
                                              {q.modelAnswer}
                                            </div>
                                          </div>
                                        ))}
                                    </div>
                                  </div>
                                )}

                                {activeAssignment.questions?.filter(
                                  (q) => q.type === "long",
                                ).length > 0 && (
                                  <div>
                                    <h4 className="text-white font-medium mb-3 text-sm">
                                      Section C — Long Questions
                                    </h4>
                                    <div className="flex flex-col gap-4 pl-2">
                                      {activeAssignment.questions
                                        .filter((q) => q.type === "long")
                                        .map((q, i) => (
                                          <div key={i}>
                                            <p className="text-white text-sm mb-1">
                                              {i + 1}. {q.question}
                                            </p>
                                            <div className="text-[#A9A4C2] text-sm pl-4 border-l border-pink-400/30 py-0.5 leading-relaxed">
                                              {q.modelAnswer}
                                            </div>
                                          </div>
                                        ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      {/* /container */}

      {/* ── Modals ── */}
      {showAssessmentModal && (
        <AssessmentFormModal
          syllabus={course.syllabus}
          onClose={() => setShowAssessmentModal(false)}
          onSubmit={handleGenerateAssessment}
          loading={generatingAssessment}
        />
      )}

      {showAssignmentModal && (
        <AssignmentFormModal
          syllabus={course.syllabus}
          onClose={() => setShowAssignmentModal(false)}
          onSubmit={handleGenerateAssignment}
          loading={generatingAssignment}
        />
      )}

      {/* ── Toasts ── */}
      <Toast
        message={successMsg}
        type="success"
        onDismiss={() => setSuccessMsg("")}
      />
      <Toast
        message={errorMsg}
        type="error"
        onDismiss={() => setErrorMsg("")}
      />
    </div>
  );
}

export default CourseDetail;
