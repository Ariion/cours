// src/pages/ElevePreview.jsx
// Vue admin : voir l'appli exactement comme un élève d'un niveau donné,
// sans avoir besoin d'un vrai compte élève.
import { useState } from "react";
import EleveHome from "./EleveHome";

const NIVEAUX = ["6e", "5e", "4e", "3e", "2nde", "1re", "Terminale"];

export default function ElevePreview({ user, niveauInitial, onBack }) {
  const [niveau, setNiveau] = useState(niveauInitial || "2nde");

  return (
    <div>
      <div style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "#0f172a", color: "#fff",
        padding: "10px 24px", display: "flex", alignItems: "center",
        justifyContent: "space-between", fontSize: 13,
        fontFamily: "'DM Sans', Arial, sans-serif", flexWrap: "wrap", gap: 10
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span>👁 Mode aperçu — vue d'un élève de ce niveau (si tu ouvres un exercice, l'envoi serait enregistré sous ton compte admin)</span>
          <select value={niveau} onChange={e => setNiveau(e.target.value)}
            style={{ padding: "4px 8px", borderRadius: 6, border: "none", fontSize: 12, fontFamily: "inherit", cursor: "pointer" }}>
            {NIVEAUX.map(n => <option key={n}>{n}</option>)}
          </select>
        </div>
        <button onClick={onBack} style={{
          background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)",
          borderRadius: 8, padding: "5px 14px", cursor: "pointer", fontSize: 12, fontWeight: 600
        }}>← Quitter l'aperçu</button>
      </div>

      {/* key={niveau} force le remontage pour recharger les cours du niveau choisi */}
      <EleveHome
        key={niveau}
        user={user}
        eleveData={{ nom: "Aperçu", niveau, chapitres_debloques: null }}
        onLogout={onBack}
      />
    </div>
  );
}
