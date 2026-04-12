import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import MathRenderer, { MathBlock } from "../components/MathRenderer";

// ── Thèmes officiels programme 3e ─────────────────────────────────────────────
const THEMES = {
  "Mathématiques": [
    {
      id: "nombres",
      label: "Nombres & Calculs",
      icon: "🔢",
      color: "#2563eb",
      bg: "#eff6ff",
      border: "#bfdbfe",
      chapitres: ["Calcul numérique — puissances et racines", "Notation scientifique", "Développement et factorisation avancés"]
    },
    {
      id: "algebre",
      label: "Algèbre",
      icon: "📐",
      color: "#7c3aed",
      bg: "#f5f3ff",
      border: "#ddd6fe",
      chapitres: ["Équations et inéquations"]
    },
    {
      id: "fonctions",
      label: "Fonctions",
      icon: "📈",
      color: "#0891b2",
      bg: "#ecfeff",
      border: "#a5f3fc",
      chapitres: ["Fonctions linéaires et affines"]
    },
    {
      id: "geometrie",
      label: "Géométrie",
      icon: "📏",
      color: "#059669",
      bg: "#ecfdf5",
      border: "#a7f3d0",
      chapitres: ["Théorème de Pythagore — réciproque", "Trigonométrie avancée", "Géométrie dans l'espace"]
    },
    {
      id: "donnees",
      label: "Données & Hasard",
      icon: "🎲",
      color: "#d97706",
      bg: "#fffbeb",
      border: "#fde68a",
      chapitres: ["Statistiques — boîte à moustaches", "Probabilités — loi des grands nombres"]
    }
  ]
};

// ── Figures SVG géométriques ──────────────────────────────────────────────────
const FIGURES = {
  "Théorème de Pythagore — réciproque": (
    <svg width="200" height="170" viewBox="0 0 200 170">
      <polygon points="30,150 170,150 30,30" fill="#eff6ff" stroke="#2563eb" strokeWidth="2.5"/>
      <rect x="30" y="134" width="16" height="16" fill="none" stroke="#2563eb" strokeWidth="1.5"/>
      <text x="100" y="168" textAnchor="middle" fontSize="13" fill="#2563eb" fontWeight="700">a</text>
      <text x="16" y="93" textAnchor="middle" fontSize="13" fill="#059669" fontWeight="700">b</text>
      <text x="118" y="82" textAnchor="middle" fontSize="14" fill="#dc2626" fontWeight="700">c</text>
      <text x="28" y="167" fontSize="11" fill="#64748b" fontWeight="600">A</text>
      <text x="174" y="167" fontSize="11" fill="#64748b" fontWeight="600">B</text>
      <text x="18" y="27" fontSize="11" fill="#64748b" fontWeight="600">C</text>
      <text x="46" y="146" fontSize="9" fill="#64748b">90°</text>
      <text x="55" y="192" textAnchor="middle" fontSize="11" fill="#1e40af" fontStyle="italic">c² = a² + b²</text>
    </svg>
  ),
  "Trigonométrie avancée": (
    <svg width="210" height="180" viewBox="0 0 210 180">
      <polygon points="20,160 180,160 20,30" fill="#f0fdf4" stroke="#059669" strokeWidth="2.5"/>
      <rect x="20" y="144" width="16" height="16" fill="none" stroke="#059669" strokeWidth="1.5"/>
      <path d="M 180,160 A 30,30 0 0,0 161,133" fill="none" stroke="#7c3aed" strokeWidth="1.5" strokeDasharray="4,2"/>
      <text x="155" y="148" fontSize="11" fill="#7c3aed" fontWeight="600">α</text>
      <text x="100" y="178" textAnchor="middle" fontSize="12" fill="#059669" fontWeight="700">adjacent</text>
      <text x="6" y="98" textAnchor="middle" fontSize="11" fill="#dc2626" fontWeight="700">opposé</text>
      <text x="115" y="85" textAnchor="middle" fontSize="12" fill="#1d4ed8" fontWeight="700">hyp.</text>
      <text x="20" y="175" fontSize="10" fill="#64748b">A</text>
      <text x="183" y="175" fontSize="10" fill="#64748b">B</text>
      <text x="8" y="28" fontSize="10" fill="#64748b">C</text>
      <text x="25" y="155" fontSize="9" fill="#64748b">90°</text>
    </svg>
  ),
  "Fonctions linéaires et affines": (
    <svg width="200" height="170" viewBox="0 0 200 170">
      <line x1="10" y1="85" x2="190" y2="85" stroke="#94a3b8" strokeWidth="1" markerEnd="url(#arr)"/>
      <line x1="100" y1="165" x2="100" y2="5" stroke="#94a3b8" strokeWidth="1" markerEnd="url(#arr)"/>
      <defs>
        <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M2 1L8 5L2 9" fill="none" stroke="#94a3b8" strokeWidth="1.5"/>
        </marker>
      </defs>
      {[1,2,3,-1,-2,-3].map(i => (
        <g key={i}>
          <line x1={100+i*30} y1={82} x2={100+i*30} y2={88} stroke="#cbd5e1" strokeWidth="1"/>
          <line x1={97} y1={85-i*30} x2={103} y2={85-i*30} stroke="#cbd5e1" strokeWidth="1"/>
        </g>
      ))}
      <line x1="10" y1="145" x2="190" y2="25" stroke="#2563eb" strokeWidth="2.5"/>
      <line x1="10" y1="100" x2="190" y2="70" stroke="#dc2626" strokeWidth="2" strokeDasharray="6,3"/>
      <text x="185" y="22" fontSize="11" fill="#2563eb" fontWeight="700">f</text>
      <text x="185" y="68" fontSize="11" fill="#dc2626" fontWeight="700">g</text>
      <text x="188" y="89" fontSize="11" fill="#64748b">x</text>
      <text x="104" y="10" fontSize="11" fill="#64748b">y</text>
      <circle cx="100" cy="115" r="4" fill="#2563eb"/>
      <text x="106" y="120" fontSize="10" fill="#2563eb">b</text>
    </svg>
  ),
};

