import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

const katexOptions = { strict: false, throwOnError: false };

// 🔥 MASTER SYMBOL MAP: Har wo cheez jo aap ko chahiye
const SYMBOL_MAP = {
  // Greek Letters
  "\\delta": "δ", "delta": "δ", "\\Delta": "Δ", "Delta": "Δ",
  "\\sigma": "σ", "sigma": "σ", "\\Sigma": "Σ", "Sigma": "Σ",
  "\\lambda": "λ", "lambda": "λ", "\\alpha": "α", "\\beta": "β",
  "\\gamma": "γ", "\\pi": "π", "\\theta": "θ", "\\omega": "ω",

  // Calculus & Math
  "\\int": "∫", "integral": "∫",
  "\\sum": "∑", "sum": "∑",
  "\\partial": "∂", "partial": "∂",
  "\\infty": "∞", "infinity": "∞",
  "\\sqrt": "√",

  // Logic & Sets
  "\\emptyset": "∅", "emptyset": "∅",
  "\\in": "∈", "\\notin": "∉",
  "\\cup": "∪", "\\cap": "∩",
  "\\subset": "⊂", "\\subseteq": "⊆",
  "\\forall": "∀", "\\exists": "∃",
  "\\neq": "≠", "\\geq": "≥", "\\leq": "≤"
};

// Yeh function text ko symbol mein badal kar "protect" karta hai
const processSymbols = (str) => {
  let text = str;
  Object.keys(SYMBOL_MAP).forEach(key => {
    // Regex: Slash (0-2 baar) + word + word boundary
    const escapedKey = key.replace(/\\/g, '\\\\');
    const regex = new RegExp(`\\\\{0,2}${escapedKey.replace(/\\\\/g, '\\\\')}(?![a-zA-Z])`, 'gi');
    text = text.replace(regex, SYMBOL_MAP[key]);
  });
  return text;
};

function MathText({ text }) {
  if (!text) return null;

  // 1. PURE TEXT SANIZE (Sab se pehle symbols ko protect karo)
  const sanitizedText = processSymbols(text);

  // 2. SPLIT & RENDER
  const blockParts = sanitizedText.split(/(\$\$[^$]+\$\$)/g);

  return (
    <>
      {blockParts.map((blockPart, bi) => {
        // Equation Block
        if (blockPart.startsWith("$$") && blockPart.endsWith("$$")) {
          return <BlockMath key={bi} math={blockPart.slice(2, -2)} settings={katexOptions} />;
        }

        // Inline Math
        const inlineParts = blockPart.split(/(\$[^$]+\$)/g);
        return (
          <span key={bi}>
            {inlineParts.map((part, i) => {
              if (part.startsWith("$") && part.endsWith("$") && part.length > 2) {
                return <InlineMath key={i} math={part.slice(1, -1)} settings={katexOptions} />;
              }
              return <span key={i} style={{ whiteSpace: "pre-wrap" }}>{part}</span>;
            })}
          </span>
        );
      })}
    </>
  );
}

export default MathText;