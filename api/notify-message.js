// api/notify-message.js
// Fonction serverless Vercel — envoie un mail à l'admin quand un élève écrit.
// Utilise Resend (resend.com), clé dans la variable d'env RESEND_API_KEY.

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Methode non autorisee" });

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    return res.status(500).json({ error: "Cle API email non configuree (RESEND_API_KEY)" });
  }

  const { eleveNom, contenu, hasImage } = req.body || {};
  const nom = eleveNom || "Un eleve";
  const extrait = (contenu || "").slice(0, 300);

  const sujet = `${nom} t'a ecrit sur Cours`;
  const corps = `
    <p><strong>${escapeHtml(nom)}</strong> vient d'envoyer un message${hasImage ? " avec une photo" : ""} :</p>
    <blockquote style="border-left:3px solid #1a56db;margin:12px 0;padding:4px 14px;color:#1a2040">
      ${extrait ? escapeHtml(extrait) : "<em>(photo sans texte)</em>"}
    </blockquote>
    <p><a href="https://cours.vercel.app" style="color:#1a56db">Repondre dans l'appli</a></p>
  `;

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Cours <onboarding@resend.dev>",
        to: ["anthony.armand07@gmail.com"],
        subject: sujet,
        html: corps,
      }),
    });
    if (!r.ok) {
      const err = await r.text();
      return res.status(502).json({ error: err });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
