# Choix d'horaire de prise en charge - Modal de création de commande

## ✅ Modifications effectuées

### Composant : `QuickOrderForm.tsx`

Ajout d'un système de choix d'horaire de prise en charge avec 3 options :

#### 1. **Dès que possible** (Immédiat)
- Enlèvement immédiat
- Aucune date/heure à sélectionner
- Un coursier est assigné dès que possible

#### 2. **Dans 1h**
- Enlèvement prévu dans 1 heure
- La date et l'heure sont calculées automatiquement (heure actuelle + 1h)
- Affichage de l'heure prévue dans le récapitulatif

#### 3. **Choisir un créneau** (Différé)
- Permet de sélectionner une date et une heure précises
- Affichage d'un formulaire avec :
  - Sélecteur de date (minimum : aujourd'hui)
  - Sélecteur d'heure
- Affichage de la date et heure choisies dans le récapitulatif

## 🎨 Design

### Boutons de sélection
- **Style actif** : Fond jaune (#FFCC00), texte bleu foncé (#0B2D55), ombre
- **Style inactif** : Fond blanc, bordure grise, texte gris
- **Hover** : Bordure plus foncée
- Disposition horizontale en 3 colonnes égales

### Formulaire conditionnel
- Affiché uniquement si "Choisir un créneau" est sélectionné
- Fond gris clair (#F2F6FA)
- Bordure grise
- 2 colonnes : Date | Heure

### Messages informatifs
- Icône + texte pour chaque type
- Couleur jaune pour les icônes
- Affichage conditionnel selon le choix

## 📋 Récapitulatif

Le récapitulatif affiche maintenant :
- **Section "HORAIRE"** en premier
  - "Dès que possible" pour immédiat
  - "Dans 1h (HH:MM)" pour dans 1h
  - "JJ/MM/AAAA à HH:MM" pour créneau personnalisé
- Adresse de retrait
- Adresse de livraison
- Type de colis
- Formule
- Prix total

## 🔧 État du composant

```typescript
const [orderType, setOrderType] = useState<'immediate' | 'in1h' | 'deferred'>('immediate');
```

### Valeurs possibles :
- `'immediate'` : Dès que possible
- `'in1h'` : Dans 1 heure
- `'deferred'` : Choisir un créneau

## 💡 Logique de fonctionnement

### Bouton "Dès que possible"
```typescript
onClick={() => {
    setOrderType('immediate');
    setFormData({ ...formData, pickupDate: '', pickupTime: '' });
}}
```
- Réinitialise la date et l'heure

### Bouton "Dans 1h"
```typescript
onClick={() => {
    setOrderType('in1h');
    const now = new Date();
    const in1h = new Date(now.getTime() + 60 * 60 * 1000);
    const date = in1h.toISOString().split('T')[0];
    const time = in1h.toTimeString().slice(0, 5);
    setFormData({ ...formData, pickupDate: date, pickupTime: time });
}}
```
- Calcule automatiquement la date et l'heure dans 1 heure
- Met à jour le formulaire

### Bouton "Choisir un créneau"
```typescript
onClick={() => setOrderType('deferred')}
```
- Affiche le formulaire de sélection date/heure
- L'utilisateur choisit manuellement

## 📱 Responsive

- **Desktop** : 3 boutons côte à côte
- **Mobile** : Les boutons s'adaptent automatiquement (flex-1)
- Le formulaire date/heure reste en 2 colonnes sur mobile

## 🎯 Validation

- Les champs date et heure sont **requis** uniquement si `orderType === 'deferred'`
- La date minimum est aujourd'hui
- Pas de validation d'heure minimum (à ajouter si nécessaire)

## 🚀 Utilisation

Le modal de création de commande affiche maintenant automatiquement ces options.
L'utilisateur peut :
1. Choisir son type d'horaire
2. Remplir le reste du formulaire
3. Voir le récapitulatif mis à jour en temps réel
4. Soumettre la commande

## 📝 Notes

- Le design est cohérent avec l'image fournie
- Les couleurs respectent la charte graphique One Connexion
- L'UX est intuitive avec des messages clairs
- Le récapitulatif se met à jour automatiquement
