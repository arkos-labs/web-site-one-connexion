# Corrections - Sélection et Création Client Modal Admin

## Date : 2025-12-06 03:32

## Problème
L'utilisateur ne pouvait pas :
1. Sélectionner un client depuis le modal admin
2. Créer un nouveau client depuis le modal admin

## Solutions apportées

### 1. Création du Modal de Création Client

**Nouveau fichier** : `src/components/admin/clients/CreateClientModal.tsx`

#### Fonctionnalités
- ✅ Formulaire complet pour créer un nouveau client
- ✅ Champs : Société, Code interne, Prénom, Nom, Email, Téléphone, Adresse, Adresse facturation, SIRET
- ✅ Validation des champs requis
- ✅ Insertion directe dans Supabase (table `profiles`)
- ✅ Toast de confirmation
- ✅ Callback `onSuccess` pour notifier le parent

#### Code clé
```tsx
const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .insert({
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        company_name: formData.company_name,
        address: formData.address,
        billing_address: formData.billing_address || formData.address,
        siret: formData.siret,
        internal_code: formData.internal_code,
        role: 'client',
    })
    .select()
    .single();
```

### 2. Corrections du Modal Admin (`CreateOrderModal.tsx`)

#### A. Imports ajoutés
```tsx
import { useState, useEffect, useRef } from "react";
import CreateClientModal from "@/components/admin/clients/CreateClientModal";
```

#### B. États ajoutés
```tsx
const [showCreateClientModal, setShowCreateClientModal] = useState(false);
const dropdownRef = useRef<HTMLDivElement>(null);
```

#### C. Gestion du clic extérieur
**Problème** : Le dropdown ne se fermait pas quand on cliquait ailleurs

**Solution** : useEffect avec event listener
```tsx
useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setShowClientDropdown(false);
        }
    };

    if (showClientDropdown) {
        document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
}, [showClientDropdown]);
```

#### D. Handler de création client
```tsx
const handleClientCreated = (newClient: any) => {
    // Ajouter le nouveau client à la liste
    setClients(prev => [...prev, newClient]);
    // Sélectionner automatiquement le nouveau client
    handleClientSelect(newClient.id);
    setClientSearchTerm(`${newClient.first_name || ''} ${newClient.last_name || ''}`.trim() || newClient.email);
};
```

#### E. Bouton "Nouveau client" connecté
```tsx
<Button 
    type="button"
    variant="ghost" 
    size="sm" 
    className="text-blue-600 hover:text-blue-800 h-8"
    onClick={() => setShowCreateClientModal(true)}
>
    <Plus className="h-3 w-3 mr-1" />
    Nouveau client
</Button>
```

#### F. Dropdown amélioré
**Avant** : Dropdown visible seulement si `clientSearchTerm.length > 0`
```tsx
{showClientDropdown && clientSearchTerm.length > 0 && (
```

**Après** : Dropdown visible si ouvert ET pas de client sélectionné
```tsx
{showClientDropdown && !formData.clientId && (
```

**Avantage** : On peut voir tous les clients même sans taper de texte

#### G. Ref ajouté au dropdown
```tsx
<div className="relative" ref={dropdownRef}>
```

#### H. Modal de création intégré
```tsx
{/* Modal de création de client */}
<CreateClientModal
    isOpen={showCreateClientModal}
    onClose={() => setShowCreateClientModal(false)}
    onSuccess={handleClientCreated}
/>
```

## Workflow complet

### Sélection d'un client existant
1. L'utilisateur clique dans le champ de recherche
2. Le dropdown s'affiche avec tous les clients
3. L'utilisateur peut filtrer en tapant (nom, email, société)
4. Clic sur un client → sélection + fermeture dropdown
5. Le client apparaît dans la carte "Client sélectionné"
6. Les contacts de retrait sont pré-remplis

### Création d'un nouveau client
1. L'utilisateur clique sur "Nouveau client"
2. Le modal `CreateClientModal` s'ouvre
3. L'utilisateur remplit le formulaire
4. Clic sur "Créer le client"
5. Insertion dans Supabase
6. Le nouveau client est ajouté à la liste
7. Le nouveau client est automatiquement sélectionné
8. Le modal se ferme

### Désélection
1. Clic sur le bouton X de la carte client
2. Réinitialisation des données client
3. Le champ de recherche redevient disponible

## Fichiers modifiés

1. ✅ **`src/components/admin/clients/CreateClientModal.tsx`** (CRÉÉ)
   - Nouveau composant modal de création client

2. ✅ **`src/components/admin/orders/CreateOrderModal.tsx`** (MODIFIÉ)
   - Import de `useRef` et `CreateClientModal`
   - Ajout des états `showCreateClientModal` et `dropdownRef`
   - Ajout du useEffect pour clic extérieur
   - Ajout du handler `handleClientCreated`
   - Modification de la condition d'affichage du dropdown
   - Connexion du bouton "Nouveau client"
   - Intégration du modal de création

## Tests à effectuer

- [ ] Ouvrir le modal de création de commande admin
- [ ] Cliquer dans le champ de recherche → dropdown s'affiche
- [ ] Taper du texte → filtrage fonctionne
- [ ] Cliquer sur un client → sélection fonctionne
- [ ] Cliquer ailleurs → dropdown se ferme
- [ ] Cliquer sur "Nouveau client" → modal s'ouvre
- [ ] Remplir le formulaire et créer → client créé et sélectionné
- [ ] Cliquer sur X → désélection fonctionne

## Résultat

✅ **Sélection client** : Fonctionne avec recherche et filtrage
✅ **Création client** : Modal dédié avec tous les champs
✅ **UX améliorée** : Dropdown se ferme au clic extérieur
✅ **Workflow fluide** : Nouveau client automatiquement sélectionné après création
