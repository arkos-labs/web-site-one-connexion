# Harmonisation des horaires (état au 2 novembre 2026, branche seo/s12-bilan)

Les pages modifiées par le plan annoncent « 7j/7, 7h–23h ». Les emplacements ci-dessous affichent encore « lundi–samedi, 9h–19h » / « fermé le dimanche ». Source des lignes : recherche dans le dépôt (hors admin, dashboard, api).

| Fichier | Ligne |
|---|---|
| `app/contact/page.tsx` | 48 |
| `app/contact/page.tsx` | 188 |
| `app/contact/page.tsx` | 189 |
| `app/references/page.tsx` | 60 |
| `app/references/page.tsx` | 175 |
| `app/zones/grande-couronne/page.tsx` | 58 |
| `app/zones/grande-couronne/page.tsx` | 230 |
| `app/zones/page.tsx` | 14 |
| `app/zones/paris/page.tsx` | 187 |
| `app/zones/petite-couronne/page.tsx` | 401 |
| `app/zones/[slug]/page.tsx` | 203 |
| `app/zones/[slug]/page.tsx` | 269 |
| `lib/chatbot/knowledge.ts` | 22 |
| `lib/chatbot/qa-bank.ts` | 17 |
| `lib/chatbot/qa-bank.ts` | 19 |
| `lib/chatbot/qa-bank.ts` | 20 |
| `lib/chatbot/qa-bank.ts` | 21 |
| `lib/chatbot/qa-bank.ts` | 57 |
| `lib/chatbot/quick-questions.ts` | 85 |
| `lib/guides.ts` | 441 |
| `lib/guides.ts` | 472 |
| `lib/guides.ts` | 522 |
| `lib/guides.ts` | 560 |
| `lib/services/coursier-moto-paris.ts` | 40 |
| `lib/services/coursier-moto-paris.ts` | 136 |
| `lib/services/tournees-regulieres.ts` | 21 |
| `lib/services/tournees-regulieres.ts` | 69 |
| `lib/services/transport-evenementiel.ts` | 53 |
| `lib/services/transport-medical.ts` | 47 |
| `lib/services/transport-medical.ts` | 133 |
| `lib/services/transport-medical.ts` | 173 |
| `lib/zones/extra-92.ts` | 42 |
| `lib/zones/extra-93.ts` | 23 |
| `lib/zones/extra-93.ts` | 167 |
| `lib/zones/extra-94.ts` | 285 |
| `lib/zones/faq-complements.ts` | 42 |
| `lib/zones/local-92.ts` | 120 |
| `lib/zones/local-94.ts` | 302 |
| `lib/zones/local-94.ts` | 307 |
| `lib/zones/paris-local.ts` | 7 |
| `lib/zones/paris-local.ts` | 53 |
| `lib/zones/paris-local.ts` | 173 |
| `lib/zones/paris-local.ts` | 278 |
| `components/ChatWidget.tsx` | 81 |
| `components/ChatWidget.tsx` | 164 |
| `components/Footer.tsx` | 37 |
| `components/Footer.tsx` | 38 |
| `components/Footer.tsx` | 41 |
| `components/sections/About.tsx` | 23 |
| `components/sections/AuthForm.tsx` | 21 |
| `components/sections/Faq.tsx` | 21 |
| `components/sections/Flotte.tsx` | 10 |
| `components/sections/Hero.tsx` | 24 |
| `components/sections/References.tsx` | 9 |
| `components/zones/PlannedZonePage.tsx` | 209 |

Données structurées : app/page.tsx (accueil) annonce 7j/7 07:00–23:00 (modifié en S7).
Décision à prendre : (a) aligner tout le site sur 7j/7 7h–23h si c'est la réalité, ou (b) revenir sur les pages du plan pour afficher les horaires réels.
