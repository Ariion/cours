// src/pages/EleveHome.jsx
import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import MathRenderer, { MathBlock } from "../components/MathRenderer";
import MathInput from "../components/MathInput";

// ── Thèmes 3e ──────────────────────────────────────────────────────────────────
const THEMES = {
  "Mathématiques": [
    { id: "nombres",   label: "Nombres & Calculs",  icon: "✦", hue: "22",  chapitres: ["Calcul numérique — puissances et racines", "Notation scientifique", "Développement et factorisation avancés"] },
    { id: "algebre",   label: "Algèbre",             icon: "◈", hue: "258", chapitres: ["Équations et inéquations"] },
    { id: "fonctions", label: "Fonctions",            icon: "⌁", hue: "195", chapitres: ["Fonctions linéaires et affines"] },
    { id: "geometrie", label: "Géométrie",            icon: "△", hue: "155", chapitres: ["Théorème de Pythagore — réciproque", "Trigonométrie avancée", "Géométrie dans l'espace"] },
    { id: "donnees",   label: "Données & Hasard",     icon: "◎", hue: "340", chapitres: ["Statistiques — boîte à moustaches", "Probabilités — loi des grands nombres"] },
  ]
};

// ── Figures SVG ────────────────────────────────────────────────────────────────
const FIGURES = {
  "Théorème de Pythagore — réciproque": (
    <svg width="190" height="160" viewBox="0 0 190 160">
      <polygon points="25,140 165,140 25,25" fill="#f0f5ff" stroke="#1a56db" strokeWidth="2"/>
      <rect x="25" y="124" width="16" height="16" fill="none" stroke="#1a56db" strokeWidth="1.5"/>
      <text x="95" y="158" textAnchor="middle" fontSize="13" fill="#1a56db" fontWeight="700" fontFamily="Georgia,serif">a</text>
      <text x="12" y="86" textAnchor="middle" fontSize="13" fill="#1a7a4a" fontWeight="700" fontFamily="Georgia,serif">b</text>
      <text x="110" y="75" textAnchor="middle" fontSize="14" fill="#c2820a" fontWeight="700" fontFamily="Georgia,serif">c</text>
    </svg>
  ),
  "Trigonométrie avancée": (
    <svg width="200" height="170" viewBox="0 0 200 170">
      <polygon points="15,155 175,155 15,25" fill="#f0faf4" stroke="#1a7a4a" strokeWidth="2"/>
      <rect x="15" y="139" width="16" height="16" fill="none" stroke="#1a7a4a" strokeWidth="1.5"/>
      <path d="M 175,155 A 28,28 0 0,0 157,129" fill="none" stroke="#7b2fa8" strokeWidth="1.5" strokeDasharray="4,2"/>
      <text x="149" y="145" fontSize="11" fill="#7b2fa8" fontWeight="700">α</text>
      <text x="95" y="170" textAnchor="middle" fontSize="11" fill="#1a7a4a" fontFamily="Georgia,serif">adjacent</text>
      <text x="4" y="93" fontSize="10" fill="#c2820a" fontFamily="Georgia,serif">opp.</text>
      <text x="106" y="82" fontSize="11" fill="#1a56db" fontFamily="Georgia,serif">hyp.</text>
    </svg>
  ),
};

// ── Config blocs cours ─────────────────────────────────────────────────────────
const BLOC_CFG = {
  texte:      { accent: null,      bg: null,      label: null },
  formule:    { accent: "#1a56db", bg: "#f0f5ff", label: null },
  definition: { accent: "#1a56db", bg: "#f0f5ff", label: "Définition",  icon: "📘" },
  theoreme:   { accent: "#c2820a", bg: "#fff9ed", label: "Théorème",    icon: "⚡" },
  exemple:    { accent: "#1a7a4a", bg: "#f0faf4", label: "Exemple",     icon: "✏️" },
  remarque:   { accent: "#b05b00", bg: "#fff8f0", label: "À retenir",   icon: "💡" },
  methode:    { accent: "#7b2fa8", bg: "#f8f0ff", label: "Méthode",     icon: "🔧" },
};

// ────────────────────────────────────────────────────────────────────────────────
// COMPOSANT BLOC COURS
// ────────────────────────────────────────────────────────────────────────────────
function BlocCours({ block, figureSvg }) {
  const cfg = BLOC_CFG[block.type] || BLOC_CFG.texte;
  if (block.type === "formule") return (
    <div style={{ background: "linear-gradient(135deg,#f0f5ff,#e8eeff)", border: "1px solid #c5d8f7", borderRadius: 14, padding: "28px 24px", textAlign: "center", marginBottom: 28 }}>
      <div style={{ fontSize: 24, color: "#1e40af" }}><MathBlock formula={block.content} /></div>
    </div>
  );
  const hasFig = figureSvg && (block.type === "theoreme" || block.type === "exemple");
  return (
    <div style={{ background: cfg.bg || "#fff", borderRadius: 14, marginBottom: 20, overflow: "hidden", border: cfg.accent ? `1px solid ${cfg.accent}22` : "1px solid #eef0f5", boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}>
      {cfg.accent && <div style={{ height: 3, background: cfg.accent, opacity: 0.7 }}/>}
      <div style={{ display: hasFig ? "grid" : "block", gridTemplateColumns: hasFig ? "1fr 200px" : undefined }}>
        <div style={{ padding: "20px 24px" }}>
          {cfg.label && <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}><span style={{ fontSize: 15 }}>{cfg.icon}</span><span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: cfg.accent, fontFamily: "sans-serif" }}>{cfg.label}</span></div>}
          {block.titre && <div style={{ fontSize: 17, fontWeight: 700, color: cfg.accent || "#1a2040", marginBottom: 12, fontFamily: "Georgia,serif", fontStyle: "italic" }}>{block.titre}</div>}
          <div style={{ fontSize: 15, color: "#2d3748", lineHeight: 1.95, fontFamily: "Georgia,'Times New Roman',serif" }}><MathRenderer formula={block.content} block={false} /></div>
        </div>
        {hasFig && <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 16, borderLeft: `1px solid ${cfg.accent}22` }}>{figureSvg}</div>}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// VUE COURS
