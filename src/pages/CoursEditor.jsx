import { useState, useRef } from "react";
import { supabase } from "../lib/supabase";
import MathRenderer from "../components/MathRenderer";

const NIVEAUX = ["6e", "5e", "4e", "3e", "2nde", "1re", "Terminale"];
const MATIERES = ["Mathématiques", "Physique-Chimie", "Français", "Histoire-Géo", "Anglais"];

const CHAPITRES_MATHS = {
  "6e": [
    "Nombres entiers et décimaux", "Fractions — introduction",
    "Opérations (addition, soustraction)", "Multiplication et division",
    "Géométrie : droites et angles", "Polygones et triangles",
    "Cercle et disque", "Périmètres et aires", "Proportionnalité", "Statistiques et données"
  ],
  "5e": [
    "Nombres relatifs", "Fractions — opérations", "Expressions littérales",
    "Équations du 1er degré — introduction", "Triangles et parallélisme",
    "Symétrie centrale", "Cercle — propriétés", "Volumes : cube, pavé, cylindre",
    "Probabilités — introduction", "Statistiques — moyenne"
  ],
  "4e": [
    "Calcul algébrique — développer, factoriser", "Équations du 1er degré",
    "Systèmes d'équations", "Trigonométrie — sin, cos, tan",
    "Théorème de Pythagore", "Théorème de Thalès",
    "Fonctions — introduction", "Statistiques — médiane et quartiles",
    "Probabilités — calcul"
  ],
  "3e": [
    "Calcul numérique — puissances et racines", "Notation scientifique",
    "Développement et factorisation avancés", "Équations et inéquations",
    "Fonctions linéaires et affines", "Théorème de Pythagore — réciproque",
    "Trigonométrie avancée", "Géométrie dans l'espace",
    "Statistiques — boîte à moustaches", "Probabilités — loi des grands nombres"
  ],
  "2nde": [
    "Ensembles de nombres (ℕ, ℤ, ℚ, ℝ)", "Intervalles et inégalités",
    "Fonctions — généralités et variations", "Fonctions de référence",
    "Équations et inéquations du 2nd degré", "Produits nuls et tableaux de signes",
    "Vecteurs dans le plan", "Droites — équations et positions relatives",
    "Statistiques descriptives", "Probabilités — fréquences",
    "Algorithmique et Python — bases"
  ],
  "1re": [
    "Suites numériques — arithmétiques", "Suites numériques — géométriques",
    "Dérivation — nombre dérivé", "Fonctions dérivées — règles de calcul",
    "Étude de fonctions — variations et extrema", "Fonction exponentielle",
    "Trigonométrie — cercle trigonométrique", "Géométrie dans l'espace — vecteurs 3D",
    "Probabilités — conditionnelles et indépendance",
    "Algorithmique — boucles et fonctions"
  ],
  "Terminale": [
    "Limites de fonctions", "Continuité et dérivabilité",
    "Fonctions — étude complète", "Intégration — primitives",
    "Intégrale de Riemann — calcul d'aires", "Fonction logarithme népérien",
    "Équations différentielles", "Suites — convergence et raisonnement par récurrence",
    "Loi binomiale", "Loi normale", "Probabilités — espérance et variance",
    "Nombres complexes", "Arithmétique — PGCD et congruences"
  ]
};

