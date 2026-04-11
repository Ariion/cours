-- ============================================
-- SCRIPT SQL — cours.vercel.app
-- À coller dans : Supabase > SQL Editor > New query
-- ============================================

-- Table des élèves
CREATE TABLE IF NOT EXISTS eleves (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  email TEXT NOT NULL UNIQUE,
  nom TEXT NOT NULL,
  niveau TEXT NOT NULL DEFAULT '6e',
  matieres TEXT[] DEFAULT '{}',
  actif BOOLEAN DEFAULT true,
  mot_de_passe_temp TEXT
);

-- Table des cours
CREATE TABLE IF NOT EXISTS cours (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  titre TEXT NOT NULL,
  matiere TEXT NOT NULL,
  niveau TEXT NOT NULL,
  chapitre TEXT,
  contenu TEXT,  -- JSON stringifié des blocs
  publie BOOLEAN DEFAULT false,
  est_exercice BOOLEAN DEFAULT false,
  auteur_id UUID REFERENCES auth.users(id)
);

-- RLS (Row Level Security)
ALTER TABLE eleves ENABLE ROW LEVEL SECURITY;
ALTER TABLE cours ENABLE ROW LEVEL SECURITY;

-- Politique : admin peut tout voir (remplacer l'email)
CREATE POLICY "Admin full access - eleves" ON eleves
  FOR ALL USING (auth.jwt() ->> 'email' = 'aardesign14@gmail.com');

CREATE POLICY "Admin full access - cours" ON cours
  FOR ALL USING (auth.jwt() ->> 'email' = 'aardesign14@gmail.com');

-- Politique : élèves voient uniquement les cours publiés
CREATE POLICY "Eleves read cours publiés" ON cours
  FOR SELECT USING (publie = true);

-- Politique : élèves voient leur propre profil
CREATE POLICY "Eleves see own profile" ON eleves
  FOR SELECT USING (email = auth.jwt() ->> 'email');

-- ============================================
-- EXEMPLE : créer un compte admin manuellement
-- Dashboard > Authentication > Users > Add user
-- Email : anthony.armand07@gmail.com
-- ============================================
