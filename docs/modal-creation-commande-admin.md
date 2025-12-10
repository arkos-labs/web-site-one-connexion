# Modal de Création de Commande Admin

## ✅ Modifications effectuées

Le modal Admin (`CreateOrderModal.tsx`) a été entièrement refondu pour être **visuellement et fonctionnellement identique** au modal Client (`QuickOrderForm.tsx`), tout en conservant les fonctionnalités spécifiques à l'administration.

### 🎯 Objectifs atteints

1.  **Uniformité UI/UX** : Le design est maintenant strictement aligné sur celui du client (couleurs, espacements, icônes, disposition).
2.  **Structure** :
    *   **Gauche (2/3)** : Formulaire complet.
    *   **Droite (1/3)** : Récapitulatif "sticky" avec prix en temps réel.
3.  **Fonctionnalités Admin** :
    *   **Sélection Client** : Un bloc dédié en haut du formulaire permet de rechercher et sélectionner un client existant.
    *   **Pré-remplissage** : La sélection d'un client pré-remplit automatiquement les champs de contact.
4.  **Gestion des Horaires** :
    *   Les 3 options ("Dès que possible", "Dans 1h", "Choisir un créneau") sont présentes en bas du formulaire.
    *   Le comportement est identique à celui du client.

### 🛠️ Détails Techniques

*   **Fichier** : `src/components/admin/orders/CreateOrderModal.tsx`
*   **Dépendances** : Utilise les mêmes composants UI (`AddressAutocomplete`, `Button`, `Input`, etc.) et services (`locationiq`, `pricingEngineNew`) que le modal client.
*   **Données** : Récupère la liste des clients via Supabase (`profiles` table) au chargement du modal.

### 📝 Utilisation

1.  Ouvrir le modal depuis le dashboard Admin.
2.  Sélectionner un client dans la liste déroulante (recherche par nom).
3.  Remplir les adresses (calcul de prix automatique).
4.  Choisir le type de colis, la formule et l'horaire.
5.  Valider la commande.

Le récapitulatif à droite se met à jour en temps réel et affiche clairement le client sélectionné.