const MATH_BUTTONS = [
  { label: "x²", insert: "^{2}", title: "Puissance 2" },
  { label: "xⁿ", insert: "^{n}", title: "Puissance n" },
  { label: "√x", insert: "\\sqrt{}", title: "Racine carrée" },
  { label: "a/b", insert: "\\frac{}{}", title: "Fraction" },
  { label: "Δ", insert: "\\Delta", title: "Delta" },
  { label: "π", insert: "\\pi", title: "Pi" },
  { label: "∞", insert: "\\infty", title: "Infini" },
  { label: "≤", insert: "\\leq", title: "Inférieur ou égal" },
  { label: "≥", insert: "\\geq", title: "Supérieur ou égal" },
  { label: "≠", insert: "\\neq", title: "Différent" },
  { label: "×", insert: "\\times", title: "Multiplication ×" },
  { label: "÷", insert: "\\div", title: "Division" },
  { label: "±", insert: "\\pm", title: "Plus ou moins" },
  { label: "α", insert: "\\alpha", title: "Alpha" },
  { label: "β", insert: "\\beta", title: "Bêta" },
  { label: "∑", insert: "\\sum_{i=1}^{n}", title: "Somme" },
  { label: "∫", insert: "\\int_{a}^{b}", title: "Intégrale" },
  { label: "→", insert: "\\rightarrow", title: "Flèche" },
  { label: "⟺", insert: "\\Leftrightarrow", title: "Équivalence" },
  { label: "ℝ", insert: "\\mathbb{R}", title: "Réels" },
  { label: "ℕ", insert: "\\mathbb{N}", title: "Entiers naturels" },
  { label: "∈", insert: "\\in", title: "Appartient à" },
  { label: "|x|", insert: "|  |", title: "Valeur absolue" },
  { label: "vec", insert: "\\vec{}", title: "Vecteur" },
];

const BLOCK_TYPES = [
  { key: "texte", label: "Texte", icon: "T" },
  { key: "formule", label: "Formule", icon: "∑" },
  { key: "definition", label: "Définition", icon: "📘" },
  { key: "theoreme", label: "Théorème", icon: "⚡" },
  { key: "exemple", label: "Exemple", icon: "✏️" },
  { key: "remarque", label: "Remarque", icon: "💡" },
  { key: "methode", label: "Méthode", icon: "🔧" },
];

const BLOCK_STYLES = {
  texte:      { bg: "#fff",    border: "#e0e8f7", accent: "#1a56db", label: null },
  formule:    { bg: "#f8faff", border: "#c5d8f7", accent: "#1a56db", label: null },
  definition: { bg: "#eef3ff", border: "#1a56db", accent: "#1a56db", label: "Définition" },
  theoreme:   { bg: "#fff8e6", border: "#f0a500", accent: "#b86f00", label: "Théorème" },
  exemple:    { bg: "#f5fff5", border: "#5aad5a", accent: "#2d7a2d", label: "Exemple" },
  remarque:   { bg: "#fffbf0", border: "#ddb860", accent: "#7a5f00", label: "Remarque" },
  methode:    { bg: "#fff0f8", border: "#c85aad", accent: "#7a1a60", label: "Méthode" },
};

// ─── Prompt système envoyé à Claude ──────────────────────────────────────────
const SYSTEM_PROMPT = `Tu es un professeur de mathématiques expert du programme français (collège et lycée).
Tu génères des cours complets, rigoureux et pédagogiques au format JSON.

RÈGLES ABSOLUES :
- Réponds UNIQUEMENT avec un tableau JSON valide, aucun texte avant ou après.
- Chaque bloc a : { "id": number, "type": string, "content": string, "titre": string|undefined }
- Types disponibles : "texte", "formule", "definition", "theoreme", "exemple", "remarque", "methode"
- Pour "definition", "theoreme", "exemple", "methode", "remarque" : inclure "titre" (string)
- Pour "texte" et "formule" : PAS de champ "titre"
- Les formules mathématiques dans "texte" s'écrivent $formule$ (inline)
- Les blocs "formule" contiennent du LaTeX pur (sans $), ex: \\frac{-b+\\sqrt{\\Delta}}{2a}
- Utilise \\times pour ×, \\leq pour ≤, \\geq pour ≥, \\sqrt{} pour √, \\frac{}{} pour les fractions
- Sois exhaustif : définitions, théorèmes, formules clés, méthodes, exemples résolus étape par étape
- Minimum 12 blocs, idéalement 18-25 blocs pour un cours complet
- Les exemples doivent montrer des calculs détaillés pas à pas dans le contenu`;

