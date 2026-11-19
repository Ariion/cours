-- ============================================
-- SETUP — banque de photos + messagerie élève ↔ admin
-- À coller dans : Supabase > SQL Editor > New query
-- ============================================
-- eleve_id référence auth.users(id) (l'UID de connexion), pas eleves.id :
-- même convention que la table "soumissions" déjà utilisée par
-- ExerciceView.jsx (eleve_id = l'UID, eleve_nom/eleve_email dénormalisés
-- pour ne pas avoir à rejoindre la table eleves côté admin).

-- Lien eleves <-> auth.users, pour que l'admin puisse ouvrir une
-- conversation avec un élève avant même qu'il ait envoyé quoi que ce
-- soit (sans ça, on ne connaît son UID que le jour où il envoie un
-- message ou une photo, puisqu'il est dénormalisé depuis la session).
ALTER TABLE eleves ADD COLUMN IF NOT EXISTS auth_id UUID REFERENCES auth.users(id);
UPDATE eleves e SET auth_id = u.id
FROM auth.users u
WHERE u.email = e.email AND e.auth_id IS NULL;

-- Table envois : photos que l'élève envoie (exercice fait, pas compris,
-- demandé par le prof, ou autre chose) — une ligne par photo.
CREATE TABLE IF NOT EXISTS envois (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  eleve_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  eleve_nom TEXT,
  eleve_email TEXT,
  type TEXT NOT NULL DEFAULT 'autre',       -- repondu | bloque | demande | autre
  note TEXT,
  image_url TEXT NOT NULL,
  statut TEXT NOT NULL DEFAULT 'nouveau'    -- nouveau | vu | traite
);

-- Table messages : messagerie simple élève <-> admin.
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  eleve_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  eleve_nom TEXT,
  expediteur TEXT NOT NULL,                 -- 'eleve' | 'admin'
  contenu TEXT NOT NULL,
  lu BOOLEAN NOT NULL DEFAULT false
);

ALTER TABLE envois ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Admin : accès complet (même email que les autres policies admin).
CREATE POLICY "Admin full access - envois" ON envois
  FOR ALL USING (auth.jwt() ->> 'email' = 'anthony.armand07@gmail.com');
CREATE POLICY "Admin full access - messages" ON messages
  FOR ALL USING (auth.jwt() ->> 'email' = 'anthony.armand07@gmail.com');

-- Élève : ne voit et n'écrit que ses propres envois / messages.
CREATE POLICY "Eleve read own envois" ON envois
  FOR SELECT USING (auth.uid() = eleve_id);
CREATE POLICY "Eleve insert own envois" ON envois
  FOR INSERT WITH CHECK (auth.uid() = eleve_id);

CREATE POLICY "Eleve read own messages" ON messages
  FOR SELECT USING (auth.uid() = eleve_id);
CREATE POLICY "Eleve insert own messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = eleve_id AND expediteur = 'eleve');
CREATE POLICY "Eleve update own messages" ON messages
  FOR UPDATE USING (auth.uid() = eleve_id) WITH CHECK (auth.uid() = eleve_id);

-- Live : les nouveaux messages apparaissent sans recharger la page.
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE messages;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

-- Bucket de stockage pour les photos, public en lecture (l'URL seule ne
-- suffit pas à deviner les autres fichiers, mais ce n'est pas un stockage
-- confidentiel — cohérent avec le reste de l'appli, ex. mot_de_passe_temp
-- en clair dans la table eleves).
INSERT INTO storage.buckets (id, name, public)
VALUES ('envois', 'envois', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated upload envois bucket" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'envois');
CREATE POLICY "Public read envois bucket" ON storage.objects
  FOR SELECT USING (bucket_id = 'envois');
