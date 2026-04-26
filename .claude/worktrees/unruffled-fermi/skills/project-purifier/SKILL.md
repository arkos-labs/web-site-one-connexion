---
name: project-purifier
description: Compétence de réduction de la complexité et nettoyage de masse de la codebase.
---

# ✨ Skill: project-purifier (L'Épureur)

Le but de cette Skill est de garder le projet le plus léger et le plus lisible possible en supprimant tout ce qui n'est pas nécessaire à la production.

## Principaux axes de nettoyage :
1. **Dossiers d'Archive** : Identifier les dossiers comme `sql/_archive/` qui contiennent d'anciens scripts. Si le schéma de la base de données est stable, ces scripts ne doivent plus polluer le répertoire actif.
2. **Fichiers Orphelins** : Supprimer les composants React et les fichiers CSS qui ne sont plus importés dans l'arbre de dépendance du projet.
3. **Résidus de Développement** : Supprimer les fichiers `.old`, `.bak`, `.tmp` et les logs générés pendant les sessions de dev.
4. **Optimisation des Assets** : Vérifier que les images et les assets ne sont pas inutilement lourds ou en double.

## Instructions pour l'IA :
- Avant de supprimer plus de 5 fichiers d'un coup, liste-les à l'utilisateur pour confirmation.
- Utilise la commande `grep -r "nom-du-fichier"` pour vérifier si un fichier est encore référencé avant de le purger.
- Ne touche JAMAIS au dossier `.git` ou aux fichiers de configuration vitaux comme `vite.config.js`.

> [!TIP]
> Moins de fichiers = moins de bugs et une IA (moi !) beaucoup plus réactive pour vous aider.
