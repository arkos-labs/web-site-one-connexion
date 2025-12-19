# 🚀 Guide Rapide : Activer RLS en 5 Minutes

## ⚡ Installation Express

### Étape 1 : Exécuter le Script RLS (2 min)

1. Ouvrez **Supabase Dashboard** → **SQL Editor**
2. Copiez le contenu de `sql/enable_rls_orders.sql`
3. Cliquez sur **Run**
4. ✅ Vérifiez qu'il n'y a pas d'erreur

### Étape 2 : Créer les Index (1 min)

1. Dans **SQL Editor**
2. Copiez le contenu de `sql/create_performance_indexes.sql`
3. Cliquez sur **Run**
4. ✅ Vérifiez qu'il n'y a pas d'erreur

### Étape 3 : Mettre à Jour le Frontend (2 min)

**Avant :**
```typescript
// ❌ À SUPPRIMER
const { data } = await supabase
  .from('orders')
  .insert({
    client_id: userId, // ⚠️ Dangereux !
    pickup_address: '...'
  });
```

**Après :**
```typescript
// ✅ À UTILISER
const { data } = await supabase
  .from('orders')
  .insert({
    // NE PAS inclure client_id
    pickup_address: '...'
  });
```

### Étape 4 : Tester (Optionnel)

Suivez `RLS_TESTING_GUIDE.md` pour valider la sécurité.

---

## 🎯 Ce qui est Protégé Maintenant

| Action | Client | Driver | Admin |
|--------|--------|--------|-------|
| Voir ses commandes | ✅ | ✅ | ✅ |
| Voir toutes les commandes | ❌ | ❌ | ✅ |
| Créer une commande | ✅ | ❌ | ✅ |
| Modifier ses commandes | ✅ (annulation) | ✅ | ✅ |
| Modifier toutes les commandes | ❌ | ❌ | ✅ |
| Supprimer | ❌ | ❌ | ✅ (super_admin) |

---

## 📚 Documentation Complète

- **`RLS_SECURITY_SUMMARY.md`** : Vue d'ensemble complète
- **`RLS_TESTING_GUIDE.md`** : 13 tests de sécurité
- **`sql/enable_rls_orders.sql`** : Script principal
- **`sql/create_performance_indexes.sql`** : Optimisation
- **`src/services/orderServiceRLS.example.ts`** : Exemples de code

---

## ✅ Checklist Rapide

- [ ] Script RLS exécuté
- [ ] Index créés
- [ ] Frontend mis à jour (client_id retiré)
- [ ] Tests effectués
- [ ] Documentation lue

---

## 🆘 Besoin d'Aide ?

Consultez `RLS_SECURITY_SUMMARY.md` pour plus de détails.
