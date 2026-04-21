// src/components/MathInput.jsx
// Éditeur mathématique avec rendu KaTeX en temps réel

import { useState, useRef, useEffect } from "react";

function loadKaTeX() {
  return new Promise((resolve) => {
    if (window.katex) { resolve(window.katex); return; }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css";
    document.head.appendChild(link);
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js";
    script.onload = () => resolve(window.katex);
    document.head.appendChild(script);
  });
}

export function toLatex(raw) {
  if (!raw) return "";
  let s = raw;
  s = s.replace(/\^(-?\d+)/g, "^{$1}");
  s = s.replace(/\^([a-zA-Z])\b/g, "^{$1}");
  s = s.replace(/_(\d+)/g, "_{$1}");
  s = s.replace(/sqrt\(([^)]+)\)/g, "\\sqrt{$1}");
  s = s.replace(/√\(([^)]+)\)/g, "\\sqrt{$1}");
  s = s.replace(/√(\S+)/g, "\\sqrt{$1}");
  s = s.replace(/\(([^)]+)\)\/\(([^)]+)\)/g, "\\frac{$1}{$2}");
  s = s.replace(/\(([^)]+)\)\/([a-zA-Z0-9]+)/g, "\\frac{$1}{$2}");
  s = s.replace(/([a-zA-Z0-9]+)\/\(([^)]+)\)/g, "\\frac{$1}{$2}");
  s = s.replace(/(\d+)\/(\d+)/g, "\\frac{$1}{$2}");
  s = s.replace(/\*/g, "\\times ");
  s = s.replace(/×/g, "\\times ");
  s = s.replace(/>=/g, "\\geq ");
  s = s.replace(/<=/g, "\\leq ");
  s = s.replace(/!=/g, "\\neq ");
  s = s.replace(/\bpi\b/gi, "\\pi");
  s = s.replace(/∞|infty/g, "\\infty");
  s = s.replace(/\bDelta\b/g, "\\Delta");
  s = s.replace(/\balpha\b/g, "\\alpha");
  s = s.replace(/\bbeta\b/g, "\\beta");
  s = s.replace(/\btheta\b/g, "\\theta");
  return s;
}

const SYMBOL_GROUPS = [
  { label: "Puissances & racines", symbols: [
    { d: "x²", ins: "^2", tip: "Carré" },
    { d: "x³", ins: "^3", tip: "Cube" },
    { d: "xⁿ", ins: "^n", tip: "Puissance n" },
    { d: "√", ins: "sqrt()", tip: "Racine carrée", cur: -1 },
    { d: "10ⁿ", ins: "*10^", tip: "Puissance de 10" },
  ]},
  { label: "Fractions", symbols: [
    { d: "a/b", ins: "/", tip: "Fraction  ex: 3/4" },
    { d: "½", ins: "1/2", tip: "Un demi" },
    { d: "¼", ins: "1/4", tip: "Un quart" },
    { d: "¾", ins: "3/4", tip: "Trois quarts" },
    { d: "⅓", ins: "1/3", tip: "Un tiers" },
  ]},
  { label: "Comparaisons", symbols: [
    { d: "≤", ins: "<=", tip: "Inférieur ou égal" },
    { d: "≥", ins: ">=", tip: "Supérieur ou égal" },
    { d: "≠", ins: "!=", tip: "Différent de" },
    { d: "≈", ins: "\\approx ", tip: "Environ" },
    { d: "∈", ins: "\\in ", tip: "Appartient à" },
  ]},
  { label: "Lettres", symbols: [
    { d: "π", ins: "pi", tip: "Pi (3,14…)" },
    { d: "∞", ins: "infty", tip: "Infini" },
    { d: "Δ", ins: "Delta", tip: "Delta" },
    { d: "α", ins: "alpha", tip: "Alpha" },
    { d: "β", ins: "beta", tip: "Bêta" },
    { d: "θ", ins: "theta", tip: "Thêta" },
    { d: "×", ins: "×", tip: "Multiplication" },
    { d: "÷", ins: "/", tip: "Division" },
  ]},
];

