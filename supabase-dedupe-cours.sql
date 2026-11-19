-- ============================================
-- DEDUPE — supprime les cours en double
-- À coller dans : Supabase > SQL Editor > New query
-- ============================================
-- Le seed de seconde a été exécuté plusieurs fois (le script le dit bien,
-- mais rien ne l'empêchait). Ceci garde, pour chaque (niveau, titre,
-- chapitre), uniquement la ligne la plus ancienne et supprime les autres.
-- Générique : fonctionne pour tous les niveaux, pas seulement 2nde.

DELETE FROM cours a USING cours b
WHERE a.niveau = b.niveau
  AND a.titre = b.titre
  AND a.chapitre IS NOT DISTINCT FROM b.chapitre
  AND a.created_at > b.created_at;

-- Vérification : doit renvoyer 0 lignes après exécution.
-- SELECT niveau, titre, chapitre, count(*) FROM cours
-- GROUP BY niveau, titre, chapitre HAVING count(*) > 1;
