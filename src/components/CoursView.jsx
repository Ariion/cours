// src/components/CoursView.jsx
// Vue cours style Kartable — sommaire latéral, sections numérotées I/II/III, quiz final

import { useState, useEffect, useRef } from "react";
import MathRenderer, { MathBlock } from "./MathRenderer";

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

// ── Types de blocs → rendu Kartable ───────────────────────────────────────────
const BLOC_STYLES = {
  definition: { bg: "#eff6ff", border: "#3b82f6", label: "DÉFINITION", labelBg: "#3b82f6", labelColor: "#fff", titleColor: "#1d4ed8" },
  theoreme:   { bg: "#fff9ed", border: "#f59e0b", label: "THÉORÈME",   labelBg: "#f59e0b", labelColor: "#fff", titleColor: "#92400e" },
  exemple:    { bg: "#f9fafb", border: "#9ca3af", label: "EXEMPLE",    labelBg: "#6b7280", labelColor: "#fff", titleColor: "#374151" },
  methode:    { bg: "#f5f3ff", border: "#8b5cf6", label: "MÉTHODE",    labelBg: "#8b5cf6", labelColor: "#fff", titleColor: "#5b21b6" },
  remarque:   { bg: "#fffbeb", border: "#f59e0b", label: "REMARQUE",   labelBg: "#fef3c7", labelColor: "#92400e", icon: "🤓", titleColor: "#92400e" },
};

// ── Rendu d'un bloc ─────────────────────────────────────────────────────────────
function Bloc({ block }) {
  const s = BLOC_STYLES[block.type];

  if (block.type === "texte") {
    return (
      <p style={{ fontSize: 16, lineHeight: 1.85, color: "#374151", margin: "0 0 16px", fontFamily: "'Source Serif 4', Georgia, serif" }}>
        <MathRenderer formula={block.content} block={false} />
      </p>
    );
  }

  if (block.type === "formule") {
    return (
      <div style={{ margin: "20px 0", padding: "18px 24px", background: "#f0f5ff", borderRadius: 10, border: "1px solid #c7d7fd", textAlign: "center" }}>
        <MathBlock formula={block.content} />
      </div>
    );
  }

  if (!s) return null;

  // Bloc remarque (style spécial avec emoji)
  if (block.type === "remarque") {
    return (
      <div style={{ margin: "16px 0", background: s.bg, border: `1px solid #fde68a`, borderRadius: 10, padding: "16px 20px", display: "flex", gap: 14 }}>
        <div style={{ fontSize: 24, flexShrink: 0, marginTop: 2 }}>🤓</div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#92400e", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>REMARQUE</div>
          {block.titre && <div style={{ fontSize: 15, fontWeight: 700, color: "#92400e", marginBottom: 8 }}>{block.titre}</div>}
          <div style={{ fontSize: 15, lineHeight: 1.8, color: "#78350f", fontFamily: "'Source Serif 4', Georgia, serif" }}>
            <MathRenderer formula={block.content} block={false} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ margin: "16px 0", background: s.bg, border: `1px solid ${s.border}40`, borderRadius: 10, overflow: "hidden" }}>
      {/* Badge label */}
      <div style={{ padding: "0 20px", paddingTop: 14, paddingBottom: block.titre ? 0 : 14, display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 800, background: s.labelBg, color: s.labelColor, padding: "3px 10px", borderRadius: 4, letterSpacing: "0.08em", flexShrink: 0 }}>
          {s.label}
        </span>
        {block.titre && <span style={{ fontSize: 15, fontWeight: 700, color: s.titleColor, fontFamily: "'Source Serif 4', Georgia, serif" }}>{block.titre}</span>}
      </div>
      <div style={{ padding: "10px 20px 16px", fontSize: 15, lineHeight: 1.85, color: "#374151", fontFamily: "'Source Serif 4', Georgia, serif", whiteSpace: "pre-line" }}>
        <MathRenderer formula={block.content} block={false} />
      </div>
    </div>
  );
}

// ── Sections (groupes de blocs numérotés) ─────────────────────────────────────
// On regroupe les blocs par sections basées sur les blocs "texte" principaux
// et on numérote avec des chiffres romains comme Kartable

