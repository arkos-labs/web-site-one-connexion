import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, MessageCircle } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AdminAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Je suis là pour t’aider à corriger et améliorer l’admin. Dis‑moi quoi vérifier." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const nextMessages = [...messages, { role: "user", content: input.trim() }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("admin-assistant", {
        body: { messages: nextMessages },
      });

      if (error) throw error;
      const reply = data?.reply || "";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (e: any) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Erreur assistant. Vérifie la fonction Supabase + clé Ollama." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!open ? (
        <Button
          onClick={() => setOpen(true)}
          className="rounded-full h-12 w-12 p-0 shadow-xl bg-slate-900 hover:bg-slate-800"
        >
          <MessageCircle className="h-5 w-5" />
        </Button>
      ) : (
        <Card className="w-[380px] h-[520px] flex flex-col shadow-2xl border border-white/10 bg-slate-900/90 text-white backdrop-blur-xl">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="font-black tracking-tight">Assistant Admin</div>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)} className="text-white/70 hover:text-white">Fermer</Button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-transparent">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
                <div
                  className={`inline-block px-3 py-2 rounded-2xl text-sm ${
                    m.role === "user"
                      ? "bg-orange-500 text-white"
                      : "bg-white/10 text-white border border-white/10"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-white/10 flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Écris ici..."
              className="bg-white/10 border-white/10 text-white placeholder:text-white/50"
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <Button onClick={sendMessage} disabled={loading} className="bg-orange-500 hover:bg-orange-600">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Envoyer"}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
