import { useState } from "react";

const BLOOM_LEVELS = [
  "Knowledge",
  "Understanding",
  "Application",
  "Analysis",
  "Evaluation",
];

const QUESTION_TYPES = [
  { value: "mixed", label: "Mixed (MCQ + Short + Long)" },
  { value: "mcq",   label: "MCQ only" },
  { value: "short", label: "Short questions only" },
  { value: "long",  label: "Long questions only" },
];

function AssignmentFormModal({ syllabus, onClose, onSubmit, loading }) {
  const [title,         setTitle]         = useState("");
  const [questionCount, setQuestionCount] = useState(5);
  const [questionType,  setQuestionType]  = useState("mixed");
  const [totalMarks,    setTotalMarks]    = useState(20);
  const [dueDate,       setDueDate]       = useState("");
  const [bloomLevel,    setBloomLevel]    = useState("Understanding");
  const [easyPercent,   setEasyPercent]   = useState(30);
  const [mediumPercent, setMediumPercent] = useState(50);
  const [hardPercent,   setHardPercent]   = useState(20);
  const [selectedWeeks, setSelectedWeeks] = useState(
    syllabus?.map((w) => w.week) || []
  );

  const [titleError,      setTitleError]      = useState("");
  const [weekError,       setWeekError]       = useState("");
  const [difficultyError, setDifficultyError] = useState("");
  const [cooldown,        setCooldown]        = useState(0);

  const isDisabled      = loading || cooldown > 0;
  const difficultyTotal = easyPercent + mediumPercent + hardPercent;

  const toggleWeek = (week) =>
    setSelectedWeeks((prev) =>
      prev.includes(week) ? prev.filter((w) => w !== week) : [...prev, week]
    );

  const toggleAllWeeks = () =>
    setSelectedWeeks(
      selectedWeeks.length === syllabus.length
        ? []
        : syllabus.map((w) => w.week)
    );

  const startCooldown = () => {
    setCooldown(8);
    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isDisabled) return;

    // Validation
    if (!title.trim()) {
      setTitleError("Assignment title is required.");
      return;
    }
    setTitleError("");

    if (selectedWeeks.length === 0) {
      setWeekError("Select at least one week.");
      return;
    }
    setWeekError("");

    if (difficultyTotal !== 100) {
      setDifficultyError(
        `Must add up to 100% (currently ${difficultyTotal}%).`
      );
      return;
    }
    setDifficultyError("");

    onSubmit({
      title: title.trim(),
      questionCount,
      questionType,
      totalMarks,
      dueDate: dueDate || null,
      bloomLevel,
      easyPercent,
      mediumPercent,
      hardPercent,
      weeks: selectedWeeks,
    });

    startCooldown();
  };

  const inputClass =
    "w-full px-3 py-2.5 rounded-xl bg-white/[0.07] border border-white/10 text-white text-sm outline-none focus:border-[#7C5CFF] focus:bg-white/[0.1] transition-all duration-200";

  const selectClass =
    "w-full px-3 py-2.5 rounded-xl bg-white/[0.07] border border-white/10 text-white text-sm outline-none focus:border-[#7C5CFF] focus:bg-white/[0.1] transition-all duration-200";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="rise-in bg-[#1C1A33] border border-white/10 shadow-2xl rounded-3xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-bold text-white">
            Create assignment
          </h2>
          <button
            onClick={onClose}
            className="text-[#A9A4C2] hover:text-white transition-colors duration-200 text-xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* Title */}
          <div>
            <label className="text-[#A9A4C2] text-xs font-medium uppercase tracking-wide mb-1.5 block">
              Assignment title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Week 1-3 Assignment"
              className={inputClass}
            />
            {titleError && (
              <p className="text-[#FF6B5E] text-xs mt-1">{titleError}</p>
            )}
          </div>

          {/* Question type + count */}
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-4">
            <p className="text-white text-sm font-medium mb-3">Questions</p>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-[#A9A4C2] text-xs mb-1.5 block">
                  Question type
                </label>
                <select
                  value={questionType}
                  onChange={(e) => setQuestionType(e.target.value)}
                  className={selectClass}
                >
                  {QUESTION_TYPES.map((t) => (
                    <option key={t.value} value={t.value} className="bg-[#1C1A33]">
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-[#A9A4C2] text-xs mb-1.5 block">
                    Total questions
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className={inputClass}
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[#A9A4C2] text-xs mb-1.5 block">
                    Total marks
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(Number(e.target.value))}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bloom's level */}
          <div>
            <label className="text-[#A9A4C2] text-xs font-medium uppercase tracking-wide mb-1.5 block">
              Bloom's level focus
            </label>
            <select
              value={bloomLevel}
              onChange={(e) => setBloomLevel(e.target.value)}
              className={selectClass}
            >
              {BLOOM_LEVELS.map((level) => (
                <option key={level} value={level} className="bg-[#1C1A33]">
                  {level}
                </option>
              ))}
            </select>
          </div>

          {/* Due date */}
          <div>
            <label className="text-[#A9A4C2] text-xs font-medium uppercase tracking-wide mb-1.5 block">
              Due date (optional)
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={inputClass}
              style={{ colorScheme: "dark" }}
            />
          </div>

          {/* Week selection */}
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-white text-sm font-medium">Cover which weeks?</p>
              <button
                type="button"
                onClick={toggleAllWeeks}
                className="text-[#7C5CFF] hover:text-[#9B82FF] text-xs font-medium transition-colors duration-200"
              >
                {selectedWeeks.length === syllabus?.length
                  ? "Deselect all"
                  : "Select all"}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {syllabus?.map((w, i) => (
                <label
                  key={i}
                  className="flex items-center gap-2 text-sm cursor-pointer text-[#A9A4C2] hover:text-white transition-colors duration-200"
                >
                  <input
                    type="checkbox"
                    checked={selectedWeeks.includes(w.week)}
                    onChange={() => toggleWeek(w.week)}
                    className="accent-[#7C5CFF] w-4 h-4 cursor-pointer"
                  />
                  {w.week}
                </label>
              ))}
            </div>
            {weekError && (
              <p className="text-[#FF6B5E] text-xs mt-2">{weekError}</p>
            )}
          </div>

          {/* Difficulty distribution */}
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-white text-sm font-medium">
                Difficulty distribution
              </p>
              <span
                className={`text-xs font-medium ${
                  difficultyTotal === 100
                    ? "text-[#A9A4C2]"
                    : "text-[#FF6B5E]"
                }`}
              >
                {difficultyTotal}% total
              </span>
            </div>

            {[
              { label: "Easy",   value: easyPercent,   setter: setEasyPercent },
              { label: "Medium", value: mediumPercent, setter: setMediumPercent },
              { label: "Hard",   value: hardPercent,   setter: setHardPercent },
            ].map(({ label, value, setter }) => (
              <div key={label} className="mb-3 last:mb-0">
                <div className="flex justify-between mb-1">
                  <label className="text-[#A9A4C2] text-xs">{label}</label>
                  <span className="text-white text-xs font-medium">{value}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={value}
                  onChange={(e) => setter(Number(e.target.value))}
                  className="w-full accent-[#7C5CFF] cursor-pointer"
                />
              </div>
            ))}

            {difficultyError && (
              <p className="text-[#FF6B5E] text-xs mt-2">{difficultyError}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isDisabled}
            className="bg-gradient-to-r from-[#7C5CFF] to-[#6845E8] text-white py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-lg hover:shadow-violet-500/30 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating...
              </>
            ) : cooldown > 0 ? (
              `Please wait (${cooldown}s)`
            ) : (
              "Create assignment"
            )}
          </button>

        </form>
      </div>
    </div>
  );
}

export default AssignmentFormModal;