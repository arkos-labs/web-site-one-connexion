# Audit avant / après — oneconnexion.com (21/09/2026)

**Méthode.** « Avant » = premier passage (00h59). « Milieu » = audit de 18h40, mesuré sur le site en ligne. « Maintenant » = **estimation** après les lots 1 à 4, non remesurée en production : les scores de cette colonne sont mon jugement sur les correctifs faits, à confirmer par un nouvel audit une fois le site redéployé.
Pondération identique à l'audit : technique 22 %, contenu 23 %, on-page 20 %, données structurées 10 %, performance 10 %, visibilité IA 10 %, images 5 %.

## Notes par catégorie (sur 100)

| Catégorie | Avant | Milieu | Maintenant (estimé) | Ce qui a bougé depuis le milieu |
|---|---|---|---|---|
| SEO technique | 82 | 88 | **92** | CSP, `lastmod` réel par page, 9 communes sans contenu propre en noindex |
| Qualité du contenu | 68 | 74 | **76** | Hub de 3 guides ; fausses affirmations retirées (faux clients, faux camions). Pages zones toujours gabaritées : plafond tant qu'il n'y a pas de contenu local réel |
| SEO on-page | 72 | 88 | **92** | Titres ≤ 60 caractères, metas hors fourchette corrigées |
| Données structurées | 72 | 85 | **86** | `hasMap`, Article + FAQ sur les guides |
| Performance (estimée) | 75 | 75 | **75** | Non mesurée : PageSpeed/CrUX à lancer |
| Visibilité IA | 55 | 78 | **80** | Guides d'information, plus citables |
| Images | 85 | 88 | **90** | Alt du logo descriptif |
| **Score global** | **72** | **82** | **≈ 85** | |

## Fonctionnement et confiance (hors score SEO)

| Sujet | Avant | Maintenant |
|---|---|---|
| Formulaire /contact | Simulait l'envoi : aucun message reçu | Enregistre dans Supabase (à confirmer en production) |
| Notification email du formulaire | Absente | Code prêt, **inactif** tant que `RESEND_API_KEY` n'est pas sur Vercel |
| Formulaires de commande | Acceptaient des champs faits d'espaces ; la fenêtre de commande n'appliquait aucun contrôle | Refusent les espaces seuls, nom, téléphone et email vérifiés |
| Clients nommés sur les pages zones (EDF, Schneider, Bouygues) | Présentés comme « Ils nous font confiance » | Renommés « Acteurs présents à … » |
| Flotte annoncée | Camions et fourgons de 20 m³ sur plusieurs pages | Deux-roues uniquement, comme sur /flotte |

## Ce qui plafonne encore la note
1. **Contenu local des 35 pages zones** (33 à 44 % de recouvrement) : il faut tes faits réels.
2. **Preuves externes** : aucune fiche Google Business Profile ni page LinkedIn vérifiées, aucun avis, aucun backlink.
3. **Performance et indexation non mesurées** : PageSpeed/CrUX et Search Console.
4. **Promesses non vérifiées** : « < 45 min » et « dispatch en 2 minutes » reviennent sur tout le site.

## Pour passer de 85 à 90 et plus
- Contenu local réel sur les pages zones conservées.
- Google Business Profile + LinkedIn dans `sameAs`, puis premiers avis Google.
- Mesure réelle (PageSpeed, Search Console), puis nouvel audit en production.
