# Logique Tarifaire One Connexion

Ce document détaille le fonctionnement unifié du moteur tarifaire utilisé dans toute l'application (Simulateur, Commande Invité, Dashboard Client, Dashboard Admin).

## Source de Vérité
La source unique des tarifs est le fichier : `src/data/tarifs_idf.ts`.
Ce fichier contient la liste des villes et leur coût en **Bons** pour chaque formule (Normal, Express, Urgence).

## Moteur de Calcul
Le calcul est centralisé dans `src/utils/pricingEngineDb.ts`.
Il applique les règles suivantes :

1.  **Trajet vers/depuis Paris** :
    *   Prix = Valeur en Bons de la ville de banlieue.
2.  **Trajet Banlieue <-> Banlieue** :
    *   Prix = Max(Bons Départ, Bons Arrivée) + Supplément Kilométrique.
    *   Supplément = 0.10 bon / km.
3.  **Conversion Euro** :
    *   1 Bon = 5.00€ (Configurable).

## Cohérence de l'Affichage
L'application affiche désormais systématiquement la valeur en **Bons** lors de la création de commande, pour garantir que le client/admin comprenne le coût appliqué.

*   **Simulateur Tarifaire** : Affiche uniquement les Bons.
*   **Création de Commande (Admin/Client)** : Affiche "Prix en € (X bons)".
*   **Création de Commande (Invité)** : Affiche "Prix en € (X bons)".

Cela assure une transparence totale et une correspondance parfaite avec la grille tarifaire papier/PDF.
