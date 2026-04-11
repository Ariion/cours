import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("Identifiants incorrects.");
    } else {
      onLogin(data.user);
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#f8faff",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Instrument Serif', Georgia, serif"
    }}>
      <div style={{
        background: "#fff", border: "1px solid #e0e8f7",
        borderRadius: 16, padding: "48px 40px", width: 380,
        boxShadow: "0 4px 32px rgba(30,80,200,0.07)"
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            background: "#1a56db", borderRadius: 12,
            padding: "10px 20px", marginBottom: 16
          }}>
            <span style={{ color: "#fff", fontSize: 18, fontWeight: 600, letterSpacing: "0.04em" }}>COURS</span>
          </div>
          <div style={{ fontSize: 14, color: "#6b7eb8", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Espace pédagogique privé
          </div>
        </div>

        {/* Champs */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, color: "#6b7eb8", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
            Adresse e-mail
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            style={{
              width: "100%", padding: "12px 14px", borderRadius: 10,
              border: "1.5px solid #dce8f7", fontSize: 15, outline: "none",
              fontFamily: "inherit", boxSizing: "border-box",
              transition: "border-color 0.2s"
            }}
            onFocus={e => e.target.style.borderColor = "#1a56db"}
            onBlur={e => e.target.style.borderColor = "#dce8f7"}
            placeholder="eleve@email.com"
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 12, color: "#6b7eb8", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
            Mot de passe
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            style={{
              width: "100%", padding: "12px 14px", borderRadius: 10,
              border: "1.5px solid #dce8f7", fontSize: 15, outline: "none",
              fontFamily: "inherit", boxSizing: "border-box",
              transition: "border-color 0.2s"
            }}
            onFocus={e => e.target.style.borderColor = "#1a56db"}
            onBlur={e => e.target.style.borderColor = "#dce8f7"}
            placeholder="••••••••"
          />
        </div>

        {error && (
          <div style={{ color: "#d93025", fontSize: 13, marginBottom: 16, textAlign: "center" }}>
            {error}
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: "100%", padding: "13px", background: loading ? "#93aee0" : "#1a56db",
            color: "#fff", border: "none", borderRadius: 10, fontSize: 15,
            fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
            letterSpacing: "0.04em", transition: "background 0.2s",
            fontFamily: "inherit"
          }}
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>

        <p style={{ textAlign: "center", fontSize: 12, color: "#aab5cc", marginTop: 24 }}>
          Accès réservé aux élèves inscrits
        </p>
      </div>
    </div>
  );
}
