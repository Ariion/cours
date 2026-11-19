-- ============================================
-- FIX — politiques RLS admin désynchronisées
-- À coller dans : Supabase > SQL Editor > New query
-- ============================================
-- supabase-setup.sql a créé les policies "Admin full access" avec l'email
-- aardesign14@gmail.com, mais l'appli (src/App.jsx, ADMIN_EMAIL) vérifie
-- anthony.armand07@gmail.com. Si le compte admin dans Supabase Auth a été
-- créé avec anthony.armand07@gmail.com, la RLS bloque silencieusement
-- l'admin sur les tables eleves et cours (connexion OK, mais aucune
-- lecture/écriture ne passe). Ce script aligne les policies sur l'email
-- réellement utilisé par l'appli.

DROP POLICY IF EXISTS "Admin full access - eleves" ON eleves;
CREATE POLICY "Admin full access - eleves" ON eleves
  FOR ALL USING (auth.jwt() ->> 'email' = 'anthony.armand07@gmail.com');

DROP POLICY IF EXISTS "Admin full access - cours" ON cours;
CREATE POLICY "Admin full access - cours" ON cours
  FOR ALL USING (auth.jwt() ->> 'email' = 'anthony.armand07@gmail.com');

-- Vérifier ensuite dans Supabase > Authentication > Users qu'un compte
-- avec l'email anthony.armand07@gmail.com existe et est confirmé
-- (Auto Confirm User, ou un clic sur le lien de confirmation envoyé).
-- Si ce compte n'existe pas encore, créez-le là : Add user, email
-- anthony.armand07@gmail.com, mot de passe de ton choix, Auto Confirm User.
