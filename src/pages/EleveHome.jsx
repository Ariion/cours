import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import MathRenderer, { MathBlock } from "../components/MathRenderer";

// ── Config visuelle des blocs ─────────────────────────────────────────────────
const BLOC_CONFIG = {
  texte: {
    icon: null,
    bg: "#ffffff",
    border: "#e8edf8",
    accent: "#3b6fd4",
    labelColor: null,
    label: null,
    shadow: "0 2px 12px rgba(59,111,212,0.06)",
  },
  formule: {
    icon: "∑",
    bg: "linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 100%)",
    border: "#c5d5f7",
    accent: "#1a56db",
    labelColor: "#1a56db",
    label: null,
    shadow: "0 4px 20px rgba(26,86,219,0.12)",
  },
  definition: {
    icon: "📘",
    bg: "#ffffff",
    border: "#93c5fd",
    accent: "#1d4ed8",
    labelColor: "#1d4ed8",
    label: "Définition",
    shadow: "0 4px 16px rgba(29,78,216,0.08)",
    stripe: "#1d4ed8",
  },
  theoreme: {
    icon: "⚡",
    bg: "#fffbeb",
    border: "#fbbf24",
    accent: "#d97706",
    labelColor: "#d97706",
    label: "Théorème",
    shadow: "0 4px 16px rgba(217,119,6,0.1)",
    stripe: "#f59e0b",
  },
  exemple: {
    icon: "✏️",
    bg: "#f0fdf4",
    border: "#86efac",
    accent: "#16a34a",
    labelColor: "#16a34a",
    label: "Exemple",
    shadow: "0 4px 16px rgba(22,163,74,0.08)",
    stripe: "#22c55e",
  },
  remarque: {
    icon: "💡",
    bg: "#fffdf0",
    border: "#fde68a",
    accent: "#ca8a04",
    labelColor: "#ca8a04",
    label: "À retenir",
    shadow: "0 4px 16px rgba(202,138,4,0.08)",
    stripe: "#eab308",
  },
  methode: {
    icon: "🔧",
    bg: "#fdf4ff",
    border: "#e879f9",
    accent: "#a21caf",
    labelColor: "#a21caf",
    label: "Méthode",
    shadow: "0 4px 16px rgba(162,28,175,0.08)",
    stripe: "#d946ef",
  },
};

