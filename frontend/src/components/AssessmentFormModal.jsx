import { useState } from "react";

const BLOOM_LEVELS = [
  "Knowledge",
  "Understanding",
  "Application",
  "Analysis",
  "Evaluation",
];

function AssessmentFormModal({ syllabus, onClose, onSubmit, loading }) {
  const [mcqCount, setMcqCount] = useState(5);
  const [mcqMarks, setMcqMarks] = useState(1);
  const [mcqBloom, setMcqBloom] = useState("Knowledge");

  const [shortCount, setShortCount] = useState(3);
  const [shortMarks, setShortMarks] = useState(5);
  const [shortBloom, setShortBloom] = useState("Understanding");

  const [longCount, setLongCount] = useState(2);
  const [longMarks, setLongMarks] = useState(10);
  const [longBloom, setLongBloom] = useState("Application");

  const [easyPercent, setEasyPercent] = useState(30);
  const [mediumPercent, setMediumPercent] = useState(50);
  const [hardPercent, setHardPercent] = useState(20);

  const [selectedWeeks, setSelectedWeeks] = useState(
    syllabus?.map((w) => w.week) || []
  );
  const [weekError, setWeekError] = useState("");
  const [difficultyError, setDifficultyError] = useState("");

  const totalMarks =
    mcqCount * mcqMarks + shortCount * shortMarks + longCount * longMarks;

  const difficultyTotal = easyPercent + mediumPercent + hardPercent;

  const toggleWeek = (week) => {
    setSelectedWeeks((prev) =>
      prev.includes(week) ? prev.filter((w) => w !== week) : [...prev, week]
    );
  };

  const toggleAllWeeks = () => {
    if (selectedWeeks.length === syllabus.length) {
      setSelectedWeeks([]);
    } else {
      setSelectedWeeks(syllabus.map((w) => w.week));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (selectedWeeks.length === 0) {
      setWeekError("Select at least one week.");
      return;
    }
    setWeekError("");

    if (difficultyTotal !== 100) {
      setDifficultyError(`Difficulty percentages must add up to 100% (currently ${difficultyTotal}%).`);
      return;
    }
    setDifficultyError("");

    onSubmit({
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
      weeks: selectedWeeks,
    });
  };

  const numberInputClass =
    "w-full px-3 py-2.5 rounded-xl bg-white/[0.07] border border-white/10 text-white text-sm outline-none focus:border-[#7C5CFF] focus:bg-white/[0.1] transition-all duration-200";

  const selectClass =
    "w-full px-3 py-2.5 rounded-xl bg-white/[0.07] border border-white/10 text-white text-sm outline-none focus:border-[#7C5CFF] focus:bg-white/[0.1] transition-all duration-200";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="rise-in bg-[#1C1A33] border border-white/10 shadow-2xl rounded-3xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">

        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-bold text-white">
            Generate assessment
          </h2>
          <button
            onClick={onClose}
            className="text-[#A9A4C2] hover:text-white transition-colors duration-200 text-xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* Week selection */}
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-white text-sm font-medium">Cover which weeks?</p>
              <button
                type="button"
                onClick={toggleAllWeeks}
                className="text-[#7C5CFF] hover:text-[#9B82FF] text-xs font-medium transition-colors duration-200"
              >
                {selectedWeeks.length === syllabus?.length ? "Deselect all" : "Select all"}
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

          {/* MCQs */}
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-4">
            <p className="text-white text-sm font-medium mb-3">Multiple choice questions</p>
            <div className="flex gap-3 mb-3">
              <div className="flex-1">
                <label className="text-[#A9A4C2] text-xs mb-1.5 block">Count</label>
                <input
                  type="number"
                  min="0"
                  value={mcqCount}
                  onChange={(e) => setMcqCount(Number(e.target.value))}
                  className={numberInputClass}
                />
              </div>
              <div className="flex-1">
                <label className="text-[#A9A4C2] text-xs mb-1.5 block">Marks each</label>
                <input
                  type="number"
                  min="0"
                  value={mcqMarks}
                  onChange={(e) => setMcqMarks(Number(e.target.value))}
                  className={numberInputClass}
                />
              </div>
            </div>
            <div>
              <label className="text-[#A9A4C2] text-xs mb-1.5 block">Bloom's level</label>
              <select
                value={mcqBloom}
                onChange={(e) => setMcqBloom(e.target.value)}
                className={selectClass}
              >
                {BLOOM_LEVELS.map((level) => (
                  <option key={level} className="bg-[#1C1A33]" value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Short questions */}
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-4">
            <p className="text-white text-sm font-medium mb-3">Short questions</p>
            <div className="flex gap-3 mb-3">
              <div className="flex-1">
                <label className="text-[#A9A4C2] text-xs mb-1.5 block">Count</label>
                <input
                  type="number"
                  min="0"
                  value={shortCount}
                  onChange={(e) => setShortCount(Number(e.target.value))}
                  className={numberInputClass}
                />
              </div>
              <div className="flex-1">
                <label className="text-[#A9A4C2] text-xs mb-1.5 block">Marks each</label>
                <input
                  type="number"
                  min="0"
                  value={shortMarks}
                  onChange={(e) => setShortMarks(Number(e.target.value))}
                  className={numberInputClass}
                />
              </div>
            </div>
            <div>
              <label className="text-[#A9A4C2] text-xs mb-1.5 block">Bloom's level</label>
              <select
                value={shortBloom}
                onChange={(e) => setShortBloom(e.target.value)}
                className={selectClass}
              >
                {BLOOM_LEVELS.map((level) => (
                  <option key={level} className="bg-[#1C1A33]" value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Long questions */}
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-4">
            <p className="text-white text-sm font-medium mb-3">Long questions</p>
            <div className="flex gap-3 mb-3">
              <div className="flex-1">
                <label className="text-[#A9A4C2] text-xs mb-1.5 block">Count</label>
                <input
                  type="number"
                  min="0"
                  value={longCount}
                  onChange={(e) => setLongCount(Number(e.target.value))}
                  className={numberInputClass}
                />
              </div>
              <div className="flex-1">
                <label className="text-[#A9A4C2] text-xs mb-1.5 block">Marks each</label>
                <input
                  type="number"
                  min="0"
                  value={longMarks}
                  onChange={(e) => setLongMarks(Number(e.target.value))}
                  className={numberInputClass}
                />
              </div>
            </div>
            <div>
              <label className="text-[#A9A4C2] text-xs mb-1.5 block">Bloom's level</label>
              <select
                value={longBloom}
                onChange={(e) => setLongBloom(e.target.value)}
                className={selectClass}
              >
                {BLOOM_LEVELS.map((level) => (
                  <option key={level} className="bg-[#1C1A33]" value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Difficulty distribution */}
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-white text-sm font-medium">Difficulty distribution</p>
              <span className={`text-xs font-medium ${difficultyTotal === 100 ? "text-[#A9A4C2]" : "text-[#FF6B5E]"}`}>
                {difficultyTotal}% total
              </span>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-[#A9A4C2] text-xs">Easy</label>
                  <span className="text-white text-xs font-medium">{easyPercent}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={easyPercent}
                  onChange={(e) => setEasyPercent(Number(e.target.value))}
                  className="w-full accent-[#7C5CFF] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-[#A9A4C2] text-xs">Medium</label>
                  <span className="text-white text-xs font-medium">{mediumPercent}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={mediumPercent}
                  onChange={(e) => setMediumPercent(Number(e.target.value))}
                  className="w-full accent-[#7C5CFF] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-[#A9A4C2] text-xs">Hard</label>
                  <span className="text-white text-xs font-medium">{hardPercent}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={hardPercent}
                  onChange={(e) => setHardPercent(Number(e.target.value))}
                  className="w-full accent-[#7C5CFF] cursor-pointer"
                />
              </div>
            </div>

            {difficultyError && (
              <p className="text-[#FF6B5E] text-xs mt-3">{difficultyError}</p>
            )}
          </div>

          {/* Total */}
          <div className="flex items-center justify-between px-1">
            <span className="text-[#A9A4C2] text-sm">Total marks</span>
            <span className="text-white font-display font-bold text-lg">{totalMarks}</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-[#7C5CFF] to-[#6845E8] text-white py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-lg hover:shadow-violet-500/30 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              "Generate assessment"
            )}
          </button>

        </form>
      </div>
    </div>
  );
}

export default AssessmentFormModal;