"use client";

/**
 * components/audit/AuditQuestionnaire.tsx
 * Questionnaire gratuit de maturité logistique : une question à la fois.
 * Tout reste dans le navigateur : aucune réponse n'est envoyée.
 */
import { useState } from "react";
import Link from "next/link";

type Q = { id: string; t: string; h: string; reco: string; why: string };
type Stage = { key: string; name: string; qs: Q[] };

const STAGES: Stage[] = [
  { key: "decl", name: "Déclenchement de la course", qs: [
    { id: "decl1", t: "Tenez-vous une liste de toutes vos courses urgentes, avec date, destinataire et issue ?", h: "Même un tableur simple compte. Répondez pour les 3 derniers mois.", reco: "Gardez une liste de vos courses urgentes par mois, même sur un tableur simple.", why: "Sans liste, impossible de savoir si un incident est fréquent ou isolé." },
    { id: "decl2", t: "Un formulaire impose-t-il l'adresse exacte, l'étage ou le code d'accès, un contact sur place et l'heure limite ?", h: "Ces quatre champs évitent la plupart des courses bloquées.", reco: "Rendez obligatoires adresse, étage ou code, contact sur place et heure limite dans le formulaire de commande.", why: "Une adresse incomplète est la première cause de course interrompue en Île-de-France." },
    { id: "decl3", t: "Une course urgente reçoit-elle un numéro de référence unique, transmis au coursier et au destinataire ?", h: "Le numéro sert à retrouver la course quand le destinataire appelle.", reco: "Générez un numéro par course et communiquez-le au coursier et à la personne qui réceptionne.", why: "Sans référence, la question « où est mon pli » demande de chercher dans les mails." },
    { id: "decl4", t: "Y a-t-il un seul canal de commande pour les urgences, avec une personne référente identifiée ?", h: "Mail, téléphone et appel direct ne doivent pas coexister sans règle.", reco: "Fixez un canal unique pour les urgences et désignez une personne référente, remplaçable.", why: "Quand trois personnes peuvent commander, personne ne suit réellement la course." },
  ]},
  { key: "remise", name: "Remise du pli au coursier", qs: [
    { id: "rem1", t: "Le coursier signe-t-il une prise en charge avec l'heure au moment où il reçoit le pli ?", h: "Papier ou application, les deux comptent.", reco: "Exigez une prise en charge signée et horodatée, à chaque remise.", why: "C'est le premier maillon de la preuve : sans lui, le délai réel ne peut pas être établi." },
    { id: "rem2", t: "Les plis confidentiels sont-ils identifiés et remis selon une règle connue (remise en main propre, contrôle d'identité) ?", h: "Dites « Non » si vous ne traitez pas les plis confidentiels à part.", reco: "Définissez une règle pour les plis confidentiels : remise en main propre, nom du réceptionnaire noté.", why: "Une rupture de suivi sur un pli confidentiel devient un problème de confidentialité, pas seulement de délai." },
    { id: "rem3", t: "Le coursier est-il identifiable (nom ou matricule) au moment de la remise ?", h: "Vous devez savoir qui a pris le pli, pas seulement quelle société.", reco: "Notez le nom ou le matricule du coursier sur chaque prise en charge.", why: "Sans identité du coursier, un incident ne peut pas être rattaché à une personne ou à une tournée." },
    { id: "rem4", t: "Pouvez-vous joindre le prestataire en moins de 5 minutes si la prise en charge pose problème ?", h: "Testez ce délai maintenant, pas en théorie.", reco: "Donnez à la personne référente un numéro direct du prestataire, valable pendant les horaires de collecte.", why: "Un problème non résolu à la prise en charge se transforme en retard d'une heure." },
  ]},
  { key: "suivi", name: "Suivi pendant le trajet", qs: [
    { id: "sui1", t: "Voyez-vous la position du coursier en direct pendant la course ?", h: "Une position figée à la prise en charge ne compte pas.", reco: "Demandez un suivi en temps réel, ou au minimum des jalons horodatés (prise, passage, livraison).", why: "Sans suivi en direct, un retard ne se voit qu'après l'appel du destinataire." },
    { id: "sui2", t: "Une alerte se déclenche-t-elle avant l'heure limite si la course n'avance pas ?", h: "L'alerte doit arriver avant le retard, pas après.", reco: "Fixez une alerte à 30 minutes de l'heure limite, avec une personne chargée de relancer.", why: "Une alerte après l'heure limite ne sert qu'à constater le retard." },
    { id: "sui3", t: "La personne qui répond au destinataire voit-elle le suivi en direct ?", h: "Si elle ne le voit pas, elle ne peut que promettre.", reco: "Donnez à la personne qui répond au téléphone l'accès au suivi, pas seulement au commanditaire.", why: "Un point de contact sans accès au suivi ne peut pas répondre à la question posée." },
    { id: "sui4", t: "Existe-t-il une procédure si le coursier ne répond plus ou si le suivi se coupe ?", h: "Tunnels, batteries, zones sans réseau : ça arrive chaque semaine à Paris.", reco: "Écrivez une procédure de rupture de suivi : délai avant relance, contact de secours, décision de réassigner.", why: "Une rupture sans procédure laisse le pli sans propriétaire pendant qu'on cherche qui décide." },
  ]},
  { key: "preuve", name: "Preuve de livraison", qs: [
    { id: "pre1", t: "La remise au destinataire est-elle prouvée par une signature, une photo ou un nom horodaté ?", h: "Un « il est passé » n'est pas une preuve.", reco: "Rendez obligatoire une preuve de remise (nom, signature ou photo, heure) pour chaque course.", why: "C'est le maillon le plus souvent absent, et celui qui tranche les litiges." },
    { id: "pre2", t: "Les adresses introuvables ou les destinataires absents sont-ils consignés avec un motif ?", h: "Motif standard : adresse incorrecte, absent, accès refusé, autre.", reco: "Ajoutez un motif d'échec standard à remplir à chaque incident, avec l'heure de la tentative.", why: "Sans motif, on ne sait pas si le problème vient de l'adresse, du coursier ou du destinataire." },
    { id: "pre3", t: "Pouvez-vous retrouver la preuve d'une course précise en moins de 5 minutes ?", h: "Testez-le avec une course du mois dernier.", reco: "Archivez chaque preuve sous le numéro de référence de la course, dans un dossier unique.", why: "Une preuve qu'on ne retrouve pas ne protège pas l'entreprise." },
    { id: "pre4", t: "Les preuves sont-elles conservées assez longtemps pour couvrir un litige (au moins un an) ?", h: "Vérifiez votre durée de conservation réelle.", reco: "Fixez une durée de conservation d'au moins un an pour les preuves de remise, avec un responsable.", why: "Un litige arrive souvent plusieurs mois après la course." },
  ]},
  { key: "cloture", name: "Clôture et pilotage", qs: [
    { id: "clo1", t: "Chaque course est-elle clôturée (validée, facturée) dans un délai connu ?", h: "Une course restée ouverte fausse le suivi et la facturation.", reco: "Fixez un délai de clôture, par exemple 48 heures après la livraison, et contrôlez-le chaque semaine.", why: "Les courses ouvertes s'accumulent et ne sont plus rapprochées de leur preuve." },
    { id: "clo2", t: "Les incidents sont-ils revus chaque mois avec le prestataire, chiffres à l'appui ?", h: "Une revue informelle au téléphone ne compte pas.", reco: "Organisez une revue mensuelle des incidents avec le prestataire, à partir d'un tableau commun.", why: "Sans revue, les mêmes causes reviennent et personne ne les rattache à un responsable." },
    { id: "clo3", t: "Sortez-vous chaque mois le nombre de courses, de retards et d'échecs ?", h: "Si vous ne le savez pas aujourd'hui, c'est une réponse « Non ».", reco: "Tenez un tableau mensuel : courses, retards, échecs, preuves manquantes.", why: "C'est l'indicateur qui permet de mesurer une progression d'un trimestre à l'autre." },
    { id: "clo4", t: "La facturation de vos courses est-elle rapprochée des preuves de remise avant paiement ?", h: "Vérifiez sur une facture récente.", reco: "Ne validez une facture de course que si sa preuve de remise est présente.", why: "Payer une course sans preuve revient à payer un service que personne ne peut vérifier." },
  ]},
];

