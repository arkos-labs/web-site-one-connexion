"use client";
/**
 * components/ChatWidget.tsx
 * Assistant du site, sur ordinateur et téléphone : bulle en bas à droite, questions rapides
 * (réponses fixes, immédiates) et questions libres (réponse de /api/chat).
 * Les réponses sont affichées en texte brut : aucun HTML venant du serveur n'est interprété.
 */
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, Phone, Send, X } from "lucide-react";
import { QUICK_QUESTIONS } from "@/lib/chatbot/quick-questions";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/site-content";
import { ACTION_BAR_HIDDEN } from "@/components/MobileActionBar";

type Msg = { role: "user" | "assistant"; content: string };

// Admin, application coursier et tunnel de commande : pas d'assistant.
const HIDDEN = /^\/(admin|telegram|commande)(\/|$)/;
const MAX_LEN = 1000;
const WELCOME = "Bonjour ! Je suis l'assistant ONE CONNEXION. Posez votre question ou choisissez-en une ci-dessous.";

export default function ChatWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (HIDDEN.test(pathname)) return null;
  const aboveActionBar = !ACTION_BAR_HIDDEN.test(pathname);

  function askQuick(q: string, a: string) {
    setMessages((m) => [...m, { role: "user", content: q }, { role: "assistant", content: a }]);
  }

  async function send() {
    const text = input.trim().slice(0, MAX_LEN);
    if (!text || loading) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Les 20 derniers messages suffisent ; le premier envoyé doit venir du visiteur.
        body: JSON.stringify({ messages: trimHistory(next) }),
      });
      const data = (await res.json().catch(() => ({}))) as { reply?: string };
      const reply = typeof data.reply === "string" && data.reply ? data.reply : errorText();
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: errorText() }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function order() {
    setOpen(false);
    window.dispatchEvent(new CustomEvent("open-order-modal"));
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
          className="fixed inset-0 z-[80] flex flex-col bg-paper-card md:inset-auto md:bottom-6 md:right-6 md:h-[600px] md:max-h-[calc(100vh-48px)] md:w-[390px] md:overflow-hidden md:rounded-2xl md:border md:border-line md:shadow-2xl"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="flex items-center justify-between bg-ink px-4 py-3 text-white" style={{ paddingTop: "max(12px, env(safe-area-inset-top))" }}>
            <div>
              <div className="text-[15px] font-bold">Assistant ONE CONNEXION</div>
              <div className="text-[12px] text-white/60">Réponses automatiques · Lun-sam 9 h - 19 h</div>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Fermer" className="rounded-lg p-2 hover:bg-white/10">
              <X size={22} />
            </button>
          </div>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4" aria-live="polite">
            <Bubble role="assistant" content={WELCOME} />
            {messages.map((m, i) => (
              <Bubble key={i} role={m.role} content={m.content} />
            ))}
            {loading && <div className="w-16 rounded-2xl bg-white px-4 py-3 text-muted shadow-sm">…</div>}

            <div className="flex flex-wrap gap-2 pt-1">
              {QUICK_QUESTIONS.map(({ q, a }) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => askQuick(q, a)}
                  className="rounded-full border border-accent/40 bg-white px-3 py-1.5 text-left text-[13px] font-medium text-accent-dark hover:bg-accent/5"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 border-t border-line px-3 pt-2">
            <button type="button" onClick={order} className="flex-1 rounded-lg bg-accent py-2 text-[13px] font-bold text-white hover:bg-accent-dark">
              Commander
            </button>
            <a href={`tel:${PHONE_TEL}`} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-line py-2 text-[13px] font-bold text-ink hover:bg-white">
              <Phone size={14} className="text-accent" /> {PHONE_DISPLAY}
            </a>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex items-end gap-2 px-3 py-3"
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
          <p className="px-4 pb-2 text-[11px] text-label">
            Ne partagez pas de données bancaires ni de mot de passe. Pour une course en cours, appelez-nous.
          </p>
        </div>
      )}
    </>
  );
}

function Bubble({ role, content }: Msg) {
  const mine = role === "user";
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-[14.5px] leading-[1.5] shadow-sm ${mine ? "bg-ink text-white" : "bg-white text-ink"}`}
      >
        {content}
      </div>
    </div>
  );
}

/** 20 derniers messages au plus, en commençant par un message du visiteur. */
function trimHistory(msgs: Msg[]): Msg[] {
  let out = msgs.slice(-20);
  while (out.length && out[0].role !== "user") out = out.slice(1);
  return out.map((m) => ({ role: m.role, content: m.content.slice(0, MAX_LEN) }));
}

function errorText() {
  return `Je n'arrive pas à répondre pour le moment. Appelez-nous au ${PHONE_DISPLAY}.`;
}
