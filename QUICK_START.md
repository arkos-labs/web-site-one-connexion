# ⚡ GUIDE RAPIDE - Démarrage en 5 Minutes

**Objectif**: Tester la synchronisation Admin ↔ Chauffeur le plus rapidement possible

---

## 🚀 Étape 1 : Cloner l'App Chauffeur (2 min)

```bash
# Ouvrir un nouveau terminal
cd c:\Users\CHERK\OneDrive\Desktop\projet

# Cloner le repository
git clone https://github.com/arkos-labs/one-connexion-app-v2.git

# Installer les dépendances
cd one-connexion-app-v2
npm install
```

---

## 📁 Étape 2 : Copier les Fichiers Corrigés (1 min)

```bash
# Copier les 3 fichiers corrigés
cp ../web-site-one-connexion-main/_App_Updates/orderSlice.ts src/stores/slices/orderSlice.ts
cp ../web-site-one-connexion-main/_App_Updates/ActiveOrderCard.tsx src/features/driver/components/ActiveOrderCard.tsx
cp ../web-site-one-connexion-main/_App_Updates/DriverMap.tsx src/features/driver/components/DriverMap.tsx
```

---

## 🔍 Étape 3 : Vérifier l'Appel de Subscription (30 sec)

**Ouvrir**: `src/features/driver/DriverHomeScreen.tsx` (ou fichier équivalent)

**Chercher** cette ligne:
```typescript
subscribeToAssignments(...)
```

**Vérifier** que c'est bien:
```typescript
subscribeToAssignments(user.id)  // ✅ BON (Auth ID)
```

**PAS**:
```typescript
subscribeToAssignments(driver.id)  // ❌ MAUVAIS (UUID)
```

---

## 🧪 Étape 4 : Lancer les 2 Applications (1 min)

### Terminal 1 : Dashboard Admin
```bash
cd c:\Users\CHERK\OneDrive\Desktop\projet\web-site-one-connexion-main
npm run dev
```

### Terminal 2 : App Chauffeur
```bash
cd c:\Users\CHERK\OneDrive\Desktop\projet\one-connexion-app-v2
npm run dev
```

---

## ✅ Étape 5 : Test Rapide (30 sec)

1. **App Chauffeur**: Se connecter et passer "En ligne"

2. **Dashboard Admin**: 
   - Aller sur la page Dispatch
   - Sélectionner une commande
   - Cliquer "Assigner" et choisir le chauffeur

3. **Vérifier**:
   - ✅ NewOrderModal s'affiche sur l'app chauffeur en < 2 secondes
   - ✅ Le gain affiché = 40% du prix total
   - ✅ Les adresses sont correctes

---

## 🐛 Si ça ne marche pas

### Vérification 1 : Console de l'App Chauffeur

**Ouvrir** la console du navigateur (F12)

**Chercher**:
```
📡 [OrderSlice] Subscribing to assignments for Driver Auth ID: ...
✅ [OrderSlice] Successfully subscribed to driver assignments
```

**Si vous ne voyez pas ces logs**:
- Le fichier `orderSlice.ts` n'a pas été copié correctement
- Ou `subscribeToAssignments()` n'est pas appelé

---

### Vérification 2 : ID du Chauffeur

**Dans la console de l'App Chauffeur**:
```javascript
// Taper dans la console
console.log('User ID:', user.id);
```

**Copier cet ID**, puis dans la console du Dashboard Admin:
```javascript
// Vérifier que la commande a bien cet ID
console.log('Order driver_id:', selectedOrder.driver_id);
```

**Les 2 IDs doivent être identiques !**

---

### Vérification 3 : Supabase Realtime

**Dans la console de l'App Chauffeur**:
```
✅ [OrderSlice] Successfully subscribed to driver assignments
```

**Si vous voyez**:
```
❌ CHANNEL_ERROR
```

**Alors**:
- Vérifier la connexion internet
- Vérifier les credentials Supabase dans `.env`

---

## 📞 Besoin d'Aide ?

**Consultez**:
- `SYNC_SUMMARY.md` - Résumé complet
- `APP_V2_INTEGRATION_GUIDE.md` - Guide détaillé
- `TECHNICAL_FLOW.md` - Flux technique

**Logs à vérifier**:
- Console navigateur (F12)
- Terminal de l'app
- Supabase Dashboard (Logs Realtime)

---

## 🎯 Résultat Attendu

**Quand tout fonctionne**:

1. Admin dispatche → Chauffeur reçoit en < 2s
2. Gain affiché = 40% du prix total
3. GPS affiche le trajet complet
4. Acceptation → Admin reçoit notification

**Exemple**:
```
Prix total: 25.00€
Gain chauffeur affiché: 10.00€ ✅
```

---

**Version**: 1.0.0  
**Temps estimé**: 5 minutes  
**Difficulté**: ⭐⭐☆☆☆
