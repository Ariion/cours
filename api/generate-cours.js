// api/generate-cours.js
// Fonction serverless Vercel — proxy vers Google Gemini (gratuit)

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Methode non autorisee" });

  const { niveau, matiere, chapitre } = req.body;
  if (!niveau || !matiere || !chapitre) {
    return res.status(400).json({ error: "Parametres manquants" });
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: "Cle API Gemini non configuree" });
  }

  const prompt = `Tu es un professeur de mathematiques expert du programme francais (college et lycee).
Tu generes des cours complets, rigoureux et pedagogiques au format JSON.

REGLES ABSOLUES :
- Reponds UNIQUEMENT avec un tableau JSON valide, aucun texte avant ou apres, sans balises markdown.
- Chaque bloc a : { "id": number, "type": string, "content": string }
- Pour les types "definition", "theoreme", "exemple", "methode", "remarque" : ajouter aussi "titre": string
- Types disponibles : "texte", "formule", "definition", "theoreme", "exemple", "remarque", "methode"
- Les formules mathematiques dans les blocs "texte" s'ecrivent entre dollars : $formule$ (inline)
- Les blocs "formule" contiennent du LaTeX pur sans dollars, ex: \\frac{-b+\\sqrt{\\Delta}}{2a}
- Utilise \\times pour la multiplication, \\leq pour <=, \\geq pour >=, \\sqrt{x} pour racine de x, \\frac{a}{b} pour les fractions
- Entre 15 et 25 blocs pour un cours complet et exhaustif
- Les exemples montrent des calculs detailles pas a pas

Genere maintenant un cours complet de ${matiere} pour la classe de ${niveau}, chapitre : "${chapitre}".

Structure du cours :
1. Introduction generale (bloc texte)
2. Definitions essentielles (blocs definition)
3. Theoremes et proprietes avec formules separees (blocs theoreme puis blocs formule)
4. Methodes de resolution etape par etape (blocs methode)
5. Exemples resolus completement avec calculs detailles (blocs exemple)
6. Remarques importantes et pieges a eviter (blocs remarque)

IMPORTANT : Reponds uniquement avec le tableau JSON brut, sans aucun texte avant ou apres.`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 4000,
        }
      })
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!text) {
      return res.status(500).json({ error: "Reponse vide de Gemini" });
    }

    // Nettoyage robuste du JSON
    const clean = text
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/g, "")
      .trim();

    const match = clean.match(/\[[\s\S]*\]/);
    if (!match) {
      return res.status(500).json({ error: "Format invalide : " + clean.slice(0, 300) });
    }

    const blocs = JSON.parse(match[0]);
    return res.status(200).json({ blocs });

  } catch (err) {
    console.error("Erreur Gemini:", err);
    return res.status(500).json({ error: err.message });
  }
}