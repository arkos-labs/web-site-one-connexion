"use client";
/**
 * components/ChatWidget.tsx
 * Assistant du site, sur ordinateur et téléphone : bulle en bas à droite.
 * - Parcours guidé (lib/chatbot/quick-questions.ts) : boutons à réponse immédiate ; pour commander,
 *   il demande « professionnel ou particulier » et explique la commande et la facturation de chaque cas.
 * - Question écrite : réponse de /api/chat (IA) ; si l'IA ne répond pas, réponse guidée ou rappel.
 * - « Être rappelé » : nom, téléphone, e-mail, enregistrés comme un message de contact (/api/contact).
 * Les réponses sont affichées en texte brut : aucun HTML venant du serveur n'est interprété.
 */
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MessageCircle, Phone, Send, X } from "lucide-react";
import { STEPS, matchStep, type Choice, type StepId } from "@/lib/chatbot/quick-questions";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/site-content";
import { ACTION_BAR_HIDDEN } from "@/components/MobileActionBar";

type Msg = { role: "user" | "assistant"; content: string; choices?: Choice[]; step?: StepId };

// Admin, application coursier et tunnel de commande : pas d'assistant.
const HIDDEN = /^\/(admin|telegram|commande)(\/|$)/;
const MAX_LEN = 1000;
const WELCOME: Msg = {
  role: "assistant",
  content: "Bonjour ! Je suis l'assistant ONE CONNEXION. Choisissez une question ou écrivez la vôtre.",
  choices: STEPS.menu.choices,
};

const stepMsg = (step: StepId): Msg => ({ role: "assistant", content: STEPS[step].text, choices: STEPS[step].choices, step });

export default function ChatWidget() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [callback, setCallback] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Nouvelle réponse : on montre son début (les réponses du parcours sont longues), sinon le bas.
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const last = list.querySelector<HTMLElement>("[data-last-bot]");
    const top = last && messages[messages.length - 1]?.role === "assistant" && !callback ? last.offsetTop - 12 : list.scrollHeight;
    list.scrollTo({ top, behavior: "smooth" });
  }, [messages, loading, callback]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (HIDDEN.test(pathname)) return null;
  const aboveActionBar = !ACTION_BAR_HIDDEN.test(pathname);
  const lastBot = [...messages].reverse().find((m) => m.role === "assistant");

  function choose(c: Choice) {
    if ("step" in c) {
      setMessages((m) => [...m, { role: "user", content: c.label }, stepMsg(c.step)]);
    } else if ("href" in c) {
      setOpen(false);
      router.push(c.href);
    } else if (c.action === "order") {
      setOpen(false);
      window.dispatchEvent(new CustomEvent("open-order-modal"));
    } else if (c.action === "call") {
      window.location.assign(`tel:${PHONE_TEL}`);
    } else {
      setMessages((m) => [...m, { role: "user", content: c.label }, { role: "assistant", content: "Laissez vos coordonnées : nous vous rappelons rapidement (lundi au samedi, 9 h - 19 h)." }]);
      setCallback(true);
    }
  }

  async function send() {
    const text = input.trim().slice(0, MAX_LEN);
    if (!text || loading) return;
    setInput("");
    const withUser = [...messages, { role: "user" as const, content: text }];
    setMessages(withUser);

    // Réponse courte à une question du parcours (« pro », « particulier »…) : immédiate, sans IA.
    const local = matchStep(text);
    if (local && (lastBot?.step === "type" || text.split(/\s+/).length <= 4)) {
      setMessages([...withUser, stepMsg(local)]);
      return;
    }

    setLoading(true);
    let reply: Msg;
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history(withUser) }),
      });
      const data = (await res.json().catch(() => ({}))) as { reply?: string; fallback?: boolean };
      if (data.fallback || typeof data.reply !== "string" || !data.reply) reply = guided(local);
      else reply = { role: "assistant", content: data.reply, choices: [{ label: "Commander maintenant", action: "order" }, { label: "Être rappelé", action: "callback" }, { label: "Autre question", step: "menu" }] };
    } catch {
      reply = guided(local);
    }
    setMessages((m) => [...m, reply]);
    setLoading(false);
    inputRef.current?.focus();
  }

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Ouvrir l'assistant"
          className={`fixed right-4 z-[45] flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-lg shadow-black/25 transition hover:bg-accent-dark md:bottom-6 md:right-6 ${aboveActionBar ? "bottom-[92px]" : "bottom-4"}`}
          style={aboveActionBar ? undefined : { marginBottom: "env(safe-area-inset-bottom)" }}
        >
          <MessageCircle size={26} />
        </button>
      )}

      {open && (
        <div
          role="dialog"
          aria-label="Assistant ONE CONNEXION"
          data-lenis-prevent
          className="fixed inset-0 z-[80] flex flex-col bg-paper-card md:inset-auto md:bottom-6 md:right-6 md:h-[620px] md:max-h-[calc(100vh-48px)] md:w-[390px] md:overflow-hidden md:rounded-2xl md:border md:border-line md:shadow-2xl"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="flex items-center justify-between bg-ink px-4 py-3 text-white" style={{ paddingTop: "max(12px, env(safe-area-inset-top))" }}>
            <div>
              <div className="text-[15px] font-bold">Assistant ONE CONNEXION</div>
              <div className="text-[12px] text-white/60">Réponse immédiate · Coursiers lun-sam 9 h - 19 h</div>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Fermer" className="rounded-lg p-2 hover:bg-white/10">
              <X size={22} />
            </button>
          </div>

          <div ref={listRef} className="relative flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4" aria-live="polite">
            {messages.map((m, i) => (
              <div key={i} data-last-bot={i === messages.length - 1 && m.role === "assistant" ? "" : undefined}>
                <Bubble role={m.role} content={m.content} />
              </div>
            ))}
            {loading && <div className="w-16 rounded-2xl bg-white px-4 py-3 text-muted shadow-sm">…</div>}

            {callback ? (
              <CallbackForm
                lastQuestion={[...messages].reverse().find((m) => m.role === "user" && m.content !== "Être rappelé")?.content ?? ""}
                onDone={(ok) => {
                  setCallback(false);
                  setMessages((m) => [
                    ...m,
                    ok
                      ? { role: "assistant", content: "Merci ! Votre demande est bien reçue : nous vous rappelons rapidement.", choices: [{ label: "Commander maintenant", action: "order" }, { label: "Autre question", step: "menu" }] }
                      : { role: "assistant", content: `L'envoi n'a pas fonctionné. Appelez-nous directement au ${PHONE_DISPLAY}.`, choices: [{ label: `Appeler le ${PHONE_DISPLAY}`, action: "call" }] },
                  ]);
                }}
              />
            ) : (
              !loading &&
              lastBot?.choices && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {lastBot.choices.map((c) => (
                    <button
                      key={c.label}
                      type="button"
                      onClick={() => choose(c)}
                      className={`rounded-full px-3 py-1.5 text-left text-[13px] font-semibold ${"action" in c && c.action === "order" ? "bg-accent text-white hover:bg-accent-dark" : "border border-accent/40 bg-white text-accent-dark hover:bg-accent/5"}`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              )
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex items-end gap-2 border-t border-line px-3 py-3"
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, MAX_LEN))}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={1}
              maxLength={MAX_LEN}
              placeholder="Votre question…"
              aria-label="Votre question"
              // 16 px minimum : évite le zoom automatique de l'iPhone sur le champ.
              className="max-h-28 min-h-[44px] flex-1 resize-none rounded-xl border border-line bg-white px-3 py-2.5 text-[16px] text-ink outline-none focus:border-accent"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Envoyer"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ink text-white disabled:opacity-40"
            >
              <Send size={18} />
            </button>
          </form>
          <div className="flex items-center justify-between gap-2 px-4 pb-2 text-[11px] text-label">
            <span>Ne partagez ni carte bancaire ni mot de passe.</span>
            <a href={`tel:${PHONE_TEL}`} className="flex shrink-0 items-center gap-1 font-bold text-ink">
              <Phone size={12} className="text-accent" /> {PHONE_DISPLAY}
            </a>
          </div>
        </div>
      )}
    </>
  );
}

