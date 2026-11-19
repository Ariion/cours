-- ============================================
-- SETUP + SEED — exercices (2nde), avec entrainement par chapitre
-- A coller dans : Supabase > SQL Editor > New query
-- Sur a relancer plusieurs fois pour la partie schema/policies ; la
-- partie INSERT ne doit etre lancee qu'UNE fois (sinon doublons, comme
-- pour supabase-seed-cours-2nde.sql).
-- ============================================

CREATE TABLE IF NOT EXISTS exercices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  titre TEXT NOT NULL,
  matiere TEXT NOT NULL DEFAULT 'Mathematiques',
  niveau TEXT NOT NULL,
  chapitre TEXT,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  publie BOOLEAN NOT NULL DEFAULT false,
  auteur_id UUID REFERENCES auth.users(id)
);
ALTER TABLE exercices ADD COLUMN IF NOT EXISTS matiere TEXT DEFAULT 'Mathematiques';
ALTER TABLE exercices ADD COLUMN IF NOT EXISTS chapitre TEXT;
ALTER TABLE exercices ADD COLUMN IF NOT EXISTS questions JSONB DEFAULT '[]'::jsonb;
ALTER TABLE exercices ADD COLUMN IF NOT EXISTS publie BOOLEAN DEFAULT false;

ALTER TABLE exercices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin full access - exercices" ON exercices;
CREATE POLICY "Admin full access - exercices" ON exercices
  FOR ALL USING (auth.jwt() ->> 'email' = 'anthony.armand07@gmail.com');

DROP POLICY IF EXISTS "Eleves read exercices publies" ON exercices;
CREATE POLICY "Eleves read exercices publies" ON exercices
  FOR SELECT USING (publie = true);

-- ============================================
-- SEED (une seule fois)
-- ============================================

