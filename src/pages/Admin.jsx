// src/pages/Admin.jsx — avec gestion déblocage chapitres
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { CorrectionPanel } from "../components/CorrectionPanel";
import AdminEnvois from "../components/AdminEnvois";
import Messagerie from "../components/Messagerie";

const MATIERES = ["Mathématiques", "Physique-Chimie", "Français", "Histoire-Géo", "Anglais"];
const NIVEAUX = ["6e", "5e", "4e", "3e", "2nde", "1re", "Terminale"];

const CHAPITRES_PAR_NIVEAU = {
  "3e": [
    "Calcul numérique — puissances et racines",
    "Notation scientifique",
    "Développement et factorisation avancés",
    "Équations et inéquations",
    "Fonctions linéaires et affines",
    "Théorème de Pythagore — réciproque",
    "Trigonométrie avancée",
    "Géométrie dans l'espace",
    "Statistiques — boîte à moustaches",
    "Probabilités — loi des grands nombres",
  ],
  "2nde": [
    "Ensembles de nombres", "Intervalles et inégalités",
    "Fonctions — généralités", "Fonctions de référence",
    "Équations du 2nd degré", "Vecteurs dans le plan",
    "Droites", "Statistiques descriptives", "Probabilités",
  ],
};

// ── Panel déblocage chapitres ──────────────────────────────────────────────────
function DeblocagePanel({ eleve, onClose, onSaved }) {
  const chapitres = CHAPITRES_PAR_NIVEAU[eleve.niveau] || [];
  const [debloques, setDebloques] = useState(
    eleve.chapitres_debloques === null
      ? null // null = tout débloqué
      : (eleve.chapitres_debloques || [])
  );
  const [saving, setSaving] = useState(false);
  const toutDebloquer = debloques === null;

  const toggle = (ch) => {
    if (debloques === null) return; // en mode "tout"
    setDebloques(prev =>
      prev.includes(ch) ? prev.filter(c => c !== ch) : [...prev, ch]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    await supabase.from("eleves").update({
      chapitres_debloques: toutDebloquer ? null : debloques
    }).eq("id", eleve.id);
    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
      zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center"
    }} onClick={onClose}>
      <div style={{
        background: "#fff", borderRadius: 20, padding: "32px 36px",
        width: 520, maxWidth: "95vw", maxHeight: "85vh", overflowY: "auto",
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)"
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", margin: 0, fontFamily: "Georgia,serif" }}>
              Chapitres de {eleve.nom}
            </h2>
            <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>Classe de {eleve.niveau}</div>
          </div>
          <button onClick={onClose} style={{ background: "#f1f5f9", border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 18, color: "#64748b" }}>✕</button>
        </div>

        {/* Toggle tout débloqué */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 16px", background: toutDebloquer ? "#f0faf4" : "#f8faff",
          borderRadius: 12, marginBottom: 20, border: `1.5px solid ${toutDebloquer ? "#a7f3d0" : "#e2e8f0"}`
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
              {toutDebloquer ? "✅ Tout le programme débloqué" : "🔒 Accès contrôlé par chapitre"}
            </div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
              {toutDebloquer ? "L'élève voit tous les cours et exercices" : `${debloques?.length || 0} chapitres accessibles`}
            </div>
          </div>
          <button
            onClick={() => setDebloques(toutDebloquer ? [] : null)}
            style={{
              padding: "8px 16px", borderRadius: 10, fontWeight: 700, fontSize: 13,
              border: "none", cursor: "pointer", fontFamily: "inherit",
              background: toutDebloquer ? "#dcfce7" : "#e0e7ff",
              color: toutDebloquer ? "#16a34a" : "#4338ca"
            }}>
            {toutDebloquer ? "Contrôler l'accès" : "Tout débloquer"}
          </button>
        </div>

        {/* Liste chapitres (si mode contrôlé) */}
        {!toutDebloquer && (
          <div>
            <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
              Chapitres disponibles — {eleve.niveau}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {chapitres.map((ch) => {
                const on = debloques?.includes(ch);
                return (
                  <div key={ch} onClick={() => toggle(ch)}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "12px 16px", borderRadius: 10, cursor: "pointer",
                      border: `1.5px solid ${on ? "#1a56db" : "#e2e8f0"}`,
                      background: on ? "#eff6ff" : "#fff",
                      transition: "all 0.15s"
                    }}>
                    <span style={{ fontSize: 14, color: on ? "#1e40af" : "#374151", fontWeight: on ? 600 : 400 }}>{ch}</span>
                    <div style={{
                      width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                      background: on ? "#1a56db" : "#f1f5f9",
                      border: `2px solid ${on ? "#1a56db" : "#e2e8f0"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.15s"
                    }}>
                      {on && <span style={{ color: "#fff", fontSize: 13, fontWeight: 900 }}>✓</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "12px", borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#fff", fontSize: 14, cursor: "pointer", fontFamily: "inherit", fontWeight: 600, color: "#64748b" }}>Annuler</button>
          <button onClick={handleSave} disabled={saving}
            style={{ flex: 2, padding: "12px", borderRadius: 10, border: "none", background: saving ? "#94a3b8" : "#1a56db", color: "#fff", fontSize: 14, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
            {saving ? "Sauvegarde…" : "✓ Enregistrer l'accès"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Admin principal ────────────────────────────────────────────────────────────
export default function Admin({ user, onLogout, onOpenEditor, onOpenPreview }) {
  const [tab, setTab] = useState("eleves");
  const [eleves, setEleves] = useState([]);
  const [cours, setCours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deblocageEleve, setDeblocageEleve] = useState(null);

  const [newEmail, setNewEmail] = useState("");
  const [newNom, setNewNom] = useState("");
  const [newNiveau, setNewNiveau] = useState("3e");
  const [newMatieres, setNewMatieres] = useState([]);
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState("");

  const [messageThreads, setMessageThreads] = useState([]); // [{eleve_id, eleve_nom, unread}]
  const [openThread, setOpenThread] = useState(null); // {eleve_id, eleve_nom}

  useEffect(() => { loadData(); }, []);
  useEffect(() => { if (tab === "messages") loadThreads(); }, [tab]);

  const loadData = async () => {
    setLoading(true);
    const { data: e } = await supabase.from("eleves").select("*").order("created_at", { ascending: false });
    const { data: c } = await supabase.from("cours").select("*").order("created_at", { ascending: false });
    setEleves(e || []);
    setCours(c || []);
    setLoading(false);
  };

  const loadThreads = async () => {
    const { data: msgs } = await supabase.from("messages").select("eleve_id, eleve_nom, expediteur, lu").order("created_at", { ascending: true });
    const byEleve = {};
    (msgs || []).forEach(m => {
      const t = byEleve[m.eleve_id] || { eleve_id: m.eleve_id, eleve_nom: m.eleve_nom || "Élève", unread: 0 };
      t.eleve_nom = m.eleve_nom || t.eleve_nom;
      if (m.expediteur === "eleve" && !m.lu) t.unread += 1;
      byEleve[m.eleve_id] = t;
    });
    // Ajoute les élèves inscrits qui n'ont encore aucun message, pour pouvoir leur écrire en premier.
    eleves.forEach(e => {
      if (e.auth_id && !byEleve[e.auth_id]) {
        byEleve[e.auth_id] = { eleve_id: e.auth_id, eleve_nom: e.nom, unread: 0 };
      }
    });
    setMessageThreads(Object.values(byEleve).sort((a, b) => b.unread - a.unread));
  };

  const creerEleve = async () => {
    if (!newEmail || !newNom) return;
    setCreating(true);
    setMsg("");
    const tempPassword = Math.random().toString(36).slice(-6).toUpperCase() + "m1!";
    const { data: signUpData } = await supabase.auth.signUp({ email: newEmail, password: tempPassword });
    const { error } = await supabase.from("eleves").insert({
      email: newEmail, nom: newNom, niveau: newNiveau,
      matieres: newMatieres, actif: true, mot_de_passe_temp: tempPassword,
      chapitres_debloques: null, // tout débloqué par défaut
      auth_id: signUpData?.user?.id || null
    });
    if (!error) {
      setMsg(`✓ Élève créé !\nEmail : ${newEmail}\nMot de passe : ${tempPassword}`);
      setNewEmail(""); setNewNom(""); setNewMatieres([]);
      loadData();
    } else {
      setMsg("Erreur lors de la création.");
    }
    setCreating(false);
  };

  const toggleMatiere = (m) => setNewMatieres(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
  const toggleEleveActif = async (id, actif) => { await supabase.from("eleves").update({ actif: !actif }).eq("id", id); loadData(); };
  const supprimerCours = async (id) => { if (!confirm("Supprimer ce cours ?")) return; await supabase.from("cours").delete().eq("id", id); loadData(); };

  const totalUnread = messageThreads.reduce((n, t) => n + t.unread, 0);
  const sideNav = [
    { key: "eleves",      label: "Élèves",         icon: "👤" },
    { key: "cours",       label: "Cours",           icon: "📖" },
    { key: "ajouter",     label: "+ Nouvel élève",  icon: "➕" },
    { key: "corrections", label: "Corrections",     icon: "✅" },
    { key: "envois",      label: "Envois",          icon: "📸" },
    { key: "messages",    label: "Messages",        icon: "💬", badge: totalUnread || null },
  ];

  // Groupe les cours par niveau, dans l'ordre scolaire, pour un rangement propre.
  const coursParNiveau = NIVEAUX
    .map(n => ({ niveau: n, items: cours.filter(c => c.niveau === n) }))
    .filter(g => g.items.length > 0);
  const autresNiveaux = cours.filter(c => !NIVEAUX.includes(c.niveau));
  if (autresNiveaux.length) coursParNiveau.push({ niveau: "Autre", items: autresNiveaux });

  return (
    <div className="adm-shell" style={{ display: "flex", minHeight: "100vh", fontFamily: "'DM Sans', Arial, sans-serif", background: "#f0f5ff" }}>
      <style>{`
        @media (max-width: 820px) {
          .adm-shell { flex-direction: column !important; }
          .adm-sidebar { width: 100% !important; flex-direction: row !important; flex-wrap: wrap; align-items: center; padding: 10px 12px !important; gap: 8px; }
          .adm-sidebar .adm-brand { display: none !important; }
          .adm-nav { display: flex !important; flex: 1 1 auto; padding: 0 !important; overflow-x: auto; gap: 4px; }
          .adm-nav > div { margin-bottom: 0 !important; white-space: nowrap; flex-shrink: 0; }
          .adm-sidebar-actions { padding: 0 !important; display: flex !important; gap: 6px; flex-shrink: 0; }
          .adm-sidebar-actions > div { margin-bottom: 0 !important; width: auto !important; padding: 8px 12px !important; font-size: 12px !important; }
          .adm-content { padding: 20px 16px !important; }
        }
      `}</style>
      {/* Modal déblocage */}
      {deblocageEleve && (
        <DeblocagePanel
          eleve={deblocageEleve}
          onClose={() => setDeblocageEleve(null)}
          onSaved={loadData}
        />
      )}

      {/* Sidebar */}
      <div className="adm-sidebar" style={{ width: 220, background: "#fff", borderRight: "1px solid #e0e8f7", display: "flex", flexDirection: "column", padding: "24px 0", flexShrink: 0 }}>
        <div className="adm-brand" style={{ padding: "0 20px 28px", borderBottom: "1px solid #e0e8f7" }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#1a56db" }}>COURS</div>
          <div style={{ fontSize: 11, color: "#aab5cc", marginTop: 2 }}>Administration</div>
        </div>
        <nav className="adm-nav" style={{ flex: 1, padding: "16px 12px" }}>
          {sideNav.map(s => (
            <div key={s.key} onClick={() => setTab(s.key)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 10, cursor: "pointer", marginBottom: 4, background: tab === s.key ? "#eef3ff" : "transparent", color: tab === s.key ? "#1a56db" : "#555", fontWeight: tab === s.key ? 600 : 400, fontSize: 14, transition: "all 0.15s" }}>
              <span style={{ fontSize: 16 }}>{s.icon}</span>{s.label}
              {s.badge ? <span style={{ fontSize: 10, fontWeight: 700, color: "#fff", background: "#dc2626", borderRadius: 20, padding: "1px 7px", marginLeft: 2 }}>{s.badge}</span> : null}
            </div>
          ))}
        </nav>
        <div className="adm-sidebar-actions" style={{ padding: "0 12px 16px" }}>
          <div onClick={onOpenEditor} style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 12px", borderRadius: 10, cursor: "pointer", background: "#1a56db", color: "#fff", fontSize: 14, fontWeight: 600, marginBottom: 8, justifyContent: "center" }}>
            ✏️ Rédiger un cours
          </div>
          <div onClick={() => onOpenPreview?.()} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 10, cursor: "pointer", border: "1.5px solid #c5d8f7", color: "#1a56db", fontSize: 13, fontWeight: 600, marginBottom: 8, justifyContent: "center" }}>
            👁 Aperçu élève
          </div>
          <div onClick={onLogout} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 10, cursor: "pointer", color: "#d93025", fontSize: 13, fontWeight: 500 }}>
            ⬡ Déconnexion
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="adm-content" style={{ flex: 1, padding: "32px 40px", overflowY: "auto", minWidth: 0 }}>

        {/* ÉLÈVES */}
        {tab === "eleves" && (
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1a2040", marginBottom: 6 }}>Mes élèves</h1>
            <p style={{ color: "#6b7eb8", fontSize: 14, marginBottom: 28 }}>{eleves.length} élève{eleves.length > 1 ? "s" : ""} inscrits</p>
            {loading ? <div style={{ color: "#aaa" }}>Chargement…</div> : (
              <div style={{ display: "grid", gap: 12 }}>
                {eleves.map(e => {
                  const chapitresOk = e.chapitres_debloques === null
                    ? "Tout débloqué"
                    : e.chapitres_debloques?.length === 0
                    ? "Aucun chapitre"
                    : `${e.chapitres_debloques.length} chapitres`;
                  return (
                    <div key={e.id} style={{ background: "#fff", border: "1px solid #e0e8f7", borderRadius: 12, padding: "16px 20px" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, color: "#1a2040", fontSize: 15 }}>{e.nom}</div>
                          <div style={{ fontSize: 13, color: "#6b7eb8", marginTop: 2 }}>{e.email} · {e.niveau}</div>
                          <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                            {(e.matieres || []).map(m => <span key={m} style={{ fontSize: 11, background: "#eef3ff", color: "#1a56db", borderRadius: 20, padding: "3px 10px", fontWeight: 500 }}>{m}</span>)}
                            {/* Badge chapitres */}
                            <span style={{
                              fontSize: 11, borderRadius: 20, padding: "3px 10px", fontWeight: 600,
                              background: e.chapitres_debloques === null ? "#f0faf4" : e.chapitres_debloques?.length === 0 ? "#fff5f5" : "#fef3c7",
                              color: e.chapitres_debloques === null ? "#16a34a" : e.chapitres_debloques?.length === 0 ? "#dc2626" : "#d97706"
                            }}>🔑 {chapitresOk}</span>
                          </div>
                          {e.mot_de_passe_temp && <div style={{ fontSize: 11, color: "#aaa", marginTop: 6 }}>MDP : <code style={{ background: "#f5f7ff", padding: "2px 6px", borderRadius: 4 }}>{e.mot_de_passe_temp}</code></div>}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                          {/* Bouton déblocage */}
                          <button onClick={() => setDeblocageEleve(e)} style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid #c5d8f7", background: "#eef3ff", color: "#1a56db", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                            🔑 Chapitres
                          </button>
                          <button onClick={() => toggleEleveActif(e.id, e.actif)} style={{ padding: "7px 16px", borderRadius: 8, border: "1px solid", borderColor: e.actif ? "#bfd7a3" : "#f5c6c4", background: e.actif ? "#f0fae8" : "#fff5f5", color: e.actif ? "#3a7d0a" : "#d93025", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                            {e.actif ? "Actif" : "Désactivé"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {eleves.length === 0 && !loading && (
                  <div style={{ textAlign: "center", color: "#aab5cc", padding: 48 }}>
                    Aucun élève. <span style={{ color: "#1a56db", cursor: "pointer" }} onClick={() => setTab("ajouter")}>Ajouter →</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* COURS */}
        {tab === "cours" && (
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1a2040", marginBottom: 6 }}>Tous les cours</h1>
            <p style={{ color: "#6b7eb8", fontSize: 14, marginBottom: 28 }}>{cours.length} cours, répartis par niveau</p>

            {coursParNiveau.map(groupe => (
              <div key={groupe.niveau} style={{ marginBottom: 32 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1a56db", margin: 0 }}>{groupe.niveau}</h2>
                    <span style={{ fontSize: 12, color: "#94a3b8" }}>{groupe.items.length} cours</span>
                  </div>
                  {NIVEAUX.includes(groupe.niveau) && (
                    <button onClick={() => onOpenPreview?.(groupe.niveau)} style={{ padding: "5px 12px", borderRadius: 8, border: "1px solid #c5d8f7", background: "#eef3ff", color: "#1a56db", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                      👁 Aperçu élève · {groupe.niveau}
                    </button>
                  )}
                </div>
                <div style={{ display: "grid", gap: 10 }}>
                  {groupe.items.map(c => (
                    <div key={c.id} style={{ background: "#fff", border: "1px solid #e0e8f7", borderRadius: 12, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ fontWeight: 600, color: "#1a2040" }}>{c.titre}</div>
                        <div style={{ fontSize: 13, color: "#6b7eb8", marginTop: 2 }}>{c.matiere} · {c.chapitre || "—"} · {new Date(c.created_at).toLocaleDateString("fr-FR")}</div>
                      </div>
                      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                        <span style={{ fontSize: 11, padding: "4px 12px", borderRadius: 20, background: c.publie ? "#f0fae8" : "#fff8e6", color: c.publie ? "#3a7d0a" : "#b86f00", fontWeight: 600 }}>{c.publie ? "Publié" : "Brouillon"}</span>
                        <button onClick={() => onOpenEditor(c)} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #cce0ff", background: "#eef5ff", color: "#1a56db", fontSize: 12, cursor: "pointer" }}>Éditer</button>
                        <button onClick={() => supprimerCours(c.id)} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #fdd", background: "#fff5f5", color: "#d93025", fontSize: 12, cursor: "pointer" }}>Supprimer</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {cours.length === 0 && !loading && <div style={{ textAlign: "center", color: "#aab5cc", padding: 48 }}>Aucun cours rédigé.</div>}
          </div>
        )}

        {/* AJOUTER ÉLÈVE */}
        {tab === "ajouter" && (
          <div style={{ maxWidth: 520 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1a2040", marginBottom: 6 }}>Nouvel élève</h1>
            <p style={{ color: "#6b7eb8", fontSize: 14, marginBottom: 32 }}>Créez le compte — l'élève reçoit ses identifiants.</p>
            {[
              { label: "Nom complet", val: newNom, set: setNewNom, placeholder: "Marie Dupont" },
              { label: "E-mail", val: newEmail, set: setNewEmail, placeholder: "marie.dupont@email.com" },
            ].map(f => (
              <div key={f.label} style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 12, color: "#6b7eb8", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>{f.label}</label>
                <input value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.placeholder} style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid #dce8f7", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
              </div>
            ))}
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 12, color: "#6b7eb8", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>Niveau</label>
              <select value={newNiveau} onChange={e => setNewNiveau(e.target.value)} style={{ padding: "11px 14px", borderRadius: 10, border: "1.5px solid #dce8f7", fontSize: 14, fontFamily: "inherit", outline: "none", background: "#fff" }}>
                {NIVEAUX.map(n => <option key={n}>{n}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 28 }}>
              <label style={{ fontSize: 12, color: "#6b7eb8", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 10 }}>Matières accessibles</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {MATIERES.map(m => (
                  <div key={m} onClick={() => toggleMatiere(m)} style={{ padding: "8px 16px", borderRadius: 20, cursor: "pointer", fontSize: 13, border: `1.5px solid ${newMatieres.includes(m) ? "#1a56db" : "#dce8f7"}`, background: newMatieres.includes(m) ? "#eef3ff" : "#fff", color: newMatieres.includes(m) ? "#1a56db" : "#888", fontWeight: newMatieres.includes(m) ? 600 : 400, transition: "all 0.15s" }}>{m}</div>
                ))}
              </div>
            </div>
            {msg && <div style={{ padding: "12px 16px", borderRadius: 10, marginBottom: 20, background: msg.startsWith("✓") ? "#f0fae8" : "#fff5f5", color: msg.startsWith("✓") ? "#3a7d0a" : "#d93025", fontSize: 13, fontWeight: 500, whiteSpace: "pre-line" }}>{msg}</div>}
            <button onClick={creerEleve} disabled={creating || !newEmail || !newNom} style={{ padding: "13px 32px", background: "#1a56db", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: "pointer", opacity: creating || !newEmail || !newNom ? 0.5 : 1, fontFamily: "inherit" }}>
              {creating ? "Création…" : "Créer l'élève →"}
            </button>
          </div>
        )}

        {/* CORRECTIONS */}
        {tab === "corrections" && <CorrectionPanel />}

        {/* ENVOIS */}
        {tab === "envois" && (
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1a2040", marginBottom: 6 }}>Photos envoyées</h1>
            <p style={{ color: "#6b7eb8", fontSize: 14, marginBottom: 28 }}>Exercices faits, incompris, ou ce que tu as demandé.</p>
            <AdminEnvois onReply={(eleveId, eleveNom) => { setOpenThread({ eleve_id: eleveId, eleve_nom: eleveNom }); setTab("messages"); }} />
          </div>
        )}

        {/* MESSAGES */}
        {tab === "messages" && (
          <div style={{ height: "calc(100vh - 64px)", display: "flex", flexDirection: "column" }}>
            {openThread ? (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, background: "#fff", border: "1px solid #e0e8f7", borderRadius: 16, overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderBottom: "1px solid #e2e8f0" }}>
                  <button onClick={() => { setOpenThread(null); loadThreads(); }} style={{ fontSize: 13, color: "#64748b", background: "#f1f5f9", border: "none", borderRadius: 8, padding: "7px 14px", cursor: "pointer", fontWeight: 600 }}>← Tous les messages</button>
                </div>
                <div style={{ flex: 1, minHeight: 0 }}>
                  <Messagerie eleveId={openThread.eleve_id} eleveNom={openThread.eleve_nom} asAdmin={true} titre={openThread.eleve_nom} />
                </div>
              </div>
            ) : (
              <div>
                <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1a2040", marginBottom: 6 }}>Messages</h1>
                <p style={{ color: "#6b7eb8", fontSize: 14, marginBottom: 28 }}>{messageThreads.length} conversation{messageThreads.length > 1 ? "s" : ""}</p>
                <div style={{ display: "grid", gap: 10 }}>
                  {messageThreads.map(t => (
                    <div key={t.eleve_id} onClick={() => setOpenThread(t)} style={{ background: "#fff", border: "1px solid #e0e8f7", borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
                      <span style={{ fontWeight: 600, color: "#1a2040" }}>{t.eleve_nom}</span>
                      {t.unread > 0
                        ? <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", background: "#dc2626", borderRadius: 20, padding: "3px 10px" }}>{t.unread} nouveau{t.unread > 1 ? "x" : ""}</span>
                        : <span style={{ fontSize: 12, color: "#94a3b8" }}>→</span>}
                    </div>
                  ))}
                  {messageThreads.length === 0 && (
                    <div style={{ textAlign: "center", color: "#aab5cc", padding: 48 }}>Aucun élève avec un compte lié pour l'instant.</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 