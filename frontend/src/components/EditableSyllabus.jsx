import { useState } from "react";
import EditableText from "./EditableText";

function EditableSyllabus({ syllabus, onChange }) {
  // Local copy so changes can be discarded without affecting parent state
  const [weeks, setWeeks] = useState(
    syllabus.map((w) => ({ ...w, topics: [...w.topics] }))
  );

  const [dirty, setDirty] = useState(false);

  const markDirty = (updated) => {
    setWeeks(updated);
    setDirty(true);
  };

  const updateWeekName = (wi, newName) => {
    const updated = weeks.map((w, i) =>
      i === wi ? { ...w, week: newName } : w
    );
    markDirty(updated);
  };

  const updateTopic = (wi, ti, newTopic) => {
    const updated = weeks.map((w, i) =>
      i === wi
        ? { ...w, topics: w.topics.map((t, j) => (j === ti ? newTopic : t)) }
        : w
    );
    markDirty(updated);
  };

  const deleteTopic = (wi, ti) => {
    const updated = weeks.map((w, i) =>
      i === wi
        ? { ...w, topics: w.topics.filter((_, j) => j !== ti) }
        : w
    );
    markDirty(updated);
  };
 
  const addTopic = (wi) => {
    const updated = weeks.map((w, i) =>
      i === wi
        ? { ...w, topics: [...w.topics, "New topic"] }
        : w
    );
    markDirty(updated);
  };

  const deleteWeek = (wi) => {
    const updated = weeks.filter((_, i) => i !== wi);
    markDirty(updated);
  };

  const addWeek = () => {
    const newWeek = {
      week: `Week ${weeks.length + 1}`,
      topics: ["New topic"],
    };
    markDirty([...weeks, newWeek]);
  };

  const handleSave = () => {
    onChange(weeks);
    setDirty(false);
  };

  const handleDiscard = () => {
    setWeeks(syllabus.map((w) => ({ ...w, topics: [...w.topics] })));
    setDirty(false);
  };

  return (
    <div className="flex flex-col gap-3">

      {weeks.map((week, wi) => (
        <div
          key={wi}
          className="bg-[#FAF8F3]/[0.06] border border-white/10 rounded-2xl p-5 group/week"
        >
          {/* Week header */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-medium">
              <EditableText
                value={week.week}
                onSave={(val) => updateWeekName(wi, val)}
              />
            </h3>
            <button
              onClick={() => deleteWeek(wi)}
              title="Delete week"
              className="opacity-0 group-hover/week:opacity-100 text-[#FF6B5E]/60 hover:text-[#FF6B5E] text-xs transition-all duration-150 px-2 py-1 rounded hover:bg-[#FF6B5E]/10"
            >
              Delete week
            </button>
          </div>

          {/* Topics */}
          <ul className="flex flex-col gap-2">
            {week.topics.map((topic, ti) => (
              <li
                key={ti}
                className="flex items-start gap-2 group/topic"
              >
                <span className="text-[#7C5CFF] mt-1 shrink-0">•</span>
                <span className="flex-1 text-[#A9A4C2] text-sm">
                  <EditableText
                    value={topic}
                    onSave={(val) => updateTopic(wi, ti, val)}
                  />
                </span>
                <button
                  onClick={() => deleteTopic(wi, ti)}
                  title="Delete topic"
                  className="opacity-0 group-hover/topic:opacity-100 text-[#FF6B5E]/50 hover:text-[#FF6B5E] text-xs shrink-0 transition-all duration-150 px-1"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>

          {/* Add topic */}
          <button
            onClick={() => addTopic(wi)}
            className="mt-3 text-[#7C5CFF] text-xs hover:text-[#9B82FF] transition-colors duration-150 flex items-center gap-1"
          >
            + Add topic
          </button>
        </div>
      ))}

      {/* Add week */}
      <button
        onClick={addWeek}
        className="border border-dashed border-white/20 hover:border-[#7C5CFF]/50 text-[#A9A4C2] hover:text-[#7C5CFF] rounded-2xl p-4 text-sm transition-all duration-200 flex items-center justify-center gap-2"
      >
        + Add week
      </button>

      {/* Save / Discard — only shown when there are unsaved changes */}
      {dirty && (
        <div className="flex gap-3 justify-end mt-1 fade-in">
          <button
            onClick={handleDiscard}
            className="text-[#A9A4C2] hover:text-white text-sm px-4 py-2 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-150"
          >
            Discard
          </button>
          <button
            onClick={handleSave}
            className="bg-gradient-to-r from-[#7C5CFF] to-[#6845E8] text-white text-sm px-5 py-2 rounded-xl hover:shadow-lg hover:shadow-violet-500/30 transition-all duration-150"
          >
            Save changes
          </button>
        </div>
      )}
    </div>
  );
}

export default EditableSyllabus;