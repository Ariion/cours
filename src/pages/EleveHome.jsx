// src/pages/EleveHome.jsx
// Page principale élève — utilise CoursView et ExerciceView comme composants séparés

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import CoursView from "../components/CoursView";
import ExerciceView from "../components/ExerciceView";

// ── Thèmes 3e ──────────────────────────────────────────────────────────────────
const THEMES = {
  "Mathématiques": [
    { id: "nombres",   label: "Nombres & Calculs",  icon: "✦", hue: "22",  chapitres: ["Calcul numérique — puissances et racines", "Notation scientifique", "Développement et factorisation avancés"] },
    { id: "algebre",   label: "Algèbre",             icon: "◈", hue: "234", chapitres: ["Équations et inéquations"] },
    { id: "fonctions", label: "Fonctions",            icon: "⌁", hue: "195", chapitres: ["Fonctions linéaires et affines"] },
    { id: "geometrie", label: "Géométrie",            icon: "△", hue: "155", chapitres: ["Théorème de Pythagore — réciproque", "Trigonométrie avancée", "Géométrie dans l'espace"] },
    { id: "donnees",   label: "Données & Hasard",     icon: "◎", hue: "340", chapitres: ["Statistiques — boîte à moustaches", "Probabilités — loi des grands nombres"] },
  ]
};

// ── Annales (inline data) ──────────────────────────────────────────────────────
const ANNALES = [
  {
    id: "brevet2023", annee: "2023", session: "Juin", type: "Brevet national", duree: "2h",
    exercices: [
      { id: "b23e1", titre: "Exercice 1 — Calcul numérique (20 pts)", questions: [
        { id: "b23e1q1", type: "calcul", difficulte: 2, enonce: "Calcule $A = \\frac{5^3 \\times 5^{-1}}{5^2}$. Justifie chaque étape.", indices: ["Rappel : $a^m \\times a^n = a^{m+n}$", "Rappel : $\\frac{a^m}{a^n} = a^{m-n}$"] },
        { id: "b23e1q2", type: "calcul", difficulte: 2, enonce: "Donne l'écriture scientifique de $0{,}00482$.", indices: ["L'écriture scientifique est de la forme $a \\times 10^n$ avec $1 \\leq a < 10$"] },
        { id: "b23e1q3", type: "calcul", difficulte: 3, enonce: "Calcule $B = \\sqrt{48} + \\sqrt{75}$. Simplifie sous la forme $k\\sqrt{3}$.", indices: ["$\\sqrt{48} = \\sqrt{16 \\times 3} = 4\\sqrt{3}$", "$\\sqrt{75} = \\sqrt{25 \\times 3} = ?$"] },
      ]},
      { id: "b23e2", titre: "Exercice 2 — Algèbre (25 pts)", questions: [
        { id: "b23e2q1", type: "calcul", difficulte: 2, enonce: "Développe et réduis : $(2x - 5)^2 - (4x^2 - 25)$.", indices: ["$(a-b)^2 = a^2 - 2ab + b^2$", "$4x^2 - 25 = (2x-5)(2x+5)$"] },
        { id: "b23e2q2", type: "redaction", difficulte: 3, enonce: "Résous l'équation : $(2x - 5)^2 = 4x^2 - 25$. Explique ta démarche.", indices: ["Développe le membre de gauche", "Tu as déjà calculé $(2x-5)^2 - (4x^2-25)$ à la question précédente !"] },
        { id: "b23e2q3", type: "redaction", difficulte: 3, enonce: "Un terrain rectangulaire a un périmètre de 84 m. Sa longueur dépasse sa largeur de 12 m.\n1. Pose un système d'équations.\n2. Trouve les dimensions.\n3. Calcule l'aire.", indices: ["Appelle $l$ la largeur et $L$ la longueur", "$2(L + l) = 84$ et $L = l + 12$"] },
      ]},
      { id: "b23e3", titre: "Exercice 3 — Géométrie (30 pts)", questions: [
        { id: "b23e3q1", type: "redaction", difficulte: 3, enonce: "Triangle ABC : $AB = 8$ cm, $BC = 15$ cm, $AC = 17$ cm.\n1. Montre que ABC est rectangle.\n2. Calcule l'aire.\n3. Calcule $\\sin(\\widehat{BAC})$ puis l'angle $\\widehat{BAC}$.", indices: ["Vérifie si $AB^2 + BC^2 = AC^2$ ou une autre combinaison", "$8^2 + 15^2 = ?$ et $17^2 = ?$"] },
      ]},
    ]
  },
  {
    id: "blanc2024", annee: "2024", session: "Blanc — Mars", type: "Brevet blanc", duree: "2h",
    exercices: [
      { id: "bl24e1", titre: "Exercice 1 — Calcul et algèbre (25 pts)", questions: [
        { id: "bl24e1q1", type: "calcul", difficulte: 2, enonce: "Calcule sans calculatrice : $A = 2^6 ÷ 2^3 + \\sqrt{36}$", indices: ["$2^6 ÷ 2^3 = 2^{6-3}$"] },
        { id: "bl24e1q2", type: "calcul", difficulte: 2, enonce: "Factorise entièrement : $2x^2 - 18$.", indices: ["Commence par factoriser le facteur commun 2", "Reconnais-tu une identité remarquable dans ce qui reste ?"] },
        { id: "bl24e1q3", type: "redaction", difficulte: 3, enonce: "Résous : $(x-3)(2x+1) = 0$. Vérifie tes solutions.", indices: ["Un produit = 0 si l'un des facteurs = 0"] },
      ]},
      { id: "bl24e2", titre: "Exercice 2 — Géométrie (30 pts)", questions: [
        { id: "bl24e2q1", type: "redaction", difficulte: 3, enonce: "Triangle ABC avec $AB = 10$ cm, $BC = 24$ cm, $AC = 26$ cm.\n1. Montre que ABC est rectangle.\n2. Calcule $\\tan(\\widehat{ABC})$ puis $\\widehat{ABC}$.\n3. M est le milieu de AC. Calcule BM.", indices: ["$10^2 + 24^2 = ?$ comparer à $26^2$", "Dans le triangle rectangle, $\\tan(\\widehat{ABC}) = \\frac{\\text{opposé}}{\\text{adjacent}}$"] },
      ]},
      { id: "bl24e3", titre: "Exercice 3 — Fonctions (20 pts)", questions: [
        { id: "bl24e3q1", type: "redaction", difficulte: 2, enonce: "La fonction $f$ est affine, $f(0) = -3$ et $f(4) = 5$.\n1. Détermine $f(x)$.\n2. Résous $f(x) = 0$.\n3. Pour quelles valeurs de $x$ a-t-on $f(x) > 0$ ?", indices: ["$f(x) = ax + b$ : tu connais $b = f(0)$", "Le coefficient $a = \\frac{f(4)-f(0)}{4-0}$"] },
      ]},
    ]
  }
];

