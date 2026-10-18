"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, Send, CheckCheck, Truck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Driver = {
  id: string;
  name: string | null;
  vehicle: string | null;
  status: string | null;
  auth_id: string | null;
};

type Message = {
  id: string;
  sender_id: string;
  recipient_id: string | null;
  content: string;
  is_admin_message: boolean;
  created_at: string;
};

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

const formatDay = (iso: string) => {
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "Aujourd'hui";
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
};

export default function AdminChatPage() {
  const supabase = useMemo(() => createClient(), []);
  const [adminId, setAdminId] = useState<string | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Admin connecté + chauffeurs + historique
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setAdminId(user.id);

      const [{ data: driversData }, { data: msgs }] = await Promise.all([
        supabase.from("drivers").select("id, name, vehicle, status, auth_id").order("name"),
        supabase.from("messages").select("*").order("created_at", { ascending: true }).limit(1000),
      ]);
      const withAuth = ((driversData as Driver[]) || []).filter((d) => d.auth_id);
      setDrivers(withAuth);
      setMessages((msgs as Message[]) || []);
      if (withAuth.length) setSelectedId((cur) => cur ?? withAuth[0].auth_id);
    };
    init();
  }, [supabase]);

  // Temps réel
  useEffect(() => {
    const channel = supabase
      .channel("admin-chat")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload: { new: unknown }) => {
        const msg = payload.new as Message;
        setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const selectedDriver = drivers.find((d) => d.auth_id === selectedId) || null;

  // Messages échangés avec le chauffeur sélectionné
  const thread = useMemo(
    () => messages.filter((m) => m.sender_id === selectedId || m.recipient_id === selectedId),
    [messages, selectedId]
  );

  const lastByDriver = useMemo(() => {
    const map = new Map<string, Message>();
    for (const m of messages) {
      const key = m.is_admin_message ? m.recipient_id : m.sender_id;
      if (key) map.set(key, m);
    }
    return map;
  }, [messages]);

  const filteredDrivers = drivers.filter((d) =>
    (d.name || "").toLowerCase().includes(search.trim().toLowerCase())
  );

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [thread.length, selectedId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = message.trim();
    if (!content || !adminId || !selectedId) return;
    setError(null);
    setMessage("");

    const { data, error: err } = await supabase
      .from("messages")
      .insert([{ sender_id: adminId, recipient_id: selectedId, content, is_admin_message: true }])
      .select()
      .single();

    if (err) {
      setError("Erreur d'envoi du message.");
      setMessage(content);
    } else if (data) {
      setMessages((prev) => (prev.some((m) => m.id === data.id) ? prev : [...prev, data as Message]));
    }
  };

  const isOnline = (d: Driver) => !!d.status && d.status !== "hors_service";

  return (
    <div className="flex h-[calc(100dvh-160px)] min-h-[520px] w-full overflow-hidden rounded-2xl border border-ink bg-white shadow-[0_12px_40px_-12px_rgba(14,15,16,0.25)]">
      {/* Sidebar - Drivers List */}
      <div className="flex w-1/3 min-w-[280px] max-w-[360px] flex-col border-r border-line bg-gray-50/50">
        <div className="relative flex flex-col gap-4 bg-ink p-5">
          <span aria-hidden className="absolute inset-x-0 top-0 h-[3px] bg-accent" />
          <div>
            <div className="label-mono flex items-center gap-2 text-xs font-medium text-accent"><span className="h-1.5 w-1.5 rounded-full bg-accent" />Flotte</div>
            <h1 className="mt-1.5 text-[22px] font-extrabold leading-none tracking-tight text-white">Messagerie</h1>
          </div>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un chauffeur..."
              className="h-10 w-full rounded-lg border border-white/15 bg-white/[0.07] pl-10 pr-4 text-sm font-medium text-white placeholder:text-white/45 outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/30"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {filteredDrivers.length === 0 && (
            <p className="p-4 text-center text-sm text-muted">Aucun chauffeur.</p>
          )}
          {filteredDrivers.map((driver) => {
            const last = driver.auth_id ? lastByDriver.get(driver.auth_id) : undefined;
            return (
              <button
                key={driver.id}
                onClick={() => setSelectedId(driver.auth_id)}
                className={`flex w-full items-start gap-3 rounded-xl p-3 text-left transition-colors ${
                  selectedId === driver.auth_id ? "bg-white shadow-sm ring-1 ring-line" : "hover:bg-gray-100/50"
                }`}
              >
                <div className="relative shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 font-bold text-accent">
                    {(driver.name || "?").charAt(0)}
                  </div>
                  <div
                    className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white ${
                      isOnline(driver) ? "bg-green-500" : "bg-gray-400"
                    }`}
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-center justify-between">
                    <span className="truncate text-sm font-bold text-ink">{driver.name || "Chauffeur"}</span>
                    {last && <span className="shrink-0 text-xs text-muted">{formatTime(last.created_at)}</span>}
                  </div>
                  <span className="truncate text-xs text-muted/80">{driver.vehicle || "-"}</span>
                  <span className="mt-1 truncate text-xs text-muted">{last?.content || "Aucun message"}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col bg-[#FBFBFB]">
        {selectedDriver ? (
          <>
            <div className="z-10 flex items-center justify-between border-b border-line bg-white px-6 py-4 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 font-bold text-accent">
                  {(selectedDriver.name || "?").charAt(0)}
                </div>
                <div>
                  <h2 className="text-base font-bold text-ink">{selectedDriver.name || "Chauffeur"}</h2>
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <span className="flex items-center gap-1"><Truck size={12} /> {selectedDriver.vehicle || "-"}</span>
                    <span>•</span>
                    <span className={isOnline(selectedDriver) ? "text-green-600" : "text-gray-500"}>
                      {isOnline(selectedDriver) ? "En ligne" : "Hors ligne"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6">
              <div className="flex flex-col gap-4">
                {thread.length === 0 && (
                  <p className="text-center text-sm italic text-muted">Aucun message. Démarrez la discussion.</p>
                )}
                {thread.map((msg, i) => {
                  const isMe = msg.is_admin_message;
                  const newDay = i === 0 || formatDay(thread[i - 1].created_at) !== formatDay(msg.created_at);
                  return (
                    <React.Fragment key={msg.id}>
                      {newDay && (
                        <div className="text-center">
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-muted">{formatDay(msg.created_at)}</span>
                        </div>
                      )}
                      <div className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`relative max-w-[70%] rounded-2xl px-5 py-3 text-sm ${
                            isMe
                              ? "rounded-br-sm bg-accent text-white shadow-sm"
                              : "rounded-bl-sm border border-line bg-white text-ink shadow-sm"
                          }`}
                        >
                          <p className="leading-relaxed">{msg.content}</p>
                          <div className={`mt-1 flex items-center justify-end gap-1 text-[11px] ${isMe ? "text-white/80" : "text-muted"}`}>
                            {formatTime(msg.created_at)}
                            {isMe && <CheckCheck size={14} className="text-white/90" />}
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-line bg-white p-4">
              {error && <p className="mb-2 text-xs font-medium text-red-600">{error}</p>}
              <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`Écrivez un message à ${selectedDriver.name || "ce chauffeur"}...`}
                  className="flex-1 rounded-xl border border-line bg-gray-50 px-5 py-3.5 text-sm outline-none transition-colors focus:border-accent focus:bg-white focus:ring-1 focus:ring-accent/30"
                />
                <button
                  type="submit"
                  disabled={!message.trim()}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent text-white transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm italic text-muted">
            Sélectionnez un chauffeur pour afficher la conversation.
          </div>
        )}
      </div>
    </div>
  );
}
