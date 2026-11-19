-- ============================================
-- SETUP — messagerie élève ↔ admin avec photos
-- À coller dans : Supabase > SQL Editor > New query
-- Sûr à relancer plusieurs fois (chaque étape vérifie si c'est déjà fait).
-- ============================================
-- eleve_id référence auth.users(id) (l'UID de connexion), pas eleves.id :
-- même convention que la table "soumissions" déjà utilisée par
-- ExerciceView.jsx (eleve_id = l'UID, eleve_nom dénormalisé pour ne pas
-- avoir à rejoindre la table eleves côté admin).

-- Lien eleves <-> auth.users, pour que l'admin puisse ouvrir une
-- conversation avec un élève avant même qu'il ait écrit quoi que ce
-- soit (sans ça, on ne connaît son UID que le jour où il envoie un
-- premier message, puisqu'il est dénormalisé depuis sa session).
ALTER TABLE eleves ADD COLUMN IF NOT EXISTS auth_id UUID REFERENCES auth.users(id);
UPDATE eleves e SET auth_id = u.id
FROM auth.users u
WHERE u.email = e.email AND e.auth_id IS NULL;

-- Table messages : chat élève <-> admin, avec photo en pièce jointe
-- optionnelle (texte seul, photo seule, ou les deux).
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  eleve_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  eleve_nom TEXT,
  expediteur TEXT NOT NULL,                 -- 'eleve' | 'admin'
  contenu TEXT,
  image_url TEXT,
  lu BOOLEAN NOT NULL DEFAULT false
);
ALTER TABLE messages ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE messages ALTER COLUMN contenu DROP NOT NULL;

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Admin : accès complet (même email que les autres policies admin).
DROP POLICY IF EXISTS "Admin full access - messages" ON messages;
CREATE POLICY "Admin full access - messages" ON messages
  FOR ALL USING (auth.jwt() ->> 'email' = 'anthony.armand07@gmail.com');

-- Élève : ne voit et n'écrit que ses propres messages.
DROP POLICY IF EXISTS "Eleve read own messages" ON messages;
CREATE POLICY "Eleve read own messages" ON messages
  FOR SELECT USING (auth.uid() = eleve_id);

DROP POLICY IF EXISTS "Eleve insert own messages" ON messages;
CREATE POLICY "Eleve insert own messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = eleve_id AND expediteur = 'eleve');

DROP POLICY IF EXISTS "Eleve update own messages" ON messages;
CREATE POLICY "Eleve update own messages" ON messages
  FOR UPDATE USING (auth.uid() = eleve_id) WITH CHECK (auth.uid() = eleve_id);

-- Live : les nouveaux messages apparaissent sans recharger la page.
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE messages;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

-- Bucket de stockage pour les photos envoyées dans le chat, public en
-- lecture (l'URL seule ne suffit pas à deviner les autres fichiers,
-- mais ce n'est pas un stockage confidentiel — cohérent avec le reste
-- de l'appli, ex. mot_de_passe_temp en clair dans la table eleves).
INSERT INTO storage.buckets (id, name, public)
VALUES ('envois', 'envois', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Authenticated upload envois bucket" ON storage.objects;
CREATE POLICY "Authenticated upload envois bucket" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'envois');

DROP POLICY IF EXISTS "Public read envois bucket" ON storage.objects;
CREATE POLICY "Public read envois bucket" ON storage.objects
  FOR SELECT USING (bucket_id = 'envois');

-- Nettoyage : si tu avais lancé une version précédente de ce fichier qui
-- créait une table "envois" séparée (banque de photos hors conversation),
-- elle n'est plus utilisée par l'appli. Vide, tu peux la supprimer :
-- DROP TABLE IF EXISTS envois;