// ─── Fonction de génération IA ───────────────────────────────────────────────
async function genererCoursIA(niveau, matiere, chapitre, onProgress) {
  onProgress("Connexion à l'IA...");

  const userPrompt = `Génère un cours complet de ${matiere} pour la classe de ${niveau}, chapitre : "${chapitre}".
  
Inclus dans l'ordre :
1. Une introduction (bloc texte)
2. Les définitions essentielles
3. Les théorèmes/propriétés avec leurs formules (blocs formule séparés)
4. Les méthodes de résolution étape par étape
5. Plusieurs exemples résolus complètement
6. Des remarques importantes et cas particuliers

Réponds uniquement avec le tableau JSON.`;

  onProgress("Génération en cours...");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }]
    })
  });

  if (!response.ok) throw new Error(`Erreur API : ${response.status}`);

  const data = await response.json();
  const text = data.content?.map(b => b.text || "").join("") || "";

  onProgress("Analyse de la réponse...");

  // Nettoyage robuste du JSON
  const clean = text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  // Extraire le tableau JSON
  const match = clean.match(/\[[\s\S]*\]/);
  if (!match) throw new Error("Format de réponse invalide");

  const blocs = JSON.parse(match[0]);

  // Validation et nettoyage des blocs
  return blocs.map((b, i) => ({
    id: Date.now() + i,
    type: BLOCK_TYPES.map(t => t.key).includes(b.type) ? b.type : "texte",
    content: b.content || "",
    ...(["definition","theoreme","exemple","methode","remarque"].includes(b.type)
      ? { titre: b.titre || "" }
      : {})
  }));
}

