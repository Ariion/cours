// Ajout à Admin.jsx — onglet "Corrections"
// Copier cette fonction et l'ajouter dans le composant Admin existant

// Dans sideNav, ajouter :
// { key: "corrections", label: "Corrections", icon: "✅" },

// Ajouter cet onglet dans le contenu :

/*
{tab === "corrections" && (
  <CorrectionPanel />
)}
*/

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import MathRenderer from "../components/MathRenderer";

export function CorrectionPanel() {
  const [soumissions, setSoumissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [notes, setNotes] = useState({});
  const [commentaires, setCommentaires] = useState({});
  const [noteGlobale, setNoteGlobale] = useState("");
  const [commentaireGlobal, setCommentaireGlobal] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadSoumissions(); }, []);

  const loadSoumissions = async () => {
    const { data } = await supabase
      .from("soumissions")
      .select("*, exercices(titre, chapitre, niveau)")
      .order("created_at", { ascending: false });
    setSoumissions(data || []);
    setLoading(false);
  };

  const openCorrection = (s) => {
    setSelected(s);
    const n = {};
    const c = {};
    (s.reponses || []).forEach(r => {
      n[r.question_id] = r.note_prof || "";
      c[r.question_id] = r.commentaire_prof || "";
    });
    setNotes(n);
    setCommentaires(c);
    setNoteGlobale(s.note_globale || "");
    setCommentaireGlobal(s.commentaire_global || "");
  };

  const saveCorrection = async () => {
    if (!selected) return;
    setSaving(true);
    const reponsesUpdated = (selected.reponses || []).map(r => ({
      ...r,
      note_prof: notes[r.question_id] || null,
      commentaire_prof: commentaires[r.question_id] || null
    }));
    await supabase.from("soumissions").update({
      reponses: reponsesUpdated,
      note_globale: noteGlobale || null,
      commentaire_global: commentaireGlobal || null,
      statut: "corrige",
      corrige_at: new Date().toISOString()
    }).eq("id", selected.id);
    setSaving(false);
    setSelected(null);
    loadSoumissions();
    alert("✓ Correction sauvegardée !");
  };

  if (selected) return (
    <div>
      <button onClick={() => setSelected(null)} style={{ fontSize: 13, color: "#64748b", background: "#f1f5f9", border: "none", borderRadius: 8, padding: "7px 14px", cursor: "pointer", marginBottom: 24, fontFamily: "inherit" }}>
        ← Retour à la liste
      </button>

      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>
          Correction — {selected.eleve_nom}
        </h2>
        <div style={{ fontSize: 13, color: "#64748b" }}>
          {selected.exercices?.titre} · {selected.exercices?.niveau} · Soumis le {new Date(selected.created_at).toLocaleDateString("fr-FR")}
        </div>
      </div>

      {/* Note globale */}
      <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 16, padding: "20px 24px", marginBottom: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>Note & commentaire global</div>
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
          <input type="number" min="0" max="20" value={noteGlobale} onChange={e => setNoteGlobale(e.target.value)}
            placeholder="Note /20"
            style={{ width: 100, padding: "8px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 14, fontFamily: "inherit", outline: "none" }}
          />
          <span style={{ fontSize: 14, color: "#94a3b8" }}>/20</span>
        </div>
        <textarea value={commentaireGlobal} onChange={e => setCommentaireGlobal(e.target.value)}
          placeholder="Commentaire général pour l'élève..."
          rows={3}
          style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 14, fontFamily: "inherit", outline: "none", resize: "vertical", boxSizing: "border-box" }}
        />
      </div>

      {/* Questions */}
      {(selected.reponses || []).map((r, idx) => (
        <div key={r.question_id} style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 16, marginBottom: 16, overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid #f1f5f9", background: "#f8faff" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#7c3aed", background: "#faf5ff", borderRadius: 20, padding: "3px 10px" }}>
              Question {idx + 1}
            </span>
          </div>
          <div style={{ padding: "16px 20px" }}>
            {/* Énoncé */}
            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8, fontWeight: 500 }}>Énoncé</div>
            <div style={{ fontSize: 14, color: "#334155", marginBottom: 16, padding: "10px 14px", background: "#f8faff", borderRadius: 10, lineHeight: 1.7 }}>
              <MathRenderer formula={r.enonce || ""} block={false} />
            </div>

            {/* Réponse élève */}
            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8, fontWeight: 500 }}>Réponse de l'élève</div>
            <div style={{ fontSize: 14, color: "#1e293b", marginBottom: 16, padding: "12px 14px", background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 10, lineHeight: 1.7, minHeight: 50, whiteSpace: "pre-wrap" }}>
              {r.reponse_eleve || <span style={{ color: "#94a3b8", fontStyle: "italic" }}>Pas de réponse</span>}
            </div>

            {/* Note + commentaire prof */}
            <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 12 }}>
              <div>
                <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600, marginBottom: 6 }}>Note</div>
                <input type="number" min="0" max="4" value={notes[r.question_id] || ""}
                  onChange={e => setNotes(prev => ({ ...prev, [r.question_id]: e.target.value }))}
                  placeholder="pts"
                  style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
                />
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600, marginBottom: 6 }}>Commentaire</div>
                <input value={commentaires[r.question_id] || ""}
                  onChange={e => setCommentaires(prev => ({ ...prev, [r.question_id]: e.target.value }))}
                  placeholder="Bravo / Attention à... / Revoir..."
                  style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
                />
              </div>
            </div>
          </div>
        </div>
      ))}

      <button onClick={saveCorrection} disabled={saving}
        style={{ marginTop: 8, background: saving ? "#94a3b8" : "#2563eb", color: "#fff", border: "none", borderRadius: 12, padding: "14px 32px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
        {saving ? "Sauvegarde..." : "✓ Sauvegarder la correction"}
      </button>
    </div>
  );

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>Corrections à faire</h1>
      <p style={{ color: "#64748b", fontSize: 14, marginBottom: 28 }}>
        {soumissions.filter(s => s.statut === "soumis").length} devoir(s) en attente · {soumissions.filter(s => s.statut === "corrige").length} corrigé(s)
      </p>

      {loading ? <div style={{ color: "#94a3b8" }}>Chargement...</div> : (
        <div style={{ display: "grid", gap: 12 }}>
          {soumissions.map(s => (
            <div key={s.id} style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontWeight: 600, color: "#0f172a", fontSize: 15 }}>{s.eleve_nom}</div>
                <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
                  {s.exercices?.titre} · {new Date(s.created_at).toLocaleDateString("fr-FR")}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {s.statut === "corrige" ? (
                  <span style={{ fontSize: 12, background: "#dcfce7", color: "#16a34a", borderRadius: 20, padding: "4px 12px", fontWeight: 700 }}>
                    ✓ Corrigé {s.note_globale ? `— ${s.note_globale}/20` : ""}
                  </span>
                ) : (
                  <span style={{ fontSize: 12, background: "#fef3c7", color: "#d97706", borderRadius: 20, padding: "4px 12px", fontWeight: 700 }}>
                    ⏳ À corriger
                  </span>
                )}
                <button onClick={() => openCorrection(s)} style={{
                  padding: "7px 16px", borderRadius: 8,
                  border: "1.5px solid #e2e8f0", background: "#fff",
                  color: "#2563eb", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit"
                }}>
                  {s.statut === "corrige" ? "Réviser" : "Corriger →"}
                </button>
              </div>
            </div>
          ))}
          {soumissions.length === 0 && (
            <div style={{ textAlign: "center", padding: 60, color: "#94a3b8", fontSize: 15 }}>
              Aucun devoir soumis pour l'instant.
            </div>
          )}
        </div>
      )}
    </div>
  );
}