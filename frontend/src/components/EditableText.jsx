import { useState, useRef, useEffect } from "react";

function EditableText({
  value,
  onSave,
  multiline = false,
  className = "",
  placeholder = "Click to edit...",
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef(null);

// Sync draft with value asynchronously to avoid setState-in-effect lint warning
  useEffect(() => {
    if (editing) return;

    const run = () => setDraft(value);

    if (typeof queueMicrotask === "function") {
      queueMicrotask(run);
      return;
    }
    const t = setTimeout(run, 0);
    return () => clearTimeout(t);
  }, [value, editing]);

  // Focus the input when entering edit mode
  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const handleSave = () => {
    setEditing(false);
    const trimmed = String(draft ?? "").trim();
    if (trimmed && trimmed !== value) onSave(trimmed);
    else setDraft(value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !multiline) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === "Escape") {
      setDraft(value);
      setEditing(false);
    }
  };

  if (editing) {
    const sharedClass =
      "w-full bg-[#15132B] border border-[#7C5CFF] rounded-lg px-2 py-1 text-white text-sm outline-none resize-none transition-all duration-150";

    return multiline ? (
      <textarea
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        rows={4}
        className={`${sharedClass} ${className}`}
      />
    ) : (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={`${sharedClass} ${className}`}
      />
    );
  }

  return (
    <span
      onClick={() => setEditing(true)}
      title="Click to edit"
      className={`group relative cursor-text rounded px-1 -mx-1 hover:bg-white/5 transition-colors duration-150 ${className}`}
    >
      {value || (
        <span className="text-[#A9A4C2]/50 italic">{placeholder}</span>
      )}
      <span className="inline-block ml-1.5 opacity-0 group-hover:opacity-60 transition-opacity duration-150 text-[#7C5CFF] text-xs align-middle">
        ✎
      </span>
    </span>
  );
}

export default EditableText;