// ─── Composant bloc éditable ─────────────────────────────────────────────────
function EditableBlock({ block, onChange, onDelete, onMoveUp, onMoveDown, isFirst, isLast }) {
  const textRef = useRef(null);
  const s = BLOCK_STYLES[block.type] || BLOCK_STYLES.texte;

  const insertMath = (latex) => {
    const content = block.content || "";
    if (block.type === "formule") {
      onChange({ ...block, content: content + latex });
      return;
    }
    const ta = textRef.current;
    if (ta) {
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const newVal = content.slice(0, start) + `$${latex}$` + content.slice(end);
      onChange({ ...block, content: newVal });
      setTimeout(() => {
        ta.focus();
        ta.setSelectionRange(start + latex.length + 2, start + latex.length + 2);
      }, 10);
    } else {
      onChange({ ...block, content: content + `$${latex}$` });
    }
  };

  return (
    <div style={{
      background: s.bg, border: `1.5px solid ${s.border}`,
      borderLeft: `4px solid ${s.accent}`,
      borderRadius: 12, marginBottom: 12, overflow: "hidden"
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "7px 14px", borderBottom: `1px solid ${s.border}`,
        background: "rgba(255,255,255,0.6)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {s.label && (
            <span style={{ fontSize: 11, fontWeight: 700, color: s.accent,
              textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</span>
          )}
          <select value={block.type} onChange={e => onChange({ ...block, type: e.target.value })}
            style={{ fontSize: 11, border: "1px solid #dce8f7", borderRadius: 6,
              padding: "3px 6px", background: "#fff", color: "#6b7eb8", cursor: "pointer" }}>
            {BLOCK_TYPES.map(t => <option key={t.key} value={t.key}>{t.icon} {t.label}</option>)}
          </select>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {!isFirst && (
            <button onClick={onMoveUp} style={smallBtn}>↑</button>
          )}
          {!isLast && (
            <button onClick={onMoveDown} style={smallBtn}>↓</button>
          )}
          <button onClick={onDelete} style={{ ...smallBtn, color: "#d93025", borderColor: "#fdd" }}>✕</button>
        </div>
      </div>

      {/* Barre mathématique */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 3, padding: "6px 14px",
        borderBottom: `1px solid ${s.border}`, background: "rgba(255,255,255,0.8)" }}>
        {MATH_BUTTONS.map(btn => (
          <button key={btn.label} title={btn.title} onClick={() => insertMath(btn.insert)}
            style={{ padding: "3px 7px", borderRadius: 5, border: "1px solid #dce8f7",
              background: "#fff", fontSize: 12, cursor: "pointer", color: "#1a56db",
              fontFamily: "Georgia, serif", fontWeight: 500, minWidth: 28 }}
            onMouseEnter={e => { e.target.style.background = "#eef3ff"; e.target.style.borderColor = "#1a56db"; }}
            onMouseLeave={e => { e.target.style.background = "#fff"; e.target.style.borderColor = "#dce8f7"; }}>
            {btn.label}
          </button>
        ))}
      </div>

      {/* Contenu */}
      <div style={{ padding: "12px 16px" }}>
        {block.type === "formule" ? (
          <div>
            <textarea value={block.content || ""}
              onChange={e => onChange({ ...block, content: e.target.value })}
              placeholder="LaTeX pur… ex: \frac{-b + \sqrt{\Delta}}{2a}"
              style={{ width: "100%", minHeight: 56, padding: "8px 10px", borderRadius: 8,
                border: "1px solid #dce8f7", fontSize: 13, fontFamily: "'Courier New', monospace",
                resize: "vertical", outline: "none", boxSizing: "border-box",
                background: "#f8faff", color: "#333" }}
            />
            {block.content && (
              <div style={{ marginTop: 10, padding: "14px", background: "#fff",
                borderRadius: 8, border: "1px solid #e0e8f7", textAlign: "center", fontSize: 20 }}>
                <MathRenderer formula={block.content} block={true} />
              </div>
            )}
          </div>
        ) : (
          <div>
            {block.titre !== undefined && (
              <input value={block.titre || ""}
                onChange={e => onChange({ ...block, titre: e.target.value })}
                placeholder="Titre du bloc (optionnel)"
                style={{ width: "100%", padding: "6px 0", border: "none",
                  borderBottom: `1px solid ${s.border}`, fontSize: 14, fontWeight: 600,
                  color: s.accent, background: "transparent", outline: "none",
                  marginBottom: 8, boxSizing: "border-box", fontFamily: "inherit" }}
              />
            )}
            <textarea ref={textRef} value={block.content || ""}
              onChange={e => onChange({ ...block, content: e.target.value })}
              placeholder={
                block.type === "texte" ? "Texte du cours… Utiliser $formule$ pour les maths inline."
                : block.type === "definition" ? "Écrire la définition…"
                : block.type === "theoreme" ? "Énoncer le théorème…"
                : block.type === "exemple" ? "Décrire l'exemple…"
                : "Saisir le contenu…"
              }
              style={{ width: "100%", minHeight: 72, padding: "6px 0", border: "none",
                fontSize: 14, fontFamily: "inherit", resize: "vertical", outline: "none",
                boxSizing: "border-box", background: "transparent", color: "#1a2040",
                lineHeight: 1.75 }}
            />
            {block.content && block.content.includes("$") && (
              <div style={{ marginTop: 8, padding: "8px 12px",
                background: "rgba(26,86,219,0.04)", borderRadius: 8 }}>
                <div style={{ fontSize: 10, color: "#aaa", marginBottom: 4,
                  textTransform: "uppercase", letterSpacing: "0.08em" }}>Aperçu</div>
                <MathRenderer formula={block.content} block={false} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const smallBtn = {
  padding: "3px 8px", borderRadius: 6, border: "1px solid #dce8f7",
  background: "#fff", fontSize: 12, cursor: "pointer", color: "#6b7eb8"
};

const selectStyle = {
  padding: "8px 14px", borderRadius: 8, border: "1.5px solid #dce8f7",
  fontSize: 13, fontFamily: "inherit", outline: "none", background: "#fff", color: "#333"
};

// ─── Composant principal ─────────────────────────────────────────────────────
export default function CoursEditor({ user, onBack, coursExistant }) {
  const [titre, setTitre] = useState(coursExistant?.titre || "");
  const [niveau, setNiveau] = useState(coursExistant?.niveau || "3e");
  const [matiere, setMatiere] = useState(coursExistant?.matiere || "Mathématiques");
  const [chapitreNom, setChapitreNom] = useState(coursExistant?.chapitre || "");
  const [blocks, setBlocks] = useState(() => {
    if (coursExistant?.contenu) {
      try { return JSON.parse(coursExistant.contenu); }
      catch { return [{ id: 1, type: "texte", content: coursExistant.contenu }]; }
    }
    return [{ id: 1, type: "texte", content: "" }];
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genStatus, setGenStatus] = useState("");
  const [genError, setGenError] = useState("");

  const addBlock = (type) => {
    const newBlock = {
      id: Date.now(), type, content: "",
      ...(["definition","theoreme","exemple","methode","remarque"].includes(type) ? { titre: "" } : {})
    };
    setBlocks(prev => [...prev, newBlock]);
  };

  const updateBlock = (id, updated) => setBlocks(prev => prev.map(b => b.id === id ? updated : b));
  const deleteBlock = (id) => setBlocks(prev => prev.filter(b => b.id !== id));
  const moveBlock = (idx, dir) => {
    setBlocks(prev => {
      const next = [...prev];
      [next[idx], next[idx + dir]] = [next[idx + dir], next[idx]];
      return next;
    });
  };

  // ── Génération IA ────────────────────────────────────────────────────────
  const handleGenererIA = async () => {
    const chapitre = chapitreNom || titre;
    if (!chapitre) {
      setGenError("Choisis d'abord un chapitre dans le menu déroulant.");
      return;
    }
    if (!confirm(`Générer automatiquement le cours "${chapitre}" en ${niveau} ?\n\nLe contenu actuel sera remplacé.`)) return;

    setGenerating(true);
    setGenError("");
    setGenStatus("Initialisation...");

    try {
      const nouveauxBlocs = await genererCoursIA(niveau, matiere, chapitre, setGenStatus);
      setBlocks(nouveauxBlocs);
      if (!titre) setTitre(chapitre);
      setGenStatus(`✓ ${nouveauxBlocs.length} blocs générés !`);
      setTimeout(() => setGenStatus(""), 3000);
    } catch (err) {
      console.error(err);
      setGenError("Erreur : " + err.message);
      setGenStatus("");
    } finally {
      setGenerating(false);
    }
  };

  // ── Génération de TOUS les chapitres d'un niveau ─────────────────────────
  const handleGenererTout = async () => {
    const chapitres = CHAPITRES_MATHS[niveau];
    if (!chapitres) return;
    if (!confirm(`Générer et sauvegarder automatiquement les ${chapitres.length} cours de ${matiere} en ${niveau} ?\n\nCela peut prendre plusieurs minutes.`)) return;

    setGenerating(true);
    setGenError("");

    for (let i = 0; i < chapitres.length; i++) {
      const chap = chapitres[i];
      setGenStatus(`[${i + 1}/${chapitres.length}] Génération : ${chap}…`);

      try {
        const blocs = await genererCoursIA(niveau, matiere, chap, () => {});

        // Sauvegarde directe en BDD
        await supabase.from("cours").insert({
          titre: chap,
          niveau,
          matiere,
          chapitre: chap,
          contenu: JSON.stringify(blocs),
          publie: false,
          auteur_id: user.id
        });

        // Petite pause entre les requêtes
        await new Promise(r => setTimeout(r, 1500));
      } catch (err) {
        console.error(`Erreur pour ${chap}:`, err);
        setGenStatus(`⚠ Erreur sur "${chap}" — on continue…`);
        await new Promise(r => setTimeout(r, 2000));
      }
    }

    setGenStatus(`✓ Tous les cours de ${niveau} générés et sauvegardés en brouillon !`);
    setGenerating(false);
    setTimeout(() => setGenStatus(""), 5000);
  };

  // ── Sauvegarde ───────────────────────────────────────────────────────────
  const saveCours = async (publie = false) => {
    if (!titre) return;
    setSaving(true);
    const donnees = { titre, niveau, matiere, chapitre: chapitreNom, contenu: JSON.stringify(blocks), publie };
    let error;
    if (coursExistant?.id) {
      const res = await supabase.from("cours").update(donnees).eq("id", coursExistant.id);
      error = res.error;
    } else {
      const res = await supabase.from("cours").insert({ ...donnees, auteur_id: user.id });
      error = res.error;
    }
    setSaving(false);
    if (error) {
      alert("Erreur : " + error.message);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f0f5ff",
      fontFamily: "'DM Sans', Arial, sans-serif" }}>

      {/* ── Sidebar ── */}
      <div style={{ width: 210, background: "#fff", borderRight: "1px solid #e0e8f7",
        padding: "24px 0", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "0 16px 20px", borderBottom: "1px solid #e0e8f7" }}>
          <button onClick={onBack} style={{ fontSize: 13, color: "#6b7eb8",
            background: "none", border: "none", cursor: "pointer", padding: 0 }}>← Retour</button>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#1a56db", marginTop: 8 }}>
            {coursExistant ? "Modifier le cours" : "Nouveau cours"}
          </div>
        </div>

        {/* Blocs */}
        <div style={{ padding: "14px 12px", flex: 1 }}>
          <div style={{ fontSize: 10, color: "#aaa", textTransform: "uppercase",
            letterSpacing: "0.1em", marginBottom: 8 }}>Ajouter un bloc</div>
          {BLOCK_TYPES.map(t => (
            <button key={t.key} onClick={() => addBlock(t.key)} style={{
              display: "flex", alignItems: "center", gap: 8, width: "100%",
              padding: "8px 10px", borderRadius: 8, border: "1px solid #e0e8f7",
              background: "#fff", fontSize: 13, cursor: "pointer", color: "#333",
              marginBottom: 5, textAlign: "left" }}
              onMouseEnter={e => e.currentTarget.style.background = "#eef3ff"}
              onMouseLeave={e => e.currentTarget.style.background = "#fff"}>
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        {/* Bouton génération IA */}
        <div style={{ padding: "12px", borderTop: "1px solid #e0e8f7" }}>
          <div style={{ fontSize: 10, color: "#aaa", textTransform: "uppercase",
            letterSpacing: "0.1em", marginBottom: 8 }}>Intelligence artificielle</div>

          {/* Générer CE chapitre */}
          <button onClick={handleGenererIA} disabled={generating}
            style={{ width: "100%", padding: "10px 8px", borderRadius: 8,
              border: "none", background: generating ? "#93aee0" : "#1a56db",
              color: "#fff", fontSize: 13, fontWeight: 700, cursor: generating ? "not-allowed" : "pointer",
              marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            {generating ? "⏳ Génération…" : "✨ Générer ce cours"}
          </button>

          {/* Générer TOUS les chapitres du niveau */}
          <button onClick={handleGenererTout} disabled={generating}
            style={{ width: "100%", padding: "9px 8px", borderRadius: 8,
              border: "1.5px solid #1a56db", background: "#fff",
              color: "#1a56db", fontSize: 12, fontWeight: 600,
              cursor: generating ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            🚀 Générer tout le niveau
          </button>

          {/* Status */}
          {genStatus && (
            <div style={{ marginTop: 8, padding: "8px 10px", borderRadius: 8,
              background: genStatus.startsWith("✓") ? "#f0fae8" : "#f0f5ff",
              color: genStatus.startsWith("✓") ? "#3a7d0a" : "#1a56db",
              fontSize: 11, fontWeight: 500, lineHeight: 1.4 }}>
              {genStatus}
            </div>
          )}
          {genError && (
            <div style={{ marginTop: 8, padding: "8px 10px", borderRadius: 8,
              background: "#fff5f5", color: "#d93025", fontSize: 11, lineHeight: 1.4 }}>
              {genError}
            </div>
          )}
        </div>
      </div>

      {/* ── Zone principale ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "32px 40px" }}>

        {/* Overlay de génération */}
        {generating && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(26,86,219,0.08)", zIndex: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
            backdropFilter: "blur(2px)" }}>
            <div style={{ background: "#fff", borderRadius: 16, padding: "32px 48px",
              border: "1.5px solid #e0e8f7", textAlign: "center",
              boxShadow: "0 8px 40px rgba(26,86,219,0.15)" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>✨</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#1a2040", marginBottom: 8 }}>
                Claude génère le cours…
              </div>
              <div style={{ fontSize: 13, color: "#6b7eb8" }}>{genStatus}</div>
            </div>
          </div>
        )}

        {/* Métadonnées */}
        <div style={{ background: "#fff", border: "1px solid #e0e8f7",
          borderRadius: 16, padding: "24px", marginBottom: 24 }}>
          <input value={titre} onChange={e => setTitre(e.target.value)}
            placeholder="Titre du cours"
            style={{ width: "100%", fontSize: 24, fontWeight: 700, border: "none",
              outline: "none", color: "#1a2040", fontFamily: "inherit",
              boxSizing: "border-box", marginBottom: 16 }}
          />
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <select value={niveau} onChange={e => { setNiveau(e.target.value); setChapitreNom(""); }} style={selectStyle}>
              {NIVEAUX.map(n => <option key={n}>{n}</option>)}
            </select>
            <select value={matiere} onChange={e => setMatiere(e.target.value)} style={selectStyle}>
              {MATIERES.map(m => <option key={m}>{m}</option>)}
            </select>

            {/* Sélecteur de chapitre */}
            {matiere === "Mathématiques" && CHAPITRES_MATHS[niveau] ? (
              <select value={chapitreNom}
                onChange={e => {
                  setChapitreNom(e.target.value);
                  if (!titre || CHAPITRES_MATHS[niveau].includes(titre)) setTitre(e.target.value);
                }}
                style={{ ...selectStyle, minWidth: 280 }}>
                <option value="">— Choisir un chapitre —</option>
                {CHAPITRES_MATHS[niveau].map(c => <option key={c}>{c}</option>)}
              </select>
            ) : (
              <input value={chapitreNom} onChange={e => setChapitreNom(e.target.value)}
                placeholder="Nom du chapitre"
                style={{ ...selectStyle, minWidth: 220 }} />
            )}

            {/* Badge IA disponible */}
            {chapitreNom && (
              <span style={{ fontSize: 11, background: "#eef3ff", color: "#1a56db",
                border: "1px solid #c5d8f7", borderRadius: 20, padding: "4px 12px",
                fontWeight: 600 }}>
                ✨ IA prête
              </span>
            )}
          </div>
        </div>

        {/* Blocs */}
        {blocks.map((block, idx) => (
          <EditableBlock key={block.id} block={block}
            onChange={updated => updateBlock(block.id, updated)}
            onDelete={() => deleteBlock(block.id)}
            onMoveUp={() => moveBlock(idx, -1)}
            onMoveDown={() => moveBlock(idx, 1)}
            isFirst={idx === 0}
            isLast={idx === blocks.length - 1}
          />
        ))}

        {blocks.length === 0 && !generating && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#aab5cc",
            background: "#fff", borderRadius: 16, border: "1px dashed #dce8f7" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>✨</div>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>
              Cours vide — prêt à générer
            </div>
            <div style={{ fontSize: 13 }}>
              Choisis un chapitre puis clique sur <strong>"Générer ce cours"</strong>
            </div>
          </div>
        )}

        {/* Actions de sauvegarde */}
        <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
          <button onClick={() => saveCours(false)} disabled={!titre || saving}
            style={{ padding: "12px 28px", borderRadius: 10, border: "1.5px solid #1a56db",
              background: "#fff", color: "#1a56db", fontSize: 14, fontWeight: 600,
              cursor: "pointer", opacity: !titre ? 0.5 : 1, fontFamily: "inherit" }}>
            {saving ? "Sauvegarde…" : "💾 Sauvegarder brouillon"}
          </button>
          <button onClick={() => saveCours(true)} disabled={!titre || saving}
            style={{ padding: "12px 28px", borderRadius: 10, border: "none",
              background: "#1a56db", color: "#fff", fontSize: 14, fontWeight: 600,
              cursor: "pointer", opacity: !titre ? 0.5 : 1, fontFamily: "inherit" }}>
            🚀 Publier le cours
          </button>
          {saved && (
            <span style={{ alignSelf: "center", color: "#3a7d0a", fontSize: 14, fontWeight: 600 }}>
              ✓ Sauvegardé !
            </span>
          )}
        </div>
      </div>
    </div>
  );
}