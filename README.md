# StudyFlow

**StudyFlow** est une application web React qui aide un élève à organiser ses devoirs, ses interrogations et ses révisions — puis à suivre ses notes.

L'application classe automatiquement les travaux par **priorité d'apprentissage** (échéance, type d'évaluation, difficulté, moyenne de la matière, coefficient, charge de travail) et génère un **plan de travail réaliste** adapté au temps disponible.

---

## ✨ Fonctionnalités

### Tableau de bord
- Vue d'ensemble : travaux à faire, charge de la semaine, retards, moyenne générale.
- **Priorité du moment** avec explication du score sur 100.
- **Coach du jour** : conseils personnalisés (retards, échéances proches, matière fragile…).
- Aperçu des 7 prochains jours et du plan conseillé.

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
- Moyenne par matière et **moyenne générale pondérée** par coefficient de matière.
- Mentions, objectif de moyenne, meilleure matière / matière à consolider.
- Tableau filtrable et triable, ajout / modification / suppression.

### Matières
- Coefficients, professeurs, couleur, moyenne, charge à venir, prochain travail.

### Guide & méthode
- Plan d'action personnalisé.
- Explication du calcul de priorité.
- Méthode en 4 étapes et techniques d'apprentissage (rappel actif, répétition espacée, Pomodoro, Feynman…).

### Autres
- 100 % **local-first** : les données restent dans le navigateur (`localStorage`).
- Thème clair / sombre.
- Export / import JSON, réinitialisation, profil et objectif.
- Interface responsive (mobile, tablette, ordinateur).

---

## 🚀 Démarrage

```bash
npm install
npm run dev
```

Ouvrez ensuite http://localhost:5173.

### Build de production

```bash
npm run build
npm run preview
```

---

## 🧱 Stack

- **React 18**
- **Vite 5**
- CSS moderne (variables, `color-mix`, grid, responsive) — aucune dépendance UI
- Aucun backend : persistance via `localStorage`

---

## 🗂 Structure

```
src/
├─ components/     # UI partagée, sidebar, formulaires, cartes de tâches
├─ data/seed.js    # données de démonstration (dates relatives)
├─ lib/            # calcul des priorités, moyennes, planning, coach
├─ pages/          # Dashboard, Tasks, Planning, Grades, Subjects, Guide
├─ store/          # contexte + reducer, sélecteurs dérivés
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

Projet personnel — utilisation libre.
