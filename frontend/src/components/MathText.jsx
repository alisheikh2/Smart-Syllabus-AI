import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

const katexOptions = { strict: false, throwOnError: false };

// Map of LaTeX commands and plain-text aliases to their Unicode symbols
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

// Replaces LaTeX/plain-text symbol notation with the actual Unicode character
const processSymbols = (str) => {
  let text = str;
  Object.keys(SYMBOL_MAP).forEach(key => {
    const escapedKey = key.replace(/\\/g, '\\\\');
    const regex = new RegExp(`\\\\{0,2}${escapedKey.replace(/\\\\/g, '\\\\')}(?![a-zA-Z])`, 'gi');
    text = text.replace(regex, SYMBOL_MAP[key]);
  });
  return text;
};

/* Detects [[1,2],[3,4]] style matrix literals inside a string and splits
 the string into plain-text and matrix segments.*/
const MATRIX_REGEX = /\[\s*\[[^\]]*\](?:\s*,\s*\[[^\]]*\])*\s*\]/g;

function parseMatrixLiteral(raw) {
  try {
    // Restrict to a safe character set before parsing as JSON
    if (!/^[\s[\]0-9.,-]+$/.test(raw)) return null;
    const rows = JSON.parse(raw);
    if (!Array.isArray(rows) || !rows.every((r) => Array.isArray(r))) return null;
    return rows;
  } catch {
    return null;
  }
}

function MatrixGrid({ rows }) {
  const colCount = rows[0]?.length || 1;

  return (
    <span
      style={{
        display: "inline-grid",
        gridTemplateColumns: `repeat(${colCount}, minmax(28px, auto))`,
        gap: "4px 14px",
        border: "1.5px solid currentColor",
        borderLeft: "1.5px solid currentColor",
        borderRight: "1.5px solid currentColor",
        borderTop: "none",
        borderBottom: "none",
        padding: "6px 10px",
        margin: "4px 6px",
        verticalAlign: "middle",
        position: "relative",
      }}
    >
      {rows.flat().map((val, i) => (
        <span key={i} style={{ textAlign: "center", fontStyle: "italic" }}>
          {val}
        </span>
      ))}
    </span>
  );
}

/* Splits text into plain text and [[...]] matrix segments, rendering
 matrices as a visual grid and leaving everything else as plain text.*/
function renderWithMatrices(text) {
  const parts = [];
  let lastIndex = 0;
  let match;

  MATRIX_REGEX.lastIndex = 0;
  while ((match = MATRIX_REGEX.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", value: text.slice(lastIndex, match.index) });
    }

    const rows = parseMatrixLiteral(match[0]);
    if (rows) {
      parts.push({ type: "matrix", value: rows });
    } else {
      parts.push({ type: "text", value: match[0] });
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: "text", value: text.slice(lastIndex) });
  }

  return parts;
}

function MathText({ text }) {
  if (!text) return null;

  // Convert symbol notation before rendering
  const sanitizedText = processSymbols(text);

  // Render block math ($$...$$) first
  const blockParts = sanitizedText.split(/(\$\$[^$]+\$\$)/g);

  return (
    <>
      {blockParts.map((blockPart, bi) => {
        if (blockPart.startsWith("$$") && blockPart.endsWith("$$")) {
          return <BlockMath key={bi} math={blockPart.slice(2, -2)} settings={katexOptions} />;
        }

        // Inline math ($...$)
        const inlineParts = blockPart.split(/(\$[^$]+\$)/g);

        return (
          <span key={bi}>
            {inlineParts.map((part, i) => {
              if (part.startsWith("$") && part.endsWith("$") && part.length > 2) {
                return <InlineMath key={i} math={part.slice(1, -1)} settings={katexOptions} />;
              }

              // Plain text segment - check it for [[1,2],[3,4]] matrix literals
              const segments = renderWithMatrices(part);

              return (
                <span key={i}>
                  {segments.map((seg, si) =>
                    seg.type === "matrix" ? (
                      <MatrixGrid key={si} rows={seg.value} />
                    ) : (
                      <span key={si} style={{ whiteSpace: "pre-wrap" }}>
                        {seg.value}
                      </span>
                    )
                  )}
                </span>
              );
            })}
          </span>
        );
      })}
    </>
  );
}

export default MathText;
