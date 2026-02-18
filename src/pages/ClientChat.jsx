import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabase";
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

            // Fetch any admin to send message to
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

        // Realtime subscription
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
                console.log("Client: Broadcast message received:", msg);
                setMessages(prev => (prev.some(m => m.id === msg.id) ? prev : [...prev, msg]));
            })
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log("Client subscribed to typing and broadcast");
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
    }, [currentUser?.id, adminId]);

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
            // Broadcast for zero-latency
            window._currentClientChatChannel?.send({
                type: 'broadcast',
                event: 'new_message',
                payload: data
            });
            setMessages(prev => prev.map(m => m.id === tempId ? data : m));
        }

        setSending(false);
    };

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-slate-400" /></div>;

    return (
        <div className="flex flex-col h-[calc(100vh-120px)]">
            <header className="mb-8">
                <h1 className="text-4xl font-extrabold text-slate-900">
                    {profile?.role === 'courier' ? 'Messagerie Chauffeur' : 'Support Client'}
                </h1>
                <p className="text-base font-medium text-slate-500 mt-1">Posez vos questions directement à notre équipe logistique.</p>
            </header>

            <div className="flex-1 bg-white rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 flex flex-col overflow-hidden">
                {/* Chat Header */}
                <div className="px-8 py-5 border-b border-slate-50 flex items-center gap-4 bg-white">
                    <div className="relative">
                        <div className="h-12 w-12 rounded-full bg-[#f97316] flex items-center justify-center text-white font-black text-lg shadow-md shadow-orange-200">
                            OC
                        </div>
                        <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500"></div>
                    </div>
                    <div>
                        <div className="text-xl font-bold text-slate-900">Support One Connexion</div>
                        <div className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Équipe en ligne</div>
                    </div>
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-white">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-300">
                            <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                                <MessageSquare size={32} className="opacity-20" />
                            </div>
                            <p className="text-sm font-medium">Posez votre première question ici.</p>
                        </div>
                    ) : (
                        messages.map((m) => {
                            const isMe = (m.is_admin_message ?? (m.sender_id === currentUser?.id)) === false;
                            return (
                                <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                    <div className={`max-w-[75%] group relative flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                                        <div className={`mb-1 text-xs font-semibold uppercase tracking-widest ${isMe ? "text-slate-400" : "text-emerald-500"}`}>
                                            {isMe ? "Vous" : "Support"}
                                        </div>
                                        <div className={`px-6 py-3.5 text-[17px] font-medium shadow-sm transition-all ${isMe
                                            ? "bg-[#0f172a] text-white rounded-[2rem] rounded-br-none hover:shadow-md"
                                            : "bg-[#f1f5f9] text-slate-700 rounded-[2rem] rounded-bl-none hover:bg-slate-200"
                                            }`}>
                                            {m.content}
                                        </div>
                                        <div className={`mt-1.5 px-2 text-xs font-bold text-slate-300 ${isMe ? "text-right" : "text-left"}`}>
                                            {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    {isPartnerTyping && (
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 animate-pulse pb-4">
                            <div className="flex gap-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-bounce"></span>
                            </div>
                            Support est en train d'écrire...
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={sendMessage} className="p-6 bg-white border-t border-slate-50 flex gap-3">
                    <input
                        className="flex-1 rounded-full border border-slate-200 bg-slate-50/50 px-6 py-4 text-base font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100 focus:bg-white transition-all"
                        placeholder="Comment pouvons-nous vous aider ?"
                        value={newMessage}
                        onChange={(e) => {
                            setNewMessage(e.target.value);
                            handleTyping();
                        }}
                    />
                    <button
                        type="submit"
                        disabled={sending || !newMessage.trim() || !adminId}
                        className="rounded-full bg-[#64748b] px-8 py-4 text-white font-bold text-sm uppercase tracking-wider shadow-lg shadow-slate-200 disabled:opacity-50 disabled:shadow-none transition-all hover:bg-slate-700 hover:scale-105 active:scale-95 flex items-center gap-2"
                    >
                        <span>Envoyer</span>
                        <Send size={14} className="-mt-0.5" />
                    </button>
                </form>
            </div>
        </div>
    );
}
