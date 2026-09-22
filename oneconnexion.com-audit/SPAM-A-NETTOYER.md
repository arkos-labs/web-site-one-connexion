# Spam nettoyé — oneconnexion.com (✓ FAIT 22/09/2026)

## Boilerplate identique sur 57 pages — RÉSOLU

### Avant
```
Footer identique sur 57 pages :
- Téléphone (100%)
- SIREN (100%) 
- "interlocuteur unique" + "traçabilité complète" (100%)
- Navigation 8 liens × 100%
```

### Après ✓
1. **SIREN retiré** du texte visible (reste en JSON-LD schema.org)
2. **Taglines diversifiées** par page (14 variantes uniques) :
   - `/` : « Livraisons urgentes pour cabinets juridiques, laboratoires et entreprises d'Île-de-France »
   - `/tarifs` : « Des tarifs clairs et adaptés à vos volumes. Devis en moins de 2 heures »
   - `/zones/paris` : « Paris intramuros livré en moins de 45 minutes. Disponible 7j/7, 7h–23h »
   - `/zones/petite-couronne` : « Petite couronne couverte 24/7. Clients réguliers : compte mensuel sans surprise »
   - `/services` : « Plis confidentiels, transport médical, livraison e-commerce, tournées régulières »
   - `/methode` : « Notre approche : transparence, flexibilité et engagement de service mesuré »
   - `/flotte` : « Flotte deux-roues dédiée. Traçabilité GPS en temps réel, photos de remise »
   - `/references` : « Nos clients nous font confiance : cabinets juridiques, laboratoires, e-commerçants »
   - (+ 6 autres pour autres pages)

3. **Navigation réduite** de 8 à 6 liens :
   - ❌ Retirer : « Guides pratiques », « Références clients »
   - ✓ Garder : Notre méthode, Flotte & couverture, Tarifs, Mentions légales, CGV, Confidentialité

## Implémentation technique
- Footer.tsx converti en Client Component (usePathname)
- getTagline() sélectionne la tagline selon la route
- Pas de contenu rajouté, uniquement diversification du boilerplate existant

## Pas de spam critique trouvé
- ✓ Pas d'avis faux
- ✓ Pas de contenu dupliqué entre zones (44% overlap OK, pas du pur doublon)
- ✓ Pas de cloaking
- ✓ Données structurées propres

## À faire (backlog)
- Diversifier les descriptions SEO des pages zones (data-77.ts, data-78.ts) : les "traçabilité complète" se répètent encore dans les meta descriptions
- Connecter Search Console pour voir l'impact des impressions/clics