function groupBlocksIntoSections(blocks) {
  // Si l'IA a généré des blocs, on crée des sections logiques
  // On regroupe : intro texte → puis les blocs associés
  const sections = [];
  let current = null;

  for (const block of blocks) {
    // Heuristique : un bloc texte long (>100 chars) commence une section
    const isHeader = block.type === "texte" && (block.content || "").length > 80 && sections.length < 8;

    if (isHeader && current) {
      sections.push(current);
      current = { title: (block.content || "").slice(0, 60) + "…", blocks: [block] };
    } else if (!current) {
      if (block.type === "texte" && (block.content || "").length > 60) {
        current = { title: (block.content || "").slice(0, 60) + "…", blocks: [block] };
      } else {
        // Crée une section générique
        current = { title: null, blocks: [block] };
      }
    } else {
      current.blocks.push(block);
    }
  }
  if (current) sections.push(current);

  // Si trop peu de sections, on ne sectionne pas
  if (sections.length <= 1) return [{ title: null, blocks }];
  return sections;
}

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

// ── Quiz intégré ────────────────────────────────────────────────────────────────
function QuizBlock({ questions }) {
  const [step, setStep] = useState(0); // index question
  const [answers, setAnswers] = useState({}); // qid -> choix
  const [submitted, setSubmitted] = useState(false);
  const [showExpl, setShowExpl] = useState({});

  if (!questions || questions.length === 0) return null;

  const q = questions[step];
  const total = questions.length;
  const answered = Object.keys(answers).length;

  const handleAnswer = (qid, choice) => {
    if (answers[qid] !== undefined) return; // déjà répondu
    setAnswers(prev => ({ ...prev, [qid]: choice }));
    setShowExpl(prev => ({ ...prev, [qid]: true }));
    // Avance auto après 1.5s
    if (step < total - 1) {
      setTimeout(() => setStep(s => s + 1), 1800);
    } else {
      setTimeout(() => setSubmitted(true), 1800);
    }
  };

  const score = questions.filter(q => answers[q.id] === q.bonne_reponse).length;

  if (submitted) {
    return (
      <div style={{ marginTop: 40, background: "linear-gradient(135deg, #f0fdf4, #dcfce7)", border: "1px solid #86efac", borderRadius: 14, padding: "28px 32px" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>
            {score === total ? "🏆" : score >= total * 0.7 ? "🎉" : score >= total * 0.5 ? "📚" : "💪"}
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#15803d", marginBottom: 4 }}>
            {score}/{total} — {score === total ? "Parfait !" : score >= total * 0.7 ? "Très bien !" : score >= total * 0.5 ? "Bien, continue !" : "Continue à réviser !"}
          </div>
          <div style={{ fontSize: 14, color: "#166534" }}>
            {score === total ? "Tu maîtrises ce cours 🌟" : `Tu as ${total - score} question${total - score > 1 ? "s" : ""} à revoir`}
          </div>
        </div>

        {/* Récapitulatif avec explications */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {questions.map((q, i) => {
            const isCorrect = answers[q.id] === q.bonne_reponse;
            return (
              <div key={q.id} style={{ background: "#fff", borderRadius: 10, padding: "14px 18px", border: `1px solid ${isCorrect ? "#86efac" : "#fca5a5"}` }}>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{ fontSize: 16, flexShrink: 0 }}>{isCorrect ? "✅" : "❌"}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", marginBottom: 6 }}>
                      <MathRenderer formula={q.question} block={false} />
                    </div>
                    {!isCorrect && (
                      <div style={{ fontSize: 13, color: "#dc2626", marginBottom: 4 }}>
                        Ta réponse : <strong>{answers[q.id]}</strong> — Bonne réponse : <strong style={{ color: "#16a34a" }}>{q.bonne_reponse}</strong>
                      </div>
                    )}
                    {q.explication && (
                      <div style={{ fontSize: 13, color: "#374151", background: isCorrect ? "#f0fdf4" : "#fff7ed", padding: "8px 12px", borderRadius: 8, border: `1px solid ${isCorrect ? "#bbf7d0" : "#fed7aa"}`, marginTop: 6, lineHeight: 1.7 }}>
                        💡 <MathRenderer formula={q.explication} block={false} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button onClick={() => { setStep(0); setAnswers({}); setSubmitted(false); setShowExpl({}); }}
          style={{ marginTop: 20, width: "100%", padding: "12px", borderRadius: 10, border: "none", background: "#16a34a", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
          🔄 Recommencer le quiz
        </button>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 40, background: "#fff", border: "2px solid #e0e7ff", borderRadius: 14, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>🧠</span>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>Quiz du cours</span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {questions.map((_, i) => (
            <div key={i} style={{ width: 28, height: 6, borderRadius: 3, background: i < step ? "#a5f3fc" : i === step ? "#fff" : "rgba(255,255,255,0.3)", transition: "all 0.3s" }} />
          ))}
        </div>
      </div>

      {/* Question */}
      <div style={{ padding: "24px 28px" }}>
        <div style={{ fontSize: 12, color: "#6366f1", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
          Question {step + 1}/{total}
        </div>
        <div style={{ fontSize: 17, fontWeight: 600, color: "#1e293b", lineHeight: 1.6, marginBottom: 20 }}>
          <MathRenderer formula={q.question} block={false} />
        </div>

        {/* Options */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {q.options.map((opt, i) => {
            const isSelected = answers[q.id] === opt;
            const isCorrect = opt === q.bonne_reponse;
            const hasAnswered = answers[q.id] !== undefined;
            let bg = "#f8f9ff", border = "#e0e7ff", color = "#374151";
            if (hasAnswered) {
              if (isCorrect) { bg = "#f0fdf4"; border = "#86efac"; color = "#15803d"; }
              else if (isSelected) { bg = "#fff5f5"; border = "#fca5a5"; color = "#dc2626"; }
              else { bg = "#f8f9ff"; border = "#e2e8f0"; color = "#94a3b8"; }
            } else if (isSelected) {
              bg = "#eef2ff"; border = "#6366f1"; color = "#4338ca";
            }

            return (
              <button key={i} type="button"
                onClick={() => handleAnswer(q.id, opt)}
                disabled={hasAnswered}
                style={{ padding: "12px 18px", borderRadius: 10, border: `1.5px solid ${border}`, background: bg, color, fontSize: 15, fontWeight: hasAnswered && isCorrect ? 700 : 500, cursor: hasAnswered ? "default" : "pointer", textAlign: "left", fontFamily: "inherit", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ width: 26, height: 26, borderRadius: "50%", border: `2px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color, flexShrink: 0, background: hasAnswered && isCorrect ? "#86efac" : hasAnswered && isSelected ? "#fca5a5" : "transparent" }}>
                  {hasAnswered ? (isCorrect ? "✓" : isSelected ? "✗" : ["A","B","C","D"][i]) : ["A","B","C","D"][i]}
                </span>
                <MathRenderer formula={opt} block={false} />
              </button>
            );
          })}
        </div>

        {/* Explication inline */}
        {showExpl[q.id] && q.explication && (
          <div style={{ marginTop: 14, padding: "12px 16px", background: answers[q.id] === q.bonne_reponse ? "#f0fdf4" : "#fff7ed", borderRadius: 10, border: `1px solid ${answers[q.id] === q.bonne_reponse ? "#bbf7d0" : "#fed7aa"}`, fontSize: 14, lineHeight: 1.7, color: "#374151" }}>
            💡 <strong>{answers[q.id] === q.bonne_reponse ? "Correct !" : "Pas tout à fait."}</strong> &nbsp;
            <MathRenderer formula={q.explication} block={false} />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Composant principal CoursView ──────────────────────────────────────────────
export default function CoursView({ cours, onBack }) {
  const blocks = (() => { try { return JSON.parse(cours.contenu || "[]"); } catch { return []; } })();
  const [activeSection, setActiveSection] = useState(0);
  const sectionRefs = useRef([]);

  // Grouper les blocs en sections avec titres
  const sections = groupBlocksIntoSections(blocks);

  // Construire le sommaire à partir des blocs définition/theoreme
  const sommaire = sections.map((s, i) => ({
    num: ROMAN[i] || (i + 1).toString(),
    title: s.title || (s.blocks.find(b => b.titre)?.titre) || `Section ${i + 1}`,
    idx: i,
  }));

  // Quiz : chercher si le cours a des questions de quiz dans les métadonnées
  // ou générer des questions simples à partir des blocs (fallback)
  const quizQuestions = (() => {
    try {
      const meta = cours.quiz ? JSON.parse(cours.quiz) : null;
      if (meta && Array.isArray(meta)) return meta;
    } catch {}

    // Quiz auto-généré depuis les blocs définition/theoreme
    const defs = blocks.filter(b => b.type === "definition" && b.titre);
    const theos = blocks.filter(b => b.type === "theoreme" && b.titre);
    const pool = [...defs, ...theos];

    if (pool.length < 2) return [];

    // Questions basiques auto-générées
    return pool.slice(0, 4).map((b, i) => ({
      id: `auto_q${i}`,
      question: `Quel est le contenu du bloc "${b.titre}" ?`,
      options: [
        b.content.slice(0, 60) + "…",
        "C'est une formule algébrique",
        "C'est un exemple de calcul",
        "C'est une définition géométrique",
      ].sort(() => Math.random() - 0.5),
      bonne_reponse: b.content.slice(0, 60) + "…",
      explication: b.content.slice(0, 150),
    }));
  })();

  // Scroll spy
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const idx = sectionRefs.current.indexOf(e.target);
          if (idx >= 0) setActiveSection(idx);
        }
      });
    }, { threshold: 0.3, rootMargin: "-100px 0px -60% 0px" });
    sectionRefs.current.forEach(r => r && observer.observe(r));
    return () => observer.disconnect();
  }, [sections.length]);

  const scrollTo = (idx) => {
    sectionRefs.current[idx]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Stats pour le header
  const nbDefs = blocks.filter(b => b.type === "definition").length;
  const nbTheos = blocks.filter(b => b.type === "theoreme").length;
  const nbExs = blocks.filter(b => b.type === "exemple").length;

  return (
    <div style={{ minHeight: "100vh", background: "#fff", fontFamily: "'Source Serif 4', Georgia, serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px)} to {opacity:1;transform:translateY(0)} }
        .section-block { animation: fadeIn 0.4s ease both; }
      `}</style>

      {/* Nav */}
      <div style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(255,255,255,0.97)", backdropFilter: "blur(10px)", borderBottom: "1px solid #f1f5f9", padding: "12px 32px", display: "flex", alignItems: "center", gap: 16 }}>
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#64748b", background: "#f1f5f9", border: "none", borderRadius: 8, padding: "7px 14px", cursor: "pointer", fontWeight: 600, fontFamily: "DM Sans, sans-serif" }}>
          ← Retour
        </button>
        <div style={{ height: 20, width: 1, background: "#e2e8f0" }} />
        {/* Fil d'Ariane */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#94a3b8", fontFamily: "DM Sans, sans-serif" }}>
          <span>Mathématiques</span>
          <span>›</span>
          <span>{cours.niveau}</span>
          <span>›</span>
          <span style={{ color: "#374151", fontWeight: 600 }}>{cours.titre}</span>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <span style={{ fontSize: 11, background: "#eff6ff", color: "#2563eb", padding: "3px 10px", borderRadius: 20, fontWeight: 700, fontFamily: "DM Sans, sans-serif" }}>{cours.matiere}</span>
          <span style={{ fontSize: 11, background: "#f1f5f9", color: "#64748b", padding: "3px 10px", borderRadius: 20, fontWeight: 600, fontFamily: "DM Sans, sans-serif" }}>{cours.niveau}</span>
        </div>
      </div>

      <div style={{ display: "flex", maxWidth: 1200, margin: "0 auto" }}>

        {/* ── Contenu principal ─────────────────────────────────────────── */}
        <main style={{ flex: 1, padding: "48px 56px 100px 56px", minWidth: 0 }}>
          {/* Header cours */}
          <div style={{ marginBottom: 40 }}>
            {cours.chapitre && cours.chapitre !== cours.titre && (
              <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10, fontFamily: "DM Sans, sans-serif" }}>
                {cours.chapitre}
              </div>
            )}
            <h1 style={{ fontSize: 36, fontWeight: 700, color: "#0f172a", lineHeight: 1.2, margin: "0 0 16px" }}>
              {cours.titre}
            </h1>

            {/* Chips stats */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", fontFamily: "DM Sans, sans-serif" }}>
              {nbDefs > 0 && <span style={{ fontSize: 12, fontWeight: 700, color: "#2563eb", background: "#eff6ff", borderRadius: 6, padding: "4px 12px", border: "1px solid #bfdbfe" }}>{nbDefs} Définition{nbDefs > 1 ? "s" : ""}</span>}
              {nbTheos > 0 && <span style={{ fontSize: 12, fontWeight: 700, color: "#b45309", background: "#fef3c7", borderRadius: 6, padding: "4px 12px", border: "1px solid #fde68a" }}>{nbTheos} Théorème{nbTheos > 1 ? "s" : ""}</span>}
              {nbExs > 0 && <span style={{ fontSize: 12, fontWeight: 700, color: "#374151", background: "#f3f4f6", borderRadius: 6, padding: "4px 12px", border: "1px solid #e5e7eb" }}>{nbExs} Exemple{nbExs > 1 ? "s" : ""}</span>}
              {quizQuestions.length > 0 && <span style={{ fontSize: 12, fontWeight: 700, color: "#5b21b6", background: "#f5f3ff", borderRadius: 6, padding: "4px 12px", border: "1px solid #ddd6fe" }}>🧠 Quiz disponible</span>}
            </div>
          </div>

          <div style={{ height: 1, background: "#f1f5f9", marginBottom: 40 }} />

          {/* Sections */}
          {sections.map((section, si) => (
            <section key={si}
              ref={el => sectionRefs.current[si] = el}
              className="section-block"
              style={{ marginBottom: 52, scrollMarginTop: 80, animationDelay: `${si * 0.06}s` }}>

              {/* Titre de section style Kartable */}
              {sommaire.length > 1 && (
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
                  <div style={{ width: 36, height: 36, background: "#1d4ed8", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#fff", flexShrink: 0, fontFamily: "DM Sans, sans-serif" }}>
                    {sommaire[si]?.num}
                  </div>
                  {sommaire[si]?.title && (
                    <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1d4ed8", margin: 0, lineHeight: 1.3 }}>
                      {sommaire[si].title.replace("…", "").trim()}
                    </h2>
                  )}
                </div>
              )}

              {/* Blocs de la section */}
              {section.blocks.map((block, bi) => (
                <Bloc key={block.id || `${si}-${bi}`} block={block} />
              ))}

              {si < sections.length - 1 && <div style={{ height: 1, background: "#f1f5f9", marginTop: 40 }} />}
            </section>
          ))}

          {/* Quiz */}
          {quizQuestions.length > 0 && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
                <div style={{ width: 36, height: 36, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🧠</div>
                <div>
                  <h2 style={{ fontSize: 22, fontWeight: 700, color: "#4338ca", margin: 0 }}>Quiz — Teste tes connaissances</h2>
                  <p style={{ fontSize: 13, color: "#6b7280", margin: "4px 0 0", fontFamily: "DM Sans, sans-serif" }}>Réponds aux questions. Pour chaque erreur, une explication t'est donnée.</p>
                </div>
              </div>
              <QuizBlock questions={quizQuestions} />
            </div>
          )}

          {/* Footer */}
          <div style={{ marginTop: 56, padding: "28px 32px", background: "linear-gradient(135deg, #f0f9ff, #e0f2fe)", borderRadius: 14, textAlign: "center", border: "1px solid #bae6fd" }}>
            <div style={{ fontSize: 26, marginBottom: 8 }}>🎉</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#0369a1", marginBottom: 4 }}>Cours terminé !</div>
            <div style={{ fontSize: 13, color: "#0284c7", marginBottom: 18, fontFamily: "DM Sans, sans-serif" }}>{blocks.length} sections · {nbDefs + nbTheos} notions clés</div>
            <button onClick={onBack} style={{ background: "#0369a1", color: "#fff", border: "none", borderRadius: 10, padding: "10px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "DM Sans, sans-serif" }}>← Retour aux cours</button>
          </div>
        </main>

        {/* ── Sommaire latéral (style Kartable) ──────────────────────────── */}
        {sommaire.length > 1 && (
          <aside style={{ width: 260, flexShrink: 0, padding: "48px 0 48px 0" }}>
            <div style={{ position: "sticky", top: 70, padding: "0 24px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16, fontFamily: "DM Sans, sans-serif" }}>
                Sommaire
              </div>
              <nav>
                {sommaire.map((item, i) => (
                  <div key={i} onClick={() => scrollTo(i)}
                    style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 12px", borderRadius: 8, cursor: "pointer", marginBottom: 4, background: activeSection === i ? "#eff6ff" : "transparent", transition: "all 0.15s" }}
                    onMouseEnter={e => { if (activeSection !== i) e.currentTarget.style.background = "#f8fafc"; }}
                    onMouseLeave={e => { if (activeSection !== i) e.currentTarget.style.background = "transparent"; }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: activeSection === i ? "#2563eb" : "#94a3b8", width: 20, flexShrink: 0, fontFamily: "DM Sans, sans-serif", marginTop: 1 }}>{item.num}</span>
                    <span style={{ fontSize: 13, color: activeSection === i ? "#1d4ed8" : "#64748b", fontWeight: activeSection === i ? 600 : 400, lineHeight: 1.4, fontFamily: "DM Sans, sans-serif" }}>
                      {item.title.replace("…", "").slice(0, 55)}
                    </span>
                  </div>
                ))}
                {quizQuestions.length > 0 && (
                  <div onClick={() => window.scrollTo({ top: 99999, behavior: "smooth" })}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, cursor: "pointer", marginTop: 8, background: "#f5f3ff", border: "1px solid #ddd6fe", transition: "all 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#ede9fe"}
                    onMouseLeave={e => e.currentTarget.style.background = "#f5f3ff"}>
                    <span>🧠</span>
                    <span style={{ fontSize: 13, color: "#5b21b6", fontWeight: 700, fontFamily: "DM Sans, sans-serif" }}>Quiz du cours</span>
                  </div>
                )}
              </nav>

              {/* Box "points clés" */}
              {(nbDefs > 0 || nbTheos > 0) && (
                <div style={{ marginTop: 28, padding: "16px", background: "#f8f9ff", borderRadius: 12, border: "1px solid #e0e7ff" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#6366f1", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12, fontFamily: "DM Sans, sans-serif" }}>Points clés</div>
                  {nbDefs > 0 && <div style={{ fontSize: 12, color: "#374151", marginBottom: 6, display: "flex", gap: 8, fontFamily: "DM Sans, sans-serif" }}><span style={{ background: "#3b82f6", color: "#fff", fontSize: 9, padding: "2px 6px", borderRadius: 3, fontWeight: 800, flexShrink: 0, marginTop: 1 }}>DÉFS</span>{nbDefs} définition{nbDefs > 1 ? "s" : ""}</div>}
                  {nbTheos > 0 && <div style={{ fontSize: 12, color: "#374151", marginBottom: 6, display: "flex", gap: 8, fontFamily: "DM Sans, sans-serif" }}><span style={{ background: "#f59e0b", color: "#fff", fontSize: 9, padding: "2px 6px", borderRadius: 3, fontWeight: 800, flexShrink: 0, marginTop: 1 }}>THÉ</span>{nbTheos} théorème{nbTheos > 1 ? "s" : ""}</div>}
                  {nbExs > 0 && <div style={{ fontSize: 12, color: "#374151", display: "flex", gap: 8, fontFamily: "DM Sans, sans-serif" }}><span style={{ background: "#6b7280", color: "#fff", fontSize: 9, padding: "2px 6px", borderRadius: 3, fontWeight: 800, flexShrink: 0, marginTop: 1 }}>EX</span>{nbExs} exemple{nbExs > 1 ? "s" : ""}</div>}
                </div>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}