# Pages services One Connexion — plan d'implémentation

> **Pour les agents :** SOUS-COMPÉTENCE REQUISE — utiliser superpowers:subagent-driven-development (recommandé) ou superpowers:executing-plans pour dérouler ce plan tâche par tâche. Les étapes utilisent des cases à cocher (`- [ ]`) pour le suivi.

**Objectif :** créer quatre pages de prestation optimisées pour l'acquisition, plus un index `/services`, alimentées par une source de contenu unique et typée.

**Architecture :** une route dynamique `app/services/[slug]/page.tsx` rend un gabarit unique à partir d'objets `Service` déclarés dans `lib/services/`. Le même module alimente la homepage, l'index, le sitemap et les métadonnées, ce qui rend toute désynchronisation impossible. Les pages sont pré-rendues statiquement via `generateStaticParams`.

**Stack :** Next.js 16.3.5 (App Router), React 19.2.8, TypeScript 5, Tailwind CSS v4 (configuration CSS-first via `@theme` dans `app/globals.css`), Lenis 1.3.

**Spec :** `docs/superpowers/specs/2026-09-12-pages-services-design.md`

## Contraintes globales

- **Next.js 16 — `params` est une `Promise`.** Toute page ou `generateMetadata` d'un segment dynamique doit typer `params: Promise<{ slug: string }>` et faire `const { slug } = await params`. L'accès synchrone est supprimé.
- **`metadataBase` est obligatoire avant toute URL relative de métadonnée.** La doc embarquée est explicite : « Using a relative path in a URL-based metadata field without configuring a metadataBase will cause a build error ». Il est donc posé en tâche 1, avant les pages.
- **Aucun test automatisé.** `package.json` n'expose que `dev`, `build`, `start`, `lint`. Le harnais de test est hors périmètre (décision de la spec, §10). Chaque tâche se termine donc par une vérification exécutable réelle — `npm run build`, `npm run lint`, ou une inspection du HTML produit — avec le résultat attendu explicite. Ne jamais déclarer une tâche terminée sans avoir lancé la commande et lu sa sortie.
- **Dépôt non initialisé.** `D:\Projets\one-connexion-main` n'est pas un dépôt git. Les étapes de commit sont écrites mais conditionnelles : si le dépôt a été initialisé (`git init`), les exécuter ; sinon les ignorer et passer à la tâche suivante. Initialiser git est recommandé avant de démarrer.
- **Convention `PLACEHOLDER`.** Tout chiffre, délai contractuel, tarif, durée de conservation ou certification non vérifié reste marqué `PLACEHOLDER` dans le texte, conformément à `lib/site-content.ts`. Les chiffres déjà publiés sur le site (prise en charge < 45 min, ponctualité 99,4 %, assurance 3,5 M€, charge 18 kg) sont réutilisables tels quels.
- **Tokens de couleur disponibles** (définis dans `app/globals.css`) : `ink`, `paper`, `paper-card`, `line`, `muted`, `label`, `accent`, `accent-dark`. Rayon de bordure : `rounded-[2px]`. N'inventer aucun token.
- **Registre visuel.** Bordures nettes, libellés en mono majuscule très espacée (`font-mono text-[10px] tracking-[0.16em] uppercase`), orange en accent seulement. Ne pas introduire d'ombres, de dégradés ni d'angles arrondis.
- **Langue.** Tout le contenu visible est en français, avec apostrophes typographiques (`’`) et espaces insécables avant `:` `;` `?` `!` dans les textes rédigés.

---

### Tâche 1 : Socle de données et base des métadonnées

Cette tâche crée le contrat de données, le premier contenu réel, et pose `metadataBase` — prérequis dur de toutes les pages suivantes.

**Fichiers :**
- Créer : `lib/services/types.ts`
- Créer : `lib/services/plis-confidentiels.ts`
- Créer : `lib/services/index.ts`
- Modifier : `lib/site-content.ts` (ajout de `SITE_URL`)
- Modifier : `app/layout.tsx:24-44` (ajout de `metadataBase`)

**Interfaces :**
- Consomme : rien.
- Produit :
  - `type Service` et les types satellites `ServiceStat`, `ServiceStep`, `ServiceUseCase`, `FaqItem` ;
  - `SERVICES: Service[]` — l'ordre du tableau détermine l'ordre d'affichage partout ;
  - `SERVICE_SLUGS: string[]` ;
  - `getService(slug: string): Service | undefined` ;
  - `SITE_URL: string` exporté depuis `lib/site-content.ts`.

- [ ] **Étape 1 : créer le contrat de données**

Créer `lib/services/types.ts` :

```ts
/**
 * lib/services/types.ts
 * Contrat de données d'une prestation. Une seule source alimente la homepage,
 * l'index /services, les pages de détail, les métadonnées et le sitemap.
 */

export type ServiceStat = { value: string; label: string };
export type ServiceStep = { title: string; body: string };
export type ServiceUseCase = { title: string; body: string };
export type FaqItem = { question: string; answer: string };

export type Service = {
  /** Segment d'URL. Définitif : le modifier après indexation impose une redirection. */
  slug: string;

  /** Carte affichée sur la homepage et sur l'index /services. */
  card: { tag: string; title: string; body: string; note: string };

  /** Métadonnées de référencement. */
  seo: { title: string; description: string; keywords: string[] };

  /** Contenu de la page. */
  h1: string;
  intro: string;
  stats: ServiceStat[];
  context: { title: string; paragraphs: string[] };
  steps: ServiceStep[];
  included: string[];
  useCases: ServiceUseCase[];
  coverage: string;
  faq: FaqItem[];
};
```

- [ ] **Étape 2 : rédiger le contenu du service juridique**

Créer `lib/services/plis-confidentiels.ts` :

