---
name: quality-guard
description: Automatisation des vérifications de qualité de code (TypeScript, Linting).
---

# 🛡️ Skill: quality-guard

Cette compétence permet de maintenir une base de code saine en automatisant les vérifications techniques.

## Objectifs
1. **Zéro Erreur TypeScript** : S'assurer que le projet compile sans erreurs de type.
2. **Linting Strict** : Appliquer les règles ESLint pour un code propre et lisible.

## Instructions
- Avant toute modification de fichier, utilise `run_command` pour vérifier les types :
  `npx tsc --noEmit`
- Exécute le linting pour détecter les mauvaises pratiques :
  `npm run lint`

## Scripts Associés
- `check:types` : Lance le compilateur TS en mode vérification.
- `check:lint` : Lance ESLint sur tout le projet.

> [!TIP]
> Si des erreurs TypeScript apparaissent après une modification, corrige-les immédiatement avant de passer à la tâche suivante. Ne laisse jamais de "dette technique" s'accumuler.
