"use client";

import React, { useState } from "react";
import { Search, Send, Phone, MoreVertical, CheckCheck, Truck } from "lucide-react";

// Mock Data
const MOCK_DRIVERS = [
  { id: 1, name: "Ahmed K.", status: "online", vehicle: "Renault Master (AB-123-CD)", lastMessage: "Je suis au point d'enlèvement.", time: "10:12" },
  { id: 2, name: "Sophie L.", status: "offline", vehicle: "Peugeot Boxer (EF-456-GH)", lastMessage: "Livraison terminée pour le client X.", time: "Hier" },
  { id: 3, name: "Marc D.", status: "online", vehicle: "Mercedes Sprinter (IJ-789-KL)", lastMessage: "Ok, c'est noté.", time: "09:45" },
];

const MOCK_MESSAGES = [
  { id: 1, senderId: 1, text: "Bonjour, je viens d'arriver chez le client pour la navette de 10h.", timestamp: "10:05", isMe: false },
  { id: 2, senderId: "admin", text: "Parfait Ahmed. Y a-t-il des soucis pour accéder au quai de chargement ?", timestamp: "10:07", isMe: true },
  { id: 3, senderId: 1, text: "Non, c'est bon, la sécurité m'a laissé passer. Je commence le chargement.", timestamp: "10:09", isMe: false },
  { id: 4, senderId: 1, text: "Je suis au point d'enlèvement.", timestamp: "10:12", isMe: false },
];

export default function AdminChatPage() {
  const [selectedDriver, setSelectedDriver] = useState(MOCK_DRIVERS[0]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(MOCK_MESSAGES);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now(),
      senderId: "admin",
      text: message,
      timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      isMe: true,
    };

    setMessages([...messages, newMessage]);
    setMessage("");
  };

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
              placeholder="Rechercher un chauffeur..."
              className="h-10 w-full rounded-lg border border-white/15 bg-white/[0.07] pl-10 pr-4 text-sm font-medium text-white placeholder:text-white/45 outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/30"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {MOCK_DRIVERS.map((driver) => (
            <button
              key={driver.id}
              onClick={() => setSelectedDriver(driver)}
              className={`flex w-full items-start gap-3 rounded-xl p-3 text-left transition-colors ${
                selectedDriver.id === driver.id ? "bg-white shadow-sm ring-1 ring-line" : "hover:bg-gray-100/50"
              }`}
            >
              <div className="relative shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 font-bold text-accent">
                  {driver.name.charAt(0)}
                </div>
                <div
                  className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white ${
                    driver.status === "online" ? "bg-green-500" : "bg-gray-400"
                  }`}
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-center justify-between">
                  <span className="truncate text-sm font-bold text-ink">{driver.name}</span>
                  <span className="shrink-0 text-xs text-muted">{driver.time}</span>
                </div>
                <span className="truncate text-xs text-muted/80">{driver.vehicle}</span>
                <span className="mt-1 truncate text-xs text-muted">{driver.lastMessage}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col bg-[#FBFBFB]">
        {/* Chat Header */}
        <div className="flex items-center justify-between border-b border-line bg-white px-6 py-4 shadow-sm z-10">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 font-bold text-accent">
              {selectedDriver.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-base font-bold text-ink">{selectedDriver.name}</h2>
              <div className="flex items-center gap-2 text-xs text-muted">
                <span className="flex items-center gap-1"><Truck size={12}/> {selectedDriver.vehicle}</span>
                <span>•</span>
                <span className={selectedDriver.status === "online" ? "text-green-600" : "text-gray-500"}>
                  {selectedDriver.status === "online" ? "En ligne" : "Hors ligne"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-muted transition-colors hover:bg-gray-100 hover:text-ink">
              <Phone size={18} />
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-muted transition-colors hover:bg-gray-100 hover:text-ink">
              <MoreVertical size={18} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col gap-4">
            <div className="text-center">
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-muted">Aujourd'hui</span>
            </div>
            {messages.map((msg) => (
              <div key={msg.id} className={`flex w-full ${msg.isMe ? "justify-end" : "justify-start"}`}>
                <div
                  className={`relative max-w-[70%] rounded-2xl px-5 py-3 text-sm ${
                    msg.isMe
                      ? "rounded-br-sm bg-accent text-white shadow-sm"
                      : "rounded-bl-sm border border-line bg-white text-ink shadow-sm"
                  }`}
                >
                  <p className="leading-relaxed">{msg.text}</p>
                  <div
                    className={`mt-1 flex items-center justify-end gap-1 text-[11px] ${
                      msg.isMe ? "text-white/80" : "text-muted"
                    }`}
                  >
                    {msg.timestamp}
                    {msg.isMe && <CheckCheck size={14} className="text-white/90" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-line bg-white p-4">
          <form onSubmit={handleSendMessage} className="flex items-center gap-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Écrivez un message à la flotte..."
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
      </div>
    </div>
  );
}