export default function MathInput({ value, onChange, placeholder, rows = 3, label }) {
  const taRef = useRef(null);
  const previewRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [activeGroup, setActiveGroup] = useState(0);
  const [focused, setFocused] = useState(false);
  const [tip, setTip] = useState(null);

  useEffect(() => { loadKaTeX().then(() => setReady(true)); }, []);

  useEffect(() => {
    if (!ready || !previewRef.current) return;
    const latex = toLatex(value || "");
    if (!latex.trim()) { previewRef.current.innerHTML = '<span style="color:#94a3b8;font-size:13px;font-style:italic">Le rendu apparaîtra ici…</span>'; return; }
    try {
      window.katex.render(latex, previewRef.current, { displayMode: false, throwOnError: false, output: "html" });
    } catch { previewRef.current.textContent = latex; }
  }, [value, ready]);

  const insert = (text, cursorAdj = 0) => {
    const ta = taRef.current;
    if (!ta) { onChange((value || "") + text); return; }
    const s = ta.selectionStart, e = ta.selectionEnd;
    const nv = (value || "").slice(0, s) + text + (value || "").slice(e);
    onChange(nv);
    const pos = s + text.length + cursorAdj;
    setTimeout(() => { ta.focus(); ta.setSelectionRange(pos, pos); }, 8);
  };

  return (
    <div style={{ fontFamily: "sans-serif" }}>
      {label && <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>{label}</div>}

      <div style={{ border: `2px solid ${focused ? "#6366f1" : "#e2e8f0"}`, borderRadius: 14, overflow: "hidden", transition: "border-color 0.2s", background: "#fff", boxShadow: focused ? "0 0 0 3px rgba(99,102,241,0.1)" : "0 2px 8px rgba(0,0,0,0.04)" }}>

        {/* Palette — groupes */}
        <div style={{ background: "#f8f9ff", borderBottom: "1px solid #eef0f8" }}>
          <div style={{ display: "flex", borderBottom: "1px solid #eef0f8" }}>
            {SYMBOL_GROUPS.map((g, i) => (
              <button key={i} type="button" onClick={() => setActiveGroup(i)}
                style={{ padding: "8px 14px", border: "none", background: "none", cursor: "pointer", fontSize: 11, fontWeight: activeGroup === i ? 700 : 500, color: activeGroup === i ? "#6366f1" : "#94a3b8", borderBottom: `2px solid ${activeGroup === i ? "#6366f1" : "transparent"}`, whiteSpace: "nowrap", fontFamily: "inherit", transition: "all 0.15s" }}>
                {g.label}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, padding: "8px 12px", alignItems: "center" }}>
            {SYMBOL_GROUPS[activeGroup].symbols.map((sym, i) => (
              <div key={i} style={{ position: "relative" }}>
                <button type="button"
                  onClick={() => insert(sym.ins, sym.cur || 0)}
                  onMouseEnter={() => setTip(i)}
                  onMouseLeave={() => setTip(null)}
                  style={{ padding: "5px 14px", borderRadius: 8, border: "1.5px solid #dde1f5", background: "#fff", fontSize: 15, cursor: "pointer", color: "#1e293b", fontFamily: "Georgia, serif", fontWeight: 600, lineHeight: 1.5, transition: "all 0.12s", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
                  onMouseOver={e => { e.currentTarget.style.background = "#eef2ff"; e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.color = "#4338ca"; }}
                  onMouseOut={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "#dde1f5"; e.currentTarget.style.color = "#1e293b"; }}
                >{sym.d}</button>
                {tip === i && (
                  <div style={{ position: "absolute", bottom: "110%", left: "50%", transform: "translateX(-50%)", background: "#1e293b", color: "#fff", fontSize: 10, fontFamily: "sans-serif", padding: "4px 8px", borderRadius: 6, whiteSpace: "nowrap", pointerEvents: "none", zIndex: 10, fontWeight: 500 }}>
                    {sym.tip}
                  </div>
                )}
              </div>
            ))}
            <div style={{ marginLeft: "auto", fontSize: 11, color: "#94a3b8", fontStyle: "italic" }}>
              Tape normalement ou clique sur un symbole
            </div>
          </div>
        </div>

        {/* Zone de saisie */}
        <textarea ref={taRef} value={value || ""} onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          placeholder={placeholder || "Écris ta réponse… ex: 2x + 3 = 7  →  x = 2"}
          rows={rows}
          style={{ width: "100%", padding: "14px 16px", border: "none", outline: "none", fontSize: 15, fontFamily: "'Courier New', monospace", resize: "vertical", boxSizing: "border-box", lineHeight: 1.8, color: "#1e293b", background: "#fff", letterSpacing: "0.02em" }}
        />

        {/* Rendu KaTeX live */}
        <div style={{ borderTop: "1px solid #eef0f8", padding: "10px 16px", background: "#f8f9ff", display: "flex", alignItems: "flex-start", gap: 10, minHeight: 44 }}>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#6366f1", paddingTop: 4, flexShrink: 0 }}>Rendu</div>
          <div ref={previewRef} style={{ fontSize: 16, color: "#1e293b", lineHeight: 1.8, flex: 1 }} />
        </div>
      </div>
    </div>
  );
}