import { useState } from "react";

function CourseFormModal({ onClose, onSubmit, loading }) {
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [duration, setDuration] = useState("");
  const [difficulty, setDifficulty] = useState("Beginner");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!topic || !audience || !duration) return;
    onSubmit({ topic, audience, duration, difficulty });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="rise-in bg-[#1C1A33] border border-white/10 shadow-2xl rounded-3xl p-8 w-full max-w-md">

        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-bold text-white">
            Create new course
          </h2>
          <button
            onClick={onClose}
            className="text-[#A9A4C2] hover:text-white transition-colors duration-200 text-xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          <div className="flex flex-col gap-1.5">
            <label className="text-[#A9A4C2] text-xs font-medium uppercase tracking-wide">
              Course topic
            </label>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. JavaScript Promises"
              className="px-4 py-3 rounded-xl bg-white/[0.07] border border-white/10 text-white placeholder-[#A9A4C2] text-sm outline-none focus:border-[#7C5CFF] focus:bg-white/[0.1] transition-all duration-200"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[#A9A4C2] text-xs font-medium uppercase tracking-wide">
              Target audience
            </label>
            <input
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="e.g. BSCS Students"
              className="px-4 py-3 rounded-xl bg-white/[0.07] border border-white/10 text-white placeholder-[#A9A4C2] text-sm outline-none focus:border-[#7C5CFF] focus:bg-white/[0.1] transition-all duration-200"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="text-[#A9A4C2] text-xs font-medium uppercase tracking-wide">
                Duration
              </label>
              <input
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 8 Weeks"
                className="px-4 py-3 rounded-xl bg-white/[0.07] border border-white/10 text-white placeholder-[#A9A4C2] text-sm outline-none focus:border-[#7C5CFF] focus:bg-white/[0.1] transition-all duration-200"
              />
            </div>

            <div className="flex-1 flex flex-col gap-1.5">
              <label className="text-[#A9A4C2] text-xs font-medium uppercase tracking-wide">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="px-4 py-3 rounded-xl bg-white/[0.07] border border-white/10 text-white text-sm outline-none focus:border-[#7C5CFF] focus:bg-white/[0.1] transition-all duration-200"
              >
                <option className="bg-[#1C1A33]" value="Beginner">Beginner</option>
                <option className="bg-[#1C1A33]" value="Intermediate">Intermediate</option>
                <option className="bg-[#1C1A33]" value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 bg-gradient-to-r from-[#7C5CFF] to-[#6845E8] text-white py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-lg hover:shadow-violet-500/30 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              "Generate course"
            )}
          </button>

        </form>
      </div>
    </div>
  );
}

export default CourseFormModal;