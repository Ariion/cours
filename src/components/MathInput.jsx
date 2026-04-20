// src/components/MathInput.jsx
// Saisie mathématique intelligente avec conversion auto et prévisualisation KaTeX

import { useState, useRef, useEffect } from "react";
import MathRenderer from "./MathRenderer";

// Convertit la saisie "naturelle" en LaTeX pour l'affichage
function naturalToLatex(text) {
  if (!text) return "";
  
  let s = text;
  
  // Fractions : a/b → \frac{a}{b} (seulement si pas déjà dans un $)
  // ex: 3/4 → \frac{3}{4}, (x+1)/2 → \frac{x+1}{2}
  s = s.replace(/(\(([^)]+)\)|([a-zA-Z0-9]+))\s*\/\s*(\(([^)]+)\)|([a-zA-Z0-9]+))/g, (_, num) => {
    const numerator = num.startsWith("(") ? num.slice(1, -1) : num;
    return `$FRAC_START$${numerator}$FRAC_MID$`;
  });
  // On simplifie — approche directe plus fiable :
  s = text;
  
  // Puissances : x^2 → x^{2}, x^12 → x^{12}
  s = s.replace(/\^(\d+)/g, "^{$1}");
  s = s.replace(/\^([a-zA-Z])/g, "^{$1}");
  
  // sqrt(x) ou sqrt x → \sqrt{x}
  s = s.replace(/sqrt\(([^)]+)\)/g, "\\sqrt{$1}");
  s = s.replace(/sqrt\s+(\S+)/g, "\\sqrt{$1}");
  s = s.replace(/√(\S*)/g, "\\sqrt{$1}");
  
  // Fractions simples : a/b entre espaces ou début/fin
  s = s.replace(/(\d+)\/(\d+)/g, "\\frac{$1}{$2}");
  
  // × ou * → \times
  s = s.replace(/\*/g, "\\times");
  s = s.replace(/×/g, "\\times");
  
  // >= → \geq, <= → \leq, != → \neq
  s = s.replace(/>=/g, "\\geq");
  s = s.replace(/<=/g, "\\leq");
  s = s.replace(/!=/g, "\\neq");
  s = s.replace(/=>/g, "\\Rightarrow");
  
  // pi → \pi, infini → \infty
  s = s.replace(/\bpi\b/g, "\\pi");
  s = s.replace(/\binfty\b/g, "\\infty");
  s = s.replace(/∞/g, "\\infty");
  
  // Delta → \Delta, alpha, beta...
  s = s.replace(/\bDelta\b/g, "\\Delta");
  s = s.replace(/\bdelta\b/g, "\\delta");
  s = s.replace(/\balpha\b/g, "\\alpha");
  s = s.replace(/\bbeta\b/g, "\\beta");
  
  return s;
}

// Détecte si le texte contient des maths à rendre
function hasMath(text) {
  return /[\^√]|sqrt|\\frac|\\sqrt|\\times|\\geq|\\leq|\d+\/\d+|\bpi\b|\\pi|\\Delta|\\alpha/.test(text);
}

