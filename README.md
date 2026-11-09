# StudyFlow

**StudyFlow** est une application web React (PWA) pour organiser ses devoirs et ses révisions, planifier son travail et suivre ses notes.

Elle classe les travaux par priorité d'apprentissage et génère un plan adapté au temps disponible.

---

## ✨ Fonctionnalités

### Compte & authentification locale
- Création de compte et connexion sans serveur. Chaque compte dispose de ses propres données sur l'appareil.
- Les mots de passe sont dérivés avec **PBKDF2-SHA256** (210 000 itérations et sel aléatoire) ; ils ne sont pas stockés en clair.
- Session expirant après 30 jours (« rester connecté ») ou 12 heures.
- Un nouveau compte contient trois matières par défaut, sans devoir ni note. Le mot de passe peut être modifié et le compte supprimé.

### Tableau de bord
- Vue d'ensemble : travaux à faire, charge de la semaine, retards, progression.
- **Priorité du moment** avec explication du score sur 100.
- **Coach du jour** : conseils personnalisés (retards, échéances proches, matière fragile…).
- Aperçu des 7 prochains jours et du plan conseillé.

### Moyenne générale protégée
- Par défaut, la moyenne générale est masquée ; les moyennes par matière restent visibles.
- L'élève peut la révéler ou la masquer. Son choix est mémorisé dans ses réglages.

### Devoirs & contrôles
- Devoir, interrogation, contrôle, projet, oral.
- Matière, échéance, temps estimé, difficulté (1–5), statut, notes.
- Score de priorité sur 100 + niveau (critique / haute / moyenne / basse).
- Filtres (statut, matière, type), recherche et tris (priorité, échéance, durée, matière).

### Planning
- **Session du jour** générée automatiquement : créneaux horaires, pauses de 5 min, tâches reportées si le temps manque.
- **Plan de révision ciblé** : sessions réparties dans le temps (répétition espacée) pour une évaluation.
- Agenda des 7 prochains jours.

### Notes
- Notes sur 20, 10, 40 ou 100, avec coefficient par évaluation.
- Moyenne par matière, moyenne générale pondérée (à la demande), mentions, objectif, meilleure matière / matière à consolider.
- Tableau filtrable et triable, ajout / modification / suppression.

### Export du tableau de notes
- Export en **Excel (.xlsx)**, **Word (.docx)** ou **PDF**, avec synthèse par matière et détail des évaluations.
- Excel et Word sont modifiables ; le PDF est prêt à imprimer.
- La moyenne générale n'est incluse que si elle a été révélée ; sinon, l'export l'indique comme non révélée.
- Les bibliothèques d'export sont chargées à la demande.

### Matières
- Coefficients, professeurs, couleur, moyenne, charge à venir, prochain travail.

### Guide & méthode
- Plan d'action personnalisé.
- Explication du calcul de priorité.
- Méthode en 4 étapes et techniques d'apprentissage (rappel actif, répétition espacée, Pomodoro, Feynman…).

### Réinitialiser son espace
- Dans **Réglages**, cette action efface les travaux, notes et matières, puis restaure les matières par défaut. Le compte et les préférences sont conservés.

### Sauvegardes intégrées au profil
- Sauvegardes nommées dans le profil, avec date et nombre de travaux, notes et matières ; restauration et suppression depuis les réglages.
- Jusqu'à 12 sauvegardes par compte. StudyFlow tente de créer une copie de sécurité avant une restauration.

### PWA (application installable)
- **Manifest** et **service worker** pour l'installation sur ordinateur et mobile (sur iOS, via « Sur l'écran d'accueil »).
- L'application est utilisable hors ligne après son premier chargement. Les polices Google Fonts peuvent nécessiter une connexion.
- Bouton d'installation et instructions adaptées dans **Réglages → Installer l'application**.
- Thème clair / sombre, interface responsive (mobile, tablette, ordinateur).

---

## 🚀 Démarrage

```bash
npm install
npm run dev
```

Ouvrez ensuite http://localhost:5173, puis créez votre compte local.

### Build de production

```bash
npm run build
npm run preview
```

Le dossier `dist/` est prêt à être déployé sur **Cloudflare Pages**, Vercel, Netlify, GitHub Pages ou un serveur statique. L'installation PWA et le mode hors ligne nécessitent **HTTPS** ou `localhost`.

---

## 🔐 Sécurité & confidentialité

- Aucun backend : les comptes, travaux, notes et sauvegardes restent dans le `localStorage` du navigateur. Les polices sont chargées depuis Google Fonts.
- Le mot de passe n'est jamais stocké : seule sa dérivation PBKDF2-SHA256 (avec sel et itérations) est conservée.
- Les données ne sont pas chiffrées au repos : il s'agit d'une authentification **locale**, adaptée à un usage personnel sur un appareil de confiance.
- Supprimer le compte efface le compte, ses données et ses sauvegardes de l'appareil.

---

## 🧱 Stack

- **React 18**
- **Vite 8** (+ plugin maison d'injection des assets dans le service worker)
- CSS moderne (variables, `color-mix`, grid, responsive) — aucune dépendance UI
- **write-excel-file** (Excel), **docx** (Word), **jsPDF + autoTable** (PDF), chargés dynamiquement
- Aucun backend : persistance via `localStorage`
- Web Crypto API pour l'authentification

---

## 🗂 Structure

```
public/
├─ manifest.webmanifest   # métadonnées PWA
├─ sw.js                  # service worker (hors ligne)
└─ icons/                 # icônes installables (192, 512, maskable, Apple)
src/
├─ components/            # UI partagée, formulaires, réglages
├─ data/seed.js           # matières par défaut et réglages initiaux
├─ lib/                   # priorités, moyennes, planning, coach, auth, sauvegardes
├─ pages/                 # AuthScreen, Dashboard, Tasks, Planning, Grades, Subjects, Guide
├─ store/                 # AuthStore (comptes) + StudyStore (données par compte)
├─ App.jsx
├─ main.jsx
└─ styles.css
```

---

## 📐 Calcul de la priorité

| Critère | Poids |
| --- | --- |
| Échéance | 40 % |
| Type de travail | 20 % |
| Difficulté ressentie | 14 % |
| Moyenne de la matière | 12 % |
| Coefficient de la matière | 8 % |
| Charge estimée | 6 % |

Le score obtenu (0–100) détermine le niveau de priorité et l'ordre des travaux dans le tableau de bord et le planning.

---

## 📄 Licence

Projet personnel. Aucune licence n'est définie dans le dépôt.