// ── Annales view ───────────────────────────────────────────────────────────────
function AnnalesView({ eleve, onBack }) {
  const [selected, setSelected] = useState(null);
  const [reponses, setReponses] = useState({});
  const [submitted, setSubmitted] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Si une annale/exo est sélectionné, utilise ExerciceView
  if (selected) {
    const exoData = {
      ...selected.exo,
      chapitre: `${selected.annale.type} ${selected.annale.annee} — ${selected.annale.session}`,
    };
    return (
      <ExerciceView
        exercice={exoData}
        eleve={eleve}
        onBack={() => {
          setSubmitted(prev => ({ ...prev, [selected.exo.id]: true }));
          setSelected(null);
        }}
      />
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#fafbff", fontFamily: "DM Sans, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');*{box-sizing:border-box}`}</style>

      <div style={{ background: "rgba(255,255,255,0.97)", backdropFilter: "blur(10px)", borderBottom: "1px solid #f1f5f9", padding: "13px 36px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <button onClick={onBack} style={{ fontSize: 13, color: "#64748b", background: "#f1f5f9", border: "none", borderRadius: 8, padding: "7px 16px", cursor: "pointer", fontWeight: 600 }}>← Retour</button>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#b91c1c" }}>🎓 Annales & Brevets blancs</span>
      </div>

      <div style={{ maxWidth: 880, margin: "0 auto", padding: "48px 32px 80px" }}>
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: "#0f172a", margin: "0 0 10px", fontFamily: "'Source Serif 4', Georgia, serif" }}>Annales & Brevets blancs</h1>
          <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>Entraîne-toi avec de vrais sujets. Chaque exercice est envoyé à ton professeur pour correction.</p>
        </div>

        {ANNALES.map((annale) => (
          <div key={annale.id} style={{ marginBottom: 44 }}>
            {/* Header annale */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 24px", background: annale.type === "Brevet national" ? "linear-gradient(135deg,#fff5f5,#fee2e2)" : "linear-gradient(135deg,#eff6ff,#dbeafe)", borderRadius: 14, border: `1px solid ${annale.type === "Brevet national" ? "#fca5a5" : "#93c5fd"}`, marginBottom: 16 }}>
              <div style={{ fontSize: 30 }}>{annale.type === "Brevet national" ? "🎓" : "📋"}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", fontFamily: "'Source Serif 4', Georgia, serif" }}>{annale.type} — {annale.annee}</div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>Session {annale.session} · Durée {annale.duree} · {annale.exercices.length} exercices</div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "5px 14px", borderRadius: 20, background: annale.type === "Brevet national" ? "#fee2e2" : "#dbeafe", color: annale.type === "Brevet national" ? "#b91c1c" : "#1d4ed8", border: `1px solid ${annale.type === "Brevet national" ? "#fca5a5" : "#93c5fd"}` }}>
                {annale.type === "Brevet national" ? "Officiel" : "Entraînement"}
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {annale.exercices.map((exo) => {
                const done = submitted[exo.id];
                return (
                  <div key={exo.id}
                    onClick={() => !done && setSelected({ annale, exo })}
                    style={{ background: done ? "#f0fdf4" : "#fff", border: `2px solid ${done ? "#86efac" : "#e2e8f0"}`, borderRadius: 12, padding: "18px 20px", cursor: done ? "default" : "pointer", transition: "all 0.15s", position: "relative", overflow: "hidden" }}
                    onMouseEnter={e => { if (!done) { e.currentTarget.style.borderColor = "#b91c1c"; e.currentTarget.style.background = "#fff5f5"; }}}
                    onMouseLeave={e => { if (!done) { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "#fff"; }}}>
                    {done && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "#22c55e" }}/>}
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 8, fontFamily: "'Source Serif 4', Georgia, serif", lineHeight: 1.35 }}>{exo.titre}</div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 12, color: "#94a3b8" }}>{exo.questions.length} question{exo.questions.length > 1 ? "s" : ""}</span>
                      {done
                        ? <span style={{ fontSize: 11, background: "#dcfce7", color: "#16a34a", borderRadius: 6, padding: "3px 10px", fontWeight: 700 }}>✓ Envoyé</span>
                        : <span style={{ fontSize: 12, color: "#b91c1c", fontWeight: 700 }}>Commencer →</span>}
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

// ── Carte cours ────────────────────────────────────────────────────────────────
function CarteCours({ cours, onClick, hue }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: hov ? `hsl(${hue},80%,97%)` : "#fff", border: `2px solid ${hov ? `hsl(${hue},55%,75%)` : "#f1f5f9"}`, borderRadius: 12, padding: "18px 20px", cursor: "pointer", transition: "all 0.18s", transform: hov ? "translateY(-2px)" : "none", boxShadow: hov ? `0 8px 24px hsl(${hue},45%,88%)` : "0 1px 4px rgba(0,0,0,0.05)", position: "relative", overflow: "hidden" }}>
      {hov && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,hsl(${hue},65%,50%),hsl(${hue},55%,70%))` }}/>}
      <div style={{ fontSize: 15, fontWeight: 600, color: "#0f172a", lineHeight: 1.4, marginBottom: 10, fontFamily: "'Source Serif 4', Georgia, serif" }}>{cours.titre}</div>
      <div style={{ fontSize: 11, color: "#94a3b8", display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: "DM Sans, sans-serif" }}>
        <span>{new Date(cours.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</span>
        <span style={{ color: hov ? `hsl(${hue},55%,45%)` : "#d1d5db", fontWeight: 700, fontSize: 16 }}>→</span>
      </div>
    </div>
  );
}

// ── Carte exercice ─────────────────────────────────────────────────────────────
function CarteExo({ exo, onClick, soumis, hue }) {
  const [hov, setHov] = useState(false);
  const nb = (exo.questions || []).length;
  const maxDiff = Math.max(...(exo.questions || []).map(q => q.difficulte || 1));
  const dc = [,{ label: "Facile", c: "#15803d", bg: "#f0fdf4" },{ label: "Intermédiaire", c: "#b45309", bg: "#fffbeb" },{ label: "Brevet", c: "#b91c1c", bg: "#fff5f5" }][maxDiff] || { label: "Facile", c: "#15803d", bg: "#f0fdf4" };

  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: soumis ? "#f0fdf4" : hov ? `hsl(${hue},80%,97%)` : "#fff", border: `2px solid ${soumis ? "#86efac" : hov ? `hsl(${hue},55%,75%)` : "#f1f5f9"}`, borderRadius: 12, padding: "18px 20px", cursor: "pointer", transition: "all 0.18s", transform: hov ? "translateY(-2px)" : "none", boxShadow: hov ? `0 8px 24px hsl(${hue},45%,88%)` : "0 1px 4px rgba(0,0,0,0.05)", position: "relative", overflow: "hidden" }}>
      {soumis && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "#22c55e" }}/>}
      {!soumis && hov && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,hsl(${hue},65%,50%),hsl(${hue},55%,70%))` }}/>}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: "#0f172a", lineHeight: 1.35, flex: 1, paddingRight: 10, fontFamily: "'Source Serif 4', Georgia, serif" }}>{exo.titre}</div>
        {soumis
          ? <span style={{ fontSize: 11, background: "#dcfce7", color: "#16a34a", borderRadius: 6, padding: "3px 10px", fontWeight: 700, flexShrink: 0, fontFamily: "DM Sans, sans-serif" }}>✓ Envoyé</span>
          : <span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 6, fontWeight: 700, flexShrink: 0, background: dc.bg, color: dc.c, fontFamily: "DM Sans, sans-serif" }}>{dc.label}</span>}
      </div>
      <div style={{ fontSize: 11, color: "#94a3b8", display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: "DM Sans, sans-serif" }}>
        <span>{nb} question{nb > 1 ? "s" : ""}</span>
        <span style={{ color: hov ? `hsl(${hue},55%,45%)` : "#d1d5db", fontWeight: 700, fontSize: 16 }}>→</span>
      </div>
    </div>
  );
}

