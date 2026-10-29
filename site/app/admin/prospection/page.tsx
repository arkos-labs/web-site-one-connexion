"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AdminPage } from "@/components/dashboard/ui";
import { SECTORS } from "@/lib/prospection/sirene";

type Status = "a_contacter" | "contacte" | "interesse" | "pas_interesse" | "client";

type Prospect = {
  id: string;
  name: string;
  city: string | null;
  postcode: string | null;
  department: string | null;
  sector: string;
  siret: string;
  need: string | null;
  status: Status;
  notes: string | null;
  batch_week: string;
  contacted_at: string | null;
};

const STATUSES: { key: Status | "all"; label: string }[] = [
  { key: "a_contacter", label: "À contacter" },
  { key: "contacte", label: "Contactés" },
  { key: "interesse", label: "Intéressés" },
  { key: "client", label: "Clients" },
  { key: "pas_interesse", label: "Pas intéressés" },
  { key: "all", label: "Tous" },
];

const sectorLabel = (key: string) => SECTORS.find((s) => s.key === key)?.label ?? key;
const dateFr = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("fr-FR") : "—");

export default function AdminProspectionPage() {
  const supabase = useMemo(() => createClient(), []);
  const [rows, setRows] = useState<Prospect[]>([]);
  const [status, setStatus] = useState<Status | "all">("a_contacter");
  const [sector, setSector] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    supabase
      .from("prospect_targets")
      .select("id, name, city, postcode, department, sector, siret, need, status, notes, batch_week, contacted_at")
      .order("batch_week", { ascending: false })
      .order("name")
      .limit(1000)
      .then(({ data, error }: { data: Prospect[] | null; error: { message: string } | null }) => {
        if (!live) return;
        if (error) setError(error.message);
        setRows(data ?? []);
        setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [supabase]);

  const [openMail, setOpenMail] = useState<string | null>(null);

  function onSent(id: string, to: string, subject: string) {
    const now = new Date().toISOString();
    setRows((rs) =>
      rs.map((r) =>
        r.id === id
          ? {
              ...r,
              status: r.status === "a_contacter" ? "contacte" : r.status,
              contacted_at: now,
              notes: [r.notes, `E-mail envoyé à ${to} : « ${subject} »`].filter(Boolean).join("\n"),
            }
          : r,
      ),
    );
    setOpenMail(null);
  }

  async function update(id: string, patch: Partial<Prospect>) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    const { error } = await supabase.from("prospect_targets").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) setError(error.message);
  }

  function markContacted(p: Prospect) {
    update(p.id, { status: "contacte", contacted_at: new Date().toISOString() });
  }

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: rows.length };
    for (const r of rows) c[r.status] = (c[r.status] ?? 0) + 1;
    return c;
  }, [rows]);

  const visible = rows.filter(
    (r) =>
      (status === "all" || r.status === status) &&
      (sector === "all" || r.sector === sector) &&
      (!search || `${r.name} ${r.city ?? ""}`.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <AdminPage
      eyebrow="Prospection"
      title="Entreprises à démarcher"
      subtitle="Chaque lundi, 10 nouvelles entreprises par secteur. Une entreprise n'apparaît qu'une fois : ici, on voit qui a été démarché."
    >
      {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className="mb-4 flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setStatus(s.key)}
            className={`rounded-full px-3 py-1.5 text-sm font-semibold ${status === s.key ? "bg-ink text-white" : "bg-white text-ink border border-line"}`}
          >
            {s.label} <span className="opacity-60">({counts[s.key] ?? 0})</span>
          </button>
        ))}
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <select value={sector} onChange={(e) => setSector(e.target.value)} className="rounded-lg border border-line bg-white px-3 py-2 text-sm">
          <option value="all">Tous les secteurs</option>
          {SECTORS.map((s) => (
            <option key={s.key} value={s.key}>{s.label}</option>
          ))}
        </select>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher une entreprise ou une ville"
          className="min-w-[220px] flex-1 rounded-lg border border-line bg-white px-3 py-2 text-sm"
        />
      </div>

      {loading ? (
        <p className="text-muted">Chargement…</p>
      ) : visible.length === 0 ? (
        <p className="text-muted">Aucune entreprise dans cette liste. La prochaine liste arrive lundi.</p>
      ) : (
        <div className="space-y-3">
          {visible.map((p) => (
            <div key={p.id} className="rounded-xl border border-line bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-bold text-ink">{p.name}</div>
                  <div className="text-sm text-muted">
                    {p.postcode} {p.city} · {sectorLabel(p.sector)} · SIRET {p.siret}
                  </div>
                  {p.need && <p className="mt-2 text-sm text-ink">{p.need}</p>}
                  <div className="mt-2 text-xs text-muted">
                    Liste du {dateFr(p.batch_week)}
                    {p.contacted_at && <> · Démarché le {dateFr(p.contacted_at)}</>}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setOpenMail(openMail === p.id ? null : p.id)}
                    className="rounded-lg border border-ink px-3 py-2 text-sm font-bold text-ink hover:bg-ink hover:text-white"
                  >
                    {openMail === p.id ? "Fermer" : "Envoyer un e-mail"}
                  </button>
                  {p.status === "a_contacter" && (
                    <button type="button" onClick={() => markContacted(p)} className="rounded-lg bg-accent px-3 py-2 text-sm font-bold text-white">
                      Marquer démarché
                    </button>
                  )}
                  <select
                    value={p.status}
                    onChange={(e) => update(p.id, { status: e.target.value as Status })}
                    className="rounded-lg border border-line bg-white px-3 py-2 text-sm"
                    aria-label="Statut"
                  >
                    {STATUSES.filter((s) => s.key !== "all").map((s) => (
                      <option key={s.key} value={s.key}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              {openMail === p.id && (
                <MailForm prospect={p} onSent={(to, subject) => onSent(p.id, to, subject)} />
              )}
              <textarea
                defaultValue={p.notes ?? ""}
                onBlur={(e) => {
                  if (e.target.value !== (p.notes ?? "")) update(p.id, { notes: e.target.value });
                }}
                placeholder="Notes (qui, quand, ce qui a été dit)"
                rows={2}
                className="mt-3 w-full rounded-lg border border-line px-3 py-2 text-sm"
              />
            </div>
          ))}
        </div>
      )}
    </AdminPage>
  );
}

