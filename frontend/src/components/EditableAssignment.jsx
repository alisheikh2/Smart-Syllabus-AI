import { useState } from "react";
import EditableText from "./EditableText";

// ── MCQ Editor ────────────────────────────────
function McqEditor({ q, index, onChange }) {
  const LABELS = ["A", "B", "C", "D"];

  const updateOption = (oi, val) =>
    onChange({ ...q, options: q.options.map((o, i) => (i === oi ? val : o)) });

  return (
    <div className="border border-white/10 rounded-xl p-4 bg-white/[0.03] flex flex-col gap-3">
      {/* Type badge */}
      <div className="flex items-center gap-2">
        <span className="text-white text-sm font-medium">Q{index + 1}.</span>
        <span className="text-xs px-2 py-0.5 rounded-md font-medium text-[#7C5CFF] bg-[#7C5CFF]/10">
          MCQ
        </span>
        <span className="text-[#A9A4C2]/50 text-xs">
          {q.marks} mark{q.marks !== 1 ? "s" : ""}
        </span>
        <span className="ml-auto text-[#A9A4C2]/40 text-xs">
          {q.difficulty} · {q.bloomLevel}
        </span>
      </div>

      {/* Question */}
      <div>
        <label className="text-[#A9A4C2] text-xs mb-1 block">Question</label>
        <p className="text-[#A9A4C2] text-sm">
          <EditableText
            value={q.question}
            onSave={(val) => onChange({ ...q, question: val })}
            multiline
          />
        </p>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {(q.options || []).map((opt, oi) => (
          <div
            key={oi}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all duration-150 ${
              q.correctAnswer === opt
                ? "border-[#7C5CFF]/50 bg-[#7C5CFF]/10"
                : "border-white/5 bg-white/[0.02]"
            }`}
          >
            <span
              className={`font-semibold text-xs shrink-0 ${
                q.correctAnswer === opt ? "text-[#7C5CFF]" : "text-[#A9A4C2]"
              }`}
            >
              {LABELS[oi]}.
            </span>
            <span className="flex-1 text-[#A9A4C2]">
              <EditableText value={opt} onSave={(val) => updateOption(oi, val)} />
            </span>
            {q.correctAnswer !== opt ? (
              <button
                onClick={() => onChange({ ...q, correctAnswer: opt })}
                title="Mark as correct"
                className="text-[#7C5CFF]/40 hover:text-[#7C5CFF] text-xs transition-colors duration-150"
              >
                ✓
              </button>
            ) : (
              <span className="text-[#7C5CFF] text-xs">✓</span>
            )}
          </div>
        ))}
      </div>

      {/* Correct answer */}
      <p className="text-xs text-[#A9A4C2]">
        Correct answer:{" "}
        <span className="text-[#7C5CFF] font-medium">
          <EditableText
            value={q.correctAnswer || ""}
            onSave={(val) => onChange({ ...q, correctAnswer: val })}
          />
        </span>
        <span className="ml-2 opacity-50">(or click ✓ on option)</span>
      </p>
    </div>
  );
}

// ── Short / Long Editor ───────────────────────
function QaEditor({ q, index, onChange }) {
  const colorMap = {
    short: { badge: "text-blue-400 bg-blue-400/10", border: "border-blue-400/30",  label: "Short" },
    long:  { badge: "text-pink-400 bg-pink-400/10", border: "border-pink-400/30",  label: "Long"  },
  };
  const style = colorMap[q.type] || colorMap.short;

  return (
    <div className="border border-white/10 rounded-xl p-4 bg-white/[0.03] flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="text-white text-sm font-medium">Q{index + 1}.</span>
        <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${style.badge}`}>
          {style.label}
        </span>
        <span className="text-[#A9A4C2]/50 text-xs">
          {q.marks} mark{q.marks !== 1 ? "s" : ""}
        </span>
        <span className="ml-auto text-[#A9A4C2]/40 text-xs">
          {q.difficulty} · {q.bloomLevel}
        </span>
      </div>

      {/* Question */}
      <div>
        <label className="text-[#A9A4C2] text-xs mb-1 block">Question</label>
        <p className="text-white text-sm font-medium">
          <EditableText
            value={q.question}
            onSave={(val) => onChange({ ...q, question: val })}
            multiline
          />
        </p>
      </div>

      {/* Model answer */}
      <div className={`border-l-2 ${style.border} pl-3`}>
        <label className="text-[#A9A4C2] text-xs mb-1 block">Model answer</label>
        <p className="text-[#A9A4C2] text-sm leading-relaxed">
          <EditableText
            value={q.modelAnswer || ""}
            onSave={(val) => onChange({ ...q, modelAnswer: val })}
            multiline
          />
        </p>
      </div>
    </div>
  );
}

// ── Main ─────────────────────────────────────
function EditableAssignment({ assignment, onSave }) {
  const [questions, setQuestions] = useState([...(assignment.questions || [])]);
  const [dirty,     setDirty]     = useState(false);
  const [saving,    setSaving]    = useState(false);

  const updateQuestion = (i, val) => {
    setQuestions((prev) => prev.map((q, idx) => (idx === i ? val : q)));
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({ questions });
      setDirty(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setQuestions([...(assignment.questions || [])]);
    setDirty(false);
  };

  return (
    <div className="flex flex-col gap-4">
      {questions.map((q, i) =>
        q.type === "mcq" ? (
          <McqEditor
            key={i}
            index={i}
            q={q}
            onChange={(val) => updateQuestion(i, val)}
          />
        ) : (
          <QaEditor
            key={i}
            index={i}
            q={q}
            onChange={(val) => updateQuestion(i, val)}
          />
        )
      )}

      {/* Sticky Save / Discard bar */}
      {dirty && (
        <div className="sticky bottom-4 flex justify-end fade-in">
          <div className="flex gap-3 bg-[#1C1A33]/90 backdrop-blur-md border border-white/10 rounded-2xl p-3 shadow-xl">
            <button
              onClick={handleDiscard}
              disabled={saving}
              className="text-[#A9A4C2] hover:text-white text-sm px-4 py-2 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-150 disabled:opacity-50"
            >
              Discard
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-[#7C5CFF] to-[#6845E8] text-white text-sm px-5 py-2 rounded-xl hover:shadow-lg hover:shadow-violet-500/30 transition-all duration-150 disabled:opacity-60 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving…
                </>
              ) : (
                "Save changes"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default EditableAssignment;