// ── Config visuelle blocs ─────────────────────────────────────────────────────
const BLOC_CFG = {
  texte:      { stripe: null,     bg: "#ffffff",   border: "#e2e8f0", label: null,         icon: null,  titleColor: "#334155" },
  formule:    { stripe: "#2563eb",bg: "#eff6ff",   border: "#bfdbfe", label: null,         icon: "∑",   titleColor: "#1d4ed8" },
  definition: { stripe: "#1d4ed8",bg: "#ffffff",   border: "#bfdbfe", label: "Définition", icon: "📘",  titleColor: "#1d4ed8" },
  theoreme:   { stripe: "#d97706",bg: "#fffbeb",   border: "#fde68a", label: "Théorème",   icon: "⚡",  titleColor: "#d97706" },
  exemple:    { stripe: "#059669",bg: "#f0fdf4",   border: "#a7f3d0", label: "Exemple",    icon: "✏️",  titleColor: "#059669" },
  remarque:   { stripe: "#ca8a04",bg: "#fefce8",   border: "#fef08a", label: "À retenir",  icon: "💡",  titleColor: "#ca8a04" },
  methode:    { stripe: "#7c3aed",bg: "#faf5ff",   border: "#ddd6fe", label: "Méthode",    icon: "🔧",  titleColor: "#7c3aed" },
};