function Bubble({ role, content }: Pick<Msg, "role" | "content">) {
  const mine = role === "user";
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[88%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-[14.5px] leading-[1.5] shadow-sm ${mine ? "bg-ink text-white" : "bg-white text-ink"}`}
      >
        {content}
      </div>
    </div>
  );
}

/** Demande de rappel : enregistrée comme un message de contact (base + e-mail à l'équipe). */
function CallbackForm({ lastQuestion, onDone }: { lastQuestion: string; onDone: (ok: boolean) => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const phoneOk = phone.replace(/\D/g, "").length >= 9;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phoneOk || !email.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim().slice(0, 120),
          email: email.trim().slice(0, 200),
          message: `Demande de rappel depuis l'assistant du site.\nTéléphone : ${phone.trim().slice(0, 30)}${lastQuestion ? `\nDernière question : ${lastQuestion.slice(0, 500)}` : ""}`,
        }),
      });
      onDone(res.ok);
    } catch {
      onDone(false);
    }
  }

  const field = "w-full rounded-lg border border-line bg-white px-3 py-2 text-[16px] text-ink outline-none focus:border-accent";
  return (
    <form onSubmit={submit} className="space-y-2 rounded-2xl bg-white p-3 shadow-sm">
      <input className={field} placeholder="Nom et prénom" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} required />
      <input className={field} placeholder="Téléphone" type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={30} required />
      <input className={field} placeholder="E-mail" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={200} required />
      <button type="submit" disabled={sending || !name.trim() || !phoneOk || !email.trim()} className="w-full rounded-lg bg-accent py-2.5 text-[14px] font-bold text-white disabled:opacity-50">
        {sending ? "Envoi…" : "Me faire rappeler"}
      </button>
    </form>
  );
}

/** L'IA ne répond pas : réponse guidée si la question est reconnue, sinon menu et rappel. */
function guided(step: StepId | null): Msg {
  if (step) return stepMsg(step);
  return {
    role: "assistant",
    content: "Je n'ai pas la réponse exacte, mais un conseiller peut vous aider. Laissez votre numéro et nous vous rappelons, ou choisissez une question.",
    choices: [{ label: "Être rappelé", action: "callback" }, ...STEPS.menu.choices.filter((c) => !("action" in c))],
  };
}

/** Historique envoyé à l'IA : 20 derniers messages au plus, en commençant par un message du visiteur. */
function history(msgs: Msg[]): { role: Msg["role"]; content: string }[] {
  let out = msgs.slice(-20);
  while (out.length && out[0].role !== "user") out = out.slice(1);
  return out.map((m) => ({ role: m.role, content: m.content.slice(0, MAX_LEN) }));
}
