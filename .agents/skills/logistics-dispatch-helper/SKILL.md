---
name: logistics-dispatch-helper
description: Propose des attributions de chauffeurs basées sur la proximité GPS pour approbation admin.
---

# Logistics Dispatch Helper

Ce skill permet à l'agent d'aider l'administrateur à assigner des commandes aux livreurs les plus proches.

## 🛠️ Instructions pour l'Agent
1. **Identification de la commande** : Lorsqu'un utilisateur demande de l'aide pour assigner une commande (ex: "Qui est le plus proche pour la commande #123 ?"), récupérez les coordonnées GPS de destination de cette commande dans la table `orders`.
2. **Localisation des livreurs** : Récupérez la position actuelle de tous les livreurs actifs (profils avec `role = 'courier'`) dans la table `profiles`.
3. **Calcul de proximité** : Utilisez le script `scripts/distance.js` pour calculer la distance entre la commande et chaque livreur.
4. **Recommandation** : Présentez une liste triée des 3 livreurs les plus proches. 
    > [!IMPORTANT]
    > Vous ne devez **JAMAIS** modifier la table `orders` pour assigner le livreur automatiquement. Vous devez demander : "Souhaitez-vous que j'assigne [Nom du Livreur] à cette commande ?"
5. **Action après approbation** : Si l'utilisateur accepte, effectuez l'update SQL vers la table `orders` pour mettre à jour le `driver_id` ou le champ correspondant.

## 🧱 Structure des Données
- **Table `orders`** : `id`, `pickup_latitude`, `pickup_longitude`, `status`, `driver_id`.
- **Table `profiles`** : `id`, `full_name`, `last_latitude`, `last_longitude`, `role`.

## 🧮 Scripts Utilitaires
- `scripts/distance.js` : Export la fonction `calculateDistance(lat1, lon1, lat2, lon2)`.
