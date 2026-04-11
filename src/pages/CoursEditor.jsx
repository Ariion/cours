import { useState, useRef } from "react";
import { supabase } from "../lib/supabase";
import MathRenderer from "../components/MathRenderer";

const NIVEAUX = ["6e", "5e", "4e", "3e", "2nde", "1re", "Terminale"];
const MATIERES = ["Mathématiques", "Physique-Chimie", "Français", "Histoire-Géo", "Anglais"];

const CHAPITRES_MATHS = {
  "6e": [
    "Nombres entiers et décimaux", "Fractions — introduction", "Opérations (addition, soustraction)",
    "Multiplication et division", "Géométrie : droites et angles", "Polygones et triangles",
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
    "Étude de fonctions — variations et extrema",
    "Fonction exponentielle", "Trigonométrie — cercle trigonométrique",
    "Géométrie dans l'espace — vecteurs 3D",
    "Probabilités — conditionnelles et indépendance",
    "Algorithmique — boucles et fonctions"
  ],
  "Terminale": [
    "Limites de fonctions", "Continuité et dérivabilité",
    "Fonctions — étude complète", "Intégration — primitives",
    "Intégrale de Riemann — calcul d'aires",
    "Fonction logarithme népérien", "Équations différentielles",
    "Suites — convergence et raisonnement par récurrence",
    "Loi binomiale", "Loi normale",
    "Probabilités — espérance et variance",
    "Nombres complexes", "Arithmétique — PGCD et congruences"
  ]
};

// Boutons de la barre mathématique
const MATH_BUTTONS = [
  { label: "x²", insert: "^{2}", title: "Puissance 2" },
  { label: "xⁿ", insert: "^{n}", title: "Puissance n" },
  { label: "√x", insert: "\\sqrt{}", title: "Racine carrée", cursor: -1 },
  { label: "a/b", insert: "\\frac{}{}", title: "Fraction", cursor: -3 },
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
  { label: "vec", insert: "\\vec{}", title: "Vecteur", cursor: -1 },
];

// Bloc types
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
  texte: { bg: "#fff", border: "#e0e8f7", accent: "#1a56db", label: null },
  formule: { bg: "#f8faff", border: "#c5d8f7", accent: "#1a56db", label: null },
  definition: { bg: "#eef3ff", border: "#1a56db", accent: "#1a56db", label: "Définition" },
  theoreme: { bg: "#fff8e6", border: "#f0a500", accent: "#b86f00", label: "Théorème" },
  exemple: { bg: "#f5fff5", border: "#5aad5a", accent: "#2d7a2d", label: "Exemple" },
  remarque: { bg: "#fffbf0", border: "#ddb860", accent: "#7a5f00", label: "Remarque" },
  methode: { bg: "#fff0f8", border: "#c85aad", accent: "#7a1a60", label: "Méthode" },
};

