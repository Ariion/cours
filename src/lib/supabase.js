import { createClient } from "@supabase/supabase-js";

// ⚙️ CONFIGURATION — remplacer par tes vraies valeurs Supabase
// Dashboard Supabase > Settings > API
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://VOTRE_PROJET.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "VOTRE_ANON_KEY";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
