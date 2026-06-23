import { useEffect, useRef } from "react";

// ✅ FIX: visible state hata diya — sirf message prop se control hoga
// Parent component message="" set karega dismiss ke liye
function Toast({ message, type = "error", onDismiss }) {
  // ✅ FIX: onDismiss ko ref mein rakh do taake deps array mein add na karna pade
  // Ye pattern "stable callback ref" kehlata hai
  const onDismissRef = useRef(onDismiss);
  useEffect(() => {
    onDismissRef.current = onDismiss;
  });

  useEffect(() => {
    // ✅ FIX: setVisible(true) hata diya — koi synchronous setState nahi
    if (!message) return;

    const timer = setTimeout(() => {
      onDismissRef.current?.();
    }, 5000);

    return () => clearTimeout(timer);
  }, [message]); // ✅ onDismiss yahan nahi chahiye kyunki ref use kar rahe hain

  // ✅ message nahi hai to kuch render mat karo
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