function EditableBlock({ block, onChange, onDelete, onMoveUp, onMoveDown, isFirst, isLast }) {
  const [editingMath, setEditingMath] = useState(false);
  const textRef = useRef(null);
  const s = BLOCK_STYLES[block.type];

  const insertMath = (latex) => {
    const content = block.content || "";
    const ta = textRef.current;
    if (block.type === "formule") {
      onChange({ ...block, content: content + latex });
      return;
    }
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
      borderRadius: 12, marginBottom: 12, overflow: "hidden",
      borderLeft: `4px solid ${s.accent}`
    }}>
      {/* Header du bloc */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "8px 14px", borderBottom: `1px solid ${s.border}`,
        background: "rgba(255,255,255,0.6)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {s.label && (
            <span style={{ fontSize: 11, fontWeight: 700, color: s.accent, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {s.label}
            </span>
          )}
          <select
            value={block.type}
            onChange={e => onChange({ ...block, type: e.target.value })}
            style={{
              fontSize: 11, border: "1px solid #dce8f7", borderRadius: 6,
              padding: "3px 6px", background: "#fff", color: "#6b7eb8", cursor: "pointer"
            }}
          >
            {BLOCK_TYPES.map(t => <option key={t.key} value={t.key}>{t.icon} {t.label}</option>)}
          </select>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {!isFirst && <btn onClick={onMoveUp} style={smallBtn}>↑</btn>}
          {!isLast && <btn onClick={onMoveDown} style={smallBtn}>↓</btn>}
          <btn onClick={onDelete} style={{ ...smallBtn, color: "#d93025", borderColor: "#fdd" }}>✕</btn>
        </div>
      </div>

      {/* Barre mathématique */}
      {(block.type === "formule" || block.type === "texte" || block.type === "definition" || block.type === "theoreme" || block.type === "exemple" || block.type === "methode") && (
        <div style={{
          display: "flex", flexWrap: "wrap", gap: 4, padding: "8px 14px",
          borderBottom: `1px solid ${s.border}`, background: "rgba(255,255,255,0.8)"
        }}>
          {MATH_BUTTONS.map(btn => (
            <button
              key={btn.label}
              title={btn.title}
              onClick={() => insertMath(btn.insert)}
              style={{
                padding: "4px 8px", borderRadius: 6, border: "1px solid #dce8f7",
                background: "#fff", fontSize: 13, cursor: "pointer", color: "#1a56db",
                fontFamily: "Georgia, serif", fontWeight: 500, minWidth: 30,
                transition: "all 0.1s"
              }}
              onMouseEnter={e => { e.target.style.background = "#eef3ff"; e.target.style.borderColor = "#1a56db"; }}
              onMouseLeave={e => { e.target.style.background = "#fff"; e.target.style.borderColor = "#dce8f7"; }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      )}

      {/* Zone de contenu */}
      <div style={{ padding: "12px 16px" }}>
        {block.type === "formule" ? (
          <div>
            <textarea
              value={block.content || ""}
              onChange={e => onChange({ ...block, content: e.target.value })}
              placeholder="Saisir la formule LaTeX... ex: \frac{-b + \sqrt{\Delta}}{2a}"
              style={{
                width: "100%", minHeight: 60, padding: "10px", borderRadius: 8,
                border: "1px solid #dce8f7", fontSize: 13, fontFamily: "'Courier New', monospace",
                resize: "vertical", outline: "none", boxSizing: "border-box",
                background: "#f8faff", color: "#333"
              }}
            />
            {block.content && (
              <div style={{
                marginTop: 12, padding: "16px", background: "#fff",
                borderRadius: 8, border: "1px solid #e0e8f7",
                textAlign: "center", fontSize: 20
              }}>
                <MathRenderer formula={block.content} block={true} />
              </div>
            )}
          </div>
        ) : (
          <div>
            {block.titre !== undefined && (
              <input
                value={block.titre || ""}
                onChange={e => onChange({ ...block, titre: e.target.value })}
                placeholder={`Titre du bloc (optionnel)`}
                style={{
                  width: "100%", padding: "8px 0", border: "none", borderBottom: `1px solid ${s.border}`,
                  fontSize: 15, fontWeight: 600, color: s.accent, background: "transparent",
                  outline: "none", marginBottom: 10, boxSizing: "border-box", fontFamily: "inherit"
                }}
              />
            )}
            <textarea
              ref={textRef}
              value={block.content || ""}
              onChange={e => onChange({ ...block, content: e.target.value })}
              placeholder={
                block.type === "texte" ? "Saisir le texte du cours... Utiliser $formule$ pour les maths inline."
                : block.type === "definition" ? "Écrire la définition..."
                : block.type === "theoreme" ? "Énoncer le théorème..."
                : block.type === "exemple" ? "Décrire l'exemple..."
                : "Saisir le contenu..."
              }
              style={{
                width: "100%", minHeight: 80, padding: "8px 0", border: "none",
                fontSize: 14, fontFamily: "inherit", resize: "vertical", outline: "none",
                boxSizing: "border-box", background: "transparent", color: "#1a2040",
                lineHeight: 1.7
              }}
            />
            {/* Aperçu inline math */}
            {block.content && block.content.includes("$") && (
              <div style={{
                marginTop: 8, padding: "10px 14px", background: "rgba(26,86,219,0.04)",
                borderRadius: 8, fontSize: 14, color: "#333"
              }}>
                <div style={{ fontSize: 10, color: "#aaa", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>Aperçu</div>
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
  background: "#fff", fontSize: 12, cursor: "pointer", color: "#6b7eb8",
  display: "inline-block"
};

export default function CoursEditor({ user, onBack }) {
  const [titre, setTitre] = useState("");
  const [niveau, setNiveau] = useState("6e");
  const [matiere, setMatiere] = useState("Mathématiques");
  const [chapitreNom, setChapitreNom] = useState("");
  const [blocks, setBlocks] = useState([{ id: 1, type: "texte", content: "", titre: "" }]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [preview, setPreview] = useState(false);

  const addBlock = (type) => {
    const newBlock = {
      id: Date.now(), type,
      content: "",
      titre: ["definition", "theoreme", "exemple", "methode", "remarque"].includes(type) ? "" : undefined
    };
    setBlocks(prev => [...prev, newBlock]);
  };

  const updateBlock = (id, updated) => {
    setBlocks(prev => prev.map(b => b.id === id ? updated : b));
  };

  const deleteBlock = (id) => {
    setBlocks(prev => prev.filter(b => b.id !== id));
  };

  const moveBlock = (idx, dir) => {
    setBlocks(prev => {
      const next = [...prev];
      const target = idx + dir;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  const saveCours = async (publie = false) => {
    if (!titre) return;
    setSaving(true);
    await supabase.from("cours").insert({
      titre, niveau, matiere,
      chapitre: chapitreNom,
      contenu: JSON.stringify(blocks),
      publie,
      auteur_id: user.id
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f0f5ff", fontFamily: "'DM Sans', Arial, sans-serif" }}>
      {/* Sidebar éditeur */}
      <div style={{ width: 200, background: "#fff", borderRight: "1px solid #e0e8f7", padding: "24px 0", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "0 16px 20px", borderBottom: "1px solid #e0e8f7" }}>
          <button onClick={onBack} style={{ fontSize: 13, color: "#6b7eb8", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
            ← Retour
          </button>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#1a56db", marginTop: 8 }}>Nouveau cours</div>
        </div>
        <div style={{ padding: "16px 12px", flex: 1 }}>
          <div style={{ fontSize: 11, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Ajouter un bloc</div>
          {BLOCK_TYPES.map(t => (
            <button key={t.key} onClick={() => addBlock(t.key)} style={{
              display: "flex", alignItems: "center", gap: 8,
              width: "100%", padding: "9px 12px", borderRadius: 8,
              border: "1px solid #e0e8f7", background: "#fff",
              fontSize: 13, cursor: "pointer", color: "#333",
              marginBottom: 6, textAlign: "left", transition: "all 0.15s"
            }}
              onMouseEnter={e => e.currentTarget.style.background = "#eef3ff"}
              onMouseLeave={e => e.currentTarget.style.background = "#fff"}
            >
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>
        <div style={{ padding: "12px" }}>
          <button onClick={() => setPreview(!preview)} style={{
            width: "100%", padding: "9px", borderRadius: 8,
            border: "1px solid #1a56db", background: preview ? "#1a56db" : "#fff",
            color: preview ? "#fff" : "#1a56db", fontSize: 13, cursor: "pointer", fontWeight: 600
          }}>
            {preview ? "✏️ Éditer" : "👁 Aperçu"}
          </button>
        </div>
      </div>

      {/* Zone principale */}
      <div style={{ flex: 1, overflowY: "auto", padding: "32px 40px" }}>
        {/* Métadonnées */}
        <div style={{
          background: "#fff", border: "1px solid #e0e8f7", borderRadius: 16,
          padding: "24px", marginBottom: 24
        }}>
          <input
            value={titre}
            onChange={e => setTitre(e.target.value)}
            placeholder="Titre du cours"
            style={{
              width: "100%", fontSize: 24, fontWeight: 700, border: "none",
              outline: "none", color: "#1a2040", fontFamily: "inherit",
              boxSizing: "border-box", marginBottom: 16
            }}
          />
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <select value={niveau} onChange={e => { setNiveau(e.target.value); setChapitreNom(""); }} style={selectStyle}>
              {NIVEAUX.map(n => <option key={n}>{n}</option>)}
            </select>
            <select value={matiere} onChange={e => setMatiere(e.target.value)} style={selectStyle}>
              {MATIERES.map(m => <option key={m}>{m}</option>)}
            </select>
            {matiere === "Mathématiques" && CHAPITRES_MATHS[niveau] ? (
              <select value={chapitreNom} onChange={e => setChapitreNom(e.target.value)} style={{ ...selectStyle, minWidth: 260 }}>
                <option value="">— Choisir un chapitre —</option>
                {CHAPITRES_MATHS[niveau].map(c => <option key={c}>{c}</option>)}
              </select>
            ) : (
              <input
                value={chapitreNom}
                onChange={e => setChapitreNom(e.target.value)}
                placeholder="Nom du chapitre"
                style={{ ...selectStyle, minWidth: 200 }}
              />
            )}
          </div>
        </div>

        {/* Blocs */}
        {blocks.map((block, idx) => (
          <EditableBlock
            key={block.id}
            block={block}
            onChange={updated => updateBlock(block.id, updated)}
            onDelete={() => deleteBlock(block.id)}
            onMoveUp={() => moveBlock(idx, -1)}
            onMoveDown={() => moveBlock(idx, 1)}
            isFirst={idx === 0}
            isLast={idx === blocks.length - 1}
          />
        ))}

        {/* Actions */}
        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <button onClick={() => saveCours(false)} disabled={!titre || saving}
            style={{
              padding: "12px 28px", borderRadius: 10, border: "1.5px solid #1a56db",
              background: "#fff", color: "#1a56db", fontSize: 14, fontWeight: 600,
              cursor: "pointer", opacity: !titre ? 0.5 : 1, fontFamily: "inherit"
            }}>
            {saving ? "Sauvegarde..." : "Sauvegarder brouillon"}
          </button>
          <button onClick={() => saveCours(true)} disabled={!titre || saving}
            style={{
              padding: "12px 28px", borderRadius: 10, border: "none",
              background: "#1a56db", color: "#fff", fontSize: 14, fontWeight: 600,
              cursor: "pointer", opacity: !titre ? 0.5 : 1, fontFamily: "inherit"
            }}>
            Publier le cours →
          </button>
          {saved && <span style={{ alignSelf: "center", color: "#3a7d0a", fontSize: 14, fontWeight: 500 }}>✓ Sauvegardé</span>}
        </div>
      </div>
    </div>
  );
}

const selectStyle = {
  padding: "8px 14px", borderRadius: 8, border: "1.5px solid #dce8f7",
  fontSize: 13, fontFamily: "inherit", outline: "none", background: "#fff", color: "#333"
}; 