```ts
/**
 * lib/services/plis-confidentiels.ts
 * Prestation juridique & notariale. Requêtes visées : coursier juridique Paris,
 * transport de plis confidentiels, coursier huissier, remise contre signature.
 */
import type { Service } from "./types";

export const plisConfidentiels: Service = {
  slug: "plis-confidentiels",

  card: {
    tag: "01 — Juridique & notarial",
    title: "Plis confidentiels",
    body: "Remise contre signature, chaîne de responsabilité documentée, coursiers dédiés aux cabinets et études.",
    note: "Preuve de dépôt horodatée",
  },

  seo: {
    title: "Coursier juridique à Paris — plis confidentiels remis contre signature",
    description:
      "Transport de plis confidentiels pour cabinets d’avocats, études notariales et offices d’huissiers à Paris et en petite couronne. Course dédiée, remise contre signature, preuve horodatée.",
    keywords: [
      "coursier juridique Paris",
      "transport plis confidentiels",
      "coursier huissier Paris",
      "coursier notaire Paris",
      "remise contre signature",
    ],
  },

  h1: "Coursier juridique à Paris : plis confidentiels remis contre signature",

  intro:
    "One Connexion transporte les actes, conclusions et pièces de procédure des cabinets d’avocats, études notariales et offices d’huissiers d’Île-de-France. Chaque pli part en course dédiée, sans regroupement, et arrive avec une preuve de remise nominative.",

  stats: [
    { value: "< 45 min", label: "Prise en charge" },
    { value: "99,4 %", label: "Ponctualité constatée" },
    { value: "3,5 M€", label: "Assurance marchandises" },
  ],

  context: {
    title: "Ce qu’un pli juridique ne pardonne pas",
    paragraphs: [
      "Un acte déposé après la clôture du greffe, c’est un délai forclos. Une pièce remise à une personne non identifiée, c’est une remise contestable. Dans le juridique, le transport ne relève pas de la commodité logistique : il s’inscrit dans la procédure et s’expose aux mêmes contestations qu’elle.",
      "La confidentialité impose une contrainte parallèle. Un pli qui voyage avec quinze autres colis, manipulé par trois personnes successives, ne permet plus d’établir qui a eu accès à quoi. C’est la raison pour laquelle nous n’appliquons aucun regroupement sur ces courses : un coursier, un pli, un trajet.",
      "Reste la preuve. Un justificatif de livraison n’a de valeur que s’il nomme la personne qui a signé, l’heure exacte et le lieu. Ces éléments sont enregistrés au moment de la remise, archivés, et restitués sur demande pour être versés au dossier.",
    ],
  },

  steps: [
    {
      title: "Commande",
      body: "Par téléphone ou par courriel, avec l’adresse d’enlèvement, la destination et l’heure limite de remise. Nous confirmons la faisabilité avant d’engager la course.",
    },
    {
      title: "Enlèvement",
      body: "Le coursier se présente au cabinet et prend le pli en charge nominativement. Le pli ne quitte pas sa sacoche jusqu’à la remise.",
    },
    {
      title: "Transport dédié",
      body: "Course directe, sans regroupement ni passage par un centre de tri. La position du coursier est suivie en temps réel pendant tout le trajet.",
    },
    {
      title: "Remise contre signature",
      body: "Le destinataire signe numériquement. Le nom du signataire, l’horodatage et le lieu sont consignés au moment précis de la remise.",
    },
    {
      title: "Preuve archivée",
      body: "Le justificatif vous est transmis puis conservé. Vous pouvez le redemander pour l’annexer à un dossier.",
    },
  ],

  included: [
    "Course dédiée, sans regroupement avec d’autres plis",
    "Remise en main propre contre signature numérique",
    "Nom du signataire, horodatage et lieu consignés",
    "Suivi de position en temps réel pendant le transport",
    "Justificatif de livraison archivé et restituable",
    "Coursier identifiable et joignable pendant la course",
    "Assurance marchandises jusqu’à 3,5 M€",
  ],

  useCases: [
    {
      title: "Dépôt au greffe avant clôture",
      body: "Un jeu de conclusions à déposer avant la fermeture du greffe. Enlèvement au cabinet, dépôt dans la journée, justificatif horodaté en retour.",
    },
    {
      title: "Transmission entre études",
      body: "Un acte à transmettre entre deux études parisiennes, avec remise nominative au clerc désigné et identification de la personne ayant signé.",
    },
    {
      title: "Pièces réclamées en audience",
      body: "Des originaux demandés en cours d’audience. Course immédiate du cabinet vers le palais, coursier joignable pendant tout le trajet.",
    },
  ],

  coverage:
    "Paris intra-muros et petite couronne (92, 93, 94) au tarif standard. Roissy, Orly et la grande couronne sur devis. Les palais de justice, greffes et études d’Île-de-France sont desservis aux mêmes conditions.",

  faq: [
    {
      question: "La remise contre signature a-t-elle une valeur probante ?",
      answer:
        "Le justificatif enregistre le nom du signataire, l’horodatage et le lieu de remise : il établit la réalité et la date de la remise. Il ne se substitue pas à une signification par huissier, qui constitue un acte de procédure distinct.",
    },
    {
      question: "Que se passe-t-il si le destinataire est absent ?",
      answer:
        "Le coursier vous appelle avant toute décision. Selon votre consigne, il patiente, remet à une personne que vous désignez, ou rapporte le pli au cabinet. Un pli confidentiel n’est jamais déposé en boîte aux lettres ni laissé à un tiers non identifié.",
    },
    {
      question: "Le pli voyage-t-il avec d’autres courses ?",
      answer:
        "Non. Les plis confidentiels partent en course dédiée : un coursier, un pli, un trajet direct. C’est la condition pour que la chaîne de responsabilité reste documentable de bout en bout.",
    },
    {
      question: "Combien de temps conservez-vous les justificatifs ?",
      answer:
        "PLACEHOLDER — durée de conservation des justificatifs à confirmer avant mise en ligne.",
    },
    {
      question: "Intervenez-vous en dehors des heures de bureau ?",
      answer:
        "Nous opérons 7j/7, de 7h à 23h. Les courses du soir et du week-end s’organisent aux mêmes conditions, sous réserve de disponibilité au moment de la commande.",
    },
    {
      question: "Peut-on ouvrir un compte pour l’ensemble du cabinet ?",
      answer:
        "Oui. Le compte entreprise regroupe les courses de tous les collaborateurs, centralise la facturation sur une échéance mensuelle et permet l’imputation par dossier.",
    },
  ],
};
```

- [ ] **Étape 3 : créer le module d'accès**

Créer `lib/services/index.ts` :

```ts
/**
 * lib/services/index.ts
 * Source unique des prestations. L'ordre de SERVICES fait l'ordre d'affichage
 * sur la homepage, sur l'index et dans le sitemap.
 */
import type { Service } from "./types";
import { plisConfidentiels } from "./plis-confidentiels";

export type {
  Service,
  ServiceStat,
  ServiceStep,
  ServiceUseCase,
  FaqItem,
} from "./types";

export const SERVICES: Service[] = [plisConfidentiels];

export const SERVICE_SLUGS: string[] = SERVICES.map((service) => service.slug);

export function getService(slug: string): Service | undefined {
  return SERVICES.find((service) => service.slug === slug);
}
```

- [ ] **Étape 4 : ajouter l'URL du site**

Dans `lib/site-content.ts`, ajouter après la ligne `export const FOUNDED_YEAR = "2019";` :

```ts
/**
 * PLACEHOLDER — domaine de production à confirmer avant mise en ligne.
 * Consommé par metadataBase, les URLs canoniques et le sitemap : une valeur
 * erronée produit des canoniques pointant vers un domaine inexistant.
 */
export const SITE_URL = "https://www.oneconnexion.fr";
```

- [ ] **Étape 5 : poser metadataBase**

Dans `app/layout.tsx`, ajouter l'import et le champ. L'import existant devient :

```ts
import { SITE_URL } from "@/lib/site-content";
```

Puis, dans l'objet `metadata`, ajouter `metadataBase` en toute première propriété, avant `title` :

```ts
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "ONE CONNEXION — Coursier B2B, Paris & Île-de-France",
  // … le reste de l'objet reste inchangé
};
```

- [ ] **Étape 6 : vérifier le typage**

Lancer :

```bash
npx tsc --noEmit
```

Attendu : aucune sortie (succès). En cas d'erreur `Cannot find module "@/lib/services"`, vérifier que `lib/services/index.ts` existe bien et que l'alias `@/*` est défini dans `tsconfig.json`.

- [ ] **Étape 7 : vérifier que le build passe toujours**

```bash
npm run build
```

Attendu : build réussi, la route `/` reste listée comme statique. Aucune nouvelle route à ce stade.

- [ ] **Étape 8 : commit (si git est initialisé)**

```bash
git add lib/services lib/site-content.ts app/layout.tsx
git commit -m "feat(services): socle de donnees typé et metadataBase"
```

---

### Tâche 2 : Gabarit de page service

À l'issue de cette tâche, `/services/plis-confidentiels` est en ligne, pré-rendue, avec ses métadonnées et ses données structurées.

**Fichiers :**
- Créer : `components/JsonLd.tsx`
- Créer : `components/services/ServiceHero.tsx`
- Créer : `components/services/ServiceSteps.tsx`
- Créer : `components/services/ServiceUseCases.tsx`
- Créer : `components/services/ServiceFaq.tsx`
- Créer : `components/services/ServiceRelated.tsx`
- Créer : `components/services/ServiceCta.tsx`
- Créer : `app/services/[slug]/page.tsx`

**Interfaces :**
- Consomme : `Service`, `SERVICES`, `SERVICE_SLUGS`, `getService` (tâche 1) ; `SITE_URL`, `EMAIL`, `PHONE_DISPLAY`, `PHONE_TEL` (`lib/site-content.ts`).
- Produit :
  - `JsonLd({ data }: { data: Record<string, unknown> })` ;
  - `ServiceHero({ service }: { service: Service })` ;
  - `ServiceSteps({ steps }: { steps: ServiceStep[] })` ;
  - `ServiceUseCases({ useCases }: { useCases: ServiceUseCase[] })` ;
  - `ServiceFaq({ faq }: { faq: FaqItem[] })` ;
  - `ServiceRelated({ currentSlug }: { currentSlug: string })` ;
  - `ServiceCta({ serviceTitle }: { serviceTitle: string })`.

- [ ] **Étape 1 : créer l'injecteur de données structurées**

Créer `components/JsonLd.tsx` :

```tsx
/**
 * components/JsonLd.tsx
 * Injecte un bloc JSON-LD. Le contenu est sérialisé côté serveur : les données
 * proviennent exclusivement de nos propres fichiers, jamais d'une saisie externe.
 */
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
```

- [ ] **Étape 2 : créer l'en-tête de page**

Créer `components/services/ServiceHero.tsx` :

