-- ============================================
-- FIX — passe tous les comptes eleves existants en niveau 2nde
-- (ils etaient enregistres en "3e" par defaut, donc le contenu 2nde
-- -- cours et exercices sur les intervalles, vecteurs, etc. -- ne
-- s'affichait jamais pour eux : l'app filtre strictement par niveau).
-- A coller dans : Supabase > SQL Editor > New query
-- ============================================

UPDATE eleves SET niveau = '2nde' WHERE niveau = '3e';
