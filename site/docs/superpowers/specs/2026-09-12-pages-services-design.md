# Pages services dédiées — conception

**Date :** 2026-09-12
**Projet :** One Connexion (Next.js App Router)
**Statut :** validé, prêt pour plan d'implémentation

---

## 1. Objectif

Le site est aujourd'hui une page unique. Les quatre prestations n'existent que sous
forme de cartes descriptives dans `components/sections/Services.tsx`, sans URL propre.
Elles sont donc invisibles pour les requêtes métier (« coursier juridique Paris »,
« transport prélèvements laboratoire ») qui constituent le trafic commercial utile.

Ce chantier crée une page par prestation, plus un index, avec un objectif d'acquisition :
capter ces requêtes, démontrer la maîtrise de chaque métier, et convertir vers le devis.

## 2. Décisions validées

| Sujet | Décision |
|---|---|
| Objectif | SEO / acquisition — pages de fond, pas des fiches descriptives |
| Périmètre | 4 pages métier + 1 index `/services` |
| Architecture | Route dynamique `[slug]` + contenu centralisé et typé |
| Contenu | Rédigé intégralement ; tout chiffre ou engagement vérifiable reste marqué `PLACEHOLDER` |
| Header | « Services » pointe vers `/services` ; les autres entrées deviennent `/#ancre` |
| Devis | Aucun formulaire dupliqué : les CTA réutilisent les points de contact existants (`tel:` et `mailto:`), l'objet du courriel étant pré-rempli avec le service concerné |

## 3. URLs

```
/services                        Index des prestations
/services/plis-confidentiels     Juridique & notarial
/services/transport-medical      Santé & laboratoires
/services/livraison-e-commerce   E-commerce
/services/compte-entreprise      Suivi & facturation
```

Les slugs portent le vocabulaire réellement recherché plutôt que le vocabulaire interne
(« transport-medical » et non « transports-urgents »). Ils sont définitifs : les modifier
après indexation impose des redirections.

## 4. Architecture des fichiers

```
lib/services/
  types.ts                     Type Service et types satellites
  plis-confidentiels.ts        Contenu du service juridique
  transport-medical.ts         Contenu du service santé
  livraison-e-commerce.ts      Contenu du service e-commerce
  compte-entreprise.ts         Contenu du service comptes entreprises
  index.ts                     SERVICES, SERVICE_SLUGS, getService(slug)

app/services/
  page.tsx                     Index des prestations
  [slug]/page.tsx              Gabarit de page service

components/services/
  ServiceHero.tsx              Fil d'Ariane, H1, chapô, CTA, bandeau chiffres
  ServiceSteps.tsx             Procédure numérotée
  ServiceUseCases.tsx          Cas d'usage concrets
  ServiceFaq.tsx               FAQ en <details>/<summary>
  ServiceRelated.tsx           Maillage vers les autres prestations
  ServiceCta.tsx               Bloc de conversion final

components/JsonLd.tsx          Injection de données structurées

app/sitemap.ts                 Sitemap généré depuis SERVICES
app/robots.ts                  Directives d'indexation
```

Un fichier de contenu par service : chacun pèse entre 100 et 180 lignes de texte
rédactionnel. Les regrouper produirait un fichier de 600 lignes, pénible à relire
et à modifier.

Les sections de texte simple (contraintes du secteur, prestations incluses, zone
couverte) sont rendues directement dans le gabarit : leur balisage ne justifie pas
un composant dédié.

## 5. Modèle de données

```ts
// lib/services/types.ts
export type ServiceStat = { value: string; label: string };
export type ServiceStep = { title: string; body: string };
export type ServiceUseCase = { title: string; body: string };
export type FaqItem = { question: string; answer: string };

export type Service = {
  slug: string;

  /** Carte affichée sur la homepage et sur l'index /services. */
  card: { tag: string; title: string; body: string; note: string };

  /** Métadonnées de référencement. */
  seo: { title: string; description: string; keywords: string[] };

  /** Contenu de la page. */
  h1: string;
  intro: string;
  stats: ServiceStat[];                              // 3 à 4
  context: { title: string; paragraphs: string[] };  // contraintes du secteur
  steps: ServiceStep[];                              // 4 à 5
  included: string[];                                // garanties concrètes
  useCases: ServiceUseCase[];                        // 3
  coverage: string;
  faq: FaqItem[];                                    // 5 à 6
};
```