// ── Page principale ────────────────────────────────────────────────────────────
export default function EleveHome({ user, eleveData, onLogout }) {
  const [cours, setCours] = useState([]);
  const [exercices, setExercices] = useState([]);
  const [soumissions, setSoumissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null); // {type, data}
  const [tab, setTab] = useState("cours");
  const [search, setSearch] = useState("");
  const [themeOpen, setThemeOpen] = useState({});

  const niveau = eleveData?.niveau || "3e";

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    const [{ data: c }, { data: e }, { data: s }] = await Promise.all([
      supabase.from("cours").select("*").eq("publie", true).eq("niveau", niveau).order("created_at"),
      supabase.from("exercices").select("*").eq("publie", true).eq("niveau", niveau).order("created_at"),
      supabase.from("soumissions").select("exercice_id").eq("eleve_id", user.id)
    ]);
    const debloques = eleveData?.chapitres_debloques || null;
    const filter = (items) => {
      if (!debloques) return items || [];
      return (items || []).filter(i => debloques.includes(i.chapitre) || debloques.includes(i.titre));
    };
    setCours(filter(c));
    setExercices(filter(e));
    setSoumissions((s || []).map(x => x.exercice_id));
    setLoading(false);
  };

  if (selected?.type === "cours") return <CoursView cours={selected.data} onBack={() => setSelected(null)} />;
  if (selected?.type === "exo")   return <ExerciceView exercice={selected.data} eleve={{ ...eleveData, id: user.id, email: user.email }} onBack={() => { setSelected(null); loadAll(); }} />;
  if (selected?.type === "annales") return <AnnalesView eleve={{ ...eleveData, id: user.id, email: user.email }} onBack={() => setSelected(null)} />;

  const themes = THEMES["Mathématiques"];
  const filteredCours = cours.filter(c => !search || c.titre.toLowerCase().includes(search.toLowerCase()));
  const filteredExos  = exercices.filter(e => !search || e.titre.toLowerCase().includes(search.toLowerCase()));
  const coursByTheme  = themes.map(t => ({ ...t, items: filteredCours.filter(c => t.chapitres.some(ch => c.chapitre === ch || c.titre === ch)) })).filter(t => t.items.length > 0);
  const exosByTheme   = themes.map(t => ({ ...t, items: filteredExos.filter(e => t.chapitres.some(ch => e.chapitre === ch || e.titre === ch)) })).filter(t => t.items.length > 0);
  const currentThemes = tab === "cours" ? coursByTheme : exosByTheme;

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9ff", fontFamily: "DM Sans, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}*{box-sizing:border-box}`}</style>

      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #f1f5f9", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 32px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 30, height: 30, background: "#1d4ed8", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#fff", fontSize: 14 }}>C</div>
            <span style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", fontFamily: "'Source Serif 4', Georgia, serif" }}>Cours</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 13, color: "#64748b", background: "#f1f5f9", borderRadius: 20, padding: "5px 14px", fontWeight: 500 }}>
              {eleveData?.nom} · <strong style={{ color: "#1d4ed8" }}>{niveau}</strong>
            </span>
            <button onClick={onLogout} style={{ fontSize: 12, color: "#ef4444", background: "#fff5f5", border: "1px solid #fecaca", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontWeight: 600 }}>Déconnexion</button>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div style={{ background: "linear-gradient(150deg,#0f2060 0%,#1d4ed8 50%,#3b82f6 100%)", padding: "44px 32px 52px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.05, backgroundImage: "repeating-linear-gradient(transparent,transparent 27px,rgba(255,255,255,1) 27px,rgba(255,255,255,1) 28px)" }} />
        <div style={{ maxWidth: 1000, margin: "0 auto", position: "relative" }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
            Bonjour {eleveData?.nom?.split(" ")[0]} 👋
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "#fff", margin: "0 0 22px", fontFamily: "'Source Serif 4', Georgia, serif" }}>
            Mathématiques · {niveau}
          </h1>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 10, padding: "8px 14px", flex: 1, maxWidth: 320 }}>
              <span style={{ opacity: 0.6 }}>🔍</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher…" style={{ background: "none", border: "none", outline: "none", color: "#fff", fontSize: 13, flex: 1 }} />
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span style={{ background: "rgba(255,255,255,0.15)", color: "#fff", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 600 }}>📖 {cours.length} cours</span>
              <span style={{ background: "rgba(255,255,255,0.15)", color: "#fff", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 600 }}>✏️ {exercices.length} exercices</span>
              <button onClick={() => setSelected({ type: "annales" })}
                style={{ background: "linear-gradient(135deg,rgba(185,28,28,0.85),rgba(220,38,38,0.85))", color: "#fff", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 8, padding: "7px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                🎓 Annales Brevet
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: "#fff", borderBottom: "1px solid #f1f5f9" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 32px", display: "flex" }}>
          {[{ key: "cours", label: "📖 Cours", count: cours.length },{ key: "exercices", label: "✏️ Exercices", count: exercices.length }].map(t => (
            <div key={t.key} onClick={() => setTab(t.key)}
              style={{ padding: "14px 22px 12px", cursor: "pointer", fontSize: 14, fontWeight: tab === t.key ? 700 : 500, borderBottom: `3px solid ${tab === t.key ? "#1d4ed8" : "transparent"}`, color: tab === t.key ? "#1d4ed8" : "#94a3b8", transition: "all 0.15s", display: "flex", alignItems: "center", gap: 8 }}>
              {t.label}
              <span style={{ fontSize: 11, background: tab === t.key ? "#dbeafe" : "#f1f5f9", color: tab === t.key ? "#1d4ed8" : "#94a3b8", borderRadius: 20, padding: "2px 8px", fontWeight: 700 }}>{t.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Contenu */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "36px 32px 80px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 80, color: "#94a3b8" }}>Chargement…</div>
        ) : currentThemes.length === 0 ? (
          <div style={{ textAlign: "center", padding: "70px 40px", background: "#fff", borderRadius: 16, border: "2px dashed #e2e8f0" }}>
            <div style={{ fontSize: 44, marginBottom: 14 }}>📚</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>
              {search ? `Aucun résultat pour "${search}"` : "Aucun contenu disponible"}
            </div>
            <div style={{ fontSize: 13, color: "#94a3b8" }}>Ton professeur va bientôt débloquer de nouveaux chapitres !</div>
          </div>
        ) : (
          currentThemes.map((theme, ti) => (
            <div key={theme.id} style={{ marginBottom: 44, animation: "fadeUp 0.4s ease both", animationDelay: `${ti * 0.07}s` }}>
              <div onClick={() => setThemeOpen(p => ({ ...p, [theme.id]: !p[theme.id] }))}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, cursor: "pointer", userSelect: "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, background: `hsl(${theme.hue},65%,94%)`, border: `2px solid hsl(${theme.hue},55%,82%)`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: `hsl(${theme.hue},55%,40%)` }}>{theme.icon}</div>
                  <div>
                    <div style={{ fontSize: 17, fontWeight: 700, color: "#0f172a", fontFamily: "'Source Serif 4', Georgia, serif" }}>{theme.label}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>{theme.items.length} {tab === "cours" ? "cours" : "exercices"}</div>
                  </div>
                </div>
                <span style={{ fontSize: 16, color: "#94a3b8", transition: "transform 0.2s", display: "block", transform: themeOpen[theme.id] ? "rotate(90deg)" : "none" }}>›</span>
              </div>
              <div style={{ height: 2, background: `linear-gradient(90deg,hsl(${theme.hue},60%,52%) 0%,transparent 100%)`, borderRadius: 2, marginBottom: 18, opacity: 0.5 }} />
              {!themeOpen[theme.id] && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 12 }}>
                  {theme.items.map(item => (
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