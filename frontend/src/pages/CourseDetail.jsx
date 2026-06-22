import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCourseById } from "../services/courseService";
import { createAssessment, getAssessmentsByCourse } from "../services/assessmentService";
import { useAuth } from "../hooks/useAuth";
import AssessmentFormModal from "../components/AssessmentFormModal";
import MathText from "../components/MathText";
import {
  generateSyllabusPDF,
  generateStudyMaterialPDF,
  generateQuestionPaperPDF,
  generateAnswerKeyPDF,
} from "../utils/pdfGenerator";

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

function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("syllabus");

  const [assessments, setAssessments] = useState([]);
  const [loadingAssessments, setLoadingAssessments] = useState(true);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [generatingAssessment, setGeneratingAssessment] = useState(false);
  const [assessmentError, setAssessmentError] = useState("");
  const [activeAssessmentView, setActiveAssessmentView] = useState("paper");

  useEffect(() => {
    let isMounted = true;

    const loadCourse = async () => {
      try {
        const data = await getCourseById(id);

        if (isMounted) {
          const fetchedCourse = data.course;

          if (Array.isArray(fetchedCourse.studyMaterial)) {
            fetchedCourse.studyMaterial = fetchedCourse.studyMaterial[0] || {};
          }

          setCourse(fetchedCourse);
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

  useEffect(() => {
    let isMounted = true;

    const loadAssessments = async () => {
      try {
        const data = await getAssessmentsByCourse(id);
        if (isMounted) setAssessments(data.assessments);
      } catch (err) {
        console.error("Failed to load assessments:", err.message);
      } finally {
        if (isMounted) setLoadingAssessments(false);
      }
    };

    loadAssessments();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const refreshAssessments = async () => {
    try {
      const data = await getAssessmentsByCourse(id);
      setAssessments(data.assessments);
    } catch (err) {
      console.error("Failed to refresh assessments:", err.message);
    }
  };

  const handleGenerateAssessment = async (formData) => {
    setGeneratingAssessment(true);
    setAssessmentError("");

    try {
      await createAssessment({ ...formData, courseId: id, email: user.email });
      await refreshAssessments();
      setShowAssessmentModal(false);
    } catch (err) {
      setAssessmentError(
        err.response?.data?.message || "Failed to generate assessment. Try again."
      );
    } finally {
      setGeneratingAssessment(false);
    }
  };

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
          <p className="text-white font-medium mb-4">{error || "Course not found."}</p>
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

  const tabs = [
    { id: "syllabus", label: "Syllabus" },
    { id: "material", label: "Study material" },
    { id: "assessment", label: "Assessment" },
  ];

  const latestAssessment = assessments[0];

  const downloadButtonClass =
    "group flex items-center gap-2 bg-gradient-to-r from-white/[0.08] to-white/[0.04] hover:from-[#7C5CFF]/20 hover:to-[#7C5CFF]/10 border border-white/10 hover:border-[#7C5CFF]/40 text-[#A9A4C2] hover:text-white text-xs font-medium px-4 py-2.5 rounded-xl transition-all duration-200 hover:shadow-md hover:shadow-violet-500/10 hover:-translate-y-0.5 active:scale-[0.97]";

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#15132B] ruled-bg">
      <div
        className="absolute w-[480px] h-[480px] rounded-full blob-a opacity-15 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #7C5CFF, transparent 70%)", top: "-10%", right: "-10%" }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-8">
        <button
          onClick={() => navigate("/")}
          className="rise-in text-[#A9A4C2] hover:text-white text-sm font-medium mb-6 flex items-center gap-2 transition-colors duration-200"
        >
          ← Back to dashboard
        </button>

        <div className="rise-in mb-8" style={{ animationDelay: "0.05s" }}>
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

        {/* Tabs */}
        <div
          className="rise-in flex gap-1 border-b border-white/10 mb-6"
          style={{ animationDelay: "0.1s" }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-5 py-3 text-sm font-medium transition-colors duration-200 ${
                activeTab === tab.id ? "text-white" : "text-[#A9A4C2] hover:text-white"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#7C5CFF] rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Syllabus Tab */}
        {activeTab === "syllabus" && (
          <div className="fade-in">
            <div className="flex justify-end mb-4">
              <button onClick={() => generateSyllabusPDF(course)} className={downloadButtonClass}>
                <DownloadIcon />
                Download PDF
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {course.syllabus?.map((week, index) => (
                <div
                  key={index}
                  className="bg-[#FAF8F3]/[0.06] border border-white/10 rounded-2xl p-5"
                >
                  <h3 className="text-white font-medium mb-2">{week.week}</h3>
                  <ul className="flex flex-col gap-1.5">
                    {week.topics?.map((topic, i) => (
                      <li key={i} className="text-[#A9A4C2] text-sm flex items-start gap-2">
                        <span className="text-[#7C5CFF] mt-1">•</span>
                        <MathText text={topic} />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Study Material Tab */}
        {activeTab === "material" && course.studyMaterial && (
          <div className="fade-in">
            <div className="flex justify-end mb-4">
              <button onClick={() => generateStudyMaterialPDF(course)} className={downloadButtonClass}>
                <DownloadIcon />
                Download PDF
              </button>
            </div>

            <div className="bg-[#FAF8F3]/[0.06] border border-white/10 rounded-2xl p-6 flex flex-col gap-6">
              {course.studyMaterial.summary && (
                <div>
                  <h4 className="text-white font-medium mb-2 text-sm">Summary</h4>
                  <p className="text-[#A9A4C2] text-sm leading-relaxed">
                    <MathText text={course.studyMaterial.summary} />
                  </p>
                </div>
              )}

              {course.studyMaterial.keyConcepts?.length > 0 && (
                <div>
                  <h4 className="text-white font-medium mb-2 text-sm">Key concepts</h4>
                  <ul className="flex flex-col gap-1.5">
                    {course.studyMaterial.keyConcepts.map((item, i) => (
                      <li key={i} className="text-[#A9A4C2] text-sm flex items-start gap-2">
                        <span className="text-[#7C5CFF] mt-1">•</span>
                        <MathText text={item} />
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {course.studyMaterial.definitions?.length > 0 && (
                <div>
                  <h4 className="text-white font-medium mb-2 text-sm">Definitions</h4>
                  <ul className="flex flex-col gap-1.5">
                    {course.studyMaterial.definitions.map((item, i) => (
                      <li key={i} className="text-[#A9A4C2] text-sm flex items-start gap-2">
                        <span className="text-[#7C5CFF] mt-1">•</span>
                        <MathText text={item} />
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {course.studyMaterial.realWorldExamples?.length > 0 && (
                <div>
                  <h4 className="text-white font-medium mb-2 text-sm">Real-world examples</h4>
                  <ul className="flex flex-col gap-1.5">
                    {course.studyMaterial.realWorldExamples.map((item, i) => (
                      <li key={i} className="text-[#A9A4C2] text-sm flex items-start gap-2">
                        <span className="text-[#7C5CFF] mt-1">•</span>
                        <MathText text={item} />
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {course.studyMaterial.interviewQuestions?.length > 0 && (
                <div>
                  <h4 className="text-white font-medium mb-2 text-sm">Interview questions</h4>
                  <ul className="flex flex-col gap-1.5">
                    {course.studyMaterial.interviewQuestions.map((item, i) => (
                      <li key={i} className="text-[#A9A4C2] text-sm flex items-start gap-2">
                        <span className="text-[#7C5CFF] mt-1">•</span>
                        <MathText text={item} />
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {course.studyMaterial.furtherReading?.length > 0 && (
                <div>
                  <h4 className="text-white font-medium mb-2 text-sm">Further reading</h4>
                  <ul className="flex flex-col gap-1.5">
                    {course.studyMaterial.furtherReading.map((item, i) => (
                      <li key={i} className="text-[#A9A4C2] text-sm flex items-start gap-2">
                        <span className="text-[#7C5CFF] mt-1">•</span>
                        <MathText text={item} />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Assessment Tab */}
        {activeTab === "assessment" && (
          <div className="fade-in">
            {loadingAssessments ? (
              <div className="flex items-center gap-3 text-[#A9A4C2] text-sm">
                <div className="w-4 h-4 border-2 border-[#7C5CFF]/30 border-t-[#7C5CFF] rounded-full animate-spin" />
                Loading assessments...
              </div>
            ) : !latestAssessment ? (
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
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="text-white font-medium text-sm">
                    Total marks: {latestAssessment.totalMarks}
                  </span>
                  <button
                    onClick={() => setShowAssessmentModal(true)}
                    className="text-[#7C5CFF] hover:text-[#9B82FF] text-sm font-medium transition-colors duration-200"
                  >
                    Regenerate
                  </button>
                </div>

                {/* Question Paper / Answer Key switch + download button */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveAssessmentView("paper")}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        activeAssessmentView === "paper"
                          ? "bg-[#7C5CFF] text-white"
                          : "bg-white/[0.06] text-[#A9A4C2] hover:text-white"
                      }`}
                    >
                      Question paper
                    </button>
                    <button
                      onClick={() => setActiveAssessmentView("key")}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        activeAssessmentView === "key"
                          ? "bg-[#7C5CFF] text-white"
                          : "bg-white/[0.06] text-[#A9A4C2] hover:text-white"
                      }`}
                    >
                      Answer key
                    </button>
                  </div>

                  <button
                    onClick={() =>
                      activeAssessmentView === "paper"
                        ? generateQuestionPaperPDF(course, latestAssessment)
                        : generateAnswerKeyPDF(course, latestAssessment)
                    }
                    className={downloadButtonClass}
                  >
                    <DownloadIcon />
                    Download {activeAssessmentView === "paper" ? "Question Paper" : "Answer Key"}
                  </button>
                </div>

                {/* Question Paper View */}
                {activeAssessmentView === "paper" && (
                  <div className="bg-[#FAF8F3]/[0.06] border border-white/10 rounded-2xl p-6 flex flex-col gap-6">
                    {latestAssessment.mcqs?.length > 0 && (
                      <div>
                        <h4 className="text-white font-medium mb-3 text-sm">
                          Section A — Multiple choice ({latestAssessment.config?.mcqMarks || 1} marks each)
                        </h4>
                        <div className="flex flex-col gap-6">
                          {latestAssessment.mcqs.map((mcq, i) => (
                            <div key={i} className="border-b border-white/5 pb-4 last:border-0">
                              <p className="text-[#A9A4C2] text-base font-medium mb-3">
                                {i + 1}. <MathText text={mcq.question} />
                              </p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-4">
                                {mcq.options?.map((opt, oi) => (
                                  <div key={oi} className="text-[#A9A4C2]/80 text-sm">
                                    <span className="font-semibold mr-1">{String.fromCharCode(65 + oi)}.</span>{" "}
                                    <MathText text={opt} />
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {latestAssessment.shortQuestions?.length > 0 && (
                      <div>
                        <h4 className="text-white font-medium mb-3 text-sm">
                          Section B — Short questions ({latestAssessment.config?.shortMarks || 5} marks each)
                        </h4>
                        <div className="flex flex-col gap-3 pl-2">
                          {latestAssessment.shortQuestions.map((q, i) => (
                            <div key={i} className="text-[#A9A4C2] text-sm leading-relaxed">
                              {i + 1}. <MathText text={q.question} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {latestAssessment.longQuestions?.length > 0 && (
                      <div>
                        <h4 className="text-white font-medium mb-3 text-sm">
                          Section C — Long questions ({latestAssessment.config?.longMarks || 10} marks each)
                        </h4>
                        <div className="flex flex-col gap-3 pl-2">
                          {latestAssessment.longQuestions.map((q, i) => (
                            <div key={i} className="text-[#A9A4C2] text-sm leading-relaxed">
                              {i + 1}. <MathText text={q.question} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Answer Key View */}
                {activeAssessmentView === "key" && (
                  <div className="bg-[#FAF8F3]/[0.06] border border-white/10 rounded-2xl p-6 flex flex-col gap-6">
                    {latestAssessment.mcqs?.length > 0 && (
                      <div>
                        <h4 className="text-white font-medium mb-3 text-sm">
                          Section A — Multiple choice
                        </h4>
                        <div className="flex flex-col gap-2 pl-2">
                          {latestAssessment.mcqs.map((mcq, i) => (
                            <p key={i} className="text-[#A9A4C2] text-sm">
                              <span className="text-white">{i + 1}.</span>{" "}
                              <span className="text-[#7C5CFF] font-medium">
                                <MathText text={mcq.correctAnswer} />
                              </span>
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    {latestAssessment.shortQuestions?.length > 0 && (
                      <div>
                        <h4 className="text-white font-medium mb-3 text-sm">
                          Section B — Short questions
                        </h4>
                        <div className="flex flex-col gap-4 pl-2">
                          {latestAssessment.shortQuestions.map((q, i) => (
                            <div key={i}>
                              <p className="text-white text-sm mb-1">
                                {i + 1}. <MathText text={q.question} />
                              </p>
                              <div className="text-[#A9A4C2] text-sm pl-4 border-l border-[#7C5CFF]/30 py-0.5">
                                <MathText text={q.modelAnswer} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {latestAssessment.longQuestions?.length > 0 && (
                      <div>
                        <h4 className="text-white font-medium mb-3 text-sm">
                          Section C — Long questions
                        </h4>
                        <div className="flex flex-col gap-4 pl-2">
                          {latestAssessment.longQuestions.map((q, i) => (
                            <div key={i}>
                              <p className="text-white text-sm mb-1">
                                {i + 1}. <MathText text={q.question} />
                              </p>
                              <div className="text-[#A9A4C2] text-sm pl-4 border-l border-[#7C5CFF]/30 py-0.5 leading-relaxed">
                                <MathText text={q.modelAnswer} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {showAssessmentModal && (
        <AssessmentFormModal
          syllabus={course.syllabus}
          onClose={() => setShowAssessmentModal(false)}
          onSubmit={handleGenerateAssessment}
          loading={generatingAssessment}
        />
      )}

      {assessmentError && (
        <div className="fixed bottom-6 right-6 bg-[#FF6B5E]/10 border border-[#FF6B5E]/30 text-[#FF6B5E] px-4 py-3 rounded-xl text-sm fade-in">
          {assessmentError}
        </div>
      )}
    </div>
  );
}

export default CourseDetail;