```tsx
/**
 * components/services/ServiceHero.tsx
 * Fil d'Ariane, H1 ciblé, chapô, CTA et bandeau de chiffres.
 * Fond sombre : reprend le registre du hero de la homepage.
 */
import Link from "next/link";
import type { Service } from "@/lib/services";
import { EMAIL, PHONE_DISPLAY, PHONE_TEL } from "@/lib/site-content";

export default function ServiceHero({ service }: { service: Service }) {
  const subject = encodeURIComponent(`Demande de devis — ${service.card.title}`);

  return (
    <section className="bg-ink text-white">
      <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] pb-16 pt-12">
        <nav
          aria-label="Fil d’Ariane"
          className="mb-9 font-mono text-[10px] tracking-[0.16em] text-white/40 uppercase"
        >
          <Link href="/" className="text-white/40 hover:text-white">
            Accueil
          </Link>
          <span className="px-2 text-white/25">›</span>
          <Link href="/services" className="text-white/40 hover:text-white">
            Prestations
          </Link>
          <span className="px-2 text-white/25">›</span>
          <span className="text-white/70">{service.card.title}</span>
        </nav>

        <div className="mb-3 flex items-center gap-3 font-mono text-[10px] tracking-[0.16em] text-accent uppercase">
          <span className="h-px w-6 bg-accent" />
          {service.card.tag}
        </div>

        <h1 className="mb-6 max-w-[22ch] text-balance text-[clamp(32px,4.4vw,58px)] font-bold leading-[1.05] tracking-[-0.035em]">
          {service.h1}
        </h1>

        <p className="mb-9 max-w-[58ch] text-pretty text-[17px] leading-[1.6] text-white/66">
          {service.intro}
        </p>

        <div className="mb-14 flex flex-wrap gap-3">
          <a
            href={`mailto:${EMAIL}?subject=${subject}`}
            className="rounded-[2px] bg-accent px-[26px] py-[15px] text-[15px] font-semibold text-white hover:bg-accent-dark"
          >
            Demander un devis
          </a>
          <a
            href={`tel:${PHONE_TEL}`}
            className="rounded-[2px] border border-white/22 px-[26px] py-[15px] text-[15px] font-semibold text-white hover:border-white"
          >
            {PHONE_DISPLAY}
          </a>
        </div>

        <dl className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-px border border-white/10 bg-white/10">
          {service.stats.map((stat) => (
            {/* flex-col + order : <dt> doit précéder <dd> dans le DOM (règle
                des listes de définitions), mais la valeur s'affiche au-dessus
                du libellé, comme dans le bloc de stats de la homepage. */}
            <div key={stat.label} className="flex flex-col bg-ink px-[18px] py-[22px]">
              <dt className="order-2 mt-2 font-mono text-[10px] tracking-[0.12em] text-white/44 uppercase">
                {stat.label}
              </dt>
              <dd className="order-1 text-[26px] font-bold tracking-[-0.02em] tabular-nums">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
```

- [ ] **Étape 3 : créer la procédure**

Créer `components/services/ServiceSteps.tsx` :

```tsx
/**
 * components/services/ServiceSteps.tsx
 * Procédure numérotée. <ol> réel : l'ordre porte du sens.
 */
import type { ServiceStep } from "@/lib/services";

export default function ServiceSteps({ steps }: { steps: ServiceStep[] }) {
  return (
    <ol className="grid gap-px border border-line bg-line">
      {steps.map((step, i) => (
        <li
          key={step.title}
          className="grid gap-4 bg-paper-card px-[30px] py-[26px] sm:grid-cols-[64px_1fr]"
        >
          <span className="font-mono text-[11px] tracking-[0.16em] text-accent-dark tabular-nums">
            {String(i + 1).padStart(2, "0")}
          </span>
          <div className="min-w-0">
            <h3 className="mb-2 text-[17px] font-bold tracking-[-0.02em]">
              {step.title}
            </h3>
            <p className="max-w-[64ch] text-[15px] leading-[1.6] text-muted">
              {step.body}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
```

- [ ] **Étape 4 : créer les cas d'usage**

Créer `components/services/ServiceUseCases.tsx` :

```tsx
/**
 * components/services/ServiceUseCases.tsx
 * Situations concrètes. Fort levier sur les requêtes longue traîne et sur
 * les réponses générées par IA, qui reprennent volontiers ce format.
 */
import type { ServiceUseCase } from "@/lib/services";

export default function ServiceUseCases({
  useCases,
}: {
  useCases: ServiceUseCase[];
}) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
      {useCases.map((useCase) => (
        <article
          key={useCase.title}
          className="border border-line bg-paper-card px-[26px] pb-[26px] pt-[28px]"
        >
          <h3 className="mb-2.5 text-[16px] font-bold tracking-[-0.02em]">
            {useCase.title}
          </h3>
          <p className="text-[15px] leading-[1.6] text-muted">{useCase.body}</p>
        </article>
      ))}
    </div>
  );
}
```

- [ ] **Étape 5 : créer la FAQ**

Créer `components/services/ServiceFaq.tsx`. Les éléments `<details>`/`<summary>` natifs sont délibérés : aucun JavaScript, rendu côté serveur, accessible au clavier, et le texte des réponses est présent dans le HTML livré aux robots — ce qu'un accordéon monté côté client ne garantit pas.

```tsx
/**
 * components/services/ServiceFaq.tsx
 * FAQ en <details>/<summary> natifs : pas de JavaScript, réponses présentes
 * dans le HTML servi (condition de l'éligibilité aux extraits enrichis).
 */
import type { FaqItem } from "@/lib/services";

export default function ServiceFaq({ faq }: { faq: FaqItem[] }) {
  return (
    <div className="grid gap-px border border-line bg-line">
      {faq.map((item) => (
        <details key={item.question} className="group bg-paper-card">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 px-[26px] py-[20px] text-[16px] font-semibold tracking-[-0.01em] hover:text-accent-dark">
            {item.question}
            <span
              aria-hidden="true"
              className="shrink-0 font-mono text-[18px] leading-none text-accent-dark group-open:hidden"
            >
              +
            </span>
            <span
              aria-hidden="true"
              className="hidden shrink-0 font-mono text-[18px] leading-none text-accent-dark group-open:block"
            >
              −
            </span>
          </summary>
          <p className="max-w-[76ch] px-[26px] pb-[22px] text-[15px] leading-[1.65] text-muted">
            {item.answer}
          </p>
        </details>
      ))}
    </div>
  );
}
```

- [ ] **Étape 6 : créer le maillage interne**

Créer `components/services/ServiceRelated.tsx` :

```tsx
/**
 * components/services/ServiceRelated.tsx
 * Liens vers les autres prestations : maillage interne et rebond commercial.
 */
import Link from "next/link";
import { SERVICES } from "@/lib/services";

export default function ServiceRelated({ currentSlug }: { currentSlug: string }) {
  const others = SERVICES.filter((service) => service.slug !== currentSlug);

  if (others.length === 0) return null;

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
      {others.map((service) => (
        <Link
          key={service.slug}
          href={`/services/${service.slug}`}
          className="group border border-line bg-paper-card px-[26px] pb-[26px] pt-[28px] text-ink hover:border-ink hover:text-ink"
        >
          <div className="mb-2.5 font-mono text-[10px] tracking-[0.16em] text-label uppercase">
            {service.card.tag}
          </div>
          <h3 className="mb-2 text-[17px] font-bold tracking-[-0.02em]">
            {service.card.title}
          </h3>
          <p className="mb-4 text-[14.5px] leading-[1.6] text-muted">
            {service.card.body}
          </p>
          <span className="font-mono text-[10.5px] tracking-[0.1em] text-accent-dark uppercase">
            Voir la prestation →
          </span>
        </Link>
      ))}
    </div>
  );
}
```

- [ ] **Étape 7 : créer le bloc de conversion**

Créer `components/services/ServiceCta.tsx`. Il reprend les deux seuls points de contact du site (`tel:` et `mailto:`), sans créer de canal supplémentaire ; l'objet du courriel est pré-rempli pour qualifier la demande à la réception.

