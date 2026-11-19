-- ============================================
-- FIX — un titre de bloc avait la fleche en texte brut
-- A coller dans : Supabase > SQL Editor > New query
-- ============================================
-- Les titres de bloc s'affichent en texte brut (pas de rendu LaTeX,
-- contrairement au contenu) : "Les coordonnees de ->AB" affichait donc
-- la fleche AVANT les lettres au lieu d'au-dessus, exactement le bug
-- deja corrige ailleurs. Ce script ne touche que ce titre, sans
-- retoucher le reste du cours.

UPDATE cours
SET contenu = REPLACE(
  contenu,
  '"titre": "Les coordonnées de →AB"',
  '"titre": "Les coordonnées d''un vecteur"'
)
WHERE niveau = '2nde' AND chapitre = 'Vecteurs dans le plan';

-- Verification : doit renvoyer "Les coordonnées d'un vecteur", pas de fleche.
-- SELECT contenu FROM cours WHERE niveau = '2nde' AND chapitre = 'Vecteurs dans le plan';
