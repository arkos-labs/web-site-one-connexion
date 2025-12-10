# Charte Graphique Doctolib - Design System

## 🎨 Vue d'ensemble

Votre application utilise désormais une charte graphique inspirée de **Doctolib**, axée sur la confiance, la clarté et le professionnalisme.

## 🔵 Couleurs Principales

### Bleu Doctolib (Couleur signature)
- **Valeur HSL**: `199 100% 44%`
- **Hex**: `#0596DE`
- **Usage**: 
  - Couleur primaire de la marque
  - Boutons CTA (Call-to-Action)
  - Liens et éléments interactifs
  - Focus states
  - Statuts "Accepté" et "En cours"

### Vert Succès
- **Valeur HSL**: `142 76% 36%`
- **Hex**: `#16A34A`
- **Usage**:
  - Messages de succès
  - Statut "Livré"
  - Éléments d'accent positifs

## 🎨 Couleurs Sémantiques

### Orange (Avertissement)
- **Valeur HSL**: `38 92% 50%`
- **Hex**: `#F97316`
- **Usage**: Statut "En attente", avertissements

### Rouge (Erreur)
- **Valeur HSL**: `0 72% 51%`
- **Hex**: `#DC2626`
- **Usage**: Erreurs, statut "Annulé"

### Violet (Dispatch)
- **Valeur HSL**: `262 52% 47%`
- **Hex**: `#7C3AED`
- **Usage**: Statut "Dispatché"

## 🌫️ Couleurs Neutres

### Gris Très Clair (Secondaire)
- **Valeur HSL**: `210 20% 98%`
- **Hex**: `#FAFAFA`
- **Usage**: Arrière-plans secondaires

### Gris Doux (Muted)
- **Valeur HSL**: `210 20% 96%`
- **Hex**: `#F5F5F5`
- **Usage**: Zones désactivées, arrière-plans subtils

### Gris Moyen (Texte secondaire)
- **Valeur HSL**: `215 16% 47%`
- **Hex**: `#737373`
- **Usage**: Texte secondaire, labels

### Bleu-Gris Foncé (Texte principal)
- **Valeur HSL**: `215 25% 27%`
- **Hex**: `#3D4E5C`
- **Usage**: Texte principal

## 📐 Principes de Design

### 1. **Clarté et Lisibilité**
- Beaucoup d'espace blanc
- Typographie claire et hiérarchisée
- Contraste élevé pour l'accessibilité

### 2. **Professionnalisme**
- Palette sobre et rassurante
- Ombres subtiles et douces
- Bordures arrondies modérées (0.5rem)

### 3. **Confiance**
- Bleu comme couleur dominante (associé à la confiance et la santé)
- Design épuré sans fioritures
- Cohérence visuelle

## 🎯 Hiérarchie des Couleurs (Règle 60-30-10)

- **60%** - Blanc et gris très clairs (arrière-plans)
- **30%** - Bleu Doctolib (éléments primaires)
- **10%** - Vert et autres couleurs d'accent

## 🖼️ Ombres

### Soft Shadow
```css
box-shadow: 0 1px 3px hsl(215 25% 27% / 0.08);
```

### Medium Shadow
```css
box-shadow: 0 4px 12px hsl(215 25% 27% / 0.10);
```

### Strong Shadow
```css
box-shadow: 0 8px 24px hsl(215 25% 27% / 0.12);
```

### CTA Shadow
```css
box-shadow: 0 4px 12px hsl(199 100% 44% / 0.25);
```

## 📝 Typographie

- **Police principale**: Poppins (déjà en place)
- **Tailles réduites** pour un look plus raffiné:
  - Hero: 3.5rem (56px) - au lieu de 3.75rem
  - Title Large: 2rem (32px) - au lieu de 2.25rem
  - Title Small: 1.125rem (18px) - au lieu de 1.25rem

## 🎨 Sidebar

La sidebar adopte maintenant un style **blanc** (comme Doctolib) au lieu d'un fond sombre:
- Fond blanc
- Texte bleu-gris foncé
- Éléments actifs en bleu Doctolib
- Bordures subtiles

## 🌙 Mode Sombre

Le mode sombre conserve le bleu Doctolib comme couleur primaire avec:
- Arrière-plans bleu-gris très foncés
- Texte clair
- Même bleu Doctolib pour les CTA

## ✅ Changements Appliqués

1. ✅ Remplacement du bleu indigo foncé par le bleu Doctolib
2. ✅ Remplacement de l'orange électrique par le bleu Doctolib pour les CTA
3. ✅ Ajustement des couleurs de statut
4. ✅ Simplification de la palette de gris
5. ✅ Réduction des tailles de typographie
6. ✅ Adoucissement des ombres
7. ✅ Sidebar blanche au lieu de sombre
8. ✅ Mise à jour du mode sombre

## 🚀 Prochaines Étapes Recommandées

1. **Vérifier visuellement** l'application avec `npm run dev`
2. **Tester l'accessibilité** des contrastes
3. **Ajuster les composants** si nécessaire pour respecter la nouvelle charte
4. **Documenter** les patterns d'utilisation des couleurs

---

**Date de mise à jour**: 6 décembre 2025
**Inspiration**: Doctolib Design System (Oxygen)
