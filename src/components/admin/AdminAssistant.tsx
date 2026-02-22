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
        <Button onClick={() => setOpen(true)} className="rounded-full h-12 w-12 p-0 shadow-lg">
          <MessageCircle className="h-5 w-5" />
        </Button>
      ) : (
        <Card className="w-[360px] h-[480px] flex flex-col shadow-2xl">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="font-bold">Assistant Admin</div>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Fermer</Button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
                <div className={`inline-block px-3 py-2 rounded-2xl text-sm ${m.role === "user" ? "bg-slate-900 text-white" : "bg-white text-slate-900 border"}`}>
                  {m.content}
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Écris ici..."
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <Button onClick={sendMessage} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Envoyer"}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
