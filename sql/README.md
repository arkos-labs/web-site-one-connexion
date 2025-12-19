# 📊 Scripts SQL - One Connexion

## 🆕 Migration du Système de Tarification

### Scripts de Migration

#### `create_city_pricing_table.sql`
**Description :** Crée la table `city_pricing` pour stocker les tarifs par ville

**Contenu :**
- Table avec 9 colonnes (id, city_name, zip_code, 5 prix, timestamps)
- Contraintes CHECK sur les prix
- Index sur city_name
- Trigger pour updated_at
- Row Level Security (RLS)
- Fonction find_city_pricing()

**Exécuter en premier** ✅

---

#### `insert_city_pricing_data.sql`
**Description :** Insère 274 villes avec leurs tarifs

**Données :**
- Paris (75) : 21 villes
- Seine-et-Marne (77) : 17 villes
- Yvelines (78) : 16 villes
- Essonne (91) : 17 villes
- Hauts-de-Seine (92) : 26 villes
- Seine-Saint-Denis (93) : 33 villes
- Val-de-Marne (94) : 38 villes
- Val-d'Oise (95) : 106 villes

**Exécuter en second** ✅

---

## 📋 Autres Scripts

### Gestion des Commandes
- `enable_realtime_orders.sql` - Active Realtime sur les commandes
- `fix_order_status_constraint.sql` - Corrige les contraintes de statut
- `add_refusal_tracking_columns.sql` - Ajoute le suivi des refus

### Gestion des Chauffeurs
- `fix_driver_id_foreign_key.sql` - Corrige les clés étrangères
- `fix_driver_sync.sql` - Synchronisation des chauffeurs
- `switch_driver_id_to_auth_id.sql` - Migration vers auth.uid()

### Permissions
- `fix_dispatch_permissions.sql` - Permissions dispatch
- `fix_order_events_rls_for_drivers.sql` - RLS pour les événements

### Alignement
- `align_with_driver_app.sql` - Alignement avec l'app chauffeur

---

## 🚀 Guide d'Exécution

Voir `../GUIDE_SQL_EXECUTION.md` pour les instructions détaillées.

---

**Date :** 2025-12-19  
**Version :** 2.0