export default function MathInput({ value, onChange, placeholder, rows = 3, label }) {
  const [preview, setPreview] = useState(false);
  const textareaRef = useRef(null);
  
  const converted = naturalToLatex(value || "");
  const showPreviewHint = hasMath(value || "");

  // Boutons d'insertion rapide
  const quickInsert = (symbol) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const newVal = (value || "").slice(0, start) + symbol + (value || "").slice(end);
    onChange(newVal);
    setTimeout(() => {
      ta.focus();
      const pos = start + symbol.length;
      ta.setSelectionRange(pos, pos);
    }, 10);
  };

  const QUICK_SYMBOLS = [
    { label: "x²", val: "x^2" },
    { label: "xⁿ", val: "x^n" },
    { label: "√", val: "sqrt()" },
    { label: "÷", val: "/" },
    { label: "×", val: "×" },
    { label: "≤", val: "<=" },
    { label: "≥", val: ">=" },
    { label: "≠", val: "!=" },
    { label: "π", val: "pi" },
    { label: "∞", val: "infty" },
    { label: "Δ", val: "Delta" },
    { label: "α", val: "alpha" },
    { label: "β", val: "beta" },
  ];

  return (
    <div>
      {label && (
        <label style={{
          fontSize: 11, color: "#94a3b8", fontWeight: 700,
          textTransform: "uppercase", letterSpacing: "0.08em",
          display: "block", marginBottom: 7
        }}>{label}</label>
      )}

      {/* Barre symboles rapides */}
      <div style={{
        display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 6,
        padding: "6px 10px",
        background: "#f8faff", borderRadius: "10px 10px 0 0",
        border: "1.5px solid #e2e8f0", borderBottom: "none"
      }}>
        {QUICK_SYMBOLS.map(s => (
          <button key={s.label} type="button"
            onClick={() => quickInsert(s.val)}
            title={`Insérer ${s.val}`}
            style={{
              padding: "3px 8px", borderRadius: 6,
              border: "1px solid #dce8f7", background: "#fff",
              fontSize: 13, cursor: "pointer", color: "#1a56db",
              fontFamily: "Georgia, serif", fontWeight: 600,
              lineHeight: 1.4, transition: "all 0.1s"
            }}
            onMouseEnter={e => { e.target.style.background = "#eef3ff"; e.target.style.borderColor = "#1a56db"; }}
            onMouseLeave={e => { e.target.style.background = "#fff"; e.target.style.borderColor = "#dce8f7"; }}
          >{s.label}</button>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 10, color: "#aab5cc", fontFamily: "sans-serif" }}>
            Astuce : <code style={{ background: "#f0f4ff", padding: "1px 4px", borderRadius: 3, fontSize: 10 }}>x^2</code> = x², <code style={{ background: "#f0f4ff", padding: "1px 4px", borderRadius: 3, fontSize: 10 }}>sqrt(x)</code> = √x, <code style={{ background: "#f0f4ff", padding: "1px 4px", borderRadius: 3, fontSize: 10 }}>3/4</code> = ¾
          </span>
        </div>
      </div>

      {/* Zone de saisie */}
      <textarea
        ref={textareaRef}
        value={value || ""}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder || "Écris ta réponse ici... (ex: x^2 + 3/4, sqrt(16) = 4)"}
        rows={rows}
        style={{
          width: "100%", padding: "11px 13px",
          borderRadius: showPreviewHint ? "0 0 0 0" : "0 0 10px 10px",
          border: `1.5px solid ${value ? "#7b2fa8" : "#e2e8f0"}`,
          borderTop: "none",
          fontSize: 14, fontFamily: "inherit", resize: "vertical",
          outline: "none", boxSizing: "border-box", lineHeight: 1.7,
          color: "#334155", transition: "border-color 0.15s",
          background: value ? "#fdf8ff" : "#fff"
        }}
        onFocus={e => { e.target.style.borderColor = "#7b2fa8"; }}
        onBlur={e => { e.target.style.borderColor = value ? "#7b2fa8" : "#e2e8f0"; }}
      />

      {/* Prévisualisation math automatique */}
      {showPreviewHint && value && (
        <div style={{
          padding: "10px 14px",
          background: "linear-gradient(135deg, #f8f0ff, #f0f5ff)",
          borderRadius: "0 0 10px 10px",
          border: "1.5px solid #ddd6fe",
          borderTop: "1px solid #ede9fe"
        }}>
          <div style={{
            fontSize: 10, color: "#9c88cc", fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "0.1em",
            marginBottom: 5, fontFamily: "sans-serif",
            display: "flex", alignItems: "center", gap: 5
          }}>
            <span>✨</span> Prévisualisation mathématique
          </div>
          <div style={{ fontSize: 15, color: "#2d1b6e", lineHeight: 1.8 }}>
            <MathRenderer formula={converted} block={false} />
          </div>
        </div>
      )}
    </div>
  );
}