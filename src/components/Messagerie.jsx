// src/components/Messagerie.jsx
// Fil de discussion élève <-> admin, avec photos en pièce jointe et une
// galerie des images échangées dans CETTE conversation. Réutilisé des
// deux côtés (props asAdmin).
import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";

export default function Messagerie({ eleveId, eleveNom, asAdmin = false, titre }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [texte, setTexte] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [attachFile, setAttachFile] = useState(null);
  const [attachPreview, setAttachPreview] = useState(null);
  const [galerieOuverte, setGalerieOuverte] = useState(false);
  const bottomRef = useRef(null);
  const fileRef = useRef(null);
  const moi = asAdmin ? "admin" : "eleve";
  const autre = asAdmin ? "eleve" : "admin";

  useEffect(() => {
    if (!eleveId) return;
    load();

    const channel = supabase
      .channel(`messages-${eleveId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `eleve_id=eq.${eleveId}` },
        (payload) => setMessages(prev => prev.some(m => m.id === payload.new.id) ? prev : [...prev, payload.new]))
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [eleveId]);

  useEffect(() => {
    if (!galerieOuverte) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, galerieOuverte]);

  const load = async () => {
    setLoading(true);
    setLoadError("");
    const { data, error } = await supabase.from("messages").select("*").eq("eleve_id", eleveId).order("created_at", { ascending: true });
    if (error) {
      setLoadError("Impossible de charger la conversation : " + error.message);
      setLoading(false);
      return;
    }
    setMessages(data || []);
    setLoading(false);
    const nonLus = (data || []).filter(m => m.expediteur === autre && !m.lu).map(m => m.id);
    if (nonLus.length) await supabase.from("messages").update({ lu: true }).in("id", nonLus);
  };

  const choisirFichier = (f) => {
    if (!f) return;
    setSendError("");
    setAttachFile(f);
    const reader = new FileReader();
    reader.onload = () => setAttachPreview(reader.result);
    reader.readAsDataURL(f);
  };

  const retirerFichier = () => {
    setAttachFile(null); setAttachPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const envoyer = async () => {
    const contenu = texte.trim();
    if ((!contenu && !attachFile) || sending || !eleveId) return;
    setSending(true);
    setSendError("");
    try {
      let image_url = null;
      if (attachFile) {
        const ext = (attachFile.name.split(".").pop() || "jpg").toLowerCase();
        const path = `${eleveId}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("envois").upload(path, attachFile, { contentType: attachFile.type || "image/jpeg" });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("envois").getPublicUrl(path);
        image_url = pub.publicUrl;
      }
      const { data, error } = await supabase.from("messages")
        .insert({ eleve_id: eleveId, eleve_nom: eleveNom || null, expediteur: moi, contenu: contenu || null, image_url })
        .select().single();
      if (error) throw error;
      setMessages(prev => prev.some(m => m.id === data.id) ? prev : [...prev, data]);
      setTexte("");
      retirerFichier();
    } catch (e) {
      setSendError("Échec de l'envoi : " + (e.message || "erreur inconnue"));
    }
    setSending(false);
  };

  const images = messages.filter(m => m.image_url);

  if (!eleveId) {
    return <div style={{ padding: 20, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>Conversation indisponible.</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      {(titre || true) && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid #e2e8f0", flexShrink: 0 }}>
          <span style={{ fontWeight: 700, color: "#0f172a", fontSize: 14 }}>{titre || "Messages"}</span>
          <button onClick={() => setGalerieOuverte(g => !g)} style={{
            fontSize: 12, fontWeight: 600, padding: "5px 11px", borderRadius: 20, cursor: "pointer",
            border: "1.5px solid " + (galerieOuverte ? "#1d4ed8" : "#e2e8f0"),
            background: galerieOuverte ? "#eff6ff" : "#fff", color: galerieOuverte ? "#1d4ed8" : "#64748b"
          }}>
            🖼 Galerie{images.length > 0 ? ` (${images.length})` : ""}
          </button>
        </div>
      )}

      {galerieOuverte ? (
        <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
          {images.length === 0 ? (
            <div style={{ textAlign: "center", color: "#94a3b8", fontSize: 13, padding: 30 }}>Aucune photo échangée dans cette conversation.</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(110px,1fr))", gap: 10 }}>
              {images.map(m => (
                <a key={m.id} href={m.image_url} target="_blank" rel="noopener noreferrer" style={{ display: "block", borderRadius: 10, overflow: "hidden", border: "1px solid #e2e8f0" }}>
                  <img src={m.image_url} alt="" style={{ width: "100%", height: 100, objectFit: "cover", display: "block" }} />
                </a>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 10, minHeight: 200 }}>
          {loading ? (
            <div style={{ textAlign: "center", color: "#94a3b8", fontSize: 13, padding: 20 }}>Chargement…</div>
          ) : loadError ? (
            <div style={{ textAlign: "center", color: "#dc2626", fontSize: 13, padding: 20 }}>{loadError}</div>
          ) : messages.length === 0 ? (
            <div style={{ textAlign: "center", color: "#94a3b8", fontSize: 13, padding: 20 }}>
              Aucun message pour l'instant.{!asAdmin && " Écris si tu bloques sur quelque chose."}
            </div>
          ) : messages.map(m => (
            <div key={m.id} style={{ display: "flex", justifyContent: m.expediteur === moi ? "flex-end" : "flex-start" }}>
              <div style={{
                maxWidth: "78%", padding: m.image_url ? 6 : "9px 13px", borderRadius: 14,
                borderBottomRightRadius: m.expediteur === moi ? 4 : 14,
                borderBottomLeftRadius: m.expediteur === moi ? 14 : 4,
                background: m.expediteur === moi ? "#1d4ed8" : "#f1f5f9",
                color: m.expediteur === moi ? "#fff" : "#0f172a",
                fontSize: 14, lineHeight: 1.45, whiteSpace: "pre-wrap", wordBreak: "break-word"
              }}>
                {m.image_url && (
                  <a href={m.image_url} target="_blank" rel="noopener noreferrer">
                    <img src={m.image_url} alt="" style={{ display: "block", width: "100%", maxWidth: 220, borderRadius: 9, marginBottom: m.contenu ? 6 : 2 }} />
                  </a>
                )}
                {m.contenu && <span style={{ padding: m.image_url ? "0 6px" : 0 }}>{m.contenu}</span>}
                <div style={{ fontSize: 10, marginTop: 4, opacity: 0.6, textAlign: "right", padding: m.image_url ? "0 6px" : 0 }}>
                  {new Date(m.created_at).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      )}

      {!galerieOuverte && (
        <div style={{ borderTop: "1px solid #e2e8f0", flexShrink: 0 }}>
          {attachPreview && (
            <div style={{ padding: "10px 16px 0", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ position: "relative" }}>
                <img src={attachPreview} alt="" style={{ height: 56, width: 56, objectFit: "cover", borderRadius: 8, border: "1px solid #e2e8f0" }} />
                <button onClick={retirerFichier} style={{ position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: "50%", border: "none", background: "#0f172a", color: "#fff", fontSize: 11, cursor: "pointer" }}>✕</button>
              </div>
              <span style={{ fontSize: 12, color: "#64748b" }}>Photo prête à envoyer</span>
            </div>
          )}
          {sendError && <div style={{ padding: "8px 16px 0", fontSize: 12, color: "#dc2626", fontWeight: 600 }}>{sendError}</div>}
          <div style={{ display: "flex", gap: 8, padding: "12px 16px", alignItems: "flex-end" }}>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => choisirFichier(e.target.files?.[0])} />
            <button onClick={() => fileRef.current?.click()} title="Joindre une photo" style={{
              width: 40, height: 40, flexShrink: 0, borderRadius: 10, border: "1.5px solid #e2e8f0",
              background: "#fff", fontSize: 17, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
            }}>📷</button>
            <textarea
              value={texte}
              onChange={e => setTexte(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); envoyer(); } }}
              placeholder={asAdmin ? "Répondre…" : "Écris ton message…"}
              rows={1}
              style={{ flex: 1, resize: "none", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 14, fontFamily: "inherit", outline: "none", maxHeight: 100 }}
            />
            <button onClick={envoyer} disabled={(!texte.trim() && !attachFile) || sending}
              style={{ padding: "0 18px", height: 40, borderRadius: 10, border: "none", background: (!texte.trim() && !attachFile) || sending ? "#cbd5e1" : "#1d4ed8", color: "#fff", fontSize: 14, fontWeight: 700, cursor: (!texte.trim() && !attachFile) || sending ? "not-allowed" : "pointer", flexShrink: 0 }}>
              {sending ? "…" : "Envoyer"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
