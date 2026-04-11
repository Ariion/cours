import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import MathRenderer, { MathBlock } from "../components/MathRenderer";

const BLOCK_STYLES = {
  texte: { bg: "#fff", border: "#e0e8f7", accent: "#1a56db", label: null },
  formule: { bg: "#f8faff", border: "#c5d8f7", accent: "#1a56db", label: null },
  definition: { bg: "#eef3ff", border: "#1a56db", accent: "#1a56db", label: "Définition" },
  theoreme: { bg: "#fff8e6", border: "#f0a500", accent: "#b86f00", label: "Théorème" },
  exemple: { bg: "#f5fff5", border: "#5aad5a", accent: "#2d7a2d", label: "Exemple" },
  remarque: { bg: "#fffbf0", border: "#ddb860", accent: "#7a5f00", label: "Remarque" },
  methode: { bg: "#fff0f8", border: "#c85aad", accent: "#7a1a60", label: "Méthode" },
};

function CoursView({ cours, onBack }) {
  const blocks = JSON.parse(cours.contenu || "[]");

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px" }}>
      <button onClick={onBack} style={{ fontSize: 13, color: "#6b7eb8", background: "none", border: "none", cursor: "pointer", marginBottom: 24 }}>
        ← Retour aux cours
      </button>
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 12, background: "#eef3ff", color: "#1a56db", borderRadius: 20, padding: "4px 12px", fontWeight: 600 }}>
            {cours.matiere}
          </span>
          <span style={{ fontSize: 12, background: "#f0f5ff", color: "#6b7eb8", borderRadius: 20, padding: "4px 12px" }}>
            {cours.niveau}
          </span>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#1a2040", margin: 0, lineHeight: 1.2 }}>{cours.titre}</h1>
        {cours.chapitre && (
          <p style={{ color: "#6b7eb8", marginTop: 8, fontSize: 15 }}>Chapitre : {cours.chapitre}</p>
        )}
      </div>

      {blocks.map((block, idx) => {
        const s = BLOCK_STYLES[block.type] || BLOCK_STYLES.texte;
        return (
          <div key={idx} style={{
            background: s.bg,
            border: `1px solid ${s.border}`,
            borderLeft: `4px solid ${s.accent}`,
            borderRadius: 12, padding: "18px 22px", marginBottom: 14
          }}>
            {s.label && (
              <div style={{ fontSize: 11, fontWeight: 700, color: s.accent, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
                {s.label}
              </div>
            )}
            {block.titre && (
              <div style={{ fontSize: 16, fontWeight: 600, color: s.accent, marginBottom: 8 }}>{block.titre}</div>
            )}
            {block.type === "formule" ? (
              <div style={{ textAlign: "center", padding: "8px 0", fontSize: 20 }}>
                <MathBlock formula={block.content} />
              </div>
            ) : (
              <div style={{ fontSize: 15, color: "#1a2040", lineHeight: 1.8 }}>
                <MathRenderer formula={block.content} block={false} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function EleveHome({ user, eleveData, onLogout }) {
  const [cours, setCours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [matiere, setMatiere] = useState("Toutes");
  const [tab, setTab] = useState("guide");

  useEffect(() => {
    loadCours();
  }, []);

  const loadCours = async () => {
    const { data } = await supabase
      .from("cours")
      .select("*")
      .eq("publie", true)
      .eq("niveau", eleveData?.niveau || "6e")
      .order("created_at", { ascending: false });
    setCours(data || []);
    setLoading(false);
  };

  const matieres = ["Toutes", ...new Set(cours.map(c => c.matiere))];
  const filtered = cours.filter(c =>
    (matiere === "Toutes" || c.matiere === matiere) &&
    (tab === "guide" ? !c.est_exercice : c.est_exercice)
  );

  if (selected) return <CoursView cours={selected} onBack={() => setSelected(null)} />;

  return (
    <div style={{ minHeight: "100vh", background: "#f8faff", fontFamily: "'DM Sans', Arial, sans-serif" }}>
      {/* Header */}
      <div style={{
        background: "#fff", borderBottom: "1px solid #e0e8f7",
        padding: "0 32px", display: "flex", alignItems: "center",
        justifyContent: "space-between", height: 60
      }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#1a56db", letterSpacing: "0.04em" }}>COURS</div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 13, color: "#6b7eb8" }}>
            {eleveData?.nom} · <strong style={{ color: "#1a56db" }}>{eleveData?.niveau}</strong>
          </span>
          <button onClick={onLogout} style={{
            fontSize: 12, color: "#d93025", background: "none",
            border: "1px solid #fdd", borderRadius: 8, padding: "6px 14px", cursor: "pointer"
          }}>Déconnexion</button>
        </div>
      </div>

      {/* Tabs Guide / Exercices */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e0e8f7", padding: "0 32px", display: "flex", gap: 0 }}>
        {["guide", "exercices"].map(t => (
          <div key={t} onClick={() => setTab(t)} style={{
            padding: "14px 24px", cursor: "pointer", fontSize: 14, fontWeight: 600,
            borderBottom: `2.5px solid ${tab === t ? "#1a56db" : "transparent"}`,
            color: tab === t ? "#1a56db" : "#aab5cc", textTransform: "capitalize",
            transition: "all 0.15s", letterSpacing: "0.04em"
          }}>
            {t === "guide" ? "📖 Guide de cours" : "✏️ Exercices"}
          </div>
        ))}
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 24px" }}>
        {/* Filtres matières */}
        <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
          {matieres.map(m => (
            <button key={m} onClick={() => setMatiere(m)} style={{
              padding: "7px 16px", borderRadius: 20, border: `1.5px solid ${matiere === m ? "#1a56db" : "#dce8f7"}`,
              background: matiere === m ? "#eef3ff" : "#fff", color: matiere === m ? "#1a56db" : "#888",
              fontSize: 13, fontWeight: matiere === m ? 600 : 400, cursor: "pointer", transition: "all 0.15s"
            }}>{m}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", color: "#aaa", padding: 60 }}>Chargement...</div>
        ) : filtered.length === 0 ? (
          <div style={{
            textAlign: "center", padding: 80, color: "#aab5cc",
            background: "#fff", borderRadius: 16, border: "1px solid #e0e8f7"
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📚</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>Aucun cours disponible pour l'instant</div>
            <div style={{ fontSize: 13, marginTop: 6 }}>Revenez bientôt !</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {filtered.map(c => (
              <div key={c.id} onClick={() => setSelected(c)} style={{
                background: "#fff", border: "1px solid #e0e8f7", borderRadius: 14,
                padding: "20px", cursor: "pointer", transition: "all 0.2s",
                borderTop: "3px solid #1a56db"
              }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 20px rgba(26,86,219,0.12)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <div style={{ fontSize: 11, color: "#1a56db", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                  {c.matiere}
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#1a2040", marginBottom: 6, lineHeight: 1.3 }}>{c.titre}</div>
                {c.chapitre && (
                  <div style={{ fontSize: 13, color: "#6b7eb8" }}>{c.chapitre}</div>
                )}
                <div style={{ marginTop: 14, fontSize: 12, color: "#aab5cc" }}>
                  {new Date(c.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
