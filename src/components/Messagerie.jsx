// src/components/Messagerie.jsx
// Fil de discussion simple élève <-> admin, réutilisé des deux côtés.
import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";

export default function Messagerie({ eleveId, eleveNom, asAdmin = false, titre }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [texte, setTexte] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
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
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("messages").select("*").eq("eleve_id", eleveId).order("created_at", { ascending: true });
    setMessages(data || []);
    setLoading(false);
    // Marque comme lus les messages envoyés par l'autre partie.
    const nonLus = (data || []).filter(m => m.expediteur === autre && !m.lu).map(m => m.id);
    if (nonLus.length) await supabase.from("messages").update({ lu: true }).in("id", nonLus);
  };

  const envoyer = async () => {
    const contenu = texte.trim();
    if (!contenu || sending) return;
    setSending(true);
    setTexte("");
    const { data, error } = await supabase.from("messages")
      .insert({ eleve_id: eleveId, eleve_nom: eleveNom || null, expediteur: moi, contenu })
      .select().single();
    if (!error && data) setMessages(prev => prev.some(m => m.id === data.id) ? prev : [...prev, data]);
    setSending(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      {titre && (
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #e2e8f0", fontWeight: 700, color: "#0f172a", fontSize: 14, flexShrink: 0 }}>
          {titre}
        </div>
      )}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 10, minHeight: 200 }}>
        {loading ? (
          <div style={{ textAlign: "center", color: "#94a3b8", fontSize: 13, padding: 20 }}>Chargement…</div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: "center", color: "#94a3b8", fontSize: 13, padding: 20 }}>
            Aucun message pour l'instant.{!asAdmin && " Écris si tu bloques sur quelque chose."}
          </div>
        ) : messages.map(m => (
          <div key={m.id} style={{ display: "flex", justifyContent: m.expediteur === moi ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "78%", padding: "9px 13px", borderRadius: 14,
              borderBottomRightRadius: m.expediteur === moi ? 4 : 14,
              borderBottomLeftRadius: m.expediteur === moi ? 14 : 4,
              background: m.expediteur === moi ? "#1d4ed8" : "#f1f5f9",
              color: m.expediteur === moi ? "#fff" : "#0f172a",
              fontSize: 14, lineHeight: 1.45, whiteSpace: "pre-wrap", wordBreak: "break-word"
            }}>
              {m.contenu}
              <div style={{ fontSize: 10, marginTop: 4, opacity: 0.6, textAlign: "right" }}>
                {new Date(m.created_at).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div style={{ display: "flex", gap: 8, padding: "12px 16px", borderTop: "1px solid #e2e8f0", flexShrink: 0 }}>
        <textarea
          value={texte}
          onChange={e => setTexte(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); envoyer(); } }}
          placeholder={asAdmin ? "Répondre…" : "Écris ton message…"}
          rows={1}
          style={{ flex: 1, resize: "none", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 14, fontFamily: "inherit", outline: "none", maxHeight: 100 }}
        />
        <button onClick={envoyer} disabled={!texte.trim() || sending}
          style={{ padding: "0 18px", borderRadius: 10, border: "none", background: !texte.trim() || sending ? "#cbd5e1" : "#1d4ed8", color: "#fff", fontSize: 14, fontWeight: 700, cursor: !texte.trim() || sending ? "not-allowed" : "pointer", flexShrink: 0 }}>
          Envoyer
        </button>
      </div>
    </div>
  );
}