`lib/services/index.ts` expose :

- `SERVICES: Service[]` — l'ordre du tableau fait l'ordre d'affichage partout ;
- `SERVICE_SLUGS: string[]` — consommé par `generateStaticParams` et le sitemap ;
- `getService(slug: string): Service | undefined` — le gabarit appelle `notFound()`
  si le slug est inconnu, ce qui produit un vrai 404 plutôt qu'une page vide.

Ce module devient la source unique de vérité : la homepage, l'index, les pages et le
sitemap lisent tous le même tableau. Le contenu dupliqué en dur dans `Services.tsx`
disparaît.

## 6. Gabarit d'une page service

| # | Section | Fonction |
|---|---|---|
| 1 | Fil d'Ariane + H1 | `Accueil › Prestations › …`. Le H1 porte la requête cible. |
| 2 | Chapô + CTA | 2 à 3 phrases, bouton devis et téléphone cliquable. |
| 3 | Bandeau chiffres | 3 à 4 engagements propres au service. |
| 4 | Contraintes du secteur | 2 à 3 paragraphes démontrant la connaissance du métier. |
| 5 | Procédure | 4 à 5 étapes numérotées, de la commande à la preuve de remise. |
| 6 | Prestations incluses | Liste des garanties. |
| 7 | Cas d'usage | 3 situations concrètes et datées. |
| 8 | Zone couverte | Paris et petite couronne, zones sur devis, lien vers `/#flotte`. |
| 9 | FAQ | 5 à 6 questions. |
| 10 | Autres prestations | Liens vers les 3 autres pages. |
| 11 | CTA final | Bloc devis : appel direct et courriel à objet pré-rempli. |

La FAQ utilise `<details>`/`<summary>` natifs : aucun JavaScript, rendu côté serveur,
accessible au clavier, et le texte des réponses est présent dans le HTML livré aux
robots — ce qu'un accordéon React monté côté client ne garantit pas.

L'index `/services` reprend l'en-tête de section, une introduction transversale, les
quatre cartes en lien vers leur page, et un rappel de la méthode commune.

**Conversion.** Le site ne comporte aucun formulaire : la section `#contact` de la
homepage est un bandeau proposant un lien `tel:` et un lien `mailto:`. Les pages service
réutilisent exactement ces deux points de contact, dans un bloc final au même registre
visuel. Le lien `mailto:` porte un objet pré-rempli — « Demande de devis — Plis
confidentiels » — ce qui qualifie la demande à la réception sans créer de second canal
à maintenir. Renvoyer vers `/#contact` aurait imposé un saut de page et fait perdre le
contexte du service consulté, sans rien apporter : la destination réelle est identique.
Le bouton « Demander un devis » du header continue, lui, de viser `/#contact`.

## 7. Référencement technique

**Métadonnées.** `generateMetadata` par slug produit `title`, `description`, `keywords`,
`openGraph` et `alternates.canonical`. L'index et les pages déclarent chacun leur
canonique absolue.

**Données structurées.** Chaque page service injecte trois blocs JSON-LD :

- `Service` — nom, description, `areaServed` (Paris et Île-de-France), `provider` ;
- `BreadcrumbList` — reflète le fil d'Ariane affiché ;
- `FAQPage` — construit depuis `service.faq`.

Le balisage `FAQPage` est le meilleur rapport effort/visibilité du chantier : il alimente
les extraits enrichis et les réponses générées par IA.

**`metadataBase`.** Absent du layout actuel, ce qui casse les URLs Open Graph relatives.
Une constante `SITE_URL` est ajoutée à `lib/site-content.ts`, marquée `PLACEHOLDER`
(le domaine de production doit être confirmé) et consommée par `metadataBase`, les
canoniques et le sitemap.

**`sitemap.ts` et `robots.ts`.** Générés depuis `SERVICE_SLUGS`, donc jamais désynchronisés
des pages réellement publiées.