```tsx
/**
 * components/services/ServiceCta.tsx
 * Bloc de conversion final. Réutilise les points de contact existants
 * (téléphone et courriel) : aucun formulaire dupliqué, un seul canal à tenir.
 */
import { EMAIL, PHONE_DISPLAY, PHONE_TEL } from "@/lib/site-content";

export default function ServiceCta({ serviceTitle }: { serviceTitle: string }) {
  const subject = encodeURIComponent(`Demande de devis — ${serviceTitle}`);

  return (
    <section className="bg-accent text-white">
      <div className="mx-auto grid max-w-[1240px] grid-cols-[repeat(auto-fit,minmax(300px,1fr))] items-center gap-10 px-[clamp(20px,4vw,28px)] py-20">
        <div className="min-w-0">
          <h2 className="mb-3.5 text-balance text-[clamp(26px,3vw,38px)] font-bold leading-[1.1] tracking-[-0.03em]">
            Une course à engager aujourd’hui ?
          </h2>
          <p className="max-w-[46ch] text-[17px] leading-[1.6] text-white/88">
            Appelez-nous pour un départ immédiat, ou demandez un devis : nous
            confirmons la faisabilité avant d’engager la course.
          </p>
        </div>
        <div className="flex min-w-0 flex-wrap justify-end gap-3">
          <a
            href={`tel:${PHONE_TEL}`}
            className="rounded-[2px] bg-ink px-[26px] py-4 text-[15px] font-semibold text-white hover:bg-white hover:text-ink"
          >
            {PHONE_DISPLAY}
          </a>
          <a
            href={`mailto:${EMAIL}?subject=${subject}`}
            className="rounded-[2px] border border-white/60 px-[26px] py-4 text-[15px] font-semibold text-white hover:border-white hover:bg-white hover:text-accent"
          >
            Demander un devis
          </a>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Étape 8 : créer le gabarit de page**

Créer `app/services/[slug]/page.tsx`. Noter le `await params` : en Next.js 16 l'accès synchrone n'existe plus.

```tsx
/**
 * app/services/[slug]/page.tsx
 * Gabarit unique des pages de prestation. Pré-rendu statiquement pour chaque
 * slug déclaré dans lib/services. Un slug inconnu produit un vrai 404.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import ServiceCta from "@/components/services/ServiceCta";
import ServiceFaq from "@/components/services/ServiceFaq";
import ServiceHero from "@/components/services/ServiceHero";
import ServiceRelated from "@/components/services/ServiceRelated";
import ServiceSteps from "@/components/services/ServiceSteps";
import ServiceUseCases from "@/components/services/ServiceUseCases";
import { SERVICE_SLUGS, getService } from "@/lib/services";
import { SITE_URL } from "@/lib/site-content";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return SERVICE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);

  if (!service) return {};

  const url = `/services/${service.slug}`;

  return {
    title: service.seo.title,
    description: service.seo.description,
    keywords: service.seo.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: service.seo.title,
      description: service.seo.description,
      url,
      type: "website",
      locale: "fr_FR",
    },
  };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const service = getService(slug);

  if (!service) notFound();

  const pageUrl = `${SITE_URL}/services/${service.slug}`;

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.card.title,
    description: service.seo.description,
    serviceType: service.card.tag,
    areaServed: { "@type": "AdministrativeArea", name: "Île-de-France" },
    provider: {
      "@type": "Organization",
      name: "ONE CONNEXION",
      url: SITE_URL,
    },
    url: pageUrl,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Prestations",
        item: `${SITE_URL}/services`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: service.card.title,
        item: pageUrl,
      },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: service.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <>
      <JsonLd data={serviceSchema} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={faqSchema} />

      <ServiceHero service={service} />

      <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)]">
        <section className="border-b border-line py-[72px]">
          <h2 className="mb-7 max-w-[20ch] text-[clamp(26px,3vw,38px)] font-bold leading-[1.1] tracking-[-0.03em]">
            {service.context.title}
          </h2>
          <div className="grid max-w-[68ch] gap-5">
            {service.context.paragraphs.map((paragraph) => (
              <p key={paragraph} className="text-[16.5px] leading-[1.65] text-muted">
                {paragraph}
              </p>
            ))}
          </div>
        </section>

        <section className="border-b border-line py-[72px]">
          <div className="mb-9">
            <div className="mb-4 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">
              Procédure
            </div>
            <h2 className="max-w-[20ch] text-[clamp(26px,3vw,38px)] font-bold leading-[1.1] tracking-[-0.03em]">
              De la commande à la preuve de remise.
            </h2>
          </div>
          <ServiceSteps steps={service.steps} />
        </section>

        <section className="border-b border-line py-[72px]">
          <div className="mb-9 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">
            Prestations incluses
          </div>
          <ul className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-x-10 gap-y-px">
            {service.included.map((item) => (
              <li
                key={item}
                className="border-b border-line py-[15px] text-[15.5px] leading-[1.5] text-muted"
              >
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="border-b border-line py-[72px]">
          <div className="mb-9">
            <div className="mb-4 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">
              Cas d’usage
            </div>
            <h2 className="max-w-[22ch] text-[clamp(26px,3vw,38px)] font-bold leading-[1.1] tracking-[-0.03em]">
              Trois situations que nous traitons chaque semaine.
            </h2>
          </div>
          <ServiceUseCases useCases={service.useCases} />
        </section>

        <section className="border-b border-line py-[72px]">
          <div className="mb-5 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">
            Zone couverte
          </div>
          <p className="max-w-[68ch] text-[16.5px] leading-[1.65] text-muted">
            {service.coverage}
          </p>
          <Link
            href="/#flotte"
            className="mt-6 inline-block font-mono text-[10.5px] tracking-[0.1em] text-accent-dark uppercase hover:text-ink"
          >
            Voir la flotte et la couverture →
          </Link>
        </section>

        <section className="border-b border-line py-[72px]">
          <div className="mb-9">
            <div className="mb-4 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">
              Questions fréquentes
            </div>
            <h2 className="max-w-[20ch] text-[clamp(26px,3vw,38px)] font-bold leading-[1.1] tracking-[-0.03em]">
              Ce que les cabinets nous demandent.
            </h2>
          </div>
          <ServiceFaq faq={service.faq} />
        </section>

        <section className="py-[72px]">
          <div className="mb-9 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">
            Autres prestations
          </div>
          <ServiceRelated currentSlug={service.slug} />
        </section>
      </div>

      <ServiceCta serviceTitle={service.card.title} />
    </>
  );
}
```

- [ ] **Étape 9 : vérifier le build et le pré-rendu**

```bash
npm run build
```

Attendu : build réussi, et la sortie liste `/services/[slug]` avec la route `/services/plis-confidentiels` générée statiquement (marquée `●` ou `SSG` selon le formatage de Next 16). Si la route apparaît comme dynamique (`ƒ`), `generateStaticParams` n'est pas pris en compte : vérifier qu'il est bien exporté.

- [ ] **Étape 10 : vérifier le HTML produit**

Démarrer le serveur de production dans un terminal :

```bash
npm run start
```

Puis, dans un autre terminal :

```bash
curl -s http://localhost:3000/services/plis-confidentiels > /tmp/page.html
grep -c "<h1" /tmp/page.html
grep -c "application/ld+json" /tmp/page.html
grep -c "FAQPage" /tmp/page.html
grep -c "rel=\"canonical\"" /tmp/page.html
grep -c "se substitue pas à une signification" /tmp/page.html
```

Attendu, dans l'ordre : `1` (un seul H1), `3` (les trois blocs JSON-LD), `1`, `1`, et `1` — cette dernière vérification prouve que le texte d'une réponse de FAQ est bien dans le HTML servi, et non injecté côté client.

- [ ] **Étape 11 : vérifier le 404**

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/services/slug-inexistant
```

Attendu : `404`.

- [ ] **Étape 12 : lint**

```bash
npm run lint
```

Attendu : aucune erreur. L'avertissement éventuel sur `dangerouslySetInnerHTML` dans `JsonLd.tsx` est acceptable — les données sérialisées proviennent de nos propres fichiers, jamais d'une entrée utilisateur.

- [ ] **Étape 13 : commit (si git est initialisé)**

```bash
git add components/JsonLd.tsx components/services app/services
git commit -m "feat(services): gabarit de page prestation avec donnees structurees"
```

---

### Tâche 3 : Index des prestations

**Fichiers :**
- Créer : `app/services/page.tsx`

**Interfaces :**
- Consomme : `SERVICES` (tâche 1), `ServiceCta` (tâche 2), `SITE_URL`.
- Produit : la route `/services`, cible des liens du header.

- [ ] **Étape 1 : créer la page index**

Créer `app/services/page.tsx` :

```tsx
/**
 * app/services/page.tsx
 * Index des prestations. Capte les requêtes génériques ("coursier B2B Paris")
 * et distribue vers les quatre pages métier.
 */
import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import ServiceCta from "@/components/services/ServiceCta";
import { SERVICES } from "@/lib/services";
import { SITE_URL } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Prestations — coursier B2B à Paris et en Île-de-France",
  description:
    "Quatre prestations de coursier B2B en Île-de-France : plis confidentiels, transport médical, livraison e-commerce le jour même et compte entreprise. Course dédiée, traçabilité, interlocuteur unique.",
  keywords: [
    "coursier B2B Paris",
    "prestations coursier Île-de-France",
    "transport urgent entreprise Paris",
  ],
  alternates: { canonical: "/services" },
  openGraph: {
    title: "Prestations — coursier B2B à Paris et en Île-de-France",
    description:
      "Quatre prestations de coursier B2B en Île-de-France, chacune avec sa procédure écrite.",
    url: "/services",
    type: "website",
    locale: "fr_FR",
  },
};