// ── Composant bloc ────────────────────────────────────────────────────────────
function BlocCours({ block, index, figureSvg }) {
  const cfg = BLOC_CFG[block.type] || BLOC_CFG.texte;
  const isFormule = block.type === "formule";

  // Bloc formule : rendu centré spécial
  if (isFormule) return (
    <div style={{
      background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
      border: "1.5px solid #93c5fd", borderRadius: 20,
      padding: "32px 28px", textAlign: "center", marginBottom: 32,
      animationDelay: `${index * 0.05}s`
    }}>
      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", color: "#2563eb", textTransform: "uppercase", marginBottom: 14, fontFamily: "sans-serif" }}>∑ Formule</div>
      <div style={{ fontSize: 26, color: "#1e40af" }}>
        <MathBlock formula={block.content} />
      </div>
    </div>
  );

  // Avec figure SVG sur la droite (théorème ou exemple avec figure)
  const hasFigure = figureSvg && (block.type === "theoreme" || block.type === "exemple");

  return (
    <div style={{
      background: cfg.bg, border: `1.5px solid ${cfg.border}`,
      borderRadius: 20, marginBottom: 28, overflow: "hidden",
      position: "relative",
      boxShadow: "0 2px 16px rgba(0,0,0,0.04)"
    }}>
      {cfg.stripe && (
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 5, background: cfg.stripe }}/>
      )}
      <div style={{ display: hasFigure ? "grid" : "block", gridTemplateColumns: hasFigure ? "1fr 220px" : undefined }}>
        <div style={{ padding: "26px 28px", paddingLeft: cfg.stripe ? 32 : 28 }}>
          {cfg.label && (
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
              <span style={{ fontSize: 16 }}>{cfg.icon}</span>
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: cfg.titleColor, fontFamily: "sans-serif" }}>{cfg.label}</span>
            </div>
          )}
          {block.titre && (
            <div style={{ fontSize: 18, fontWeight: 700, color: cfg.titleColor, marginBottom: 14, fontFamily: "Georgia, serif", fontStyle: "italic", lineHeight: 1.3 }}>
              {block.titre}
            </div>
          )}
          <div style={{ fontSize: 15.5, color: "#334155", lineHeight: 1.9, fontFamily: "sans-serif", whiteSpace: "pre-line" }}>
            <MathRenderer formula={block.content} block={false} />
          </div>
        </div>
        {hasFigure && (
          <div style={{
            background: "rgba(255,255,255,0.6)",
            borderLeft: `1.5px solid ${cfg.border}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 20
          }}>
            {figureSvg}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Vue d'un cours ────────────────────────────────────────────────────────────
function CoursView({ cours, eleve, onBack }) {
  const blocks = (() => { try { return JSON.parse(cours.contenu || "[]"); } catch { return []; } })();
  const figureSvg = FIGURES[cours.chapitre] || FIGURES[cours.titre] || null;
  const stats = blocks.reduce((a, b) => { a[b.type] = (a[b.type]||0)+1; return a; }, {});

  const statItems = [
    { key: "definition", label: "Définitions", icon: "📘", bg: "#dbeafe" },
    { key: "theoreme",   label: "Théorèmes",   icon: "⚡", bg: "#fef3c7" },
    { key: "exemple",    label: "Exemples",     icon: "✏️", bg: "#dcfce7" },
    { key: "methode",    label: "Méthodes",     icon: "🔧", bg: "#fae8ff" },
  ].filter(s => stats[s.key] > 0);

  return (
    <div style={{ minHeight: "100vh", background: "#f8faff", fontFamily: "sans-serif" }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}.fade-up{animation:fadeUp 0.4s ease both}`}</style>

      {/* Nav sticky */}
      <div style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(10px)", borderBottom: "1px solid #e2e8f0", padding: "14px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <button onClick={onBack} style={{ fontSize: 13, color: "#64748b", background: "#f1f5f9", border: "none", borderRadius: 8, padding: "7px 16px", cursor: "pointer", fontWeight: 500, fontFamily: "inherit" }}>← Retour</button>
        <div style={{ display: "flex", gap: 6 }}>
          <span style={{ fontSize: 11, background: "#dbeafe", color: "#1d4ed8", borderRadius: 20, padding: "4px 12px", fontWeight: 700 }}>{cours.matiere}</span>
          <span style={{ fontSize: 11, background: "#f1f5f9", color: "#64748b", borderRadius: 20, padding: "4px 12px", fontWeight: 600 }}>{cours.niveau}</span>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "56px 32px 100px" }}>
        {/* Hero */}
        <div className="fade-up" style={{ marginBottom: 48 }}>
          {cours.chapitre && cours.chapitre !== cours.titre && (
            <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>
              {cours.chapitre}
            </div>
          )}
          <h1 style={{ fontSize: 36, fontWeight: 800, color: "#0f172a", lineHeight: 1.15, margin: "0 0 20px", fontFamily: "Georgia, serif" }}>
            {cours.titre}
          </h1>
          {statItems.length > 0 && (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {statItems.map(s => (
                <span key={s.key} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, background: s.bg, borderRadius: 20, padding: "5px 14px", color: "#374151" }}>
                  <span style={{ fontSize: 14 }}>{s.icon}</span>
                  {stats[s.key]} {s.label}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Séparateur */}
        <div style={{ height: 3, background: "linear-gradient(90deg, #2563eb 0%, #93c5fd 50%, transparent 100%)", borderRadius: 3, marginBottom: 48, opacity: 0.6 }}/>

        {/* Blocs */}
        {blocks.map((block, idx) => (
          <BlocCours
            key={block.id || idx}
            block={block}
            index={idx}
            figureSvg={figureSvg}
          />
        ))}

        {/* Footer */}
        <div style={{ marginTop: 56, padding: "32px", background: "linear-gradient(135deg, #eff6ff, #dbeafe)", borderRadius: 20, textAlign: "center", border: "1.5px solid #bfdbfe" }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>🎉</div>
          <div style={{ fontSize: 17, fontWeight: 800, color: "#1d4ed8", marginBottom: 6, fontFamily: "Georgia, serif" }}>Cours terminé !</div>
          <div style={{ fontSize: 13, color: "#3b82f6", marginBottom: 20 }}>Tu as parcouru {blocks.length} sections</div>
          <button onClick={onBack} style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: 12, padding: "12px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            ← Retour aux cours
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Vue exercices ─────────────────────────────────────────────────────────────
function ExerciceView({ exercice, eleve, onBack }) {
  const questions = exercice.questions || [];
  const [reponses, setReponses] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const setReponse = (qid, val) => setReponses(prev => ({ ...prev, [qid]: val }));

  const handleSubmit = async () => {
    const unanswered = questions.filter(q => !reponses[q.id] || reponses[q.id].trim() === "");
    if (unanswered.length > 0) {
      alert(`Tu n'as pas répondu à ${unanswered.length} question(s). Réponds à tout avant de soumettre !`);
      return;
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

  const diffStars = (n) => "★".repeat(n) + "☆".repeat(3 - n);

  if (submitted) return (
    <div style={{ minHeight: "100vh", background: "#f8faff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>
      <div style={{ textAlign: "center", maxWidth: 440, padding: 40 }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>📬</div>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", marginBottom: 12, fontFamily: "Georgia, serif" }}>Devoir envoyé !</h2>
        <p style={{ fontSize: 15, color: "#64748b", lineHeight: 1.7, marginBottom: 28 }}>
          Ton devoir a bien été transmis à ton professeur. Tu recevras ta correction et ta note bientôt.
        </p>
        <button onClick={onBack} style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: 12, padding: "12px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
          ← Retour aux exercices
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f8faff", fontFamily: "sans-serif" }}>
      <div style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(10px)", borderBottom: "1px solid #e2e8f0", padding: "14px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <button onClick={onBack} style={{ fontSize: 13, color: "#64748b", background: "#f1f5f9", border: "none", borderRadius: 8, padding: "7px 16px", cursor: "pointer", fontWeight: 500, fontFamily: "inherit" }}>← Retour</button>
        <span style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>{Object.keys(reponses).filter(k => reponses[k]?.trim()).length}/{questions.length} réponses</span>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "48px 32px 100px" }}>
        {/* Hero */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Série d'exercices · {exercice.chapitre}</div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "#0f172a", margin: "0 0 12px", fontFamily: "Georgia, serif" }}>{exercice.titre}</h1>
          <div style={{ fontSize: 13, color: "#64748b", background: "#fef3c7", borderRadius: 10, padding: "10px 16px", border: "1px solid #fde68a", display: "inline-block" }}>
            ⚠️ Réponds à toutes les questions avant de soumettre. La correction te sera envoyée par ton professeur.
          </div>
        </div>

        <div style={{ height: 3, background: "linear-gradient(90deg, #7c3aed, #a78bfa, transparent)", borderRadius: 3, marginBottom: 40, opacity: 0.6 }}/>

        {/* Questions */}
        {questions.map((q, idx) => (
          <div key={q.id} style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 20, marginBottom: 24, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
            <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ background: "#7c3aed", color: "#fff", borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 700 }}>
                  Exercice {idx + 1}
                </span>
                <span style={{ fontSize: 14, color: "#fbbf24", letterSpacing: 2 }}>{diffStars(q.difficulte || 1)}</span>
              </div>
            </div>

            <div style={{ padding: "20px 24px" }}>
              {/* Énoncé */}
              <div style={{ fontSize: 15.5, color: "#1e293b", lineHeight: 1.8, marginBottom: 16, fontFamily: "sans-serif" }}>
                <MathRenderer formula={q.enonce} block={false} />
              </div>

              {/* Figure si présente */}
              {q.figure_svg && (
                <div style={{ margin: "16px 0", padding: "16px", background: "#f8faff", borderRadius: 12, border: "1px solid #e2e8f0", display: "flex", justifyContent: "center" }}
                  dangerouslySetInnerHTML={{ __html: q.figure_svg }}
                />
              )}

              {/* QCM */}
              {q.type === "qcm" && q.options && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12 }}>
                  {q.options.map((opt, i) => (
                    <label key={i} style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "10px 14px", borderRadius: 10, cursor: "pointer",
                      border: `1.5px solid ${reponses[q.id] === opt ? "#7c3aed" : "#e2e8f0"}`,
                      background: reponses[q.id] === opt ? "#faf5ff" : "#fff",
                      fontSize: 14, color: "#334155", fontFamily: "sans-serif",
                      transition: "all 0.15s"
                    }}>
                      <input type="radio" name={`q-${q.id}`} value={opt} checked={reponses[q.id] === opt}
                        onChange={() => setReponse(q.id, opt)} style={{ display: "none" }}/>
                      <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${reponses[q.id] === opt ? "#7c3aed" : "#cbd5e1"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {reponses[q.id] === opt && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#7c3aed" }}/>}
                      </div>
                      <MathRenderer formula={opt} block={false} />
                    </label>
                  ))}
                </div>
              )}

              {/* Calcul / rédaction */}
              {(q.type === "calcul" || q.type === "redaction" || !q.type) && (
                <div style={{ marginTop: 12 }}>
                  <label style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 8 }}>
                    {q.type === "redaction" ? "Ta rédaction" : "Ta réponse"}
                  </label>
                  <textarea
                    value={reponses[q.id] || ""}
                    onChange={e => setReponse(q.id, e.target.value)}
                    placeholder={q.type === "redaction" ? "Rédige ta démonstration complète ici..." : "Écris ton calcul et ta réponse ici..."}
                    rows={q.type === "redaction" ? 5 : 3}
                    style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${reponses[q.id] ? "#7c3aed" : "#e2e8f0"}`, fontSize: 14, fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box", lineHeight: 1.6, color: "#334155", transition: "border-color 0.15s" }}
                  />
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Bouton soumettre */}
        <div style={{ marginTop: 36, padding: "28px 32px", background: "#fff", borderRadius: 20, border: "1.5px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Prête à envoyer ?</div>
            <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
              {Object.keys(reponses).filter(k => reponses[k]?.trim()).length}/{questions.length} questions répondues
            </div>
          </div>
          <button onClick={handleSubmit} disabled={submitting}
            style={{ background: submitting ? "#94a3b8" : "#7c3aed", color: "#fff", border: "none", borderRadius: 12, padding: "14px 32px", fontSize: 15, fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer", fontFamily: "inherit", transition: "background 0.2s" }}>
            {submitting ? "Envoi..." : "📬 Soumettre mon devoir"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Carte cours ───────────────────────────────────────────────────────────────
function CarteCours({ cours, onClick, index }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? "#f8faff" : "#fff",
        border: `1.5px solid ${hov ? "#93c5fd" : "#e2e8f0"}`,
        borderRadius: 16, padding: "20px 22px",
        cursor: "pointer", transition: "all 0.18s",
        transform: hov ? "translateY(-2px)" : "none",
        boxShadow: hov ? "0 8px 24px rgba(37,99,235,0.1)" : "0 2px 8px rgba(0,0,0,0.04)",
        animationDelay: `${index * 0.06}s`
      }}>
      <div style={{ fontSize: 15.5, fontWeight: 700, color: "#0f172a", lineHeight: 1.35, marginBottom: 8 }}>{cours.titre}</div>
      <div style={{ fontSize: 12, color: "#94a3b8", display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
        <span>{new Date(cours.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</span>
        <span style={{ color: hov ? "#2563eb" : "#cbd5e1", fontWeight: 600, fontSize: 16 }}>{hov ? "→" : "›"}</span>
      </div>
    </div>
  );
}

// ── Carte exercice ────────────────────────────────────────────────────────────
function CarteExo({ exo, onClick, index, soumis }) {
  const [hov, setHov] = useState(false);
  const nb = (exo.questions || []).length;
  return (
    <div onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? "#faf5ff" : "#fff",
        border: `1.5px solid ${soumis ? "#a7f3d0" : hov ? "#ddd6fe" : "#e2e8f0"}`,
        borderRadius: 16, padding: "20px 22px",
        cursor: "pointer", transition: "all 0.18s",
        transform: hov ? "translateY(-2px)" : "none",
        boxShadow: hov ? "0 8px 24px rgba(124,58,237,0.1)" : "0 2px 8px rgba(0,0,0,0.04)",
      }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ fontSize: 15.5, fontWeight: 700, color: "#0f172a", lineHeight: 1.35, flex: 1, paddingRight: 8 }}>{exo.titre}</div>
        {soumis ? (
          <span style={{ fontSize: 11, background: "#dcfce7", color: "#16a34a", borderRadius: 20, padding: "3px 10px", fontWeight: 700, flexShrink: 0 }}>✓ Envoyé</span>
        ) : (
          <span style={{ fontSize: 11, background: "#faf5ff", color: "#7c3aed", borderRadius: 20, padding: "3px 10px", fontWeight: 700, flexShrink: 0 }}>{nb} questions</span>
        )}
      </div>
      <div style={{ fontSize: 12, color: "#94a3b8", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span>{exo.chapitre}</span>
        <span style={{ color: hov ? "#7c3aed" : "#cbd5e1", fontWeight: 600, fontSize: 16 }}>{hov ? "→" : "›"}</span>
      </div>
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function EleveHome({ user, eleveData, onLogout }) {
  const [cours, setCours] = useState([]);
  const [exercices, setExercices] = useState([]);
  const [soumissions, setSoumissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);    // { type: "cours"|"exo", data }
  const [tab, setTab] = useState("cours");
  const [search, setSearch] = useState("");
  const [themeOpen, setThemeOpen] = useState(null);

  const niveau = eleveData?.niveau || "3e";
  const matiere = "Mathématiques"; // pour l'instant

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    const [{ data: c }, { data: e }, { data: s }] = await Promise.all([
      supabase.from("cours").select("*").eq("publie", true).eq("niveau", niveau).order("created_at"),
      supabase.from("exercices").select("*").eq("publie", true).eq("niveau", niveau).order("created_at"),
      supabase.from("soumissions").select("exercice_id").eq("eleve_id", user.id)
    ]);
    setCours(c || []);
    setExercices(e || []);
    setSoumissions((s || []).map(s => s.exercice_id));
    setLoading(false);
  };

  if (selected?.type === "cours") return <CoursView cours={selected.data} eleve={eleveData} onBack={() => setSelected(null)} />;
  if (selected?.type === "exo")   return <ExerciceView exercice={selected.data} eleve={{ ...eleveData, id: user.id, email: user.email }} onBack={() => { setSelected(null); loadAll(); }} />;

  // Thèmes pour cette matière
  const themes = THEMES[matiere] || [];

  // Filtrer par recherche
  const filteredCours = cours.filter(c => !search || c.titre.toLowerCase().includes(search.toLowerCase()));
  const filteredExos  = exercices.filter(e => !search || e.titre.toLowerCase().includes(search.toLowerCase()));

  // Grouper cours par thème
  const coursByTheme = themes.map(t => ({
    ...t,
    items: filteredCours.filter(c => t.chapitres.some(ch => c.chapitre === ch || c.titre === ch))
  })).filter(t => t.items.length > 0);

  const exosByTheme = themes.map(t => ({
    ...t,
    items: filteredExos.filter(e => t.chapitres.some(ch => e.chapitre === ch || e.titre === ch))
  })).filter(t => t.items.length > 0);

  const currentThemes = tab === "cours" ? coursByTheme : exosByTheme;

  return (
    <div style={{ minHeight: "100vh", background: "#f8faff", fontFamily: "sans-serif" }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}*{box-sizing:border-box}`}</style>

      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 32px", height: 62, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 30, height: 30, background: "#2563eb", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#fff", fontSize: 14 }}>C</div>
            <span style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>Cours</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 13, color: "#64748b", background: "#f1f5f9", borderRadius: 20, padding: "5px 14px", fontWeight: 500 }}>
              {eleveData?.nom} · <strong style={{ color: "#2563eb" }}>{niveau}</strong>
            </span>
            <button onClick={onLogout} style={{ fontSize: 12, color: "#ef4444", background: "#fff5f5", border: "1px solid #fecaca", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontWeight: 600, fontFamily: "inherit" }}>
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #1d4ed8 0%, #3b82f6 60%, #60a5fa 100%)", padding: "44px 32px 52px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
            Bonjour {eleveData?.nom?.split(" ")[0]} 👋
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: "#fff", margin: "0 0 24px", fontFamily: "Georgia, serif" }}>
            Tes mathématiques de {niveau}
          </h1>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 10, padding: "9px 14px", maxWidth: 360, flex: 1 }}>
              <span style={{ fontSize: 14, opacity: 0.7 }}>🔍</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..."
                style={{ background: "none", border: "none", outline: "none", color: "#fff", fontSize: 13, flex: 1, fontFamily: "inherit" }}/>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <span style={{ background: "rgba(255,255,255,0.2)", color: "#fff", borderRadius: 20, padding: "5px 14px", fontSize: 12, fontWeight: 600 }}>
                📖 {cours.length} cours
              </span>
              <span style={{ background: "rgba(255,255,255,0.2)", color: "#fff", borderRadius: 20, padding: "5px 14px", fontSize: 12, fontWeight: 600 }}>
                ✏️ {exercices.length} exercices
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 32px", display: "flex" }}>
          {[
            { key: "cours",     label: "📖 Cours",     count: cours.length },
            { key: "exercices", label: "✏️ Exercices", count: exercices.length },
          ].map(t => (
            <div key={t.key} onClick={() => setTab(t.key)} style={{
              padding: "15px 24px 13px", cursor: "pointer", fontSize: 14, fontWeight: tab === t.key ? 700 : 500,
              borderBottom: `3px solid ${tab === t.key ? "#2563eb" : "transparent"}`,
              color: tab === t.key ? "#2563eb" : "#94a3b8", transition: "all 0.15s",
              display: "flex", alignItems: "center", gap: 8
            }}>
              {t.label}
              <span style={{ fontSize: 11, background: tab === t.key ? "#dbeafe" : "#f1f5f9", color: tab === t.key ? "#1d4ed8" : "#94a3b8", borderRadius: 20, padding: "2px 8px", fontWeight: 700 }}>{t.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Contenu par thèmes */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "40px 32px 80px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 80, color: "#94a3b8" }}>Chargement...</div>
        ) : currentThemes.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 40px", background: "#fff", borderRadius: 20, border: "1.5px dashed #e2e8f0" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>
              {search ? `Aucun résultat pour "${search}"` : tab === "cours" ? "Aucun cours disponible" : "Aucun exercice disponible"}
            </div>
            <div style={{ fontSize: 13, color: "#94a3b8" }}>Reviens bientôt !</div>
          </div>
        ) : (
          currentThemes.map((theme, ti) => (
            <div key={theme.id} style={{ marginBottom: 44, animation: `fadeUp 0.4s ease both`, animationDelay: `${ti * 0.08}s` }}>
              {/* Header thème */}
              <div
                onClick={() => setThemeOpen(themeOpen === theme.id ? null : theme.id)}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, cursor: "pointer", userSelect: "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, background: theme.bg, border: `1.5px solid ${theme.border}`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                    {theme.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>{theme.label}</div>
                    <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 1 }}>{theme.items.length} {tab === "cours" ? "cours" : "exercices"}</div>
                  </div>
                </div>
                <div style={{ fontSize: 18, color: "#94a3b8", transition: "transform 0.2s", transform: themeOpen === theme.id ? "rotate(90deg)" : "none" }}>›</div>
              </div>

              {/* Barre couleur */}
              <div style={{ height: 2, background: `linear-gradient(90deg, ${theme.color} 0%, transparent 100%)`, borderRadius: 2, marginBottom: 20, opacity: 0.4 }}/>

              {/* Grille de cartes */}
              {themeOpen !== theme.id && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
                  {theme.items.map((item, i) => (
                    tab === "cours"
                      ? <CarteCours key={item.id} cours={item} index={i} onClick={() => setSelected({ type: "cours", data: item })} />
                      : <CarteExo   key={item.id} exo={item}   index={i} onClick={() => setSelected({ type: "exo",   data: item })} soumis={soumissions.includes(item.id)} />
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