## 8. Modifications de l'existant

| Fichier | Modification | Raison |
|---|---|---|
| `components/Header.tsx` | « Services » → `/services` ; les autres entrées passent en `/#methode`, `/#flotte`, `/#references` | Les ancres nues ne résolvent rien depuis une sous-page |
| `components/ClientShell.tsx` | Remise à zéro du scroll Lenis au changement de route (`usePathname` + `lenis.scrollTo(0, { immediate: true })`) | Lenis pilote le scroll et ignore la restauration de Next : sans cela on arrive au milieu de la page suivante |
| `components/sections/Services.tsx` | Lit `SERVICES` ; les cartes deviennent des liens | Supprime la duplication de contenu et crée le maillage interne |
| `components/Footer.tsx` | La colonne « Services » pointe vers les pages réelles | Les liens actuels ne mènent nulle part |
| `app/layout.tsx` | Ajout de `metadataBase` | Corrige les URLs Open Graph |
| `lib/site-content.ts` | Ajout de `SITE_URL` | Nécessaire aux canoniques et au sitemap |

Le composant `ClientShell` monte Lenis une seule fois pour toute l'application, avec un
tableau de dépendances vide. Le comportement est correct entre les routes, mais la
position de défilement n'est pas réinitialisée : c'est le seul correctif nécessaire.

## 9. Contenu rédactionnel

Angle et requêtes visées par page :

**`plis-confidentiels` — Juridique & notarial.**
Requêtes : coursier juridique Paris, transport de plis confidentiels, coursier huissier,
remise contre signature. Contraintes traitées : confidentialité, délais de procédure et
dépôts au greffe, preuve de remise opposable, chaîne de responsabilité documentée.

**`transport-medical` — Santé & laboratoires.**
Requêtes : coursier médical Paris, transport de prélèvements, transport d'échantillons
biologiques Île-de-France. Contraintes traitées : délai de stabilité des échantillons,
maintien en température, emballage conforme, traçabilité.
*Précaution obligatoire :* le transport d'échantillons biologiques relève d'une
réglementation stricte (classification UN3373, triple emballage, obligations ADR).
Aucune conformité, certification ou habilitation n'est affirmée dans le texte ; toute
mention de ce type reste marquée `PLACEHOLDER` jusqu'à validation documentaire.

**`livraison-e-commerce` — E-commerce.**
Requêtes : livraison le jour même Paris, coursier e-commerce, livraison same day
Île-de-France. Contraintes traitées : tenue de la promesse client, créneaux de réception,
échecs de livraison et représentations, retours.

**`compte-entreprise` — Suivi & facturation.**
Requêtes : compte coursier entreprise, facturation mensuelle coursier, contrat coursier
Paris. Contraintes traitées : commandes multi-sites, justificatifs de livraison archivés,
facturation centralisée, export comptable, interlocuteur unique.

Règle appliquée à l'ensemble : les descriptions de procédure et de méthode sont rédigées
librement ; les délais contractuels, tarifs, volumes, taux et certifications restent des
`PLACEHOLDER` visibles, conformément à la convention déjà en place dans
`lib/site-content.ts`.

## 10. Vérification

Le projet ne dispose d'aucune infrastructure de test (`package.json` n'expose que `dev`,
`build`, `start`, `lint`). Aucun test automatisé n'est donc écrit ici ; l'ajout d'un
harnais de test est un chantier distinct.

La vérification repose sur :

1. `npm run build` — valide le typage, la génération statique des cinq routes et l'absence
   d'erreur de rendu serveur ;
2. `npm run lint` ;
3. contrôle du HTML généré pour chaque route : présence du `<h1>` unique, des trois blocs
   JSON-LD, de la balise canonique et des réponses de FAQ dans le document livré ;
4. contrôle de navigation : header et footer depuis une sous-page, retour en haut au
   changement de route, 404 sur un slug inconnu ;
5. rendu mobile et desktop des cinq routes.

## 11. Hors périmètre

Écartés délibérément : système de blocs composables ou CMS, pages par arrondissement ou
par zone géographique, blog, formulaire de devis dupliqué sur chaque page,
internationalisation, harnais de tests automatisés.
