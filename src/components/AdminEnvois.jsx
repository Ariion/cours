// src/components/AdminEnvois.jsx
// Côté admin : toutes les photos envoyées par les élèves, groupées par élève.
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const TYPES = {
  repondu: { label: "J'ai répondu", color: "#16a34a", bg: "#f0fdf4", border: "#86efac" },
  bloque:  { label: "Pas compris",  color: "#b91c1c", bg: "#fff5f5", border: "#fca5a5" },
  demande: { label: "Demandé",      color: "#1d4ed8", bg: "#eff6ff", border: "#93c5fd" },
  autre:   { label: "Autre",        color: "#64748b", bg: "#f8fafc", border: "#e2e8f0" },
};
const STATUTS = ["nouveau", "vu", "traite"];
const STATUT_LABEL = { nouveau: "🆕 Nouveau", vu: "👀 Vu", traite: "✓ Traité" };

export default function AdminEnvois({ onReply }) {
  const [envois, setEnvois] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("envois").select("*").order("created_at", { ascending: false });
    setEnvois(data || []);
    setLoading(false);
  };

  const cyclerStatut = async (e) => {
    const next = STATUTS[(STATUTS.indexOf(e.statut) + 1) % STATUTS.length];
    setEnvois(prev => prev.map(x => x.id === e.id ? { ...x, statut: next } : x));
    await supabase.from("envois").update({ statut: next }).eq("id", e.id);
  };

  const groupes = {};
  envois.forEach(e => { (groupes[e.eleve_id] = groupes[e.eleve_id] || []).push(e); });

  if (loading) return <div style={{ color: "#aaa" }}>Chargement…</div>;
  if (envois.length === 0) return <div style={{ textAlign: "center", color: "#aab5cc", padding: 48 }}>Aucune photo envoyée pour l'instant.</div>;

  return (
    <div>
      {Object.entries(groupes).map(([eleveId, items]) => (
        <div key={eleveId} style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1a56db", margin: 0 }}>{items[0]?.eleve_nom || "Élève"}</h2>
              <span style={{ fontSize: 12, color: "#94a3b8" }}>{items.length} photo{items.length > 1 ? "s" : ""}</span>
              {items.some(i => i.statut === "nouveau") && (
                <span style={{ fontSize: 11, fontWeight: 700, color: "#b91c1c", background: "#fff5f5", border: "1px solid #fca5a5", borderRadius: 20, padding: "2px 9px" }}>
                  {items.filter(i => i.statut === "nouveau").length} à voir
                </span>
              )}
            </div>
            <button onClick={() => onReply?.(eleveId, items[0]?.eleve_nom)} style={{ padding: "5px 12px", borderRadius: 8, border: "1px solid #c5d8f7", background: "#eef3ff", color: "#1a56db", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              💬 Répondre
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 12 }}>
            {items.map(it => {
              const t = TYPES[it.type] || TYPES.autre;
              return (
                <div key={it.id} style={{ background: "#fff", border: "1px solid #e0e8f7", borderRadius: 12, overflow: "hidden" }}>
                  <a href={it.image_url} target="_blank" rel="noopener noreferrer">
                    <img src={it.image_url} alt="" style={{ width: "100%", height: 130, objectFit: "cover", display: "block" }} />
                  </a>
                  <div style={{ padding: "9px 10px" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: t.color, background: t.bg, border: `1px solid ${t.border}`, borderRadius: 20, padding: "2px 8px" }}>{t.label}</span>
                    {it.note && <div style={{ fontSize: 12, color: "#374151", marginTop: 6, lineHeight: 1.4 }}>{it.note}</div>}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
                      <span style={{ fontSize: 10, color: "#94a3b8" }}>{new Date(it.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</span>
                      <button onClick={() => cyclerStatut(it)} style={{ fontSize: 10, fontWeight: 600, border: "1px solid #e2e8f0", background: "#f8fafc", borderRadius: 20, padding: "3px 8px", cursor: "pointer", color: "#374151" }}>
                        {STATUT_LABEL[it.statut]}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
