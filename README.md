# 🚀 One Connexion - Plateforme de Livraison

## 📋 À propos du projet

**One Connexion** est une plateforme complète de gestion de livraisons avec :
- 👥 Gestion multi-rôles (Admin, Client, Chauffeur)
- 📦 Suivi des commandes en temps réel
- 💰 Gestion des factures
- 📊 Statistiques et analytics
- 💬 Système de messagerie intégré

---

## ⚡ Démarrage Rapide

### 1️⃣ Installation

```bash
# Installer les dépendances
npm install

# Vérifier l'environnement
npm run check
```

### 2️⃣ Lancer le projet

```bash
# Lancer le serveur de développement
npm run dev
```

Le projet sera accessible sur **http://localhost:5173**

---

## 📁 Structure du Projet

```
├── src/
│   ├── components/        # Composants réutilisables
│   │   ├── admin/        # Composants admin
│   │   ├── client/       # Composants client
│   │   └── ui/           # Composants UI (shadcn)
│   ├── pages/            # Pages de l'application
│   │   ├── admin/        # Pages admin
│   │   ├── client/       # Pages client
│   │   └── public/       # Pages publiques
│   └── hooks/            # Hooks React personnalisés
└── .env                  # Variables d'environnement
```

---

## 🔧 Configuration

Veuillez mettre en place votre propre système de backend.

---

## 🎨 Technologies Utilisées

- **Frontend :**
  - React 18
  - TypeScript
  - Vite
  - Tailwind CSS
  - shadcn/ui
  - Framer Motion

- **Autres :**
  - React Router
  - React Query
  - Recharts (graphiques)

---

## 📚 Documentation

### 🆕 Correctifs et Déploiement (Nov 2025)
| Document | Description |
|----------|-------------|
| [**DEMARRAGE_RAPIDE.md**](./DEMARRAGE_RAPIDE.md) | ⚡ **Démarrage en 3 étapes** |
| [GUIDE_DEPLOIEMENT_FIXES.md](./GUIDE_DEPLOIEMENT_FIXES.md) | 📖 Guide complet d'installation des correctifs |
| [RECAPITULATIF_CORRECTIFS.md](./RECAPITULATIF_CORRECTIFS.md) | 📊 Résumé détaillé des changements |
| [LISTE_FICHIERS.md](./LISTE_FICHIERS.md) | 📋 Structure complète du projet |

### Configuration Supabase
| Document | Description |
|----------|-------------|
| [complete_database_schema.sql](./complete_database_schema.sql) | ⭐ Schéma DB complet (à exécuter en premier) |
| [fix_rls_policies_complete.sql](./fix_rls_policies_complete.sql) | ⭐ Policies RLS (à exécuter en second) |
| [migration_donnees_existantes.sql](./migration_donnees_existantes.sql) | Migration données existantes (optionnel) |

### Autres Guides
| Document | Description |
|----------|-------------|
| [README_ADMIN.md](./README_ADMIN.md) | Guide administrateur |

---

## 🚀 Commandes Disponibles

```bash
# Développement
npm run dev              # Lancer le serveur de développement

# Build
npm run build           # Build pour la production
npm run build:dev       # Build en mode développement

# Vérifications
npm run check           # Vérifier l'environnement
npm run lint            # Linter le code

# Preview
npm run preview         # Prévisualiser le build de production
```

---

## 👥 Rôles et Accès

### Admin
- Dashboard complet
- Gestion des commandes
- Gestion des chauffeurs
- Gestion des clients
- Statistiques avancées
- Gestion des factures

### Client
- Dashboard personnel
- Création de commandes
- Suivi des livraisons
- Consultation des factures
- Messagerie

### Chauffeur
- Commandes assignées
- Mise à jour de statut
- Géolocalisation

---

## 🔐 Sécurité

- Authentification personnalisée requise
- Politiques de sécurité par rôle
- Variables d'environnement sécurisées
- Validation des données côté serveur

---

## 🆘 Dépannage

Pour toute question ou problème :
1. Consultez la documentation dans les fichiers `.md`
2. Exécutez `npm run check` pour diagnostiquer

---

## 📞 Support

Pour toute question ou problème :
1. Consultez la documentation
2. Vérifiez la section Dépannage

---

## 📄 Licence

Ce projet est privé et propriétaire.

---

**Développé avec ❤️ pour One Connexion**