const ALL_QS: { q: Q; stage: Stage; stageIndex: number }[] = STAGES.flatMap((stage, stageIndex) =>
  stage.qs.map((q) => ({ q, stage, stageIndex })),
);

// Volume : contexte pour le rappel, pas de points dans le score.
const VOLUMES = [
  "Moins de 5 courses par mois",
  "5 à 20 courses par mois",
  "20 à 50 courses par mois",
  "Plus de 50 courses par mois",
];

const OPTS = [
  { v: 2, l: "Oui" },
  { v: 1, l: "Partiellement" },
  { v: 0, l: "Non" },
];

const LABEL = "font-mono text-[11px] tracking-[0.16em] uppercase text-accent-dark";
const BTN = "inline-flex items-center justify-center font-mono text-[12px] tracking-[0.14em] uppercase px-6 py-3.5 bg-accent text-ink hover:opacity-90 disabled:opacity-40 disabled:cursor-default";
const BTN_GHOST = "inline-flex items-center justify-center font-mono text-[12px] tracking-[0.14em] uppercase px-6 py-3.5 border border-ink text-ink hover:bg-ink hover:text-paper disabled:opacity-30 disabled:cursor-default disabled:hover:bg-transparent disabled:hover:text-ink";

export default function AuditQuestionnaire() {
  const [phase, setPhase] = useState<"intro" | "volume" | "quiz" | "result">("intro");
  const [volume, setVolume] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [warn, setWarn] = useState("");

  const stageScore = (s: Stage) => {
    const sum = s.qs.reduce((a, q) => a + (answers[q.id] ?? 0), 0);
    return Math.round((sum / (s.qs.length * 2)) * 100);
  };

  const restart = () => {
    setAnswers({});
    setIndex(0);
    setWarn("");
    setPhase("intro");
    window.scrollTo(0, 0);
  };

  const goTo = (i: number) => {
    setIndex(i);
    setWarn("");
  };

  // Le choix ne fait que sélectionner la réponse : la question suivante
  // s'ouvre seulement quand la personne clique sur « Suivant ».
  const choose = (qid: string, v: number) => {
    setAnswers((a) => ({ ...a, [qid]: v }));
    setWarn("");
  };

  const next = () => {
    if (answers[ALL_QS[index].q.id] === undefined) {
      setWarn("Choisissez une réponse pour continuer.");
      return;
    }
    if (index < ALL_QS.length - 1) {
      goTo(index + 1);
    } else {
      setPhase("result");
      window.scrollTo(0, 0);
    }
  };

  if (phase === "intro") {
    return (
      <div className="mx-auto max-w-[720px] px-[clamp(20px,4vw,28px)] py-16">
        <div className={LABEL}>Audit gratuit · environ 10 minutes</div>
        <h2 className="mt-4 mb-6 text-[clamp(28px,3vw,40px)] font-bold leading-[1.1] tracking-[-0.03em]">
          Score de maturité logistique
        </h2>
        <p className="mb-4 text-[15.5px] leading-[1.7] text-muted">
          Pour vos courses urgentes en Île-de-France. Répondez en décrivant ce que vous faites réellement, pas la
          procédure affichée : un score faux ne vaut rien.
        </p>
        <p className="mb-8 text-[15.5px] leading-[1.7] text-muted">
          Vos réponses restent dans votre navigateur et ne sont envoyées nulle part. Pensez aux 10 dernières courses
          urgentes que vous avez lancées. Il y a 5 étapes et 20 questions.
        </p>
        <button type="button" className={BTN} onClick={() => setPhase("volume")}>
          Commencer l&apos;audit
        </button>
      </div>
    );
  }

  if (phase === "volume") {
    return (
      <div className="mx-auto max-w-[720px] px-[clamp(20px,4vw,28px)] py-12 pb-40 md:pb-32">
        <div className={LABEL}>Avant de commencer</div>
        <h2 className="mt-3 mb-3 text-[clamp(24px,3vw,32px)] font-bold leading-[1.2] tracking-[-0.02em] text-balance">
          Combien de courses urgentes envoyez-vous ?
        </h2>
        <p className="mb-8 text-[15px] leading-[1.6] text-muted">
          Indiquez un ordre de grandeur, sur le mois écoulé. Cette réponse ne change pas votre score, elle sert à
          chiffrer les recommandations.
        </p>
        <div role="radiogroup" aria-label="Volume de courses urgentes" className="grid gap-3">
          {VOLUMES.map((v) => {
            const checked = volume === v;
            return (
              <button
                key={v}
                type="button"
                role="radio"
                aria-checked={checked}
                onClick={() => setVolume(v)}
                className={`flex w-full items-center gap-4 border px-5 py-4 text-left text-[16px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${
                  checked ? "border-ink bg-ink text-paper" : "border-line bg-paper-card text-ink hover:border-ink"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`grid h-5 w-5 flex-none place-items-center rounded-full border-2 ${checked ? "border-accent" : "border-label"}`}
                >
                  {checked && <span className="h-2.5 w-2.5 rounded-full bg-accent" />}
                </span>
                <span className="font-semibold">{v}</span>
              </button>
            );
          })}
        </div>
        <div className="fixed inset-x-0 bottom-[88px] z-40 border-t border-line bg-paper/95 backdrop-blur md:bottom-0">
          <div className="mx-auto flex max-w-[720px] items-center justify-between gap-3 px-[clamp(20px,4vw,28px)] py-3">
            <button type="button" className={BTN_GHOST} onClick={() => setPhase("intro")}>
              Retour
            </button>
            <button
              type="button"
              className={BTN}
              disabled={volume === null}
              onClick={() => { setPhase("quiz"); setIndex(0); window.scrollTo(0, 0); }}
            >
              Suivant
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "quiz") {
    const { q, stage, stageIndex } = ALL_QS[index];
    const current = answers[q.id];
    const pct = Math.round((index / ALL_QS.length) * 100);
    const isLast = index === ALL_QS.length - 1;
    return (
      <div className="mx-auto max-w-[720px] px-[clamp(20px,4vw,28px)] pt-10 pb-48 md:pb-32">
        {/* Progression globale */}
        <div className="flex items-center justify-between gap-4 font-mono text-[11px] tracking-[0.14em] uppercase text-label">
          <span>Question {index + 1} sur {ALL_QS.length}</span>
          <span>{pct} %</span>
        </div>
        <div className="mt-3 mb-8 h-[6px] w-full bg-line" aria-hidden="true">
          <div className="h-full bg-accent transition-[width] duration-300" style={{ width: `${pct}%` }} />
        </div>

        <div className={LABEL}>{stage.name}</div>
        <h2 className="mt-3 mb-3 text-[clamp(24px,3vw,32px)] font-bold leading-[1.2] tracking-[-0.02em] text-balance">
          {q.t}
        </h2>
        <p className="mb-8 text-[15px] leading-[1.6] text-muted">{q.h}</p>

        <div role="radiogroup" aria-labelledby={q.id} className="grid gap-3">
          {OPTS.map((o) => {
            const checked = current === o.v;
            return (
              <button
                key={o.v}
                type="button"
                role="radio"
                aria-checked={checked}
                onClick={() => choose(q.id, o.v)}
                className={`flex w-full items-center gap-4 border px-5 py-4 text-left text-[16px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${
                  checked ? "border-ink bg-ink text-paper" : "border-line bg-paper-card text-ink hover:border-ink"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`grid h-5 w-5 flex-none place-items-center rounded-full border-2 ${
                    checked ? "border-accent" : "border-label"
                  }`}
                >
                  {checked && <span className="h-2.5 w-2.5 rounded-full bg-accent" />}
                </span>
                <span className="font-semibold">{o.l}</span>
              </button>
            );
          })}
        </div>

        {warn && <p className="mt-4 text-[14px] text-accent-dark" role="alert">{warn}</p>}

        {/* Navigation fixée au bas, au-dessus de la barre du site */}
        <div className="fixed inset-x-0 bottom-[88px] z-40 border-t border-line bg-paper/95 backdrop-blur md:bottom-0">
          <div className="mx-auto flex max-w-[720px] items-center justify-between gap-3 px-[clamp(20px,4vw,28px)] py-3">
            <button type="button" className={BTN_GHOST} onClick={() => goTo(index - 1)} disabled={index === 0}>
              Précédent
            </button>
            <button type="button" className={BTN} onClick={next} disabled={current === undefined}>
              {isLast ? "Voir mon score" : "Suivant"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Résultats
  const scores = STAGES.map(stageScore);
  const global = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const globalText =
    global >= 75
      ? "Traçabilité solide. Travaillez les points faibles restants."
      : global >= 45
      ? "Traçabilité partielle. Des ruptures existent, surtout à certaines étapes."
      : "Traçabilité fragile. Une partie du suivi n'existe pas encore.";

  const recos: { score: number; stage: string; q: Q; urgent: boolean }[] = [];
  STAGES.forEach((st, i) =>
    st.qs.forEach((q) => {
      const a = answers[q.id] ?? 0;
      if (a < 2) recos.push({ score: a, stage: st.name, q, urgent: a === 0 && scores[i] < 50 });
    }),
  );
  recos.sort((x, y) => x.score - y.score);

  return (
    <div className="mx-auto max-w-[720px] px-[clamp(20px,4vw,28px)] py-12">
      <div className="border border-line bg-paper-card p-6 md:p-8">
        <div className={LABEL}>Votre score</div>
        <div className="mt-3 font-bold text-[clamp(56px,10vw,80px)] leading-none tabular-nums tracking-[-0.03em]">
          {global} <span className="text-[24px] font-normal text-muted">/ 100</span>
        </div>
        <p className="mt-4 text-[15.5px] text-muted">{globalText}</p>
        {volume && (
          <p className="mt-3 text-[14.5px] text-muted">Volume déclaré : <strong className="text-ink">{volume.toLowerCase()}</strong>.</p>
        )}

        <div className="mt-8 grid gap-5">
          {STAGES.map((st, i) => (
            <div key={st.key}>
              <div className="flex justify-between gap-3 text-[14.5px]">
                <span>{st.name}</span>
                <strong className="tabular-nums">{scores[i]} / 100</strong>
              </div>
              <div className="mt-2 h-[8px] w-full bg-line">
                <div className={`h-full ${scores[i] < 50 ? "bg-accent-dark" : "bg-accent"}`} style={{ width: `${scores[i]}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10">
        <h2 className="mb-2 text-[22px] font-bold tracking-[-0.01em]">Recommandations</h2>
        <p className="mb-6 text-[14.5px] text-muted">
          De la plus urgente à la moins urgente. « À traiter vite » signifie que l&apos;étape est faible et qu&apos;un incident est probable.
        </p>
        <ol className="grid gap-4">
          {recos.length === 0 && (
            <li className="border-l-[3px] border-[#2F6B3A] pl-4 text-[15px]">
              Toutes les réponses sont « Oui ». Maintenez ces pratiques et mesurez-les chaque mois.
            </li>
          )}
          {recos.map((r, idx) => (
            <li key={idx} className="border-l-[3px] border-accent pl-4">
              <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-label">
                {r.stage} · {r.urgent ? "À traiter vite" : r.score === 0 ? "À planifier" : "À renforcer"}
              </div>
              <div className="mt-1 font-semibold text-[15.5px]">{r.q.reco}</div>
              <div className="mt-1 text-[14px] text-muted">{r.q.why}</div>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-10 bg-ink p-6 text-paper md:p-8">
        <h3 className="mb-2 text-[18px] font-bold">Être rappelé</h3>
        <p className="mb-6 text-[14.5px] text-paper/70">
          Pour une lecture de votre score avec un interlocuteur, écrivez-nous depuis la page contact.
        </p>
        <Link href="/contact" className={BTN}>
          Demander un rappel
        </Link>
      </div>

      <div className="mt-8">
        <button type="button" className={BTN_GHOST} onClick={restart}>
          Recommencer
        </button>
      </div>
    </div>
  );
}
