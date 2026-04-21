// src/components/ExerciceView.jsx
// Exercices guidés avec indices progressifs, saisie math propre, soumission partielle

import { useState } from "react";
import { supabase } from "../lib/supabase";
import MathRenderer from "./MathRenderer";
import MathInput from "./MathInput";

// ── Badge difficulté ───────────────────────────────────────────────────────────
function DiffBadge({ n }) {
  const cfg = [
    null,
    { label: "Facile",        color: "#15803d", bg: "#f0fdf4", border: "#86efac" },
    { label: "Intermédiaire", color: "#b45309", bg: "#fffbeb", border: "#fde68a" },
    { label: "Type Brevet",   color: "#b91c1c", bg: "#fff5f5", border: "#fecaca" },
  ];
  const c = cfg[n] || cfg[1];
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 6, background: c.bg, color: c.color, border: `1px solid ${c.border}`, fontFamily: "DM Sans, sans-serif" }}>
      {c.label}
    </span>
  );
}

// ── Carte question ─────────────────────────────────────────────────────────────
function QuestionCard({ question, index, reponse, onReponseChange, submitted }) {
  const [hintsShown, setHintsShown] = useState(0);
  const hints = question.indices || [];
  const isAnswered = (reponse || "").trim().length > 0;

  return (
    <div style={{
      background: "#fff",
      border: `2px solid ${isAnswered ? "#6366f1" : "#e2e8f0"}`,
      borderRadius: 16,
      marginBottom: 24,
      overflow: "hidden",
      boxShadow: isAnswered ? "0 4px 20px rgba(99,102,241,0.1)" : "0 2px 8px rgba(0,0,0,0.04)",
      transition: "all 0.25s",
      fontFamily: "DM Sans, sans-serif",
    }}>
      {/* Barre de progression si répondu */}
      {isAnswered && <div style={{ height: 3, background: "linear-gradient(90deg, #6366f1, #8b5cf6)" }} />}

      {/* Header */}
      <div style={{ padding: "14px 22px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fafbff" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: isAnswered ? "#6366f1" : "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: isAnswered ? "#fff" : "#94a3b8", transition: "all 0.3s" }}>
            {isAnswered ? "✓" : index + 1}
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#374151" }}>Question {index + 1}</span>
        </div>
        <DiffBadge n={question.difficulte || 1} />
      </div>

      {/* Corps */}
      <div style={{ padding: "20px 24px" }}>
        {/* Énoncé */}
        <div style={{ fontSize: 16, color: "#1e293b", lineHeight: 1.85, marginBottom: 18, fontFamily: "'Source Serif 4', Georgia, serif", whiteSpace: "pre-line" }}>
          <MathRenderer formula={question.enonce} block={false} />
        </div>

        {/* Figure SVG si présente */}
        {question.figure_svg && (
          <div style={{ margin: "14px 0", padding: 16, background: "#f8faff", borderRadius: 10, border: "1px solid #e2e8f0", display: "flex", justifyContent: "center" }}
            dangerouslySetInnerHTML={{ __html: question.figure_svg }} />
        )}

        {/* QCM */}
        {question.type === "qcm" && question.options && !submitted && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 4 }}>
            {question.options.map((opt, i) => {
              const selected = reponse === opt;
              return (
                <button key={i} type="button"
                  onClick={() => onReponseChange(opt)}
                  style={{
                    padding: "12px 16px", borderRadius: 10, cursor: "pointer", textAlign: "left",
                    border: `2px solid ${selected ? "#6366f1" : "#e2e8f0"}`,
                    background: selected ? "#eef2ff" : "#fff",
                    fontSize: 15, color: selected ? "#4338ca" : "#374151",
                    fontWeight: selected ? 700 : 400,
                    fontFamily: "'Source Serif 4', Georgia, serif",
                    transition: "all 0.15s", display: "flex", alignItems: "center", gap: 12
                  }}>
                  <div style={{ width: 26, height: 26, borderRadius: "50%", border: `2px solid ${selected ? "#6366f1" : "#d1d5db"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: selected ? "#6366f1" : "#9ca3af", flexShrink: 0, background: selected ? "#eef2ff" : "transparent" }}>
                    {["A","B","C","D"][i]}
                  </div>
                  <MathRenderer formula={opt} block={false} />
                </button>
              );
            })}
          </div>
        )}

        {/* Saisie libre avec MathInput */}
        {(question.type === "calcul" || question.type === "redaction" || !question.type) && !submitted && (
          <MathInput
            value={reponse || ""}
            onChange={onReponseChange}
            label={question.type === "redaction" ? "Ta rédaction complète" : "Ta réponse"}
            placeholder={
              question.type === "redaction"
                ? "Rédige ta démonstration pas à pas…"
                : "Ex: x = 3, ou 2x + 5 = 11 donc 2x = 6 donc x = 3"
            }
            rows={question.type === "redaction" ? 6 : 3}
          />
        )}

        {/* Réponse affichée après soumission */}
        {submitted && (reponse || "").trim() && (
          <div style={{ padding: "12px 16px", background: "#f0fdf4", borderRadius: 10, border: "1px solid #86efac", fontSize: 14, color: "#15803d" }}>
            <span style={{ fontWeight: 700 }}>Ta réponse :</span> {reponse}
          </div>
        )}

        {/* Indices progressifs */}
        {hints.length > 0 && !submitted && (
          <div style={{ marginTop: 16 }}>
            {hints.slice(0, hintsShown).map((hint, hi) => (
              <div key={hi} style={{ marginBottom: 8, padding: "10px 14px", background: "#fffbeb", borderRadius: 10, border: "1px solid #fde68a", fontSize: 14, color: "#92400e", lineHeight: 1.6 }}>
                <span style={{ fontWeight: 700 }}>💡 Indice {hi + 1} :</span>{" "}
                <MathRenderer formula={hint} block={false} />
              </div>
            ))}
            {hintsShown < hints.length && (
              <button type="button"
                onClick={() => setHintsShown(h => h + 1)}
                style={{ fontSize: 13, color: "#b45309", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "7px 14px", cursor: "pointer", fontWeight: 600, fontFamily: "inherit" }}>
                💡 Voir un indice ({hints.length - hintsShown} restant{hints.length - hintsShown > 1 ? "s" : ""})
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Composant principal ────────────────────────────────────────────────────────
export default function ExerciceView({ exercice, eleve, onBack }) {
  const questions = exercice.questions || [];
  const [reponses, setReponses] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const setReponse = (qid, val) => setReponses(prev => ({ ...prev, [qid]: val }));
  const answered = questions.filter(q => (reponses[q.id] || "").trim()).length;

  const handleSubmit = async (partial = false) => {
    if (!partial && answered < questions.length) {
      const ok = window.confirm(`Tu n'as répondu qu'à ${answered}/${questions.length} questions.\nEnvoyer quand même ce que tu as fait ?`);
      if (!ok) return;
    }
    if (answered === 0) { alert("Réponds à au moins une question avant d'envoyer."); return; }
    setSubmitting(true);
    const reponsesArray = questions.map(q => ({
      question_id: q.id,
      enonce: q.enonce,
      reponse_eleve: reponses[q.id] || "",
      note_prof: null,
      commentaire_prof: null
    }));
    await supabase.from("soumissions").insert({
      exercice_id: exercice.id,
      eleve_id: eleve?.id,
      eleve_email: eleve?.email,
      eleve_nom: eleve?.nom || eleve?.email,
      reponses: reponsesArray,
      statut: "soumis"
    });
    setSubmitting(false);
    setSubmitted(true);
  };

  // Vue post-soumission
  if (submitted) {
    return (
      <div style={{ minHeight: "100vh", background: "#fafbff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "DM Sans, sans-serif" }}>
        <div style={{ textAlign: "center", maxWidth: 440, padding: 40 }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>📬</div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", marginBottom: 10, fontFamily: "'Source Serif 4', Georgia, serif" }}>Devoir envoyé !</h2>
          <p style={{ fontSize: 15, color: "#64748b", lineHeight: 1.7, marginBottom: 28 }}>
            Ton professeur va corriger ton travail et te donner ses retours.
          </p>
          <button onClick={onBack} style={{ background: "#1d4ed8", color: "#fff", border: "none", borderRadius: 12, padding: "12px 28px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            ← Retour aux exercices
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#fafbff", fontFamily: "DM Sans, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;600;700&family=DM+Sans:wght@400;500;600;700&display=swap'); *{box-sizing:border-box}`}</style>

      {/* Nav */}
      <div style={{ background: "rgba(255,255,255,0.97)", backdropFilter: "blur(10px)", borderBottom: "1px solid #f1f5f9", padding: "13px 36px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <button onClick={onBack} style={{ fontSize: 13, color: "#64748b", background: "#f1f5f9", border: "none", borderRadius: 8, padding: "7px 16px", cursor: "pointer", fontWeight: 600 }}>← Retour</button>
        {/* Progression */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", gap: 4 }}>
            {questions.map((q, i) => (
              <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: (reponses[q.id] || "").trim() ? "#6366f1" : "#e2e8f0", transition: "background 0.3s" }} />
            ))}
          </div>
          <span style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}>{answered}/{questions.length}</span>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "48px 32px 140px" }}>
        {/* Hero */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>{exercice.chapitre}</div>
          <h1 style={{ fontSize: 30, fontWeight: 700, color: "#0f172a", margin: "0 0 12px", fontFamily: "'Source Serif 4', Georgia, serif" }}>{exercice.titre}</h1>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, color: "#92400e", background: "#fffbeb", borderRadius: 8, padding: "9px 14px", border: "1px solid #fde68a" }}>
            <span>💡</span>
            <span>Utilise la barre de symboles pour écrire tes équations. Tu peux envoyer à tout moment.</span>
          </div>
        </div>

        <div style={{ height: 2, background: "linear-gradient(90deg, #6366f1, #e2e8f0)", borderRadius: 2, marginBottom: 36, opacity: 0.6 }} />

        {/* Questions */}
        {questions.map((q, idx) => (
          <QuestionCard
            key={q.id}
            question={q}
            index={idx}
            reponse={reponses[q.id] || ""}
            onReponseChange={val => setReponse(q.id, val)}
            submitted={submitted}
          />
        ))}
      </div>

      {/* Barre d'action fixe en bas */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(255,255,255,0.97)", backdropFilter: "blur(12px)", borderTop: "1px solid #e2e8f0", padding: "14px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 50 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
            {answered === questions.length ? "✅ Tout complété !" : `${answered} / ${questions.length} réponses`}
          </div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>Tu peux envoyer à tout moment, même incomplet</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {answered > 0 && answered < questions.length && (
            <button onClick={() => handleSubmit(true)} disabled={submitting}
              style={{ padding: "11px 20px", borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#f8f9ff", color: "#64748b", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Envoyer ce que j'ai ({answered})
            </button>
          )}
          <button onClick={() => handleSubmit(false)} disabled={submitting || answered === 0}
            style={{ padding: "11px 26px", borderRadius: 10, border: "none", background: answered === 0 ? "#e2e8f0" : submitting ? "#94a3b8" : "#1d4ed8", color: answered === 0 ? "#94a3b8" : "#fff", fontSize: 14, fontWeight: 700, cursor: answered === 0 || submitting ? "not-allowed" : "pointer", transition: "all 0.2s" }}>
            {submitting ? "Envoi…" : answered === questions.length ? "📬 Envoyer" : "📬 Envoyer quand même"}
          </button>
        </div>
      </div>
    </div>
  );
}