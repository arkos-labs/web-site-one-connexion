---
name: brand-police
description: Surveillance de la cohérence visuelle et du design system "Premium".
---

# 🎨 Skill: brand-police

Cette compétence est le gardien de l'image de marque de "One Connexion".

## Objectifs
1. **Design System** : Utiliser exclusivement la palette de couleurs officielle.
2. **Typographie** : Appliquer systématiquement les polices `Archivo` et `Loos Wide`.

## Instructions
- **Couleur Primaire (Orange)** : `#ed5518`.
- **Fonds (Dark Mode)** : Utiliser les dégradés et les effets de verre (Glassmorphism) définis dans `tailwind.config.ts`.
- **Analyse du Design** : Avant de valider une UI, vérifie qu'elle n'utilise pas de couleurs génériques (blue-500, red-600) mais bien les tokens de la marque.

## Vérification UI
- Inspecter les fichiers CSS pour s'assurer qu'aucun style "ad-hoc" n'est utilisé.
- Privilégier les composants réutilisables du projet.

> [!CAUTION]
> Un design qui semble "basique" ou "MVP" est un échec. Utilise des micro-animations et des transitions fluides pour un rendu haut de gamme.
