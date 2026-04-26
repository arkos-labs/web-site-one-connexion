---
name: supabase-toolkit
description: Gestion automatisée des migrations et de la synchronisation de la base de données Supabase.
---

# ⚡ Skill: supabase-toolkit

Cette compétence gère la communication entre le code et la base de données.

## Objectifs
1. **Migrations SQL** : Appliquer les nouvelles structures de tables via le dossier `supabase/migrations`.
2. **Type Safety** : Générer les types TypeScript à partir de la structure de données réelle.

## Instructions
- Pour toute modification de schéma, crée un nouveau fichier SQL dans `supabase/migrations`.
- Utilise la CLI Supabase (si installée) pour synchroniser :
  `supabase gen types typescript --local > src/types/supabase.ts`
- Toujours vérifier les politiques RLS (Row Level Security) lors de la création d'une nouvelle table.

## Scripts Associés
- `db:migrate` : Applique les scripts SQL en attente.
- `db:types` : Met à jour les types TypeScript de la base de données.

> [!IMPORTANT]
> Ne fais jamais de modifications directes ("Hotfixes") via l'interface web de Supabase sans les reporter dans un script de migration SQL ici. La cohérence entre le code et la DB est la clé d'un projet sans bug.