INSERT INTO exercices (titre, matiere, niveau, chapitre, questions, publie) VALUES
('Intervalles et ensembles de nombres — entraînement', 'Mathématiques', '2nde', 'Intervalles et ensembles de nombres', $exJson1$[{"id": "i1", "type": "calcul", "difficulte": 1, "enonce": "Écris $2 \\leq x < 7$ à l'aide d'un intervalle.", "indices": ["Un crochet tourné vers le nombre l'inclut, vers l'extérieur l'exclut."], "verif": {"nombres": [2, 7], "mode": "ordre"}}, {"id": "i2", "type": "calcul", "difficulte": 1, "enonce": "Calcule $]-\\infty ; 1] \\cap [-3 ; 5]$.", "indices": ["Dessine les deux intervalles sur la même droite et regarde ce qui est commun aux deux."], "verif": {"nombres": [-3, 1], "mode": "ordre"}}, {"id": "i3", "type": "calcul", "difficulte": 2, "enonce": "Calcule $[1 ; 3] \\cup [2 ; 6]$.", "indices": ["La réunion, c'est tout ce qui est dans l'un OU l'autre."], "verif": {"nombres": [1, 6], "mode": "ordre"}}, {"id": "i4", "type": "redaction", "difficulte": 2, "enonce": "Pourquoi $[2 ; 5] \\cap [7 ; 9] = \\emptyset$ et pas $[5 ; 7]$ ? Explique.", "indices": ["Dessine les deux intervalles : y a-t-il un seul nombre commun aux deux ?"]}, {"id": "i5", "type": "redaction", "difficulte": 3, "enonce": "Donne, sous forme d'intervalle, l'ensemble des réels qui vérifient à la fois x ≥ −2 et x < 4.", "indices": ["C'est l'intersection de deux intervalles. Dessine-les sur la même droite avant de répondre."]}]$exJson1$, true),
('Valeur absolue et distance — entraînement', 'Mathématiques', '2nde', 'Valeur absolue et distance', $exJson2$[{"id": "va1", "type": "calcul", "difficulte": 1, "enonce": "Quelle est la distance entre −4 et 3 ?", "indices": ["d(a ; b) = |a − b|."], "verif": {"nombres": [7], "mode": "ordre"}}, {"id": "va2", "type": "calcul", "difficulte": 1, "enonce": "Résous $|x - 2| = 5$.", "indices": ["Les solutions sont les deux nombres à distance 5 de 2."], "verif": {"nombres": [-3, 7], "mode": "ensemble"}}, {"id": "va3", "type": "redaction", "difficulte": 2, "enonce": "Résous $|x + 3| \\leq 4$ et donne la solution sous forme d'intervalle.", "indices": ["Récris x + 3 en x − (−3) pour repérer le centre : c'est −3."]}, {"id": "va4", "type": "redaction", "difficulte": 3, "enonce": "Bonus, hors programme : résous $|x - 1| > 2$.", "indices": ["On cherche les x à distance strictement plus de 2 de 1."]}]$exJson2$, true),
('Inéquations du premier degré — entraînement', 'Mathématiques', '2nde', 'Inéquations du premier degré', $exJson3$[{"id": "e1", "type": "calcul", "difficulte": 1, "enonce": "Résous $-4x + 3 < 11$.", "indices": ["Isole d'abord −4x, puis divise par −4 : le sens de l'inégalité change."], "verif": {"nombres": [-2], "mode": "ordre"}}, {"id": "e2", "type": "calcul", "difficulte": 1, "enonce": "Résous $5x - 2 \\geq 3x + 6$.", "indices": ["Regroupe les x d'un côté, les nombres de l'autre."], "verif": {"nombres": [4], "mode": "ordre"}}, {"id": "e3", "type": "calcul", "difficulte": 2, "enonce": "Résous $4(x - 2) < 3x + 5$.", "indices": ["Développe d'abord le membre de gauche."], "verif": {"nombres": [13], "mode": "ordre"}}, {"id": "e4", "type": "redaction", "difficulte": 3, "enonce": "Résous la double inégalité $-3 < 2x + 1 \\leq 7$.", "indices": ["Retire 1 partout d'abord, puis divise par 2 — les trois morceaux en même temps."]}, {"id": "e5", "type": "redaction", "difficulte": 3, "enonce": "Pour $2x + 1 \\geq 5x - 8$, vérifie ta solution avec deux valeurs test : une dans la solution, une en dehors.", "indices": ["Teste x = 0 et x = 4, remplace dans l'inégalité de départ, et regarde si c'est cohérent avec ta solution."]}]$exJson3$, true),
('Vecteurs : coordonnées, norme, colinéarité — entraînement', 'Mathématiques', '2nde', 'Vecteurs dans le plan', $exJson4$[{"id": "v1", "type": "calcul", "difficulte": 1, "enonce": "A(1 ; 2) et B(4 ; 6). Donne les coordonnées de $\\overrightarrow{AB}$.", "indices": ["Arrivée moins départ : (x_B − x_A ; y_B − y_A)."], "verif": {"nombres": [3, 4], "mode": "ordre"}}, {"id": "v2", "type": "calcul", "difficulte": 1, "enonce": "Un vecteur a pour coordonnées (3 ; 4). Calcule sa norme.", "indices": ["$\\|\\vec{u}\\| = \\sqrt{x^2+y^2}$", "Le triangle 3-4-5 donne un résultat entier."], "verif": {"nombres": [5], "mode": "ordre"}}, {"id": "v3", "type": "calcul", "difficulte": 2, "enonce": "A(2 ; −3) et B(−4 ; 1). Donne les coordonnées du milieu de [AB].", "indices": ["Fais la moyenne de chaque coordonnée séparément."], "verif": {"nombres": [-1, -1], "mode": "ordre"}}, {"id": "v4", "type": "calcul", "difficulte": 2, "enonce": "C(−2 ; 4) et D(1 ; −3). Donne les coordonnées de $\\overrightarrow{CD}$.", "indices": ["Attention aux deux signes négatifs : x_D − x_C = 1 − (−2)."], "verif": {"nombres": [3, -7], "mode": "ordre"}}, {"id": "v5", "type": "redaction", "difficulte": 3, "enonce": "$\\vec{u}$ a pour coordonnées (2 ; 4) et $\\vec{v}$ (1 ; 2). Ces deux vecteurs sont-ils colinéaires ? Justifie.", "indices": ["det(u, v) = xy′ − x′y.", "Nul ⟺ colinéaires."]}, {"id": "v6", "type": "redaction", "difficulte": 3, "enonce": "A(−2 ; −1), B(2 ; −3), C(−4 ; 4), D(6 ; −1). Les droites (AB) et (CD) sont-elles parallèles ? Justifie à l'aide d'un déterminant.", "indices": ["Calcule d'abord $\\overrightarrow{AB}$ et $\\overrightarrow{CD}$.", "det(u, v) = xy′ − x′y ; nul si et seulement si les vecteurs sont colinéaires."]}]$exJson4$, true);