// ── Composant d'un bloc de cours ──────────────────────────────────────────────
function BlocCours({ block, index }) {
  const cfg = BLOC_CONFIG[block.type] || BLOC_CONFIG.texte;
  const isFormule = block.type === "formule";
  const hasLabel = cfg.label;

  return (
    <div
      style={{
        background: cfg.bg,
        border: `1.5px solid ${cfg.border}`,
        borderRadius: 16,
        marginBottom: 20,
        overflow: "hidden",
        boxShadow: cfg.shadow,
        animation: `fadeUp 0.4s ease both`,
        animationDelay: `${index * 0.05}s`,
        position: "relative",
      }}
    >
      {/* Bande colorée gauche */}
      {cfg.stripe && (
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0,
          width: 4, background: cfg.stripe, borderRadius: "16px 0 0 16px"
        }} />
      )}

      {/* Header du bloc */}
      {hasLabel && (
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "14px 20px 10px", paddingLeft: cfg.stripe ? 24 : 20,
        }}>
          <span style={{ fontSize: 18 }}>{cfg.icon}</span>
          <span style={{
            fontSize: 11, fontWeight: 800, letterSpacing: "0.12em",
            textTransform: "uppercase", color: cfg.labelColor,
            fontFamily: "'DM Sans', sans-serif"
          }}>
            {cfg.label}
          </span>
        </div>
      )}

      {/* Contenu */}
      <div style={{
        padding: isFormule ? "24px 28px" : hasLabel ? "4px 20px 18px" : "20px 20px",
        paddingLeft: cfg.stripe ? (hasLabel ? 24 : 24) : 20,
      }}>
        {/* Titre du bloc */}
        {block.titre && (
          <div style={{
            fontSize: 17, fontWeight: 700, color: cfg.accent,
            marginBottom: 10, fontFamily: "'Instrument Serif', Georgia, serif",
            fontStyle: "italic"
          }}>
            {block.titre}
          </div>
        )}

        {/* Formule centrée */}
        {isFormule ? (
          <div style={{
            textAlign: "center",
            padding: "16px 0",
            fontSize: 22,
            background: "rgba(255,255,255,0.7)",
            borderRadius: 12,
            border: "1px solid rgba(26,86,219,0.15)"
          }}>
            <MathBlock formula={block.content} />
          </div>
        ) : (
          <div style={{
            fontSize: 15.5,
            color: "#1e293b",
            lineHeight: 1.85,
            fontFamily: "'DM Sans', sans-serif",
            whiteSpace: "pre-line",
          }}>
            <MathRenderer formula={block.content} block={false} />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Vue d'un cours complet ────────────────────────────────────────────────────
function CoursView({ cours, onBack }) {
  const blocks = (() => {
    try { return JSON.parse(cours.contenu || "[]"); }
    catch { return []; }
  })();

  const cfg = BLOC_CONFIG;
  const nbBlocs = blocks.length;

  // Compter les types
  const stats = blocks.reduce((acc, b) => {
    acc[b.type] = (acc[b.type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, #f8faff 0%, #ffffff 400px)",
      fontFamily: "'DM Sans', Arial, sans-serif",
    }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>

      {/* Header sticky */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #e8edf8",
        padding: "12px 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <button onClick={onBack} style={{
          display: "flex", alignItems: "center", gap: 6,
          fontSize: 13, color: "#64748b", background: "none",
          border: "1px solid #e2e8f0", borderRadius: 8,
          padding: "6px 14px", cursor: "pointer", fontFamily: "inherit",
          fontWeight: 500, transition: "all 0.15s"
        }}
          onMouseEnter={e => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.color = "#1e293b"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#64748b"; }}
        >
          ← Retour
        </button>
        <div style={{ display: "flex", gap: 8 }}>
          <span style={{
            fontSize: 12, background: "#dbeafe", color: "#1d4ed8",
            borderRadius: 20, padding: "4px 12px", fontWeight: 600
          }}>{cours.matiere}</span>
          <span style={{
            fontSize: 12, background: "#f1f5f9", color: "#64748b",
            borderRadius: 20, padding: "4px 12px", fontWeight: 500
          }}>{cours.niveau}</span>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* Hero du cours */}
        <div style={{
          marginBottom: 40,
          animation: "fadeUp 0.5s ease both"
        }}>
          <h1 style={{
            fontSize: 34, fontWeight: 800, color: "#0f172a",
            margin: "0 0 10px",
            fontFamily: "'Instrument Serif', Georgia, serif",
            lineHeight: 1.2
          }}>{cours.titre}</h1>
          {cours.chapitre && cours.chapitre !== cours.titre && (
            <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>
              Chapitre · {cours.chapitre}
            </p>
          )}

          {/* Statistiques du cours */}
          <div style={{
            display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap"
          }}>
            {[
              { key: "definition", label: "Définitions", icon: "📘", color: "#dbeafe" },
              { key: "theoreme",   label: "Théorèmes",  icon: "⚡", color: "#fef3c7" },
              { key: "exemple",    label: "Exemples",   icon: "✏️", color: "#dcfce7" },
              { key: "methode",    label: "Méthodes",   icon: "🔧", color: "#fae8ff" },
            ].filter(s => stats[s.key] > 0).map(s => (
              <div key={s.key} style={{
                display: "flex", alignItems: "center", gap: 6,
                background: s.color, borderRadius: 20,
                padding: "5px 14px", fontSize: 12, fontWeight: 600,
                color: "#374151"
              }}>
                <span>{s.icon}</span>
                <span>{stats[s.key]} {s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Séparateur */}
        <div style={{
          height: 1, background: "linear-gradient(90deg, #3b6fd4 0%, transparent 100%)",
          marginBottom: 36, opacity: 0.3
        }} />

        {/* Blocs du cours */}
        {blocks.map((block, idx) => (
          <BlocCours key={block.id || idx} block={block} index={idx} />
        ))}

        {/* Footer du cours */}
        <div style={{
          marginTop: 48, padding: "24px",
          background: "linear-gradient(135deg, #f0f4ff, #e8f0fe)",
          borderRadius: 16, textAlign: "center",
          border: "1px solid #c5d5f7"
        }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>🎉</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#1d4ed8", marginBottom: 4 }}>
            Cours terminé !
          </div>
          <div style={{ fontSize: 13, color: "#64748b" }}>
            Tu as parcouru {nbBlocs} sections · N'hésite pas à relire les points importants
          </div>
          <button onClick={onBack} style={{
            marginTop: 16, padding: "10px 24px",
            background: "#1a56db", color: "#fff", border: "none",
            borderRadius: 10, fontSize: 13, fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit"
          }}>
            ← Retour aux cours
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Carte cours dans la liste ─────────────────────────────────────────────────
function CarteCoursItem({ cours, onClick, index }) {
  const [hovered, setHovered] = useState(false);

  const matiereColors = {
    "Mathématiques": { bg: "#eff6ff", accent: "#1d4ed8", dot: "#3b82f6" },
    "Physique-Chimie": { bg: "#fff7ed", accent: "#c2410c", dot: "#f97316" },
    "Français": { bg: "#f0fdf4", accent: "#15803d", dot: "#22c55e" },
    "Histoire-Géo": { bg: "#fdf4ff", accent: "#7e22ce", dot: "#a855f7" },
    "Anglais": { bg: "#fff1f2", accent: "#be123c", dot: "#f43f5e" },
  };
  const colors = matiereColors[cours.matiere] || matiereColors["Mathématiques"];

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? colors.bg : "#ffffff",
        border: `1.5px solid ${hovered ? colors.dot : "#e8edf8"}`,
        borderRadius: 16,
        padding: "22px 24px",
        cursor: "pointer",
        transition: "all 0.2s ease",
        transform: hovered ? "translateY(-3px)" : "none",
        boxShadow: hovered
          ? `0 8px 32px rgba(59,111,212,0.15)`
          : "0 2px 8px rgba(0,0,0,0.04)",
        animation: `fadeUp 0.4s ease both`,
        animationDelay: `${index * 0.07}s`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Accent top */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: hovered
          ? `linear-gradient(90deg, ${colors.dot}, transparent)`
          : "transparent",
        transition: "all 0.2s",
        borderRadius: "16px 16px 0 0"
      }} />

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div style={{ flex: 1 }}>
          <span style={{
            fontSize: 11, fontWeight: 700, textTransform: "uppercase",
            letterSpacing: "0.1em", color: colors.accent,
            display: "flex", alignItems: "center", gap: 5, marginBottom: 8
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: colors.dot, display: "inline-block"
            }} />
            {cours.matiere}
          </span>
          <div style={{
            fontSize: 17, fontWeight: 700, color: "#0f172a",
            lineHeight: 1.3, marginBottom: 6
          }}>
            {cours.titre}
          </div>
          {cours.chapitre && cours.chapitre !== cours.titre && (
            <div style={{ fontSize: 13, color: "#94a3b8" }}>
              {cours.chapitre}
            </div>
          )}
        </div>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: hovered ? colors.dot : "#f1f5f9",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, transition: "all 0.2s", flexShrink: 0, marginLeft: 12
        }}>
          {hovered ? "→" : "📖"}
        </div>
      </div>

      <div style={{
        marginTop: 14, paddingTop: 12,
        borderTop: "1px solid #f1f5f9",
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <div style={{ fontSize: 12, color: "#94a3b8" }}>
          {new Date(cours.created_at).toLocaleDateString("fr-FR", {
            day: "numeric", month: "long"
          })}
        </div>
        <span style={{
          fontSize: 11, fontWeight: 600,
          background: hovered ? colors.dot : "#f1f5f9",
          color: hovered ? "#fff" : "#94a3b8",
          borderRadius: 20, padding: "3px 10px",
          transition: "all 0.2s"
        }}>
          {hovered ? "Ouvrir →" : cours.niveau}
        </span>
      </div>
    </div>
  );
}

// ── Page principale élève ─────────────────────────────────────────────────────
export default function EleveHome({ user, eleveData, onLogout }) {
  const [cours, setCours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [matiere, setMatiere] = useState("Toutes");
  const [tab, setTab] = useState("guide");
  const [search, setSearch] = useState("");

  useEffect(() => { loadCours(); }, []);

  const loadCours = async () => {
    const { data } = await supabase
      .from("cours")
      .select("*")
      .eq("publie", true)
      .eq("niveau", eleveData?.niveau || "3e")
      .order("created_at", { ascending: false });
    setCours(data || []);
    setLoading(false);
  };

  const matieres = ["Toutes", ...new Set(cours.map(c => c.matiere))];
  const filtered = cours.filter(c => {
    const matchTab = tab === "guide" ? !c.est_exercice : c.est_exercice;
    const matchMat = matiere === "Toutes" || c.matiere === matiere;
    const matchSearch = !search || c.titre.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchMat && matchSearch;
  });

  if (selected) return <CoursView cours={selected} onBack={() => setSelected(null)} />;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f8faff",
      fontFamily: "'DM Sans', Arial, sans-serif"
    }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        * { box-sizing: border-box; }
      `}</style>

      {/* Header */}
      <div style={{
        background: "#ffffff",
        borderBottom: "1px solid #e8edf8",
        position: "sticky", top: 0, zIndex: 50,
        backdropFilter: "blur(12px)",
      }}>
        <div style={{
          maxWidth: 1000, margin: "0 auto",
          padding: "0 32px", height: 64,
          display: "flex", alignItems: "center", justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 32, height: 32, background: "#1a56db",
              borderRadius: 8, display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#fff"
            }}>C</div>
            <span style={{ fontSize: 17, fontWeight: 700, color: "#0f172a", letterSpacing: "0.02em" }}>
              Cours
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "#f1f5f9", borderRadius: 20, padding: "6px 16px"
            }}>
              <span style={{ fontSize: 13, color: "#64748b" }}>{eleveData?.nom}</span>
              <span style={{
                background: "#1a56db", color: "#fff",
                borderRadius: 12, padding: "2px 8px", fontSize: 12, fontWeight: 700
              }}>{eleveData?.niveau}</span>
            </div>
            <button onClick={onLogout} style={{
              fontSize: 12, color: "#ef4444", background: "#fff5f5",
              border: "1px solid #fecaca", borderRadius: 8,
              padding: "6px 14px", cursor: "pointer", fontFamily: "inherit", fontWeight: 500
            }}>Déconnexion</button>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, #1a56db 0%, #3b82f6 100%)",
        padding: "48px 32px 56px",
      }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{
            fontSize: 13, color: "rgba(255,255,255,0.7)",
            fontWeight: 500, marginBottom: 8, letterSpacing: "0.06em",
            textTransform: "uppercase"
          }}>
            Bonjour {eleveData?.nom?.split(" ")[0]} 👋
          </div>
          <h1 style={{
            fontSize: 32, fontWeight: 800, color: "#ffffff",
            margin: "0 0 16px",
            fontFamily: "'Instrument Serif', Georgia, serif"
          }}>
            Tes cours de {eleveData?.niveau}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 15, margin: "0 0 24px" }}>
            {cours.length} cours disponibles · Clique pour commencer à apprendre
          </p>

          {/* Barre de recherche */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            background: "rgba(255,255,255,0.15)",
            border: "1.5px solid rgba(255,255,255,0.3)",
            borderRadius: 12, padding: "10px 16px", maxWidth: 420
          }}>
            <span style={{ fontSize: 16, opacity: 0.7 }}>🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un cours..."
              style={{
                background: "none", border: "none", outline: "none",
                color: "#fff", fontSize: 14, flex: 1,
                fontFamily: "inherit",
                "::placeholder": { color: "rgba(255,255,255,0.5)" }
              }}
            />
          </div>
        </div>
      </div>

      {/* Tabs Guide / Exercices */}
      <div style={{
        background: "#ffffff",
        borderBottom: "1px solid #e8edf8",
        padding: "0 32px",
      }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex" }}>
          {[
            { key: "guide", label: "📖 Cours", desc: "Fiches de révision" },
            { key: "exercices", label: "✏️ Exercices", desc: "S'entraîner" },
          ].map(t => (
            <div key={t.key} onClick={() => setTab(t.key)} style={{
              padding: "16px 24px 14px", cursor: "pointer",
              borderBottom: `3px solid ${tab === t.key ? "#1a56db" : "transparent"}`,
              color: tab === t.key ? "#1a56db" : "#94a3b8",
              fontWeight: tab === t.key ? 700 : 500,
              fontSize: 14, transition: "all 0.15s",
              display: "flex", alignItems: "center", gap: 6
            }}>
              {t.label}
            </div>
          ))}
        </div>
      </div>

      {/* Contenu */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 32px 80px" }}>

        {/* Filtres matières */}
        {matieres.length > 1 && (
          <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
            {matieres.map(m => (
              <button key={m} onClick={() => setMatiere(m)} style={{
                padding: "8px 18px", borderRadius: 20, fontSize: 13,
                fontWeight: matiere === m ? 700 : 500,
                border: `1.5px solid ${matiere === m ? "#1a56db" : "#e2e8f0"}`,
                background: matiere === m ? "#1a56db" : "#ffffff",
                color: matiere === m ? "#ffffff" : "#64748b",
                cursor: "pointer", transition: "all 0.15s",
                fontFamily: "inherit"
              }}>{m}</button>
            ))}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: 80 }}>
            <div style={{ fontSize: 32, marginBottom: 12, animation: "fadeUp 0.5s ease" }}>⏳</div>
            <div style={{ color: "#94a3b8", fontSize: 15 }}>Chargement des cours...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "80px 40px",
            background: "#ffffff", borderRadius: 20,
            border: "1.5px dashed #e2e8f0"
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>
              {search ? `Aucun résultat pour "${search}"` : "Aucun cours disponible"}
            </div>
            <div style={{ fontSize: 14, color: "#94a3b8" }}>
              {search ? "Essaie un autre mot-clé" : "Reviens bientôt, de nouveaux cours arrivent !"}
            </div>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 16
          }}>
            {filtered.map((c, i) => (
              <CarteCoursItem
                key={c.id}
                cours={c}
                index={i}
                onClick={() => setSelected(c)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}