export default function ServicesIndexPage() {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Prestations",
        item: `${SITE_URL}/services`,
      },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumbSchema} />

      <section className="bg-ink text-white">
        <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] pb-16 pt-12">
          <nav
            aria-label="Fil d’Ariane"
            className="mb-9 font-mono text-[10px] tracking-[0.16em] text-white/40 uppercase"
          >
            <Link href="/" className="text-white/40 hover:text-white">
              Accueil
            </Link>
            <span className="px-2 text-white/25">›</span>
            <span className="text-white/70">Prestations</span>
          </nav>

          <div className="mb-3 flex items-center gap-3 font-mono text-[10px] tracking-[0.16em] text-accent uppercase">
            <span className="h-px w-6 bg-accent" />
            Prestations
          </div>

          <h1 className="mb-6 max-w-[20ch] text-balance text-[clamp(32px,4.4vw,58px)] font-bold leading-[1.05] tracking-[-0.035em]">
            Coursier B2B à Paris : quatre métiers, une même exigence.
          </h1>

          <p className="max-w-[58ch] text-pretty text-[17px] leading-[1.6] text-white/66">
            Chaque secteur impose ses contraintes : signature manuscrite,
            maintien en température, créneau de réception. Nos procédures sont
            écrites par type de flux, pas improvisées à la course.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-[72px]">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-4">
          {SERVICES.map((service) => (
            <Link
              key={service.slug}
              href={`/services/${service.slug}`}
              className="flex flex-col gap-3.5 border border-line bg-paper-card px-[30px] pb-[30px] pt-[34px] text-ink hover:border-ink hover:text-ink"
            >
              <div className="font-mono text-[10px] tracking-[0.16em] text-label uppercase">
                {service.card.tag}
              </div>
              <h2 className="text-xl font-bold tracking-[-0.02em]">
                {service.card.title}
              </h2>
              <p className="text-[15px] leading-[1.6] text-muted">
                {service.card.body}
              </p>
              <div className="mt-auto pt-5 font-mono text-[10.5px] tracking-[0.1em] text-accent-dark uppercase">
                Voir la prestation →
              </div>
            </Link>
          ))}
        </div>
      </div>

      <ServiceCta serviceTitle="toutes prestations" />
    </>
  );
}
```

- [ ] **Étape 2 : vérifier**

```bash
npm run build
```

Attendu : la route `/services` apparaît comme statique dans la sortie.

Puis, serveur démarré (`npm run start`) :

```bash
curl -s http://localhost:3000/services | grep -c "plis-confidentiels"
```

Attendu : au moins `1` — la carte pointe vers la page de détail.

- [ ] **Étape 3 : commit (si git est initialisé)**

```bash
git add app/services/page.tsx
git commit -m "feat(services): page index des prestations"
```

---

### Tâche 4 : Contenu des trois prestations restantes

**Fichiers :**
- Créer : `lib/services/transport-medical.ts`
- Créer : `lib/services/livraison-e-commerce.ts`
- Créer : `lib/services/compte-entreprise.ts`
- Modifier : `lib/services/index.ts` (enregistrement des trois services)

**Interfaces :**
- Consomme : `Service` (tâche 1).
- Produit : `SERVICES` passe de 1 à 4 entrées ; `SERVICE_SLUGS` devient `["plis-confidentiels", "transport-medical", "livraison-e-commerce", "compte-entreprise"]`. Aucun composant ne change : le gabarit les rend automatiquement.

- [ ] **Étape 1 : rédiger la prestation santé**

Créer `lib/services/transport-medical.ts`. **Précaution réglementaire impérative :** le transport d'échantillons biologiques est encadré (classification UN3373, triple emballage, obligations ADR). Le texte ci-dessous décrit des pratiques opérationnelles et ne revendique aucune certification, agrément ou conformité ; toute affirmation de ce type reste `PLACEHOLDER` jusqu'à validation documentaire. Ne pas « améliorer » ces formulations en ajoutant des mentions de conformité.

```ts
/**
 * lib/services/transport-medical.ts
 * Prestation santé & laboratoires. Requêtes visées : coursier médical Paris,
 * transport de prélèvements, transport d'échantillons biologiques Île-de-France.
 *
 * ATTENTION : aucune conformité réglementaire (UN3373, ADR, agrément) n'est
 * affirmée ici. Les mentions correspondantes restent PLACEHOLDER.
 */
import type { Service } from "./types";

export const transportMedical: Service = {
  slug: "transport-medical",

  card: {
    tag: "02 — Santé & laboratoires",
    title: "Transport médical",
    body: "Prélèvements, pièces critiques et matériel technique. Contenants isothermes et relevés de température à la demande.",
    note: "Course dédiée, sans regroupement",
  },

  seo: {
    title: "Coursier médical à Paris — transport de prélèvements et matériel de laboratoire",
    description:
      "Transport urgent de prélèvements, échantillons et matériel technique pour laboratoires, cliniques et cabinets d’Île-de-France. Course dédiée, contenants isothermes, traçabilité de bout en bout.",
    keywords: [
      "coursier médical Paris",
      "transport prélèvements laboratoire",
      "transport échantillons biologiques Île-de-France",
      "coursier laboratoire analyses Paris",
      "transport urgent matériel médical",
    ],
  },

  h1: "Transport médical urgent à Paris : prélèvements et matériel de laboratoire",

  intro:
    "One Connexion achemine les prélèvements, échantillons et pièces techniques des laboratoires d’analyses, cliniques et cabinets d’Île-de-France. Course dédiée, contenant adapté, et une contrainte qui commande tout le reste : le délai de stabilité de ce qui est transporté.",

  stats: [
    { value: "< 45 min", label: "Prise en charge" },
    { value: "99,4 %", label: "Ponctualité constatée" },
    { value: "Sans regroupement", label: "Course dédiée" },
  ],

  context: {
    title: "Un échantillon ne se renvoie pas",
    paragraphs: [
      "Un prélèvement dégradé n’est pas une livraison ratée : c’est un patient qu’il faut reconvoquer, une analyse à refaire, et un résultat qui arrive trop tard pour la décision qu’il devait éclairer. Contrairement à un colis, un échantillon ne se réexpédie pas.",
      "Le délai de stabilité commande toute la course. Il varie selon la nature du prélèvement et les exigences du laboratoire destinataire : c’est vous qui le fixez, et c’est lui qui détermine si la course est réalisable. Nous confirmons la faisabilité avant d’engager, plutôt que d’accepter puis d’échouer.",
      "Le maintien en température suit la même logique. Le contenant isotherme est choisi en fonction de ce qui est transporté, et un relevé de température peut être joint à la course lorsque le protocole du laboratoire l’exige — à préciser à la commande.",
    ],
  },

  steps: [
    {
      title: "Commande et faisabilité",
      body: "Vous indiquez la nature du transport, le délai de stabilité et les conditions de température. Nous confirmons la faisabilité avant d’engager la course.",
    },
    {
      title: "Enlèvement conditionné",
      body: "Le coursier se présente avec le contenant adapté convenu à la commande. Le conditionnement de l’échantillon relève du site expéditeur, conformément aux protocoles en vigueur.",
    },
    {
      title: "Transport direct",
      body: "Course dédiée, sans regroupement ni rupture de charge. Le deux-roues s’affranchit des congestions qui constituent le principal risque sur les délais courts.",
    },
    {
      title: "Suivi en temps réel",
      body: "La position du coursier est consultable pendant toute la course. Le laboratoire destinataire peut anticiper la réception.",
    },
    {
      title: "Remise et traçabilité",
      body: "Remise en main propre au service destinataire, horodatée et nominative. Relevé de température joint lorsque la course en prévoit un.",
    },
  ],

  included: [
    "Course dédiée, sans regroupement ni rupture de charge",
    "Contenant isotherme adapté, convenu à la commande",
    "Relevé de température sur demande",
    "Confirmation de faisabilité avant engagement de la course",
    "Suivi de position en temps réel",
    "Remise en main propre horodatée et nominative",
    "Coursier joignable pendant toute la course",
  ],

  useCases: [
    {
      title: "Prélèvements vers un plateau technique",
      body: "Des prélèvements collectés en cabinet à acheminer vers le plateau technique dans le délai de stabilité fixé par le laboratoire.",
    },
    {
      title: "Transfert inter-sites",
      body: "Un échantillon à transférer entre deux sites d’un même groupe pour une analyse spécialisée, avec maintien des conditions de température.",
    },
    {
      title: "Pièce technique immobilisante",
      body: "Une pièce de rechange qui bloque un automate d’analyse. Enlèvement chez le fournisseur et livraison directe au service technique.",
    },
  ],

  coverage:
    "Paris intra-muros et petite couronne (92, 93, 94) au tarif standard. Roissy, Orly et la grande couronne sur devis. Laboratoires, cliniques et plateaux techniques d’Île-de-France desservis aux mêmes conditions.",

  faq: [
    {
      question: "Comment le maintien en température est-il assuré ?",
      answer:
        "Le contenant isotherme est choisi à la commande en fonction de la nature du transport et de la durée prévue. Un relevé de température peut être joint lorsque le protocole du laboratoire l’exige : précisez-le au moment de la commande.",
    },
    {
      question: "Qui est responsable du conditionnement de l’échantillon ?",
      answer:
        "Le conditionnement relève du site expéditeur, qui applique les protocoles propres à la nature du prélèvement. Nous assurons le transport dans le contenant convenu et le maintien des conditions pendant la course.",
    },
    {
      question: "Que se passe-t-il si le délai de stabilité ne peut pas être tenu ?",
      answer:
        "Nous vous le disons avant d’engager la course, pas après. La faisabilité est confirmée au moment de la commande en fonction du délai que vous fixez, de l’heure et de la distance.",
    },
    {
      question: "Disposez-vous des habilitations réglementaires pour le transport d’échantillons biologiques ?",
      answer:
        "PLACEHOLDER — habilitations, formations ADR et conformité au conditionnement UN3373 à documenter et faire valider avant mise en ligne. Ne pas publier cette page sans avoir tranché ce point.",
    },
    {
      question: "Assurez-vous des tournées récurrentes ?",
      answer:
        "Oui. Les collectes régulières entre sites ou cabinets et plateau technique s’organisent sur créneaux fixes dans le cadre d’un compte entreprise.",
    },
    {
      question: "Intervenez-vous le week-end ?",
      answer:
        "Nous opérons 7j/7, de 7h à 23h. Les collectes de week-end s’organisent aux mêmes conditions, sous réserve de disponibilité au moment de la commande.",
    },
  ],
};
```

- [ ] **Étape 2 : rédiger la prestation e-commerce**

Créer `lib/services/livraison-e-commerce.ts` :

```ts
/**
 * lib/services/livraison-e-commerce.ts
 * Prestation e-commerce. Requêtes visées : livraison le jour même Paris,
 * coursier e-commerce, livraison same day Île-de-France.
 */