function MailForm({ prospect, onSent }: { prospect: Prospect; onSent: (to: string, subject: string) => void }) {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState(`Coursiers à ${prospect.city ?? "Paris"} pour ${prospect.name}`);
  const [body, setBody] = useState(
    `Bonjour,

Nous sommes ONE CONNEXION, coursiers à deux-roues pour les entreprises de Paris et d'Île-de-France. ${prospect.need ?? ""}

Nos courses sont dédiées : enlèvement en moins de 45 minutes à Paris et en petite couronne, avec preuve de remise.

Si cela vous intéresse, répondez à ce message ou appelez le 06 66 02 67 07.

Bien cordialement,
L'équipe ONE CONNEXION`,
  );
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    setSending(true);
    setError(null);
    const res = await fetch("/api/admin/prospects/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: prospect.id, to, subject, body }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    setSending(false);
    if (!res.ok) {
      setError(data.error ?? "L'envoi a échoué.");
      return;
    }
    onSent(to.trim(), subject.trim());
  }

  return (
    <div className="mt-3 space-y-2 rounded-lg bg-paper p-3">
      <input
        value={to}
        onChange={(e) => setTo(e.target.value)}
        placeholder="Adresse e-mail de l'entreprise (ex. contact@...)"
        className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm"
      />
      <input
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={8}
        className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm"
      />
      <p className="text-xs text-muted">
        Une mention de désinscription (« répondez STOP ») est ajoutée automatiquement en bas du message.
      </p>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button
        type="button"
        onClick={send}
        disabled={sending || !to.trim() || !subject.trim() || !body.trim()}
        className="rounded-lg bg-accent px-4 py-2 text-sm font-bold text-white disabled:opacity-40"
      >
        {sending ? "Envoi…" : "Envoyer maintenant"}
      </button>
    </div>
  );
}
