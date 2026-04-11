import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const MATIERES = ["Mathématiques", "Physique-Chimie", "Français", "Histoire-Géo", "Anglais"];
const NIVEAUX = ["6e", "5e", "4e", "3e", "2nde", "1re", "Terminale"];

export default function Admin({ user, onLogout, onOpenEditor }) {
  const [tab, setTab] = useState("eleves");
  const [eleves, setEleves] = useState([]);
  const [cours, setCours] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form nouvel élève
  const [newEmail, setNewEmail] = useState("");
  const [newNom, setNewNom] = useState("");
  const [newNiveau, setNewNiveau] = useState("6e");
  const [newMatieres, setNewMatieres] = useState([]);
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const { data: e } = await supabase.from("eleves").select("*").order("created_at", { ascending: false });
    const { data: c } = await supabase.from("cours").select("*").order("created_at", { ascending: false });
    setEleves(e || []);
    setCours(c || []);
    setLoading(false);
  };

  const creerEleve = async () => {
    if (!newEmail || !newNom) return;
    setCreating(true);
    setMsg("");

    // Générer un mot de passe temporaire
    const tempPassword = Math.random().toString(36).slice(-6).toUpperCase() + "m1!";

    // 1. Créer le compte Auth via signUp (fonctionne côté navigateur)
    const { error: signUpError } = await supabase.auth.signUp({
      email: newEmail,
      password: tempPassword,
    });
    // On ignore l'erreur si l'email existe déjà, on continue quand même

    // 2. Enregistrer dans la table élèves
    const { error } = await supabase.from("eleves").insert({
      email: newEmail,
      nom: newNom,
      niveau: newNiveau,
      matieres: newMatieres,
      actif: true,
      mot_de_passe_temp: tempPassword
    });

    if (!error) {
      setMsg(`✓ Élève créé ! Identifiants à transmettre :\nEmail : ${newEmail}\nMot de passe : ${tempPassword}`);
      setNewEmail(""); setNewNom(""); setNewMatieres([]);
      loadData();
    } else {
      setMsg("Erreur lors de la création.");
    }
    setCreating(false);
  };

  const toggleMatiere = (m) => {
    setNewMatieres(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
  };

  const toggleEleveActif = async (id, actif) => {
    await supabase.from("eleves").update({ actif: !actif }).eq("id", id);
    loadData();
  };

  const supprimerCours = async (id) => {
    if (!confirm("Supprimer ce cours ?")) return;
    await supabase.from("cours").delete().eq("id", id);
    loadData();
  };

  const sideNav = [
    { key: "eleves", label: "Élèves", icon: "👤" },
    { key: "cours", label: "Cours", icon: "📖" },
    { key: "ajouter", label: "+ Nouvel élève", icon: "➕" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'DM Sans', Arial, sans-serif", background: "#f0f5ff" }}>
      {/* Sidebar */}
      <div style={{
        width: 220, background: "#fff", borderRight: "1px solid #e0e8f7",
        display: "flex", flexDirection: "column", padding: "24px 0"
      }}>
        <div style={{ padding: "0 20px 28px", borderBottom: "1px solid #e0e8f7" }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#1a56db", letterSpacing: "0.04em" }}>COURS</div>
          <div style={{ fontSize: 11, color: "#aab5cc", marginTop: 2 }}>Administration</div>
        </div>
        <nav style={{ flex: 1, padding: "16px 12px" }}>
          {sideNav.map(s => (
            <div key={s.key} onClick={() => setTab(s.key)} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px", borderRadius: 10, cursor: "pointer", marginBottom: 4,
              background: tab === s.key ? "#eef3ff" : "transparent",
              color: tab === s.key ? "#1a56db" : "#555",
              fontWeight: tab === s.key ? 600 : 400, fontSize: 14,
              transition: "all 0.15s"
            }}>
              <span style={{ fontSize: 16 }}>{s.icon}</span>
              {s.label}
            </div>
          ))}
        </nav>
        <div style={{ padding: "0 12px 16px" }}>
          <div onClick={onOpenEditor} style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "11px 12px", borderRadius: 10, cursor: "pointer",
            background: "#1a56db", color: "#fff",
            fontSize: 14, fontWeight: 600, marginBottom: 8,
            justifyContent: "center"
          }}>
            ✏️ Rédiger un cours
          </div>
          <div onClick={onLogout} style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "10px 12px", borderRadius: 10, cursor: "pointer",
            color: "#d93025", fontSize: 13, fontWeight: 500
          }}>
            ⬡ Déconnexion
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div style={{ flex: 1, padding: "32px 40px", overflowY: "auto" }}>

        {/* ONGLET ÉLÈVES */}
        {tab === "eleves" && (
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1a2040", marginBottom: 6 }}>Mes élèves</h1>
            <p style={{ color: "#6b7eb8", fontSize: 14, marginBottom: 28 }}>{eleves.length} élève{eleves.length > 1 ? "s" : ""} inscrits</p>
            {loading ? <div style={{ color: "#aaa" }}>Chargement...</div> : (
              <div style={{ display: "grid", gap: 12 }}>
                {eleves.map(e => (
                  <div key={e.id} style={{
                    background: "#fff", border: "1px solid #e0e8f7",
                    borderRadius: 12, padding: "16px 20px",
                    display: "flex", alignItems: "center", justifyContent: "space-between"
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, color: "#1a2040", fontSize: 15 }}>{e.nom}</div>
                      <div style={{ fontSize: 13, color: "#6b7eb8", marginTop: 2 }}>
                        {e.email} · {e.niveau}
                      </div>
                      <div style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {(e.matieres || []).map(m => (
                          <span key={m} style={{
                            fontSize: 11, background: "#eef3ff", color: "#1a56db",
                            borderRadius: 20, padding: "3px 10px", fontWeight: 500
                          }}>{m}</span>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      {e.mot_de_passe_temp && (
                        <div style={{ fontSize: 11, color: "#aaa", textAlign: "right" }}>
                          MDP : <code style={{ background: "#f5f7ff", padding: "2px 6px", borderRadius: 4 }}>{e.mot_de_passe_temp}</code>
                        </div>
                      )}
                      <button
                        onClick={() => toggleEleveActif(e.id, e.actif)}
                        style={{
                          padding: "7px 16px", borderRadius: 8, border: "1px solid",
                          borderColor: e.actif ? "#bfd7a3" : "#f5c6c4",
                          background: e.actif ? "#f0fae8" : "#fff5f5",
                          color: e.actif ? "#3a7d0a" : "#d93025",
                          fontSize: 12, fontWeight: 600, cursor: "pointer"
                        }}
                      >
                        {e.actif ? "Actif" : "Désactivé"}
                      </button>
                    </div>
                  </div>
                ))}
                {eleves.length === 0 && !loading && (
                  <div style={{ textAlign: "center", color: "#aab5cc", padding: 48 }}>
                    Aucun élève pour l'instant.<br />
                    <span style={{ color: "#1a56db", cursor: "pointer" }} onClick={() => setTab("ajouter")}>Ajouter le premier →</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ONGLET COURS */}
        {tab === "cours" && (
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1a2040", marginBottom: 6 }}>Tous les cours</h1>
            <p style={{ color: "#6b7eb8", fontSize: 14, marginBottom: 28 }}>{cours.length} cours publiés</p>
            <div style={{ display: "grid", gap: 12 }}>
              {cours.map(c => (
                <div key={c.id} style={{
                  background: "#fff", border: "1px solid #e0e8f7",
                  borderRadius: 12, padding: "16px 20px",
                  display: "flex", alignItems: "center", justifyContent: "space-between"
                }}>
                  <div>
                    <div style={{ fontWeight: 600, color: "#1a2040" }}>{c.titre}</div>
                    <div style={{ fontSize: 13, color: "#6b7eb8", marginTop: 2 }}>
                      {c.matiere} · {c.niveau} · {new Date(c.created_at).toLocaleDateString("fr-FR")}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <span style={{
                      fontSize: 11, padding: "4px 12px", borderRadius: 20,
                      background: c.publie ? "#f0fae8" : "#fff8e6",
                      color: c.publie ? "#3a7d0a" : "#b86f00", fontWeight: 600
                    }}>{c.publie ? "Publié" : "Brouillon"}</span>
                    <button onClick={() => supprimerCours(c.id)} style={{
                      padding: "6px 12px", borderRadius: 8, border: "1px solid #fdd",
                      background: "#fff5f5", color: "#d93025", fontSize: 12, cursor: "pointer"
                    }}>Supprimer</button>
                  </div>
                </div>
              ))}
              {cours.length === 0 && !loading && (
                <div style={{ textAlign: "center", color: "#aab5cc", padding: 48 }}>
                  Aucun cours rédigé pour l'instant.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ONGLET AJOUTER ÉLÈVE */}
        {tab === "ajouter" && (
          <div style={{ maxWidth: 520 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1a2040", marginBottom: 6 }}>Nouvel élève</h1>
            <p style={{ color: "#6b7eb8", fontSize: 14, marginBottom: 32 }}>
              Créez le compte — l'élève reçoit ses identifiants.
            </p>

            {[
              { label: "Nom complet", val: newNom, set: setNewNom, placeholder: "Marie Dupont" },
              { label: "E-mail", val: newEmail, set: setNewEmail, placeholder: "marie.dupont@email.com" },
            ].map(f => (
              <div key={f.label} style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 12, color: "#6b7eb8", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>
                  {f.label}
                </label>
                <input
                  value={f.val} onChange={e => f.set(e.target.value)}
                  placeholder={f.placeholder}
                  style={{
                    width: "100%", padding: "11px 14px", borderRadius: 10,
                    border: "1.5px solid #dce8f7", fontSize: 14, outline: "none",
                    boxSizing: "border-box", fontFamily: "inherit"
                  }}
                />
              </div>
            ))}

            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 12, color: "#6b7eb8", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>
                Niveau
              </label>
              <select value={newNiveau} onChange={e => setNewNiveau(e.target.value)}
                style={{
                  padding: "11px 14px", borderRadius: 10, border: "1.5px solid #dce8f7",
                  fontSize: 14, fontFamily: "inherit", outline: "none", background: "#fff"
                }}>
                {NIVEAUX.map(n => <option key={n}>{n}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 28 }}>
              <label style={{ fontSize: 12, color: "#6b7eb8", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 10 }}>
                Matières accessibles
              </label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {MATIERES.map(m => (
                  <div key={m} onClick={() => toggleMatiere(m)} style={{
                    padding: "8px 16px", borderRadius: 20, cursor: "pointer", fontSize: 13,
                    border: `1.5px solid ${newMatieres.includes(m) ? "#1a56db" : "#dce8f7"}`,
                    background: newMatieres.includes(m) ? "#eef3ff" : "#fff",
                    color: newMatieres.includes(m) ? "#1a56db" : "#888",
                    fontWeight: newMatieres.includes(m) ? 600 : 400, transition: "all 0.15s"
                  }}>{m}</div>
                ))}
              </div>
            </div>

            {msg && (
              <div style={{
                padding: "12px 16px", borderRadius: 10, marginBottom: 20,
                background: msg.startsWith("✓") ? "#f0fae8" : "#fff5f5",
                color: msg.startsWith("✓") ? "#3a7d0a" : "#d93025",
                fontSize: 13, fontWeight: 500
              }}>{msg}</div>
            )}

            <button onClick={creerEleve} disabled={creating || !newEmail || !newNom}
              style={{
                padding: "13px 32px", background: "#1a56db", color: "#fff",
                border: "none", borderRadius: 10, fontSize: 15, fontWeight: 600,
                cursor: "pointer", opacity: creating || !newEmail || !newNom ? 0.5 : 1,
                fontFamily: "inherit"
              }}>
              {creating ? "Création..." : "Créer l'élève →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}