import type { Service } from "./types";

export const livraisonEcommerce: Service = {
  slug: "livraison-e-commerce",

  card: {
    tag: "03 — E-commerce",
    title: "Livraison jour même",
    body: "Collecte en boutique ou en entrepôt, livraison dans la journée sur Paris et première couronne. Créneaux au choix du destinataire.",
    note: "Tournées récurrentes possibles",
  },

  seo: {
    title: "Livraison le jour même à Paris — coursier e-commerce en Île-de-France",
    description:
      "Collecte en boutique ou en entrepôt et livraison le jour même sur Paris et la petite couronne. Créneaux choisis par le destinataire, suivi en temps réel, preuve de livraison.",
    keywords: [
      "livraison jour même Paris",
      "coursier e-commerce Paris",
      "livraison same day Île-de-France",
      "livraison dernier kilomètre Paris",
      "coursier boutique en ligne",
    ],
  },

  h1: "Livraison le jour même à Paris pour votre e-commerce",

  intro:
    "Vos clients commandent le matin et reçoivent avant le dîner. One Connexion collecte en boutique ou en entrepôt et livre dans la journée sur Paris et la petite couronne, avec un créneau choisi par le destinataire.",

  stats: [
    { value: "Jour même", label: "Délai de livraison" },
    { value: "99,4 %", label: "Ponctualité constatée" },
    { value: "18 kg", label: "Charge par course" },
  ],

  context: {
    title: "Le dernier kilomètre porte votre promesse, pas la nôtre",
    paragraphs: [
      "Le transporteur est invisible tant que tout va bien. Dès qu’une livraison échoue, c’est votre marque que le client tient pour responsable, votre service client qui absorbe la réclamation, et votre note qui en porte la trace. Le dernier kilomètre est le seul moment physique de la relation : il vaut mieux qu’il soit tenu.",
      "L’échec de livraison est le premier poste de coût caché du secteur. Un destinataire absent, c’est une seconde présentation, un colis qui dort quelque part, et un client qui ne comprend pas. Laisser le destinataire choisir son créneau supprime la cause à la racine plutôt que d’en traiter les conséquences.",
      "La livraison le jour même change par ailleurs la nature de l’argument commercial. Ce n’est plus une option de confort en fin de tunnel : c’est ce qui permet de vendre à quelqu’un qui hésitait à traverser la ville pour l’acheter en boutique.",
    ],
  },

  steps: [
    {
      title: "Collecte",
      body: "Enlèvement en boutique, en entrepôt ou en point de stockage, sur créneau fixe ou à la demande selon votre volume.",
    },
    {
      title: "Créneau avec le destinataire",
      body: "Le créneau de réception est choisi par le destinataire, ce qui supprime la première cause d’échec de livraison.",
    },
    {
      title: "Livraison dans la journée",
      body: "Course directe sur Paris et la petite couronne. Le deux-roues n’attend ni les bouchons ni les restrictions de circulation.",
    },
    {
      title: "Remise et preuve",
      body: "Remise en main propre, horodatée. La preuve de livraison est disponible pour votre service client en cas de contestation.",
    },
    {
      title: "Retour éventuel",
      body: "En cas d’absence malgré le créneau, le colis vous est rapporté ou représenté selon la consigne définie à l’ouverture du compte.",
    },
  ],

  included: [
    "Collecte en boutique, entrepôt ou point de stockage",
    "Créneau de réception choisi par le destinataire",
    "Livraison le jour même sur Paris et petite couronne",
    "Suivi de position en temps réel",
    "Preuve de livraison horodatée et archivée",
    "Consigne de repli définie à l’avance en cas d’absence",
    "Tournées récurrentes sur créneaux fixes",
  ],

  useCases: [
    {
      title: "Commande passée avant midi",
      body: "Une commande passée le matin sur votre boutique, collectée en début d’après-midi et livrée avant le dîner, dans le créneau choisi par le client.",
    },
    {
      title: "Réassort entre points de vente",
      body: "Un article disponible dans une seule boutique et demandé dans une autre. Transfert dans la journée plutôt que vente perdue.",
    },
    {
      title: "Pic saisonnier",
      body: "Un volume qui double sur quelques jours. Les tournées passent en créneaux rapprochés sans renégocier le contrat.",
    },
  ],

  coverage:
    "Paris intra-muros et petite couronne (92, 93, 94) au tarif standard. Roissy, Orly et la grande couronne sur devis. Les collectes récurrentes s’organisent sur créneaux fixes convenus à l’avance.",

  faq: [
    {
      question: "Quelle est l’heure limite de collecte pour une livraison le jour même ?",
      answer:
        "PLACEHOLDER — heure limite (cut-off) à confirmer avant mise en ligne. Elle dépend de la zone de collecte et de la zone de livraison.",
    },
    {
      question: "Que se passe-t-il si le destinataire est absent ?",
      answer:
        "La consigne est définie à l’ouverture du compte : représentation, retour à l’expéditeur, ou remise à une personne désignée. Le créneau choisi par le destinataire réduit fortement ce cas de figure.",
    },
    {
      question: "Quel est le poids maximal par course ?",
      answer:
        "18 kg par course, dans un top-case de 60 × 40 cm. Au-delà, la commande est répartie sur plusieurs courses : nous le signalons au moment du devis.",
    },
    {
      question: "Peut-on brancher la commande sur notre boutique en ligne ?",
      answer:
        "PLACEHOLDER — intégration technique (API, connecteurs de plateformes e-commerce) à confirmer. Les commandes se passent aujourd’hui par téléphone et par courriel.",
    },
    {
      question: "Gérez-vous les retours ?",
      answer:
        "Oui, sur le même principe qu’une livraison : enlèvement chez le client et retour vers votre boutique ou votre entrepôt, avec preuve d’enlèvement.",
    },
    {
      question: "Proposez-vous des tarifs dégressifs au volume ?",
      answer:
        "PLACEHOLDER — grille tarifaire et conditions de dégressivité à confirmer avant mise en ligne.",
    },
  ],
};
```

- [ ] **Étape 3 : rédiger la prestation compte entreprise**

Créer `lib/services/compte-entreprise.ts` :

```ts
/**
 * lib/services/compte-entreprise.ts
 * Prestation transversale : suivi, justificatifs et facturation centralisée.
 * Requêtes visées : compte coursier entreprise, facturation mensuelle coursier.
 */
import type { Service } from "./types";

