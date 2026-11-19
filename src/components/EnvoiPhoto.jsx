// src/components/EnvoiPhoto.jsx
// Côté élève : envoyer une photo (exercice fait, pas compris, demandé, autre)
// et revoir ce qu'on a déjà envoyé.
import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";

const TYPES = [
  { key: "repondu", label: "✅ J'ai répondu", color: "#16a34a", bg: "#f0fdf4", border: "#86efac" },
  { key: "bloque",  label: "❓ Je ne comprends pas", color: "#b91c1c", bg: "#fff5f5", border: "#fca5a5" },
  { key: "demande", label: "📩 Tu me l'as demandé", color: "#1d4ed8", bg: "#eff6ff", border: "#93c5fd" },
  { key: "autre",   label: "💬 Autre", color: "#64748b", bg: "#f8fafc", border: "#e2e8f0" },
];
const TYPE_MAP = Object.fromEntries(TYPES.map(t => [t.key, t]));

export default function EnvoiPhoto({ eleve }) {
  const eleveId = eleve?.id;
  const [type, setType] = useState("repondu");
  const [note, setNote] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState("");
  const [envois, setEnvois] = useState([]);
  const [loading, setLoading] = useState(true);
  const fileRef = useRef(null);

  useEffect(() => { load(); }, [eleveId]);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("envois").select("*").eq("eleve_id", eleveId).order("created_at", { ascending: false });
    setEnvois(data || []);
    setLoading(false);
  };

  const choisirFichier = (f) => {
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(f);
  };

  const envoyer = async () => {
    if (!file || sending) return;
    setSending(true);
    setMsg("");
    try {
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${eleveId}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("envois").upload(path, file, { contentType: file.type || "image/jpeg" });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("envois").getPublicUrl(path);
      const { error: insErr } = await supabase.from("envois").insert({
        eleve_id: eleveId, eleve_nom: eleve?.nom || null, eleve_email: eleve?.email || null,
        type, note: note.trim() || null, image_url: pub.publicUrl, statut: "nouveau"
      });
      if (insErr) throw insErr;
      setMsg("✓ Envoyé à ton prof !");
      setFile(null); setPreview(null); setNote("");
      if (fileRef.current) fileRef.current.value = "";
      load();
    } catch (e) {
      setMsg("Erreur à l'envoi : " + e.message);
    }
    setSending(false);
    setTimeout(() => setMsg(""), 4000);
  };

  return (
    <div>
      <div style={{ background: "#fff", border: "1px solid #e0e8f7", borderRadius: 16, padding: 20, marginBottom: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
          C'est quoi, cette photo ?
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
          {TYPES.map(t => (
            <div key={t.key} onClick={() => setType(t.key)} style={{
              padding: "8px 14px", borderRadius: 20, cursor: "pointer", fontSize: 13, fontWeight: 600,
              border: `1.5px solid ${type === t.key ? t.color : t.border}`,
              background: type === t.key ? t.bg : "#fff",
              color: type === t.key ? t.color : "#64748b", transition: "all 0.15s"
            }}>
              {t.label}
            </div>
          ))}
        </div>

        {!preview ? (
          <label style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8,
            border: "2px dashed #cbd5e1", borderRadius: 14, padding: "32px 16px", cursor: "pointer", background: "#fafbff"
          }}>
            <span style={{ fontSize: 30 }}>📷</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#1d4ed8" }}>Prendre ou choisir une photo</span>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }}
              onChange={e => choisirFichier(e.target.files?.[0])} />
          </label>
        ) : (
          <div style={{ position: "relative", borderRadius: 14, overflow: "hidden", border: "1px solid #e2e8f0" }}>
            <img src={preview} alt="Aperçu" style={{ width: "100%", maxHeight: 360, objectFit: "contain", background: "#f1f5f9", display: "block" }} />
            <button onClick={() => { setFile(null); setPreview(null); if (fileRef.current) fileRef.current.value = ""; }}
              style={{ position: "absolute", top: 10, right: 10, width: 30, height: 30, borderRadius: "50%", border: "none", background: "rgba(15,23,42,0.7)", color: "#fff", fontSize: 15, cursor: "pointer" }}>✕</button>
          </div>
        )}

        <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Un mot pour expliquer (optionnel)…"
          rows={2} style={{ width: "100%", marginTop: 14, padding: "10px 12px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 14, fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box" }} />

        <button onClick={envoyer} disabled={!file || sending} style={{
          marginTop: 14, width: "100%", padding: "13px", borderRadius: 10, border: "none",
          background: !file || sending ? "#cbd5e1" : "#1d4ed8", color: "#fff", fontSize: 14, fontWeight: 700,
          cursor: !file || sending ? "not-allowed" : "pointer"
        }}>
          {sending ? "Envoi…" : "📤 Envoyer à mon prof"}
        </button>
        {msg && <div style={{ marginTop: 10, fontSize: 13, color: msg.startsWith("✓") ? "#16a34a" : "#dc2626", fontWeight: 600 }}>{msg}</div>}
      </div>

      <div style={{ fontSize: 13, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
        Déjà envoyé
      </div>
      {loading ? (
        <div style={{ color: "#94a3b8", fontSize: 13 }}>Chargement…</div>
      ) : envois.length === 0 ? (
        <div style={{ color: "#94a3b8", fontSize: 13 }}>Rien envoyé pour l'instant.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 12 }}>
          {envois.map(e => {
            const t = TYPE_MAP[e.type] || TYPE_MAP.autre;
            return (
              <a key={e.id} href={e.image_url} target="_blank" rel="noopener noreferrer" style={{
                display: "block", borderRadius: 12, overflow: "hidden", border: "1px solid #e2e8f0", textDecoration: "none", background: "#fff"
              }}>
                <img src={e.image_url} alt="" style={{ width: "100%", height: 110, objectFit: "cover", display: "block" }} />
                <div style={{ padding: "7px 9px" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: t.color, background: t.bg, border: `1px solid ${t.border}`, borderRadius: 20, padding: "2px 8px" }}>{t.label.replace(/^\S+ /, "")}</span>
                  <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 5 }}>
                    {e.statut === "traite" ? "✓ Traité" : e.statut === "vu" ? "👀 Vu" : "Envoyé"} · {new Date(e.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
