import { useEffect, useState, useRef } from "react";
import { supabase } from "../../lib/supabase";
import { Loader2, Send, User as UserIcon, MessageSquare } from "lucide-react";

export default function ClientChat() {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [adminId, setAdminId] = useState(null);
    const messagesEndRef = useRef(null);

    const [profile, setProfile] = useState(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUser(user);

            if (user) {
                const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single();
                setProfile(p);
            }

            const { data: admins } = await supabase
                .from('profiles')
                .select('id')
                .eq('role', 'admin')
                .limit(1);

            if (admins && admins.length > 0) {
                setAdminId(admins[0].id);
                if (user) fetchMessages(user.id, admins[0].id);
            }
            setLoading(false);
        };
        init();
    }, []);

    const [isPartnerTyping, setIsPartnerTyping] = useState(false);
    const typingTimeoutRef = useRef(null);

    useEffect(() => {
        if (!currentUser || !adminId) return;

        const channelId = `chat-${[currentUser.id, adminId].sort().join('-')}`;

        const channel = supabase
            .channel(channelId)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `recipient_id=eq.${currentUser.id}`
            }, (payload) => {
                const msg = payload.new;
                setMessages((prev) => (prev.some(m => m.id === msg.id) ? prev : [...prev, msg]));
            })
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `sender_id=eq.${currentUser.id}`
            }, (payload) => {
                const msg = payload.new;
                setMessages((prev) => (prev.some(m => m.id === msg.id) ? prev : [...prev, msg]));
            })
            .on('broadcast', { event: 'typing' }, (payload) => {
                const { userId, typing } = payload.payload;
                if (userId === adminId) {
                    setIsPartnerTyping(typing);
                }
            })
            .on('broadcast', { event: 'new_message' }, (payload) => {
                const msg = payload.payload;
                setMessages(prev => (prev.some(m => m.id === msg.id) ? prev : [...prev, msg]));
            })
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                }
            });

        const broadcastTyping = (isTyping) => {
            channel.send({
                type: 'broadcast',
                event: 'typing',
                payload: { userId: currentUser.id, typing: isTyping },
            });
        };

        window._broadcastClientTyping = broadcastTyping;
        window._currentClientChatChannel = channel;

        return () => {
            supabase.removeChannel(channel);
            window._currentClientChatChannel = null;
        };
    }, [currentUser, currentUser?.id, adminId]);

    const handleTyping = () => {
        if (!currentUser) return;
        window._broadcastClientTyping?.(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            window._broadcastClientTyping?.(false);
        }, 3000);
    };

    const fetchMessages = async (userId, targetId) => {
        const { data } = await supabase
            .from('messages')
            .select('*')
            .or(`and(sender_id.eq.${userId},recipient_id.eq.${targetId}),and(sender_id.eq.${targetId},recipient_id.eq.${userId})`)
            .order('created_at', { ascending: true });

        if (data) {
            setMessages(data);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !adminId || !currentUser) return;

        const content = newMessage.trim();
        setNewMessage("");
        setSending(true);

        const tempId = 'temp-' + Date.now();
        const tempMsg = {
            id: tempId,
            sender_id: currentUser.id,
            recipient_id: adminId,
            content,
            created_at: new Date().toISOString(),
            is_admin_message: false,
            is_optimistic: true
        };

        setMessages(prev => [...prev, tempMsg]);

        const { data, error } = await supabase
            .from('messages')
            .insert({
                sender_id: currentUser.id,
                recipient_id: adminId,
                content,
                is_admin_message: false
            })
            .select()
            .single();

        if (error) {
            setMessages(prev => prev.filter(m => m.id !== tempId));
            alert("Erreur d'envoi");
        } else if (data) {
            window._currentClientChatChannel?.send({
                type: 'broadcast',
                event: 'new_message',
                payload: data
            });
            setMessages(prev => prev.map(m => m.id === tempId ? data : m));
        }

        setSending(false);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-noir/10" />
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-noir/20">Connexion au support</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] font-body">
            <header className="mb-12 space-y-4 border-b border-noir/5 pb-8">
                <h1 className="text-6xl font-display italic text-noir leading-none">
                    {profile?.role === 'courier' ? <span>Chat <span className="text-[#ed5518]">Chauffeur.</span></span> : <span>Support <span className="text-[#ed5518]">Direct.</span></span>}
                </h1>
                <p className="text-noir/40 font-medium tracking-[0.1em]">Échangez en temps réel avec notre équipe logistique.</p>
            </header>

            <div className="flex-1 bg-white rounded-[2.5rem] border border-noir/5 flex flex-col overflow-hidden shadow-2xl shadow-noir/[0.02]">
                <div className="px-10 py-6 border-b border-noir/[0.03] flex items-center justify-between bg-white">
                    <div className="flex items-center gap-5">
                        <div className="relative group">
                            <div className="h-14 w-14 rounded-2xl bg-noir flex items-center justify-center text-white font-display italic text-xl shadow-xl shadow-noir/20 overflow-hidden relative">
                                <div className="absolute inset-0 bg-gradient-to-tr from-[#ed5518]/20 to-transparent"></div>
                                OC
                            </div>
                            <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-4 border-white bg-emerald-500 shadow-sm"></div>
                        </div>
                        <div className="space-y-0.5">
                            <div className="text-lg font-display italic text-noir leading-none">One Connexion Support</div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#ed5518]">En Ligne</span>
                                <span className="h-1 w-1 rounded-full bg-[#ed5518]/30"></span>
                                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-noir/20">Temps de réponse habituel : &lt; 5 min</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-10 py-10 space-y-8 bg-noir/[0.005]">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center space-y-8 py-20 grayscale opacity-20">
                            <div className="h-32 w-32 rounded-[3rem] border border-noir/10 flex items-center justify-center">
                                <MessageSquare size={48} strokeWidth={1} />
                            </div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] max-w-[180px] text-center leading-relaxed">
                                Démarrer une conversation confidentielle
                            </p>
                        </div>
                    ) : (
                        messages.map((m) => {
                            const isMe = m.sender_id === currentUser?.id;

                            return (
                                <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                                    <div className={`max-w-[70%] space-y-2 flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                                        <div className={`flex items-center gap-3 px-1 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-noir/20">
                                                {isMe ? "Votre Message" : "One Connexion"}
                                            </span>
                                            <span className="text-[9px] font-bold text-noir/10">
                                                {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div className={`px-8 py-5 text-[15px] leading-relaxed shadow-sm transition-all border ${isMe
                                            ? "bg-noir text-white rounded-[2rem] rounded-tr-sm border-noir shadow-xl shadow-noir/10"
                                            : "bg-white text-noir/80 rounded-[2rem] rounded-tl-sm border-noir/5 shadow-sm"
                                            }`}>
                                            {m.content}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    {isPartnerTyping && (
                        <div className="flex items-center gap-4 px-2 animate-pulse">
                            <div className="flex gap-1.5">
                                <span className="h-1 w-1 rounded-full bg-[#ed5518] animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="h-1 w-1 rounded-full bg-[#ed5518] animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="h-1 w-1 rounded-full bg-[#ed5518] animate-bounce"></span>
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#ed5518]">Support rédige une réponse</span>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-8 bg-white border-t border-noir/[0.03]">
                    <form onSubmit={sendMessage} className="relative flex items-center">
                        <input
                            className="w-full bg-noir/[0.01] border border-noir/5 rounded-[2rem] px-8 py-6 pr-40 text-sm font-medium focus:outline-none focus:bg-white focus:border-[#ed5518]/30 transition-all placeholder:italic placeholder:text-noir/20"
                            placeholder="Décrivez votre demande ou question ici..."
                            value={newMessage}
                            onChange={(e) => {
                                setNewMessage(e.target.value);
                                handleTyping();
                            }}
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                            {newMessage.trim() && (
                                <button
                                    type="submit"
                                    disabled={sending || !adminId}
                                    className="bg-noir text-white px-8 py-3.5 rounded-[1.5rem] text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#ed5518] transition-all transform active:scale-95 flex items-center gap-3 shadow-xl shadow-noir/10"
                                >
                                    Envoyer
                                    <Send size={12} className="-rotate-12" />
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}