export const compteEntreprise: Service = {
  slug: "compte-entreprise",

  card: {
    tag: "04 — Comptes entreprises",
    title: "Suivi & facturation",
    body: "Position en temps réel, justificatifs de livraison archivés, facturation mensuelle centralisée et export comptable.",
    note: "Interlocuteur unique",
  },

  seo: {
    title: "Compte entreprise coursier — suivi en temps réel et facturation centralisée",
    description:
      "Ouvrez un compte coursier pour votre entreprise à Paris : commandes par plusieurs collaborateurs, justificatifs archivés, facturation mensuelle unique et export comptable.",
    keywords: [
      "compte coursier entreprise",
      "facturation mensuelle coursier",
      "contrat coursier entreprise Paris",
      "coursier multi-sites Île-de-France",
    ],
  },

  h1: "Compte entreprise : suivi en temps réel et facturation centralisée",

  intro:
    "Le compte entreprise regroupe les courses de tous vos collaborateurs et de tous vos sites sous une facturation unique. Un interlocuteur, une échéance mensuelle, et des justificatifs archivés que vous pouvez retrouver des mois plus tard.",

  stats: [
    { value: "1", label: "Interlocuteur dédié" },
    { value: "Mensuelle", label: "Facturation" },
    { value: "Sous 2 h", label: "Réponse aux devis" },
  ],

  context: {
    title: "Le coût d’une course n’est pas seulement son prix",
    paragraphs: [
      "Dans la plupart des structures, les courses se commandent au fil de l’eau : chacun appelle, chacun avance, et la comptabilité récupère en fin de mois une liasse de justificatifs disparates qu’il faut rapprocher un par un. Le temps passé à régulariser dépasse souvent le prix des courses elles-mêmes.",
      "Le second angle mort est la preuve. Un justificatif de livraison ne sert à rien le jour de la course : il sert six mois plus tard, quand un client ou une partie adverse conteste une réception. S’il n’est pas archivé et retrouvable, il n’existe pas.",
      "Le compte entreprise traite les deux : une facture unique par mois, imputable par dossier ou par service, et des justificatifs conservés et restituables à la demande.",
    ],
  },

  steps: [
    {
      title: "Ouverture du compte",
      body: "Nous définissons ensemble les sites concernés, les collaborateurs autorisés à commander et les consignes de repli en cas d’absence du destinataire.",
    },
    {
      title: "Commandes multi-collaborateurs",
      body: "Chaque collaborateur autorisé commande par téléphone ou par courriel. Les courses sont rattachées automatiquement au compte, sans avance de frais.",
    },
    {
      title: "Suivi en temps réel",
      body: "La position du coursier est consultable pendant la course, pour le demandeur comme pour le destinataire.",
    },
    {
      title: "Justificatifs archivés",
      body: "Chaque remise génère un justificatif horodaté et nominatif, conservé et restituable sur demande.",
    },
    {
      title: "Facturation centralisée",
      body: "Une facture mensuelle unique, détaillée course par course, avec export comptable et imputation par dossier ou par service.",
    },
  ],

  included: [
    "Interlocuteur unique pour l’ensemble du compte",
    "Commandes par plusieurs collaborateurs, sans avance de frais",
    "Suivi de position en temps réel",
    "Justificatifs de livraison archivés et restituables",
    "Facture mensuelle unique et détaillée",
    "Export comptable et imputation par dossier ou service",
    "Consignes de livraison définies une fois pour toutes",
  ],

  useCases: [
    {
      title: "Cabinet multi-associés",
      body: "Quinze collaborateurs commandent des courses sans avancer de frais ; la comptabilité reçoit une facture unique, imputable par dossier.",
    },
    {
      title: "Entreprise multi-sites",
      body: "Trois implantations en Île-de-France commandent indépendamment, sous un seul contrat et une seule échéance mensuelle.",
    },
    {
      title: "Justificatif réclamé a posteriori",
      body: "Une réception contestée plusieurs mois après la livraison. Le justificatif horodaté et nominatif est retrouvé et transmis.",
    },
  ],

  coverage:
    "Le compte entreprise couvre l’ensemble de nos prestations sur Paris et la petite couronne (92, 93, 94), Roissy, Orly et la grande couronne sur devis. Il s’applique indifféremment aux plis confidentiels, au transport médical et à la livraison e-commerce.",

  faq: [
    {
      question: "Y a-t-il un volume minimum pour ouvrir un compte ?",
      answer:
        "PLACEHOLDER — conditions d’ouverture et volume minimum éventuel à confirmer avant mise en ligne.",
    },
    {
      question: "Comment sont imputées les courses par dossier ou par service ?",
      answer:
        "La référence de dossier ou de service est indiquée au moment de la commande ; elle est reprise sur le détail de la facture mensuelle, ce qui permet la refacturation ou l’imputation analytique.",
    },
    {
      question: "Combien de temps les justificatifs sont-ils conservés ?",
      answer:
        "PLACEHOLDER — durée de conservation des justificatifs à confirmer avant mise en ligne.",
    },
    {
      question: "Quels sont les délais de règlement ?",
      answer:
        "PLACEHOLDER — conditions et délais de règlement à confirmer avant mise en ligne.",
    },
    {
      question: "Plusieurs collaborateurs peuvent-ils commander ?",
      answer:
        "Oui. Vous désignez les collaborateurs autorisés à l’ouverture du compte ; ils commandent sans avance de frais, et toutes les courses remontent sur la même facture.",
    },
    {
      question: "Le compte couvre-t-il toutes les prestations ?",
      answer:
        "Oui : plis confidentiels, transport médical et livraison e-commerce relèvent du même compte, du même interlocuteur et de la même facture mensuelle.",
    },
  ],
};
```

- [ ] **Étape 4 : enregistrer les trois services**

Remplacer intégralement le contenu de `lib/services/index.ts` par :

```ts
/**
 * lib/services/index.ts
 * Source unique des prestations. L'ordre de SERVICES fait l'ordre d'affichage
 * sur la homepage, sur l'index et dans le sitemap.
 */
import type { Service } from "./types";
import { plisConfidentiels } from "./plis-confidentiels";
import { transportMedical } from "./transport-medical";
import { livraisonEcommerce } from "./livraison-e-commerce";
import { compteEntreprise } from "./compte-entreprise";

export type {
  Service,
  ServiceStat,
  ServiceStep,
  ServiceUseCase,
  FaqItem,
} from "./types";

export const SERVICES: Service[] = [
  plisConfidentiels,
  transportMedical,
  livraisonEcommerce,
  compteEntreprise,
];

export const SERVICE_SLUGS: string[] = SERVICES.map((service) => service.slug);

export function getService(slug: string): Service | undefined {
  return SERVICES.find((service) => service.slug === slug);
}
```

- [ ] **Étape 5 : vérifier la génération des quatre pages**

```bash
npm run build
```

Attendu : la sortie liste les quatre routes pré-rendues — `/services/plis-confidentiels`, `/services/transport-medical`, `/services/livraison-e-commerce`, `/services/compte-entreprise` — plus `/services` et `/`.

- [ ] **Étape 6 : vérifier que chaque page répond**

Serveur démarré (`npm run start`) :

```bash
for slug in plis-confidentiels transport-medical livraison-e-commerce compte-entreprise; do
  printf "%s " "$slug"
  curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3000/services/$slug"
done
```

Attendu : `200` pour les quatre.

- [ ] **Étape 7 : commit (si git est initialisé)**

```bash
git add lib/services
git commit -m "feat(services): contenu des trois prestations restantes"
```

---

### Tâche 5 : Intégration dans le site existant

Sans cette tâche, les pages existent mais ne sont atteignables que par URL directe, et la navigation est cassée depuis une sous-page.

**Fichiers :**
- Modifier : `components/Header.tsx:12-17` (entrées de navigation)
- Modifier : `components/ClientShell.tsx` (remise à zéro du défilement au changement de route)
- Modifier : `components/sections/Services.tsx` (lecture de `SERVICES`, cartes cliquables)
- Modifier : `components/Footer.tsx` (colonne « Services »)

**Interfaces :**
- Consomme : `SERVICES` (tâches 1 et 4).
- Produit : aucune nouvelle interface. `components/sections/Services.tsx` n'exporte plus de constante `SERVICES` locale — le tableau en dur est supprimé au profit du module partagé.

- [ ] **Étape 1 : corriger la navigation du header**

Dans `components/Header.tsx`, remplacer la constante `NAV_ITEMS` (lignes 12 à 17) par :

```ts
// "Services" vise une vraie page ; les autres entrées restent des ancres de la
// homepage, préfixées par "/" pour rester fonctionnelles depuis une sous-page.
const NAV_ITEMS = [
  { label: "Services", href: "/services" },
  { label: "Méthode", href: "/#methode" },
  { label: "Flotte", href: "/#flotte" },
  { label: "Références", href: "/#references" },
];
```

Dans le même fichier, remplacer les trois occurrences restantes d'ancres nues :
- `href="#top"` (lien du logo, ligne 25) devient `href="/"` ;
- `href="#contact"` (bouton desktop, ligne 50) devient `href="/#contact"` ;
- `href="#contact"` (bouton du menu mobile, ligne 86) devient `href="/#contact"`.

- [ ] **Étape 2 : vérifier la navigation**

```bash
npm run build && npm run start
```

Puis, dans un navigateur, ouvrir `http://localhost:3000/services/plis-confidentiels` et cliquer sur « Flotte » dans le header.

Attendu : arrivée sur la homepage, positionnée sur la section Flotte. Avant ce correctif, le clic ne produisait aucun effet.

- [ ] **Étape 3 : remettre le défilement à zéro au changement de route**

Lenis pilote le défilement et ignore la restauration de position de Next : sans ce correctif, on arrive au milieu de la page suivante. Remplacer intégralement `components/ClientShell.tsx` par :