// ────────────────────────────────────────────────────────────────────────────────
function CoursView({ cours, onBack }) {
  const blocks = (() => { try { return JSON.parse(cours.contenu || "[]"); } catch { return []; } })();
  const figureSvg = FIGURES[cours.chapitre] || FIGURES[cours.titre] || null;
  const stats = blocks.reduce((a, b) => { a[b.type] = (a[b.type]||0)+1; return a; }, {});
  const chips = [
    { key: "definition", label: "Déf.", color: "#1a56db" },
    { key: "theoreme",   label: "Théo.", color: "#c2820a" },
    { key: "exemple",    label: "Ex.", color: "#1a7a4a" },
    { key: "methode",    label: "Méth.", color: "#7b2fa8" },
  ].filter(s => stats[s.key] > 0);

  return (
    <div style={{ minHeight: "100vh", background: "#fafbfe" }}>
      <div style={{ background: "rgba(255,255,255,0.96)", backdropFilter: "blur(12px)", borderBottom: "1px solid #e8ecf4", padding: "13px 36px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <button onClick={onBack} style={{ fontSize: 13, color: "#64748b", background: "#f1f5f9", border: "none", borderRadius: 8, padding: "7px 16px", cursor: "pointer", fontWeight: 500, fontFamily: "inherit" }}>← Tous les cours</button>
        <div style={{ display: "flex", gap: 6 }}>
          <span style={{ fontSize: 11, background: "#e8f0fe", color: "#1a56db", borderRadius: 20, padding: "4px 12px", fontWeight: 700 }}>{cours.matiere}</span>
          <span style={{ fontSize: 11, background: "#f1f5f9", color: "#64748b", borderRadius: 20, padding: "4px 12px", fontWeight: 600 }}>{cours.niveau}</span>
        </div>
      </div>
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "52px 32px 8px" }}>
        {cours.chapitre && cours.chapitre !== cours.titre && <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12, fontFamily: "sans-serif" }}>{cours.chapitre}</div>}
        <h1 style={{ fontSize: 38, fontWeight: 700, color: "#0f1629", lineHeight: 1.18, margin: "0 0 22px", fontFamily: "Georgia,serif" }}>{cours.titre}</h1>
        {chips.length > 0 && <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 32 }}>{chips.map(s => <span key={s.key} style={{ fontSize: 12, fontWeight: 700, color: s.color, background: s.color + "14", borderRadius: 6, padding: "4px 12px", fontFamily: "sans-serif", border: `1px solid ${s.color}30` }}>{stats[s.key]} {s.label}</span>)}</div>}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 40 }}>
          <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,#1a56db,#e2e8f0)" }}/>
          <span style={{ fontSize: 18, color: "#1a56db" }}>◈</span>
          <div style={{ width: 40, height: 1, background: "#e2e8f0" }}/>
        </div>
      </div>
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "0 32px 100px" }}>
        {blocks.map((block, idx) => <BlocCours key={block.id || idx} block={block} figureSvg={figureSvg} />)}
        <div style={{ marginTop: 52, padding: "28px 32px", background: "linear-gradient(135deg,#f0f5ff,#e8eeff)", borderRadius: 16, textAlign: "center", border: "1px solid #c5d8f7" }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🎉</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#1a56db", marginBottom: 4, fontFamily: "Georgia,serif" }}>Cours terminé !</div>
          <div style={{ fontSize: 13, color: "#3b82f6", marginBottom: 18, fontFamily: "sans-serif" }}>{blocks.length} sections parcourues</div>
          <button onClick={onBack} style={{ background: "#1a56db", color: "#fff", border: "none", borderRadius: 10, padding: "11px 26px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>← Retour</button>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// VUE EXERCICE — avec MathInput + soumission partielle
// ────────────────────────────────────────────────────────────────────────────────
function ExerciceView({ exercice, eleve, onBack }) {
  const questions = exercice.questions || [];
  const [reponses, setReponses] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const setReponse = (qid, val) => setReponses(prev => ({ ...prev, [qid]: val }));

  const answered = Object.keys(reponses).filter(k => reponses[k]?.trim()).length;

  // Soumission — partielle ou totale
  const handleSubmit = async (forcePartial = false) => {
    if (!forcePartial) {
      const unanswered = questions.filter(q => !reponses[q.id] || reponses[q.id].trim() === "");
      if (unanswered.length > 0) {
        const ok = window.confirm(`Tu n'as répondu qu'à ${answered}/${questions.length} questions.\n\nEnvoyer quand même ce que tu as fait ?`);
        if (!ok) return;
      }
    }
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

  const DiffBadge = ({ n }) => {
    const cfg = [, { label: "Facile", color: "#1a7a4a", bg: "#f0faf4" }, { label: "Intermédiaire", color: "#c2820a", bg: "#fff9ed" }, { label: "Type Brevet", color: "#c2350a", bg: "#fff0f0" }];
    const c = cfg[n] || cfg[1];
    return <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 6, background: c.bg, color: c.color, fontFamily: "sans-serif", border: `1px solid ${c.color}30` }}>{c.label}</span>;
  };

  if (submitted) return (
    <div style={{ minHeight: "100vh", background: "#fafbfe", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", maxWidth: 420, padding: 40 }}>
        <div style={{ fontSize: 60, marginBottom: 18 }}>📬</div>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: "#0f1629", marginBottom: 10, fontFamily: "Georgia,serif" }}>Devoir envoyé !</h2>
        <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.7, marginBottom: 24, fontFamily: "sans-serif" }}>Ton professeur va corriger ton travail et te donner sa note et ses commentaires.</p>
        <button onClick={onBack} style={{ background: "#1a56db", color: "#fff", border: "none", borderRadius: 10, padding: "11px 26px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>← Retour</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#fafbfe", fontFamily: "sans-serif" }}>
      {/* Nav */}
      <div style={{ background: "rgba(255,255,255,0.96)", backdropFilter: "blur(12px)", borderBottom: "1px solid #e8ecf4", padding: "13px 36px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <button onClick={onBack} style={{ fontSize: 13, color: "#64748b", background: "#f1f5f9", border: "none", borderRadius: 8, padding: "7px 16px", cursor: "pointer", fontWeight: 500, fontFamily: "inherit" }}>← Retour</button>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", gap: 3 }}>
            {questions.map((q, i) => (
              <div key={q.id} style={{ width: 8, height: 8, borderRadius: "50%", background: reponses[q.id]?.trim() ? "#7b2fa8" : "#e2e8f0" }}/>
            ))}
          </div>
          <span style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>{answered}/{questions.length}</span>
        </div>
      </div>

      <div style={{ maxWidth: 740, margin: "0 auto", padding: "48px 32px 120px" }}>
        {/* Hero */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>{exercice.chapitre}</div>
          <h1 style={{ fontSize: 30, fontWeight: 700, color: "#0f1629", margin: "0 0 14px", fontFamily: "Georgia,serif" }}>{exercice.titre}</h1>
          <div style={{ fontSize: 13, color: "#92400e", background: "#fffbeb", borderRadius: 8, padding: "10px 14px", border: "1px solid #fde68a", display: "inline-flex", alignItems: "center", gap: 8 }}>
            <span>💡</span>
            <span>Tu peux envoyer ton travail à tout moment — même incomplet. Ton prof verra ce que tu as fait.</span>
          </div>
        </div>

        <div style={{ height: 2, background: "linear-gradient(90deg,#7b2fa8,#e2e8f0)", borderRadius: 2, marginBottom: 36, opacity: 0.5 }}/>

        {/* Questions */}
        {questions.map((q, idx) => (
          <div key={q.id} style={{ background: "#fff", border: `1px solid ${reponses[q.id]?.trim() ? "#ddd6fe" : "#e8ecf4"}`, borderRadius: 14, marginBottom: 20, overflow: "hidden", boxShadow: "0 1px 8px rgba(0,0,0,0.04)", transition: "border-color 0.2s" }}>
            {reponses[q.id]?.trim() && <div style={{ height: 2, background: "linear-gradient(90deg,#7b2fa8,#a78bfa)" }}/>}
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fbfcff" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ background: reponses[q.id]?.trim() ? "#7b2fa8" : "#94a3b8", color: "#fff", borderRadius: 6, padding: "3px 12px", fontSize: 12, fontWeight: 700, transition: "background 0.2s" }}>
                  {reponses[q.id]?.trim() ? "✓" : idx + 1} Question {idx + 1}
                </span>
              </div>
              <DiffBadge n={q.difficulte || 1} />
            </div>

            <div style={{ padding: "18px 22px" }}>
              {/* Énoncé */}
              <div style={{ fontSize: 15, color: "#1e293b", lineHeight: 1.85, marginBottom: 16, fontFamily: "Georgia,serif", whiteSpace: "pre-line" }}>
                <MathRenderer formula={q.enonce} block={false} />
              </div>

              {q.figure_svg && <div style={{ margin: "14px 0", padding: 14, background: "#f8faff", borderRadius: 10, border: "1px solid #e8ecf4", display: "flex", justifyContent: "center" }} dangerouslySetInnerHTML={{ __html: q.figure_svg }} />}

              {/* QCM */}
              {q.type === "qcm" && q.options && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
                  {q.options.map((opt, i) => (
                    <label key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, cursor: "pointer", border: `1.5px solid ${reponses[q.id] === opt ? "#7b2fa8" : "#e2e8f0"}`, background: reponses[q.id] === opt ? "#f8f0ff" : "#fff", fontSize: 14, color: "#334155", transition: "all 0.15s", fontFamily: "Georgia,serif" }}>
                      <input type="radio" name={`q-${q.id}`} value={opt} checked={reponses[q.id] === opt} onChange={() => setReponse(q.id, opt)} style={{ display: "none" }} />
                      <div style={{ width: 18, height: 18, borderRadius: "50%", flexShrink: 0, border: `2px solid ${reponses[q.id] === opt ? "#7b2fa8" : "#cbd5e1"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {reponses[q.id] === opt && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#7b2fa8" }}/>}
                      </div>
                      <MathRenderer formula={opt} block={false} />
                    </label>
                  ))}
                </div>
              )}

              {/* Calcul / rédaction — avec MathInput */}
              {(q.type === "calcul" || q.type === "redaction" || !q.type) && (
                <MathInput
                  value={reponses[q.id] || ""}
                  onChange={val => setReponse(q.id, val)}
                  label={q.type === "redaction" ? "Ta rédaction" : "Ta réponse"}
                  placeholder={q.type === "redaction" ? "Rédige ta démonstration... (ex: x^2 + 3 = 12 donc x^2 = 9 donc x = 3)" : "Écris ton calcul... (ex: 2^5 = 32, sqrt(9) = 3, 3/4 + 1/4 = 1)"}
                  rows={q.type === "redaction" ? 6 : 3}
                />
              )}
            </div>
          </div>
        ))}

        {/* Footer action */}
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(255,255,255,0.96)", backdropFilter: "blur(12px)", borderTop: "1px solid #e8ecf4", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 40 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#0f1629" }}>
              {answered === questions.length ? "✅ Tout est complété !" : `${answered}/${questions.length} réponses`}
            </div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>Tu peux envoyer à tout moment</div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {answered > 0 && answered < questions.length && (
              <button onClick={() => handleSubmit(true)} disabled={submitting}
                style={{ background: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0", borderRadius: 10, padding: "11px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                Envoyer ce que j'ai ({answered})
              </button>
            )}
            <button onClick={() => handleSubmit(false)} disabled={submitting}
              style={{ background: submitting ? "#94a3b8" : "#7b2fa8", color: "#fff", border: "none", borderRadius: 10, padding: "11px 24px", fontSize: 14, fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer", fontFamily: "inherit", transition: "background 0.2s" }}>
              {submitting ? "Envoi…" : answered === questions.length ? "📬 Envoyer" : "📬 Envoyer quand même"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// VUE ANNALES BREVET
// ────────────────────────────────────────────────────────────────────────────────
const ANNALES = [
  {
    id: "brevet2023",
    annee: "2023",
    session: "Juin",
    type: "Brevet national",
    duree: "2h",
    exercices: [
      {
        id: "b23e1",
        titre: "Exercice 1 — Calcul numérique (20 pts)",
        questions: [
          { id: "b23e1q1", type: "calcul", difficulte: 2, enonce: "Calcule $A = \\frac{5^3 \\times 5^{-1}}{5^2}$. Justifie chaque étape." },
          { id: "b23e1q2", type: "calcul", difficulte: 2, enonce: "Donne l'écriture scientifique de $0{,}00482$." },
          { id: "b23e1q3", type: "calcul", difficulte: 3, enonce: "Calcule $B = \\sqrt{48} + \\sqrt{75}$. Simplifie sous la forme $k\\sqrt{3}$." },
        ]
      },
      {
        id: "b23e2",
        titre: "Exercice 2 — Algèbre (25 pts)",
        questions: [
          { id: "b23e2q1", type: "calcul", difficulte: 2, enonce: "Développe et réduis : $(2x - 5)^2 - (4x^2 - 25)$." },
          { id: "b23e2q2", type: "redaction", difficulte: 3, enonce: "Résous l'équation : $(2x - 5)^2 = (4x^2 - 25)$. Explique ta démarche." },
          { id: "b23e2q3", type: "redaction", difficulte: 3, enonce: "Un terrain rectangulaire a un périmètre de 84 m. Sa longueur dépasse sa largeur de 12 m.\n1. Pose un système d'équations.\n2. Trouve les dimensions du terrain.\n3. Calcule son aire." },
        ]
      },
      {
        id: "b23e3",
        titre: "Exercice 3 — Géométrie (30 pts)",
        questions: [
          { id: "b23e3q1", type: "redaction", difficulte: 3, enonce: "Triangle ABC : $AB = 8$ cm, $BC = 15$ cm, $AC = 17$ cm.\n1. Montre que le triangle ABC est rectangle. Précise l'angle droit.\n2. Calcule l'aire du triangle.\n3. Calcule $\\sin(\\widehat{BAC})$ puis l'angle $\\widehat{BAC}$ (arrondi au degré)." },
          { id: "b23e3q2", type: "redaction", difficulte: 3, enonce: "Un mat vertical de 6 m est fixé au sol. Son ombre mesure 4 m.\n1. Dessine un schéma légendé.\n2. Quelle est la hauteur d'un poteau voisin dont l'ombre fait 6 m au même moment ? (Utilise le théorème de Thalès.)" },
        ]
      },
      {
        id: "b23e4",
        titre: "Exercice 4 — Probabilités & statistiques (25 pts)",
        questions: [
          { id: "b23e4q1", type: "redaction", difficulte: 3, enonce: "Boîte à moustaches des résultats de 60 élèves :\nMin = 2 ; Q1 = 7 ; Médiane = 11 ; Q3 = 14 ; Max = 20\n\n1. Calcule l'étendue et l'écart interquartile.\n2. Quel pourcentage d'élèves a une note comprise entre 7 et 14 ?\n3. Combien d'élèves ont une note supérieure à 11 ?" },
          { id: "b23e4q2", type: "redaction", difficulte: 2, enonce: "Un jeu de 20 cartes : 8 rouges, 7 bleues, 5 vertes.\n1. Probabilité de tirer une carte verte ?\n2. On tire deux cartes AVEC remise. Probabilité de tirer deux cartes rouges ?\n3. On répète l'expérience 500 fois. Combien de fois attend-on obtenir une carte bleue ?" },
        ]
      }
    ]
  },
  {
    id: "brevet2022",
    annee: "2022",
    session: "Juin",
    type: "Brevet national",
    duree: "2h",
    exercices: [
      {
        id: "b22e1",
        titre: "Exercice 1 — Nombres et calculs (20 pts)",
        questions: [
          { id: "b22e1q1", type: "calcul", difficulte: 2, enonce: "Calcule $A = (3 \\times 10^{-2}) \\times (5 \\times 10^4)$. Donne le résultat en notation scientifique." },
          { id: "b22e1q2", type: "calcul", difficulte: 2, enonce: "Développe et réduis : $(x + 4)(x - 4) - (x - 2)^2$." },
          { id: "b22e1q3", type: "redaction", difficulte: 3, enonce: "Démontre que l'expression $(n + 3)^2 - (n^2 + 9)$ est un multiple de 6 pour tout entier $n$." },
        ]
      },
      {
        id: "b22e2",
        titre: "Exercice 2 — Fonctions et équations (25 pts)",
        questions: [
          { id: "b22e2q1", type: "redaction", difficulte: 2, enonce: "Deux abonnements streaming :\nOffre A : 3 € par mois + 2 € par film\nOffre B : 10 € par mois, films illimités\n\n1. Écris les fonctions $f_A(x)$ et $f_B(x)$ (coût pour $x$ films/mois).\n2. À partir de combien de films l'offre B est-elle plus avantageuse ?" },
          { id: "b22e2q2", type: "calcul", difficulte: 2, enonce: "Résous le système :\n$3x - 2y = 1$\n$x + y = 7$" },
        ]
      },
      {
        id: "b22e3",
        titre: "Exercice 3 — Géométrie (30 pts)",
        questions: [
          { id: "b22e3q1", type: "redaction", difficulte: 3, enonce: "Une personne de 1,70 m de hauteur se tient à 4 m d'un lampadaire. Son ombre mesure 2 m.\n1. Schéma légendé.\n2. Calcule la hauteur du lampadaire (Thalès).\n3. Si la personne s'éloigne à 8 m du lampadaire, quelle sera la longueur de son ombre ?" },
          { id: "b22e3q2", type: "redaction", difficulte: 3, enonce: "Triangle rectangle DEF en E, $DE = 9$ cm, $EF = 12$ cm.\n1. Calcule $DF$.\n2. Calcule $\\cos(\\widehat{FDE})$ puis la mesure de cet angle (arrondi au degré).\n3. Calcule la hauteur issue de E sur DF." },
        ]
      },
    ]
  },
  {
    id: "blanc2024",
    annee: "2024",
    session: "Blanc — Mars",
    type: "Brevet blanc",
    duree: "2h",
    exercices: [
      {
        id: "bl24e1",
        titre: "Exercice 1 — Calcul et algèbre (25 pts)",
        questions: [
          { id: "bl24e1q1", type: "calcul", difficulte: 2, enonce: "Calcule sans calculatrice :\n$A = 2^6 ÷ 2^3 + \\sqrt{36}$" },
          { id: "bl24e1q2", type: "calcul", difficulte: 2, enonce: "Factorise entièrement : $2x^2 - 18$." },
          { id: "bl24e1q3", type: "redaction", difficulte: 3, enonce: "Résous : $(x-3)(2x+1) = 0$. Vérifie tes solutions." },
        ]
      },
      {
        id: "bl24e2",
        titre: "Exercice 2 — Géométrie (30 pts)",
        questions: [
          { id: "bl24e2q1", type: "redaction", difficulte: 3, enonce: "Un triangle ABC a $AB = 10$ cm, $BC = 24$ cm, $AC = 26$ cm.\n1. Montre que ABC est rectangle. Indique l'angle droit.\n2. Calcule $\\tan(\\widehat{ABC})$, puis $\\widehat{ABC}$ au degré.\n3. M est le milieu de AC. Calcule BM." },
        ]
      },
      {
        id: "bl24e3",
        titre: "Exercice 3 — Fonctions (20 pts)",
        questions: [
          { id: "bl24e3q1", type: "redaction", difficulte: 2, enonce: "La fonction $f$ est affine et vérifie $f(0) = -3$ et $f(4) = 5$.\n1. Détermine $f(x)$.\n2. Résous $f(x) = 0$.\n3. Pour quelles valeurs de $x$ a-t-on $f(x) > 0$ ?" },
        ]
      },
      {
        id: "bl24e4",
        titre: "Exercice 4 — Statistiques (25 pts)",
        questions: [
          { id: "bl24e4q1", type: "redaction", difficulte: 3, enonce: "Durées (min) d'appels téléphoniques sur 10 jours :\n3, 7, 12, 5, 8, 15, 6, 10, 4, 9\n\n1. Calcule la moyenne.\n2. Détermine : min, Q1, médiane, Q3, max.\n3. L'étendue et l'écart interquartile.\n4. Interprète les résultats en une phrase." },
        ]
      }
    ]
  }
];

function AnnalesView({ eleve, onBack }) {
  const [selected, setSelected] = useState(null); // { annale, exo }
  const [reponses, setReponses] = useState({});
  const [submitted, setSubmitted] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const setReponse = (qid, val) => setReponses(prev => ({ ...prev, [qid]: val }));

  const handleSubmitExo = async (annale, exo) => {
    setSubmitting(true);
    const reponsesArray = exo.questions.map(q => ({
      question_id: q.id,
      enonce: q.enonce,
      reponse_eleve: reponses[q.id] || "",
      note_prof: null,
      commentaire_prof: null
    }));
    await supabase.from("soumissions").insert({
      exercice_id: null,
      eleve_id: eleve?.id,
      eleve_email: eleve?.email,
      eleve_nom: eleve?.nom || eleve?.email,
      reponses: reponsesArray,
      statut: "soumis",
      meta: JSON.stringify({ type: "annale", annale_id: annale.id, exo_id: exo.id, titre: `${annale.annee} ${annale.session} — ${exo.titre}` })
    });
    setSubmitting(false);
    setSubmitted(prev => ({ ...prev, [exo.id]: true }));
    setSelected(null);
  };

  // Vue exercice d'annale
  if (selected) {
    const { annale, exo } = selected;
    const answered = exo.questions.filter(q => reponses[q.id]?.trim()).length;
    const DiffBadge = ({ n }) => {
      const cfg = [, { label: "Facile", color: "#1a7a4a", bg: "#f0faf4" }, { label: "Intermédiaire", color: "#c2820a", bg: "#fff9ed" }, { label: "Type Brevet", color: "#c2350a", bg: "#fff0f0" }];
      const c = cfg[n] || cfg[1];
      return <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 6, background: c.bg, color: c.color, fontFamily: "sans-serif" }}>{c.label}</span>;
    };
    return (
      <div style={{ minHeight: "100vh", background: "#fafbfe" }}>
        <div style={{ background: "rgba(255,255,255,0.96)", backdropFilter: "blur(12px)", borderBottom: "1px solid #e8ecf4", padding: "13px 36px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
          <button onClick={() => setSelected(null)} style={{ fontSize: 13, color: "#64748b", background: "#f1f5f9", border: "none", borderRadius: 8, padding: "7px 16px", cursor: "pointer", fontWeight: 500, fontFamily: "inherit" }}>← Retour aux annales</button>
          <span style={{ fontSize: 12, color: "#64748b", background: "#f0f4ff", borderRadius: 20, padding: "4px 14px", fontWeight: 600 }}>{annale.annee} · {annale.session}</span>
        </div>
        <div style={{ maxWidth: 740, margin: "0 auto", padding: "48px 32px 120px" }}>
          <div style={{ fontSize: 11, color: "#c2350a", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>🎓 {annale.type}</div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "#0f1629", margin: "0 0 24px", fontFamily: "Georgia,serif" }}>{exo.titre}</h1>
          <div style={{ height: 2, background: "linear-gradient(90deg,#c2350a,#e2e8f0)", borderRadius: 2, marginBottom: 32, opacity: 0.5 }}/>
          {exo.questions.map((q, idx) => (
            <div key={q.id} style={{ background: "#fff", border: `1px solid ${reponses[q.id]?.trim() ? "#ddd6fe" : "#e8ecf4"}`, borderRadius: 14, marginBottom: 20, overflow: "hidden" }}>
              {reponses[q.id]?.trim() && <div style={{ height: 2, background: "linear-gradient(90deg,#c2350a,#f87171)" }}/>}
              <div style={{ padding: "14px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fbfcff" }}>
                <span style={{ background: reponses[q.id]?.trim() ? "#c2350a" : "#94a3b8", color: "#fff", borderRadius: 6, padding: "3px 12px", fontSize: 12, fontWeight: 700, transition: "background 0.2s" }}>
                  {reponses[q.id]?.trim() ? "✓" : ""} Question {idx + 1}
                </span>
                <DiffBadge n={q.difficulte || 2} />
              </div>
              <div style={{ padding: "18px 22px" }}>
                <div style={{ fontSize: 15, color: "#1e293b", lineHeight: 1.85, marginBottom: 16, fontFamily: "Georgia,serif", whiteSpace: "pre-line" }}>
                  <MathRenderer formula={q.enonce} block={false} />
                </div>
                {q.type === "qcm" && q.options ? (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {q.options.map((opt, i) => (
                      <label key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, cursor: "pointer", border: `1.5px solid ${reponses[q.id] === opt ? "#c2350a" : "#e2e8f0"}`, background: reponses[q.id] === opt ? "#fff5f5" : "#fff", fontSize: 14, color: "#334155" }}>
                        <input type="radio" name={`aq-${q.id}`} value={opt} checked={reponses[q.id] === opt} onChange={() => setReponse(q.id, opt)} style={{ display: "none" }} />
                        <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${reponses[q.id] === opt ? "#c2350a" : "#cbd5e1"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {reponses[q.id] === opt && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#c2350a" }}/>}
                        </div>
                        <MathRenderer formula={opt} block={false} />
                      </label>
                    ))}
                  </div>
                ) : (
                  <MathInput value={reponses[q.id] || ""} onChange={val => setReponse(q.id, val)} label={q.type === "redaction" ? "Ta rédaction" : "Ta réponse"} placeholder="Écris ta réponse... (ex: x^2, sqrt(16), 3/4)" rows={q.type === "redaction" ? 6 : 3} />
                )}
              </div>
            </div>
          ))}
        </div>
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(255,255,255,0.96)", backdropFilter: "blur(12px)", borderTop: "1px solid #e8ecf4", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 40 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#0f1629" }}>{answered}/{exo.questions.length} réponses</div>
            <div style={{ fontSize: 12, color: "#94a3b8" }}>Envoie quand tu veux</div>
          </div>
          <button onClick={() => handleSubmitExo(annale, exo)} disabled={submitting || answered === 0}
            style={{ background: submitting || answered === 0 ? "#94a3b8" : "#c2350a", color: "#fff", border: "none", borderRadius: 10, padding: "11px 24px", fontSize: 14, fontWeight: 700, cursor: submitting || answered === 0 ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
            {submitting ? "Envoi…" : "📬 Envoyer au professeur"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#fafbfe" }}>
      <div style={{ background: "rgba(255,255,255,0.96)", backdropFilter: "blur(12px)", borderBottom: "1px solid #e8ecf4", padding: "13px 36px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <button onClick={onBack} style={{ fontSize: 13, color: "#64748b", background: "#f1f5f9", border: "none", borderRadius: 8, padding: "7px 16px", cursor: "pointer", fontWeight: 500, fontFamily: "inherit" }}>← Retour</button>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#c2350a" }}>🎓 Annales Brevet</span>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "48px 32px 80px" }}>
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: "#0f1629", margin: "0 0 10px", fontFamily: "Georgia,serif" }}>Annales & Brevets blancs</h1>
          <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>Entraîne-toi avec de vrais sujets. Chaque exercice est envoyé à ton professeur pour correction.</p>
        </div>

        {ANNALES.map((annale, ai) => (
          <div key={annale.id} style={{ marginBottom: 40 }}>
            {/* Header annale */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20, padding: "16px 20px", background: annale.type === "Brevet national" ? "linear-gradient(135deg,#fff0f0,#ffe4e4)" : "linear-gradient(135deg,#f0f5ff,#e8eeff)", borderRadius: 14, border: `1px solid ${annale.type === "Brevet national" ? "#fca5a5" : "#c5d8f7"}` }}>
              <div style={{ fontSize: 28 }}>{annale.type === "Brevet national" ? "🎓" : "📋"}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 17, fontWeight: 800, color: "#0f1629", fontFamily: "Georgia,serif" }}>
                  {annale.type} — {annale.annee}
                </div>
                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>Session {annale.session} · Durée {annale.duree} · {annale.exercices.length} exercices</div>
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, padding: "5px 14px", borderRadius: 20, background: annale.type === "Brevet national" ? "#fee2e2" : "#dbeafe", color: annale.type === "Brevet national" ? "#c2350a" : "#1a56db", border: `1px solid ${annale.type === "Brevet national" ? "#fca5a5" : "#93c5fd"}` }}>
                {annale.type === "Brevet national" ? "Officiel" : "Entraînement"}
              </div>
            </div>

            {/* Exercices */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {annale.exercices.map((exo) => {
                const done = submitted[exo.id];
                const progress = exo.questions.filter(q => reponses[q.id]?.trim()).length;
                return (
                  <div key={exo.id} onClick={() => !done && setSelected({ annale, exo })}
                    style={{ background: done ? "#f0faf4" : "#fff", border: `1px solid ${done ? "#a7f3d0" : "#e8ecf4"}`, borderRadius: 12, padding: "16px 18px", cursor: done ? "default" : "pointer", transition: "all 0.15s", position: "relative", overflow: "hidden" }}
                    onMouseEnter={e => { if (!done) e.currentTarget.style.borderColor = "#c2350a"; }}
                    onMouseLeave={e => { if (!done) e.currentTarget.style.borderColor = "#e8ecf4"; }}>
                    {!done && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,#c2350a ${(progress/exo.questions.length)*100}%,#e2e8f0 0%)` }}/>}
                    {done && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "#34d399" }}/>}
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#0f1629", marginBottom: 8, fontFamily: "Georgia,serif", lineHeight: 1.35 }}>{exo.titre}</div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 12, color: "#94a3b8" }}>{exo.questions.length} questions</span>
                      {done ? (
                        <span style={{ fontSize: 11, background: "#dcfce7", color: "#16a34a", borderRadius: 6, padding: "3px 10px", fontWeight: 700 }}>✓ Envoyé</span>
                      ) : progress > 0 ? (
                        <span style={{ fontSize: 11, background: "#fef3c7", color: "#d97706", borderRadius: 6, padding: "3px 10px", fontWeight: 700 }}>{progress}/{exo.questions.length} en cours</span>
                      ) : (
                        <span style={{ fontSize: 11, color: "#c2350a", fontWeight: 700 }}>Commencer →</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// CARTES
// ────────────────────────────────────────────────────────────────────────────────
function CarteCours({ cours, onClick, hue }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: hov ? `hsl(${hue},80%,97%)` : "#fff", border: `1px solid ${hov ? `hsl(${hue},60%,80%)` : "#e8ecf4"}`, borderRadius: 12, padding: "18px 20px", cursor: "pointer", transition: "all 0.18s", transform: hov ? "translateY(-2px)" : "none", boxShadow: hov ? `0 6px 20px hsl(${hue},50%,85%)` : "0 1px 6px rgba(0,0,0,0.04)", position: "relative", overflow: "hidden" }}>
      {hov && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,hsl(${hue},70%,55%),hsl(${hue},60%,75%))` }}/>}
      <div style={{ fontSize: 15, fontWeight: 600, color: "#0f1629", lineHeight: 1.4, marginBottom: 10, fontFamily: "Georgia,serif" }}>{cours.titre}</div>
      <div style={{ fontSize: 11, color: "#94a3b8", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span>{new Date(cours.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</span>
        <span style={{ color: hov ? `hsl(${hue},60%,50%)` : "#cbd5e1", fontWeight: 700, fontSize: 15 }}>→</span>
      </div>
    </div>
  );
}

function CarteExo({ exo, onClick, soumis, hue }) {
  const [hov, setHov] = useState(false);
  const nb = (exo.questions || []).length;
  const maxDiff = Math.max(...(exo.questions || []).map(q => q.difficulte || 1));
  const diffCfg = [, { label: "Facile", color: "#1a7a4a" }, { label: "Intermédiaire", color: "#c2820a" }, { label: "Type Brevet", color: "#c2350a" }];
  const dc = diffCfg[maxDiff] || diffCfg[1];
  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: hov ? `hsl(${hue},80%,97%)` : "#fff", border: `1px solid ${soumis ? "#a7f3d0" : hov ? `hsl(${hue},60%,80%)` : "#e8ecf4"}`, borderRadius: 12, padding: "18px 20px", cursor: "pointer", transition: "all 0.18s", transform: hov ? "translateY(-2px)" : "none", boxShadow: hov ? `0 6px 20px hsl(${hue},50%,85%)` : "0 1px 6px rgba(0,0,0,0.04)", position: "relative", overflow: "hidden" }}>
      {soumis && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "#34d399" }}/>}
      {!soumis && hov && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,hsl(${hue},70%,55%),hsl(${hue},60%,75%))` }}/>}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: "#0f1629", lineHeight: 1.35, flex: 1, paddingRight: 10, fontFamily: "Georgia,serif" }}>{exo.titre}</div>
        {soumis ? <span style={{ fontSize: 11, background: "#dcfce7", color: "#16a34a", borderRadius: 6, padding: "3px 10px", fontWeight: 700, flexShrink: 0 }}>✓ Envoyé</span>
          : <span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 6, fontWeight: 700, flexShrink: 0, background: dc.color + "15", color: dc.color, border: `1px solid ${dc.color}30` }}>{dc.label}</span>}
      </div>
      <div style={{ fontSize: 11, color: "#94a3b8", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span>{nb} question{nb > 1 ? "s" : ""}</span>
        <span style={{ color: hov ? `hsl(${hue},60%,50%)` : "#cbd5e1", fontWeight: 700, fontSize: 15 }}>→</span>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// PAGE PRINCIPALE
// ────────────────────────────────────────────────────────────────────────────────
export default function EleveHome({ user, eleveData, onLogout }) {
  const [cours, setCours] = useState([]);
  const [exercices, setExercices] = useState([]);
  const [soumissions, setSoumissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState("cours");
  const [search, setSearch] = useState("");
  const [themeOpen, setThemeOpen] = useState({});

  const niveau = eleveData?.niveau || "3e";
  const matiere = "Mathématiques";

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    const [{ data: c }, { data: e }, { data: s }] = await Promise.all([
      supabase.from("cours").select("*").eq("publie", true).eq("niveau", niveau).order("created_at"),
      supabase.from("exercices").select("*").eq("publie", true).eq("niveau", niveau).order("created_at"),
      supabase.from("soumissions").select("exercice_id").eq("eleve_id", user.id)
    ]);
    // Filtrer selon les chapitres débloqués pour cet élève
    const debloques = eleveData?.chapitres_debloques || null; // null = tout débloqué
    const filterByDebloques = (items) => {
      if (!debloques) return items || [];
      return (items || []).filter(item => debloques.includes(item.chapitre) || debloques.includes(item.titre));
    };
    setCours(filterByDebloques(c));
    setExercices(filterByDebloques(e));
    setSoumissions((s || []).map(s => s.exercice_id));
    setLoading(false);
  };

  if (selected?.type === "cours") return <CoursView cours={selected.data} onBack={() => setSelected(null)} />;
  if (selected?.type === "exo") return <ExerciceView exercice={selected.data} eleve={{ ...eleveData, id: user.id, email: user.email }} onBack={() => { setSelected(null); loadAll(); }} />;
  if (selected?.type === "annales") return <AnnalesView eleve={{ ...eleveData, id: user.id, email: user.email }} onBack={() => setSelected(null)} />;

  const themes = THEMES[matiere] || [];
  const filteredCours = cours.filter(c => !search || c.titre.toLowerCase().includes(search.toLowerCase()));
  const filteredExos = exercices.filter(e => !search || e.titre.toLowerCase().includes(search.toLowerCase()));
  const coursByTheme = themes.map(t => ({ ...t, items: filteredCours.filter(c => t.chapitres.some(ch => c.chapitre === ch || c.titre === ch)) })).filter(t => t.items.length > 0);
  const exosByTheme = themes.map(t => ({ ...t, items: filteredExos.filter(e => t.chapitres.some(ch => e.chapitre === ch || e.titre === ch)) })).filter(t => t.items.length > 0);
  const currentThemes = tab === "cours" ? coursByTheme : exosByTheme;

  return (
    <div style={{ minHeight: "100vh", background: "#f7f8fc", fontFamily: "sans-serif" }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}*{box-sizing:border-box}`}</style>

      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e8ecf4", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 32px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, background: "#1a56db", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#fff", fontSize: 13 }}>C</div>
            <span style={{ fontSize: 16, fontWeight: 800, color: "#0f1629", fontFamily: "Georgia,serif" }}>Cours</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 13, color: "#64748b", background: "#f1f5f9", borderRadius: 20, padding: "5px 14px", fontWeight: 500 }}>{eleveData?.nom} · <strong style={{ color: "#1a56db" }}>{niveau}</strong></span>
            <button onClick={onLogout} style={{ fontSize: 12, color: "#ef4444", background: "#fff5f5", border: "1px solid #fecaca", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontWeight: 600, fontFamily: "inherit" }}>Déconnexion</button>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div style={{ background: "linear-gradient(150deg,#1a2f6e 0%,#1a56db 55%,#2d7dd2 100%)", padding: "40px 32px 48px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.06, backgroundImage: "repeating-linear-gradient(transparent,transparent 27px,rgba(255,255,255,0.8) 27px,rgba(255,255,255,0.8) 28px)", backgroundSize: "100% 28px" }}/>
        <div style={{ maxWidth: 960, margin: "0 auto", position: "relative" }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Bonjour {eleveData?.nom?.split(" ")[0]} 👋</div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "#fff", margin: "0 0 22px", fontFamily: "Georgia,serif" }}>Mathématiques · {niveau}</h1>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 10, padding: "8px 14px", flex: 1, maxWidth: 320 }}>
              <span style={{ fontSize: 13, opacity: 0.6 }}>🔍</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher…" style={{ background: "none", border: "none", outline: "none", color: "#fff", fontSize: 13, flex: 1, fontFamily: "inherit" }} />
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span style={{ background: "rgba(255,255,255,0.18)", color: "#fff", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600 }}>📖 {cours.length} cours</span>
              <span style={{ background: "rgba(255,255,255,0.18)", color: "#fff", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600 }}>✏️ {exercices.length} exercices</span>
              {/* Bouton annales */}
              <button onClick={() => setSelected({ type: "annales" })}
                style={{ background: "linear-gradient(135deg,rgba(194,53,10,0.9),rgba(220,80,30,0.9))", color: "#fff", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 8, padding: "6px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                🎓 Annales Brevet
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e8ecf4" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 32px", display: "flex" }}>
          {[{ key: "cours", label: "📖 Cours", count: cours.length }, { key: "exercices", label: "✏️ Exercices", count: exercices.length }].map(t => (
            <div key={t.key} onClick={() => setTab(t.key)} style={{ padding: "14px 22px 12px", cursor: "pointer", fontSize: 14, fontWeight: tab === t.key ? 700 : 500, borderBottom: `3px solid ${tab === t.key ? "#1a56db" : "transparent"}`, color: tab === t.key ? "#1a56db" : "#94a3b8", transition: "all 0.15s", display: "flex", alignItems: "center", gap: 8 }}>
              {t.label}
              <span style={{ fontSize: 11, background: tab === t.key ? "#e8f0fe" : "#f1f5f9", color: tab === t.key ? "#1a56db" : "#94a3b8", borderRadius: 20, padding: "2px 8px", fontWeight: 700 }}>{t.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Contenu */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "36px 32px 80px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 80, color: "#94a3b8" }}>Chargement…</div>
        ) : currentThemes.length === 0 ? (
          <div style={{ textAlign: "center", padding: "70px 40px", background: "#fff", borderRadius: 16, border: "1px dashed #e2e8f0" }}>
            <div style={{ fontSize: 44, marginBottom: 14 }}>📚</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#0f1629", marginBottom: 6 }}>
              {search ? `Aucun résultat pour "${search}"` : "Aucun contenu disponible pour l'instant"}
            </div>
            <div style={{ fontSize: 13, color: "#94a3b8" }}>Ton professeur va bientôt débloquer de nouveaux chapitres !</div>
          </div>
        ) : (
          currentThemes.map((theme, ti) => (
            <div key={theme.id} style={{ marginBottom: 40, animation: "fadeUp 0.4s ease both", animationDelay: `${ti * 0.07}s` }}>
              <div onClick={() => setThemeOpen(prev => ({ ...prev, [theme.id]: !prev[theme.id] }))}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, cursor: "pointer", userSelect: "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 38, height: 38, background: `hsl(${theme.hue},70%,95%)`, border: `1.5px solid hsl(${theme.hue},60%,82%)`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: `hsl(${theme.hue},60%,40%)` }}>{theme.icon}</div>
                  <div>
                    <div style={{ fontSize: 17, fontWeight: 700, color: "#0f1629", fontFamily: "Georgia,serif" }}>{theme.label}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>{theme.items.length} {tab === "cours" ? "cours" : "exercices"}</div>
                  </div>
                </div>
                <div style={{ fontSize: 16, color: "#94a3b8", transition: "transform 0.2s", transform: themeOpen[theme.id] ? "rotate(90deg)" : "none" }}>›</div>
              </div>
              <div style={{ height: 2, background: `linear-gradient(90deg,hsl(${theme.hue},65%,55%) 0%,transparent 100%)`, borderRadius: 2, marginBottom: 18, opacity: 0.5 }}/>
              {!themeOpen[theme.id] && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: 12 }}>
                  {theme.items.map((item) => (
                    tab === "cours"
                      ? <CarteCours key={item.id} cours={item} hue={theme.hue} onClick={() => setSelected({ type: "cours", data: item })} />
                      : <CarteExo key={item.id} exo={item} hue={theme.hue} onClick={() => setSelected({ type: "exo", data: item })} soumis={soumissions.includes(item.id)} />
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}