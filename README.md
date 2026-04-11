# cours.vercel.app — Espace pédagogique privé

Plateforme de cours privée avec connexion élèves, panel admin, et éditeur mathématique.

## Stack technique
- **React + Vite** — Frontend
- **Supabase** — Auth + Base de données
- **KaTeX** — Rendu mathématique (fractions, racines, Δ, etc.)
- **Vercel** — Hébergement

---

## Installation en 4 étapes

### 1. Supabase — Créer le projet
1. Aller sur [supabase.com](https://supabase.com) → Nouveau projet
2. Aller dans **SQL Editor** → coller le contenu de `supabase-setup.sql` → Run
3. Aller dans **Settings > API** → copier `URL` et `anon key`

### 2. Variables d'environnement
```bash
cp .env.example .env
# Remplir avec tes valeurs Supabase
```

### 3. Lancer en local
```bash
npm install
npm run dev
```

### 4. Déployer sur Vercel
```bash
npm install -g vercel
vercel
# Ajouter les variables d'env dans le dashboard Vercel
```

---

## Créer le compte admin
Dans Supabase > **Authentication > Users > Add user** :
- Email : `aardesign14@gmail.com`  
- Password : ton mot de passe
- ✅ Auto Confirm User

---

## Créer un élève (depuis l'interface admin)
1. Se connecter avec le compte admin
2. Onglet **+ Nouvel élève**
3. Remplir nom, email, niveau, matières
4. → Un mot de passe temporaire est généré
5. Donner à l'élève : email + mot de passe temporaire

---

## Éditeur de cours — Blocs disponibles
| Bloc | Usage |
|------|-------|
| Texte | Paragraphe avec maths inline `$formule$` |
| Formule | Formule mathématique centrée (LaTeX) |
| Définition | Encadré bleu — définition officielle |
| Théorème | Encadré orange — théorèmes |
| Exemple | Encadré vert — exemples résolus |
| Remarque | Encadré jaune — notes importantes |
| Méthode | Encadré rose — méthodes à retenir |

### Syntaxe mathématique (KaTeX)
```
\frac{-b + \sqrt{\Delta}}{2a}    → fraction avec racine
x^{2}                             → puissance
\Delta                            → delta majuscule
\times                            → signe ×
\leq  \geq                        → ≤ ≥
\mathbb{R}                        → ℝ
\vec{u}                           → vecteur u
```

---

## Structure des fichiers
```
src/
├── App.jsx              — Routage principal + auth
├── main.jsx             — Point d'entrée
├── lib/
│   └── supabase.js      — Client Supabase
├── pages/
│   ├── Login.jsx        — Page de connexion
│   ├── Admin.jsx        — Panel administrateur
│   ├── CoursEditor.jsx  — Éditeur de cours
│   └── EleveHome.jsx    — Vue élève
└── components/
    └── MathRenderer.jsx — Rendu KaTeX
```
