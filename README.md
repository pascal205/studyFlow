# StudyFlow

**StudyFlow** est une application web React (PWA) qui aide un élève à organiser ses devoirs, ses interrogations et ses révisions — puis à suivre ses notes.

L'application classe automatiquement les travaux par **priorité d'apprentissage** (échéance, type d'évaluation, difficulté, moyenne de la matière, coefficient, charge de travail) et génère un **plan de travail réaliste** adapté au temps disponible.

---

## ✨ Fonctionnalités

### Compte & authentification locale
- **Création de compte** (nom, e-mail, mot de passe) et **connexion** réelles, sans serveur.
- Mots de passe dérivés avec **PBKDF2-SHA256** (210 000 itérations, sel aléatoire) : aucun mot de passe en clair n'est stocké.
- Session persistante avec expiration (« rester connecté » 30 jours, sinon 12 h).
- **Un espace de données isolé par compte** : deux élèves sur le même appareil ne voient pas leurs travaux respectifs.
- **Nouveau compte = espace vierge** : seules trois matières par défaut (Mathématiques, Français, Anglais) sont créées — aucun devoir, aucune note, aucune statistique inventée. L'élève ajoute ensuite ses propres données.
- Changement de mot de passe et suppression définitive du compte (avec confirmation par mot de passe).
- Tout fonctionne hors ligne, sur `localhost` comme en HTTPS.

### Tableau de bord
- Vue d'ensemble : travaux à faire, charge de la semaine, retards, progression.
- **Priorité du moment** avec explication du score sur 100.
- **Coach du jour** : conseils personnalisés (retards, échéances proches, matière fragile…).
- Aperçu des 7 prochains jours et du plan conseillé.

### Moyenne générale protégée
- Par défaut, la **moyenne générale n'est pas affichée** (ni dans le tableau de bord, ni dans la barre latérale, ni dans le guide).
- Les **moyennes par matière**, les notes et les statistiques restent visibles.
- L'élève décide de la découvrir : un bouton **« Révéler ma moyenne »** lance une courte animation de calcul, puis affiche le résultat. Un lien « Masquer ma moyenne » permet de revenir en arrière.
- Le choix est mémorisé sur le compte.

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

### Matières
- Coefficients, professeurs, couleur, moyenne, charge à venir, prochain travail.

### Guide & méthode
- Plan d'action personnalisé.
- Explication du calcul de priorité.
- Méthode en 4 étapes et techniques d'apprentissage (rappel actif, répétition espacée, Pomodoro, Feynman…).

### Réinitialiser son espace
- Depuis **Réglages → Réinitialiser mon espace** : efface travaux, notes et matières, puis restaure les matières par défaut, tout en conservant le compte et les préférences.

### Sauvegardes intégrées au profil
- Création de **sauvegardes nommées directement dans l'espace profil** (aucun fichier à retrouver sur l'ordinateur).
- Liste des sauvegardes (date, nombre de travaux, notes et matières), **restauration en un clic** et suppression.
- Une sauvegarde de sécurité « Avant restauration » est créée automatiquement pour pouvoir revenir en arrière.
- Jusqu'à 12 sauvegardes par compte.

### PWA (application installable)
- **Manifest** + **service worker** : installation sur ordinateur (Chrome/Edge) et mobile (Android, iOS via « Sur l'écran d'accueil »).
- Fonctionne **hors ligne** après la première visite (app shell + assets pré-cachés).
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

Le dossier `dist/` est prêt à être déployé tel quel (Vercel, Netlify, GitHub Pages, serveur statique). L'installation PWA et le mode hors ligne nécessitent **HTTPS** ou `localhost`.

---

## 🔐 Sécurité & confidentialité

- Aucun serveur, aucune requête vers un backend : les comptes, travaux, notes et sauvegardes restent dans le `localStorage` du navigateur.
- Le mot de passe n'est jamais stocké : seule sa dérivation PBKDF2-SHA256 (avec sel et itérations) est conservée.
- Les données ne sont pas chiffrées au repos : il s'agit d'une authentification **locale**, adaptée à un usage personnel sur un appareil de confiance.
- Supprimer le compte efface le compte, ses données et ses sauvegardes de l'appareil.

---

## 🧱 Stack

- **React 18**
- **Vite 5** (+ plugin maison d'injection des assets dans le service worker)
- CSS moderne (variables, `color-mix`, grid, responsive) — aucune dépendance UI
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

Projet personnel — utilisation libre.
