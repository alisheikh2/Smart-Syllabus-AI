import { useState } from "react";
import EditableText from "./EditableText";

// Generic editable list (keyConcepts, definitions etc)
function EditableList({ items, onChange }) {
  const updateItem = (i, val) =>
    onChange(items.map((it, idx) => (idx === i ? val : it)));

  const deleteItem = (i) =>
    onChange(items.filter((_, idx) => idx !== i));

  const addItem = () =>
    onChange([...items, "New item"]);

  return (
    <ul className="flex flex-col gap-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 group/item">
          <span className="text-[#7C5CFF] mt-1 shrink-0">•</span>
          <span className="flex-1 text-[#A9A4C2] text-sm">
            <EditableText value={item} onSave={(val) => updateItem(i, val)} />
          </span>
          <button
            onClick={() => deleteItem(i)}
            className="opacity-0 group-hover/item:opacity-100 text-[#FF6B5E]/50 hover:text-[#FF6B5E] text-xs shrink-0 px-1 transition-all duration-150"
          >
            ✕
          </button>
        </li>
      ))}
      <li>
        <button
          onClick={addItem}
          className="text-[#7C5CFF] text-xs hover:text-[#9B82FF] transition-colors duration-150 flex items-center gap-1 mt-1"
        >
          + Add item
        </button>
      </li>
    </ul>
  );
}

function EditableStudyMaterial({ studyMaterial, onChange }) {
  const [sm, setSm]     = useState({ ...studyMaterial });
  const [dirty, setDirty] = useState(false);

  const update = (key, val) => {
    setSm((prev) => ({ ...prev, [key]: val }));
    setDirty(true);
  };

  const handleSave    = () => { onChange(sm); setDirty(false); };
  const handleDiscard = () => { setSm({ ...studyMaterial }); setDirty(false); };

  const SECTIONS = [
    { key: "keyConcepts",        label: "Key concepts" },
    { key: "definitions",        label: "Definitions" },
    { key: "realWorldExamples",  label: "Real-world examples" },
    { key: "interviewQuestions", label: "Interview questions" },
    { key: "furtherReading",     label: "Further reading" },
  ];

  return (
    <div className="bg-[#FAF8F3]/[0.06] border border-white/10 rounded-2xl p-6 flex flex-col gap-6">

      {/* Summary */}
      {sm.summary !== undefined && (
        <div>
          <h4 className="text-white font-medium mb-2 text-sm">Summary</h4>
          <p className="text-[#A9A4C2] text-sm leading-relaxed">
            <EditableText
              value={sm.summary}
              onSave={(val) => update("summary", val)}
              multiline
              className="w-full"
            />
          </p>
        </div>
      )}

      {/* List sections */}
      {SECTIONS.map(({ key, label }) =>
        Array.isArray(sm[key]) ? (
          <div key={key}>
            <h4 className="text-white font-medium mb-2 text-sm">{label}</h4>
            <EditableList
              items={sm[key]}
              onChange={(val) => update(key, val)}
            />
          </div>
        ) : null
      )}

      {/* Save / Discard */}
      {dirty && (
        <div className="flex gap-3 justify-end fade-in">
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

export default EditableStudyMaterial;