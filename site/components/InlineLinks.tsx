/**
 * components/InlineLinks.tsx
 * Affiche un texte de données où les liens internes s'écrivent [ancre](/chemin).
 */
import Link from "next/link";
import { Fragment } from "react";

const LINK = /\[([^\]]+)\]\((\/[^)\s]*)\)/g;

export default function InlineLinks({
  text,
  className = "font-medium text-ink underline decoration-accent underline-offset-4 hover:text-accent-dark",
}: {
  text: string;
  className?: string;
}) {
  const parts: React.ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(LINK)) {
    const at = m.index ?? 0;
    if (at > last) parts.push(text.slice(last, at));
    parts.push(
      <Link key={at} href={m[2]} className={className}>
        {m[1]}
      </Link>,
    );
    last = at + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts.map((p, i) => <Fragment key={i}>{p}</Fragment>)}</>;
}

/** Texte sans la syntaxe de lien, pour les schémas JSON-LD et les clés React. */
export const stripLinks = (text: string) => text.replace(LINK, "$1");
