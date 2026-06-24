import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getCourses } from "../services/courseService";
import { getAssessmentsByCourse } from "../services/assessmentService";

// ── Mini bar chart component ──────────────────
function Bar({ label, value, max, color = "#7C5CFF" }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-[#A9A4C2] text-xs w-24 shrink-0 truncate">{label}</span>
      <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-white text-xs w-6 text-right">{value}</span>
    </div>
  );
}

// ── Stat card ─────────────────────────────────
function StatCard({ label, value, sub, delay = 0 }) {
  return (
    <div
      className="rise-in bg-[#FAF8F3]/[0.06] border border-white/10 rounded-2xl p-5"
      style={{ animationDelay: `${delay}s` }}
    >
      <p className="text-[#A9A4C2] text-xs font-medium uppercase tracking-widest mb-2">
        {label}
      </p>
      <p className="font-display text-3xl font-bold text-white">{value}</p>
      {sub && <p className="text-[#A9A4C2] text-xs mt-1">{sub}</p>}
    </div>
  );
}

export default function Analytics() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses]       = useState([]);
  const [allAssessments, setAllAssessments] = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    if (!user?.email) return;
    let isMounted = true;

    const load = async () => {
      try {
        // 1. Load all courses
        const courseData = await getCourses();
        const fetchedCourses = courseData.courses || [];
        if (!isMounted) return;
        setCourses(fetchedCourses);

        // 2. Load assessments for every course in parallel
        const results = await Promise.allSettled(
          fetchedCourses.map((c) => getAssessmentsByCourse(c._id))
        );

        const merged = results.flatMap((r) =>
          r.status === "fulfilled" ? r.value.assessments || [] : []
        );

        if (isMounted) setAllAssessments(merged);
      } catch (err) {
        console.error("Analytics load error:", err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();
    return () => { isMounted = false; };
  }, [user]);

  // ── Derived stats ───────────────────────────
  const totalCourses     = courses.length;
  const totalAssessments = allAssessments.length;

  const totalQuestions = allAssessments.reduce(
    (sum, a) =>
      sum +
      (a.mcqs?.length || 0) +
      (a.shortQuestions?.length || 0) +
      (a.longQuestions?.length || 0),
    0
  );

  const avgMarks =
    totalAssessments > 0
      ? Math.round(
          allAssessments.reduce((s, a) => s + (a.totalMarks || 0), 0) /
            totalAssessments
        )
      : 0;

  // Difficulty distribution across ALL assessments
  const diffTotals = allAssessments.reduce(
    (acc, a) => {
      acc.easy   += a.difficultyDistribution?.easyPercent   || 0;
      acc.medium += a.difficultyDistribution?.mediumPercent || 0;
      acc.hard   += a.difficultyDistribution?.hardPercent   || 0;
      return acc;
    },
    { easy: 0, medium: 0, hard: 0 }
  );
  const avgEasy   = totalAssessments > 0 ? Math.round(diffTotals.easy   / totalAssessments) : 0;
  const avgMedium = totalAssessments > 0 ? Math.round(diffTotals.medium / totalAssessments) : 0;
  const avgHard   = totalAssessments > 0 ? Math.round(diffTotals.hard   / totalAssessments) : 0;

  // Bloom's level distribution
  const bloomCount = {};
  allAssessments.forEach((a) => {
    [...(a.mcqs || []), ...(a.shortQuestions || []), ...(a.longQuestions || [])].forEach(
      (q) => {
        if (q.bloomLevel) {
          bloomCount[q.bloomLevel] = (bloomCount[q.bloomLevel] || 0) + 1;
        }
      }
    );
  });
  const bloomMax = Math.max(...Object.values(bloomCount), 1);

  // Courses by difficulty
  const courseDiffCount = courses.reduce((acc, c) => {
    const d = c.difficulty || "Unknown";
    acc[d] = (acc[d] || 0) + 1;
    return acc;
  }, {});

  // Most active courses (by assessment count)
  const assessmentsByCourse = courses
    .map((c) => ({
      title: c.title,
      count: allAssessments.filter((a) => String(a.courseId) === String(c._id)).length,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const maxCourseAssessments = Math.max(...assessmentsByCourse.map((c) => c.count), 1);

  // Question type breakdown
  const qTypeTotals = allAssessments.reduce(
    (acc, a) => {
      acc.mcq   += a.mcqs?.length           || 0;
      acc.short += a.shortQuestions?.length || 0;
      acc.long  += a.longQuestions?.length  || 0;
      return acc;
    },
    { mcq: 0, short: 0, long: 0 }
  );
  const qTypeMax = Math.max(qTypeTotals.mcq, qTypeTotals.short, qTypeTotals.long, 1);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#15132B]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[#7C5CFF]/30 border-t-[#7C5CFF] rounded-full animate-spin" />
          <span className="text-[#A9A4C2] text-xs tracking-widest uppercase">
            Crunching data…
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#15132B] ruled-bg">
      {/* Blobs */}
      <div
        className="absolute w-[400px] h-[400px] rounded-full blob-a opacity-15 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #7C5CFF, transparent 70%)", top: "-5%", right: "-5%" }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-8">

        {/* Back */}
        <button
          onClick={() => navigate("/")}
          className="rise-in text-[#A9A4C2] hover:text-white text-sm font-medium mb-6 flex items-center gap-2 transition-colors duration-200"
        >
          ← Back to dashboard
        </button>

        {/* Title */}
        <div className="rise-in mb-8" style={{ animationDelay: "0.05s" }}>
          <h1 className="font-display text-3xl font-bold text-white mb-1">
            Analytics
          </h1>
          <p className="text-[#A9A4C2] text-sm">
            Overview of your courses and assessments.
          </p>
        </div>

        {/* ── Top stat cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Courses"     value={totalCourses}     delay={0.05} />
          <StatCard label="Assessments"       value={totalAssessments} delay={0.10} />
          <StatCard label="Questions Generated" value={totalQuestions} delay={0.15} />
          <StatCard label="Avg. Marks / Paper"  value={avgMarks || "—"} delay={0.20} />
        </div>

        {/* ── Row 1: Difficulty + Question types ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

          {/* Difficulty distribution */}
          <div
            className="rise-in bg-[#FAF8F3]/[0.06] border border-white/10 rounded-2xl p-5"
            style={{ animationDelay: "0.25s" }}
          >
            <h3 className="text-white text-sm font-medium mb-4">
              Avg. Difficulty Distribution
            </h3>
            {totalAssessments === 0 ? (
              <p className="text-[#A9A4C2] text-xs">No assessments yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                <Bar label="Easy"   value={avgEasy}   max={100} color="#34d399" />
                <Bar label="Medium" value={avgMedium} max={100} color="#fbbf24" />
                <Bar label="Hard"   value={avgHard}   max={100} color="#f87171" />
              </div>
            )}
          </div>

          {/* Question type breakdown */}
          <div
            className="rise-in bg-[#FAF8F3]/[0.06] border border-white/10 rounded-2xl p-5"
            style={{ animationDelay: "0.30s" }}
          >
            <h3 className="text-white text-sm font-medium mb-4">
              Question Type Breakdown
            </h3>
            {totalQuestions === 0 ? (
              <p className="text-[#A9A4C2] text-xs">No questions generated yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                <Bar label="MCQs"            value={qTypeTotals.mcq}   max={qTypeMax} color="#7C5CFF" />
                <Bar label="Short Questions" value={qTypeTotals.short} max={qTypeMax} color="#60a5fa" />
                <Bar label="Long Questions"  value={qTypeTotals.long}  max={qTypeMax} color="#f472b6" />
              </div>
            )}
          </div>
        </div>

        {/* ── Row 2: Bloom's + Course difficulty ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

          {/* Bloom's taxonomy distribution */}
          <div
            className="rise-in bg-[#FAF8F3]/[0.06] border border-white/10 rounded-2xl p-5"
            style={{ animationDelay: "0.35s" }}
          >
            <h3 className="text-white text-sm font-medium mb-4">
              Bloom's Taxonomy Distribution
            </h3>
            {Object.keys(bloomCount).length === 0 ? (
              <p className="text-[#A9A4C2] text-xs">No data yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {Object.entries(bloomCount)
                  .sort((a, b) => b[1] - a[1])
                  .map(([level, count]) => (
                    <Bar
                      key={level}
                      label={level}
                      value={count}
                      max={bloomMax}
                      color="#7C5CFF"
                    />
                  ))}
              </div>
            )}
          </div>

          {/* Courses by difficulty */}
          <div
            className="rise-in bg-[#FAF8F3]/[0.06] border border-white/10 rounded-2xl p-5"
            style={{ animationDelay: "0.40s" }}
          >
            <h3 className="text-white text-sm font-medium mb-4">
              Courses by Difficulty
            </h3>
            {Object.keys(courseDiffCount).length === 0 ? (
              <p className="text-[#A9A4C2] text-xs">No courses yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {Object.entries(courseDiffCount).map(([diff, count]) => {
                  const colorMap = {
                    Beginner:     "#34d399",
                    Intermediate: "#fbbf24",
                    Advanced:     "#f87171",
                  };
                  return (
                    <Bar
                      key={diff}
                      label={diff}
                      value={count}
                      max={totalCourses}
                      color={colorMap[diff] || "#7C5CFF"}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Row 3: Most assessed courses ── */}
        <div
          className="rise-in bg-[#FAF8F3]/[0.06] border border-white/10 rounded-2xl p-5"
          style={{ animationDelay: "0.45s" }}
        >
          <h3 className="text-white text-sm font-medium mb-4">
            Most Assessed Courses (Top 5)
          </h3>
          {assessmentsByCourse.every((c) => c.count === 0) ? (
            <p className="text-[#A9A4C2] text-xs">No assessments generated yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {assessmentsByCourse.map((c) => (
                <Bar
                  key={c.title}
                  label={c.title}
                  value={c.count}
                  max={maxCourseAssessments}
                  color="#7C5CFF"
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}