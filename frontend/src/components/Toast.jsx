import { useEffect, useRef } from "react";

// Visibility is fully controlled by the message prop; parent dismisses by clearing it
function Toast({ message, type = "error", onDismiss }) {
  // Store the latest onDismiss in a ref to keep it out of the effect's dependency array
  const onDismissRef = useRef(onDismiss);
  useEffect(() => {
    onDismissRef.current = onDismiss;
  });

  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      onDismissRef.current?.();
    }, 5000);

    return () => clearTimeout(timer);
  }, [message]); // onDismiss is intentionally omitted; it's accessed via the ref

  if (!message) return null;

  const styles = {
    error: {
      container: "bg-[#FF6B5E]/10 border-[#FF6B5E]/30 text-[#FF6B5E]",
      bar:       "bg-[#FF6B5E]",
    },
    success: {
      container: "bg-[#7C5CFF]/10 border-[#7C5CFF]/30 text-[#7C5CFF]",
      bar:       "bg-[#7C5CFF]",
    },
  };

  const s = styles[type] ?? styles.error;

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 border px-4 py-3 rounded-xl text-sm fade-in max-w-sm ${s.container}`}
    >
      <div className="flex items-start justify-between gap-3">
        <span>{message}</span>
        <button
          onClick={() => onDismissRef.current?.()}
          className="opacity-60 hover:opacity-100 transition-opacity shrink-0 mt-0.5"
        >
          ×
        </button>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] rounded-b-xl overflow-hidden">
        <div
          className={`h-full ${s.bar} opacity-50`}
          style={{ animation: "shrink 5s linear forwards" }}
        />
      </div>
    </div>
  );
}

export default Toast;