```tsx
"use client";
/**
 * components/ClientShell.tsx
 * Wrapper client pour Lenis smooth scroll (nécessite le navigateur,
 * ne peut pas vivre dans un Server Component).
 */
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.1,
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo out
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Lenis pilote le défilement : la restauration de position de Next ne
  // s'applique pas. Sans cette remise à zéro, un changement de route laisse
  // le visiteur au milieu de la page suivante. Les ancres (/#flotte) sont
  // exclues : elles doivent conserver leur cible.
  useEffect(() => {
    if (window.location.hash) return;
    lenisRef.current?.scrollTo(0, { immediate: true });
  }, [pathname]);

  return <main>{children}</main>;
}
```

- [ ] **Étape 4 : vérifier le comportement du défilement**

```bash
npm run build && npm run start
```

Dans le navigateur : descendre en bas de `http://localhost:3000/services/plis-confidentiels`, puis cliquer sur « Voir la prestation » d'une autre prestation dans le bloc « Autres prestations ».

Attendu : la nouvelle page s'affiche depuis le haut. Vérifier ensuite qu'un clic sur « Flotte » depuis cette page arrive bien sur la section Flotte (l'ancre n'est pas écrasée par la remise à zéro).

- [ ] **Étape 5 : brancher la homepage sur la source unique**

Remplacer intégralement `components/sections/Services.tsx` par la version ci-dessous. Le tableau `SERVICES` local disparaît : la homepage et les pages de détail décrivent désormais les mêmes prestations, sans risque de divergence.

```tsx
/**
 * components/sections/Services.tsx
 * "Prestations" — quatre métiers, chacun avec sa procédure propre.
 * Les données proviennent de lib/services : source unique partagée avec
 * les pages de détail, l'index et le sitemap.
 */
import Link from "next/link";
import { SERVICES } from "@/lib/services";

export default function Services() {
  return (
    <section id="services" className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-[104px]">
      <div className="mb-14 grid items-end gap-12 sm:grid-cols-[0.9fr_1.1fr]">
        <div className="min-w-0">
          <div className="mb-5 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">
            Prestations
          </div>
          <h2 className="text-[clamp(30px,3.4vw,44px)] font-bold leading-[1.08] tracking-[-0.03em]">
            Quatre métiers, un même niveau d&rsquo;exigence.
          </h2>
        </div>
        <p className="min-w-0 max-w-[52ch] text-pretty text-[16.5px] leading-[1.65] text-muted">
          Chaque secteur a ses contraintes : signature manuscrite, chaîne du froid,
          créneau de réception. Nos procédures sont écrites par type de flux, pas
          improvisées à la course.
        </p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-4">
        {SERVICES.map((service) => (
          <Link
            key={service.slug}
            href={`/services/${service.slug}`}
            className="flex flex-col gap-3.5 border border-line bg-paper-card px-[30px] pb-[30px] pt-[34px] text-ink hover:border-ink hover:text-ink"
          >
            <div className="font-mono text-[10px] tracking-[0.16em] text-label uppercase">
              {service.card.tag}
            </div>
            <h3 className="text-xl font-bold tracking-[-0.02em]">{service.card.title}</h3>
            <p className="text-[15px] leading-[1.6] text-muted">{service.card.body}</p>
            <div className="mt-auto flex items-center justify-between gap-4 pt-5 font-mono text-[10.5px] tracking-[0.1em] uppercase">
              <span className="text-accent-dark">{service.card.note}</span>
              <span className="text-label">Voir →</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Étape 6 : brancher le pied de page**

Le pied de page porte le même défaut que le header : ses liens `COMPANY_LINKS` utilisent des ancres nues (`#methode`, `#flotte`, `#contact`) qui ne résolvent rien depuis une sous-page. La colonne « Prestations », elle, liste quatre libellés en dur qui pointent tous vers `#services`.

Dans `components/Footer.tsx`, remplacer l'import et les deux constantes (lignes 6 à 20) par :

```ts
import Link from "next/link";
import { SERVICES } from "@/lib/services";
import { EMAIL, FOUNDED_YEAR, PHONE_DISPLAY, PHONE_TEL } from "@/lib/site-content";

// Ancres préfixées par "/" : nues, elles ne résolvent rien depuis une sous-page.
const COMPANY_LINKS = [
  { label: "Notre méthode", href: "/#methode" },
  { label: "Flotte & couverture", href: "/#flotte" },
  { label: "Devenir coursier partenaire", href: "/#contact" },
  { label: "Mentions légales", href: "/#contact" },
];
```

La constante `SERVICE_LINKS` disparaît : les libellés proviennent désormais de `SERVICES`.

Puis remplacer le contenu de la colonne « Prestations » (lignes 40 à 46) par :

```tsx
          <div className="grid gap-2.5 text-sm">
            {SERVICES.map((service) => (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className="text-white/70 hover:text-white"
              >
                {service.card.title}
              </Link>
            ))}
          </div>
```

Enfin, remplacer les liens de la colonne « Société » (lignes 53 à 59) par des `Link`, les ancres internes devant être gérées par le routeur :

```tsx
          <div className="grid gap-2.5 text-sm">
            {COMPANY_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-white/70 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
```

Les liens `tel:` et `mailto:` de la colonne « Contact » restent des balises `<a>` : ce ne sont pas des routes internes.

- [ ] **Étape 7 : vérifier l'intégration**

```bash
npm run build && npm run lint
```

Attendu : build et lint sans erreur.

Serveur démarré :

```bash
curl -s http://localhost:3000/ | grep -c "/services/transport-medical"
```

Attendu : au moins `2` — la carte de la section Prestations et le lien du pied de page.

- [ ] **Étape 8 : commit (si git est initialisé)**

```bash
git add components/Header.tsx components/ClientShell.tsx components/sections/Services.tsx components/Footer.tsx
git commit -m "feat(services): integration navigation, homepage et pied de page"
```

---

### Tâche 6 : Sitemap et directives d'indexation

**Fichiers :**
- Créer : `app/sitemap.ts`
- Créer : `app/robots.ts`

**Interfaces :**
- Consomme : `SERVICE_SLUGS` (tâches 1 et 4), `SITE_URL` (tâche 1).
- Produit : les routes `/sitemap.xml` et `/robots.txt`.

- [ ] **Étape 1 : créer le sitemap**

Créer `app/sitemap.ts`. Il est généré depuis `SERVICE_SLUGS` : ajouter une prestation l'ajoute au sitemap sans intervention.

```ts
/**
 * app/sitemap.ts
 * Sitemap généré depuis lib/services : impossible de le désynchroniser
 * des pages réellement publiées.
 */
import type { MetadataRoute } from "next";
import { SERVICE_SLUGS } from "@/lib/services";
import { SITE_URL } from "@/lib/site-content";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/services`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    ...SERVICE_SLUGS.map((slug) => ({
      url: `${SITE_URL}/services/${slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
```

- [ ] **Étape 2 : créer les directives d'indexation**

Créer `app/robots.ts` :

```ts
/**
 * app/robots.ts
 * Directives d'indexation. Le site est entièrement public : rien à exclure.
 */
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-content";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
```

- [ ] **Étape 3 : vérifier**

```bash
npm run build && npm run start
```

Puis :

```bash
curl -s http://localhost:3000/sitemap.xml | grep -c "<loc>"
curl -s http://localhost:3000/robots.txt
```

Attendu : `6` pour le premier (homepage + index + quatre prestations), et un `robots.txt` contenant `User-Agent: *`, `Allow: /` et la ligne `Sitemap:`.

- [ ] **Étape 4 : vérification finale de bout en bout**

```bash
npm run lint
npm run build
```

Attendu : aucune erreur, six routes statiques générées.

Contrôle visuel final, serveur démarré, sur `/`, `/services` et les quatre pages de prestation, en largeur bureau puis en largeur mobile (375 px) :
- le H1 de chaque page est unique et lisible ;
- la FAQ s'ouvre et se ferme au clic et au clavier ;
- aucun débordement horizontal ;
- le header et le pied de page mènent aux bonnes destinations.

- [ ] **Étape 5 : commit (si git est initialisé)**

```bash
git add app/sitemap.ts app/robots.ts
git commit -m "feat(seo): sitemap et robots generes depuis lib/services"
```

---

## Points à arbitrer avant mise en ligne

À remonter à la fin de l'exécution, regroupés :

1. **`SITE_URL`** — le domaine `https://www.oneconnexion.fr` est supposé d'après l'adresse de courriel. À confirmer : une valeur erronée produit des canoniques et un sitemap pointant vers un domaine inexistant.
2. **Habilitations pour le transport d'échantillons biologiques** — bloquant pour la publication de `/services/transport-medical`.
3. **Durée de conservation des justificatifs**, **heure limite de collecte e-commerce**, **grille tarifaire**, **conditions d'ouverture de compte et délais de règlement** — tous marqués `PLACEHOLDER` dans les FAQ.

Note : l'amplitude horaire annoncée (7j/7, 7h–23h) est cohérente entre `Hero.tsx` et
`Footer.tsx` ; elle est donc reprise telle quelle dans les FAQ, sans marquage.
