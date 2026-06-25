import { useState } from "react";
import EditableText from "./EditableText";

// MCQ Editor 
function McqEditor({ mcq, index, onChange }) {
  const LABELS = ["A", "B", "C", "D"];

  const updateOption = (oi, val) => {
    const newOptions = mcq.options.map((o, i) => (i === oi ? val : o));
    onChange({ ...mcq, options: newOptions });
  };

  return (
    <div className="border border-white/10 rounded-xl p-4 bg-white/[0.03] flex flex-col gap-3">

      {/* Question */}
      <div>
        <span className="text-[#A9A4C2] text-xs mb-1 block">Question {index + 1}</span>
        <p className="text-[#A9A4C2] text-sm font-medium">
          <EditableText
            value={mcq.question}
            onSave={(val) => onChange({ ...mcq, question: val })}
            multiline
          />
        </p>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {(mcq.options || []).map((opt, oi) => (
          <div
            key={oi}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all duration-150 ${
              mcq.correctAnswer === opt
                ? "border-[#7C5CFF]/50 bg-[#7C5CFF]/10"
                : "border-white/5 bg-white/[0.02]"
            }`}
          >
            <span
              className={`font-semibold text-xs shrink-0 ${
                mcq.correctAnswer === opt ? "text-[#7C5CFF]" : "text-[#A9A4C2]"
              }`}
            >
              {LABELS[oi]}.
            </span>
            <span className="flex-1 text-[#A9A4C2]">
              <EditableText
                value={opt}
                onSave={(val) => updateOption(oi, val)}
              />
            </span>
            {/* Mark as correct */}
            {mcq.correctAnswer !== opt && (
              <button
                onClick={() => onChange({ ...mcq, correctAnswer: opt })}
                title="Mark as correct answer"
                className="opacity-0 group-hover:opacity-100 text-[#7C5CFF]/50 hover:text-[#7C5CFF] text-xs shrink-0 transition-all duration-150"
              >
                ✓
              </button>
            )}
            {mcq.correctAnswer === opt && (
              <span className="text-[#7C5CFF] text-xs shrink-0">✓</span>
            )}
          </div>
        ))}
      </div>

      {/* Correct answer text edit */}
      <div className="text-xs text-[#A9A4C2]">
        Correct answer:{" "}
        <span className="text-[#7C5CFF] font-medium">
          <EditableText
            value={mcq.correctAnswer || ""}
            onSave={(val) => onChange({ ...mcq, correctAnswer: val })}
          />
        </span>
        <span className="ml-2 opacity-60">(or click ✓ on an option above)</span>
      </div>

      {/* Meta */}
      <div className="flex gap-2 flex-wrap">
        <span className="text-[#A9A4C2]/50 text-xs bg-white/5 px-2 py-0.5 rounded-md">
          {mcq.difficulty}
        </span>
        <span className="text-[#7C5CFF]/60 text-xs bg-[#7C5CFF]/5 px-2 py-0.5 rounded-md">
          {mcq.bloomLevel}
        </span>
      </div>
    </div>
  );
}

// Short / Long Question Editor 
function QaEditor({ q, index, label, onChange }) {
  return (
    <div className="border border-white/10 rounded-xl p-4 bg-white/[0.03] flex flex-col gap-3">
      <div>
        <span className="text-[#A9A4C2] text-xs mb-1 block">
          {label} {index + 1}
        </span>
        <p className="text-white text-sm font-medium">
          <EditableText
            value={q.question}
            onSave={(val) => onChange({ ...q, question: val })}
            multiline
          />
        </p>
      </div>

      <div className="border-l-2 border-[#7C5CFF]/30 pl-3">
        <span className="text-[#A9A4C2] text-xs mb-1 block">Model answer</span>
        <p className="text-[#A9A4C2] text-sm leading-relaxed">
          <EditableText
            value={q.modelAnswer || ""}
            onSave={(val) => onChange({ ...q, modelAnswer: val })}
            multiline
          />
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        <span className="text-[#A9A4C2]/50 text-xs bg-white/5 px-2 py-0.5 rounded-md">
          {q.difficulty}
        </span>
        <span className="text-[#7C5CFF]/60 text-xs bg-[#7C5CFF]/5 px-2 py-0.5 rounded-md">
          {q.bloomLevel}
        </span>
      </div>
    </div>
  );
}

// Main Component 
function EditableAssessment({ assessment, onSave }) {
  const [mcqs, setMcqs]                   = useState([...(assessment.mcqs || [])]);
  const [shortQuestions, setShortQuestions] = useState([...(assessment.shortQuestions || [])]);
  const [longQuestions, setLongQuestions]   = useState([...(assessment.longQuestions || [])]);
  const [dirty, setDirty]                 = useState(false);
  const [saving, setSaving]               = useState(false);

  const wrap = (setter) => (val) => { setter(val); setDirty(true); };

  const updateMcq   = (i, val) => wrap(setMcqs)(mcqs.map((q, idx) => (idx === i ? val : q)));
  const updateShort = (i, val) => wrap(setShortQuestions)(shortQuestions.map((q, idx) => (idx === i ? val : q)));
  const updateLong  = (i, val) => wrap(setLongQuestions)(longQuestions.map((q, idx) => (idx === i ? val : q)));

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({ mcqs, shortQuestions, longQuestions });
      setDirty(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setMcqs([...(assessment.mcqs || [])]);
    setShortQuestions([...(assessment.shortQuestions || [])]);
    setLongQuestions([...(assessment.longQuestions || [])]);
    setDirty(false);
  };

  return (
    <div className="flex flex-col gap-6">

      {/* MCQs */}
      {mcqs.length > 0 && (
        <div>
          <h4 className="text-white font-medium mb-3 text-sm">
            Section A — Multiple choice ({assessment.config?.mcqMarks || 1} marks each)
          </h4>
          <div className="flex flex-col gap-3">
            {mcqs.map((mcq, i) => (
              <McqEditor
                key={i}
                index={i}
                mcq={mcq}
                onChange={(val) => updateMcq(i, val)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Short Questions */}
      {shortQuestions.length > 0 && (
        <div>
          <h4 className="text-white font-medium mb-3 text-sm">
            Section B — Short questions ({assessment.config?.shortMarks || 5} marks each)
          </h4>
          <div className="flex flex-col gap-3">
            {shortQuestions.map((q, i) => (
              <QaEditor
                key={i}
                index={i}
                q={q}
                label="Short Q"
                onChange={(val) => updateShort(i, val)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Long Questions */}
      {longQuestions.length > 0 && (
        <div>
          <h4 className="text-white font-medium mb-3 text-sm">
            Section C — Long questions ({assessment.config?.longMarks || 10} marks each)
          </h4>
          <div className="flex flex-col gap-3">
            {longQuestions.map((q, i) => (
              <QaEditor
                key={i}
                index={i}
                q={q}
                label="Long Q"
                onChange={(val) => updateLong(i, val)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Save / Discard */}
      {dirty && (
        <div className="flex gap-3 justify-end sticky bottom-4 fade-in">
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

export default EditableAssessment;