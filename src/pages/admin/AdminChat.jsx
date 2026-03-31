import { useEffect, useState, useRef } from "react";
import { supabase } from "../../lib/supabase";
import { Loader2, Send, Phone, MoreVertical, Paperclip, Smile, Search, X, Check, Video } from "lucide-react";

export default function AdminChat() {
  const [users, setUsers] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [toast, setToast] = useState(null);
  const [typingUsers, setTypingUsers] = useState({});
  const [showMobileList, setShowMobileList] = useState(true);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const activeUserRef = useRef(null);

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
        await fetchUsers(user.id);
      }
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    activeUserRef.current = activeUser;
  }, [activeUser]);

  const triggerToast = (content, senderName) => {
    setToast({ content, senderName });
    if (window._toastTimeout) clearTimeout(window._toastTimeout);
    window._toastTimeout = setTimeout(() => setToast(null), 5000);
  };

  useEffect(() => {
    if (!currentUser) return;

    const globalChannel = supabase
      .channel('admin-chat-global-' + currentUser.id)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, async (payload) => {
        const msg = payload.new;
        fetchUsers(currentUser.id);

        if (msg.sender_id !== currentUser.id) {
          const { data: profile } = await supabase.from('profiles').select('details').eq('id', msg.sender_id).single();
          const senderName = profile?.details?.full_name || "Utilisateur";
          triggerToast(msg.content, senderName);
        }

        const currentActive = activeUserRef.current;
        if (currentActive && (msg.sender_id === currentActive.id || msg.recipient_id === currentActive.id)) {
          setMessages(prev => (prev.some(m => m.id === msg.id) ? prev : [...prev, msg]));
          if (msg.recipient_id === currentUser.id) {
            markAsRead(currentActive.id);
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(globalChannel);
    };
  }, [currentUser]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!currentUser || !activeUser?.id) return;

    const channelId = `chat-${[currentUser.id, activeUser.id].sort().join('-')}`;
    const chatChannel = supabase
      .channel(channelId)
      .on('broadcast', { event: 'typing' }, (payload) => {
        const { userId, typing } = payload.payload;
        setTypingUsers(prev => ({
          ...prev,
          [userId]: typing ? Date.now() : 0
        }));
      })
      .subscribe();

    const broadcastTyping = (isTyping) => {
      chatChannel.send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId: currentUser.id, typing: isTyping },
      });
    };

    window._broadcastAdminTyping = broadcastTyping;
    window._currentChatChannel = chatChannel;

    fetchMessages(activeUser.id);
    markAsRead(activeUser.id);

    return () => {
      supabase.removeChannel(chatChannel);
      window._currentChatChannel = null;
    };
  }, [currentUser?.id, activeUser?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTyping = () => {
    if (!currentUser) return;
    window._broadcastAdminTyping?.(true);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      window._broadcastAdminTyping?.(false);
    }, 3000);
  };

  const isPartnerTyping = activeUser && typingUsers[activeUser.id] && (Date.now() - typingUsers[activeUser.id] < 4000);

  const markAsRead = async (partnerId) => {
    if (!currentUser) return;
    await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('sender_id', partnerId)
      .eq('recipient_id', currentUser.id)
      .is('read_at', null);

    fetchUsers(currentUser?.id);
  };

  const fetchUsers = async (currentUserId) => {
    try {
      const { data: profiles, error: pError } = await supabase.from('profiles').select('*');
      if (pError) throw pError;

      const { data: lastMessages } = await supabase
        .from('messages')
        .select('sender_id, recipient_id, content, created_at, read_at')
        .order('created_at', { ascending: false });

      const otherProfiles = profiles.filter(p => p.id !== currentUserId);

      const meta = otherProfiles.map(p => {
        const userMessages = lastMessages?.filter(m => m.sender_id === p.id || m.recipient_id === p.id) || [];
        const lastMsg = userMessages[0];
        const unreadCount = lastMessages?.filter(m => m.sender_id === p.id && m.recipient_id === currentUserId && !m.read_at).length || 0;

        return {
          id: p.id,
          name: (p.role === 'courier' ? p.details?.full_name : (p.details?.company || p.details?.full_name)) || "Utilisateur inconnu",
          role: p.role,
          roleLabel: p.role === 'courier' ? 'Chauffeur' : 'Client',
          last: lastMsg ? lastMsg.content : "Aucun message",
          lastDate: lastMsg ? new Date(lastMsg.created_at) : new Date(0),
          unreadCount
        };
      }).sort((a, b) => {
        if (a.unreadCount !== b.unreadCount) return b.unreadCount - a.unreadCount;
        return b.lastDate - a.lastDate;
      });

      setUsers(meta);
    } catch (err) {
      console.error("fetchUsers error:", err);
    }
  };

  const filteredUsers = users.filter(u => {
    const nameMatch = (u.name || "").toLowerCase().includes(search.toLowerCase());
    const tabMatch = activeTab === "all" || (activeTab === "courier" && u.role === "courier") || (activeTab === "client" && u.role === "client");
    return nameMatch && tabMatch;
  });

  const fetchMessages = async (partnerId) => {
    if (!currentUser) return;
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${partnerId},recipient_id.eq.${partnerId}`)
      .order('created_at', { ascending: true });

    const filtered = data?.filter(m =>
      (m.sender_id === currentUser.id && m.recipient_id === partnerId) ||
      (m.sender_id === partnerId && m.recipient_id === currentUser.id)
    );

    if (filtered) {
      setMessages(filtered);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeUser || !currentUser) return;

    const content = newMessage.trim();
    setNewMessage("");
    setSending(true);

    const tempId = 'temp-' + Date.now();
    const tempMsg = {
      id: tempId,
      sender_id: currentUser.id,
      recipient_id: activeUser.id,
      content,
      created_at: new Date().toISOString(),
      is_admin_message: true,
      is_optimistic: true
    };

    setMessages(prev => [...prev, tempMsg]);

    const { data, error } = await supabase.from('messages').insert({
      sender_id: currentUser.id,
      recipient_id: activeUser.id,
      content,
      is_admin_message: true
    }).select().single();

    if (error) {
      setMessages(prev => prev.filter(m => m.id !== tempId));
      alert("Erreur d'envoi");
    } else if (data) {
      setMessages(prev => prev.map(m => m.id === tempId ? data : m));
    }

    setSending(false);
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-slate-400" /></div>;

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] -mt-4">
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 animate-in fade-in slide-in-from-left-4 duration-700">
        <div>
          <h2 className="text-2xl md:text-4xl font-black tracking-tight text-slate-900 uppercase">Support</h2>
          <p className="mt-1 text-xs md:text-base font-medium text-slate-500">
            Interaction en direct avec la flotte et les partenaires.
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-hidden grid grid-cols-12 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/20">
        {/* Sidebar */}
        <div className={`col-span-12 md:col-span-4 lg:col-span-3 border-r border-slate-50 bg-slate-50/20 flex flex-col h-full ${!showMobileList ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-6 border-b border-slate-50">
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Chercher..."
                className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-sm font-medium focus:ring-2 focus:ring-slate-900 transition-all outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200/50">
              {['all', 'courier', 'client'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === tab ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                >
                  {tab === 'all' ? 'TOUS' : tab === 'courier' ? 'FLOTTE' : 'CLIENTS'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {filteredUsers.map(u => (
              <div
                key={u.id}
                onClick={() => { setActiveUser(u); setShowMobileList(false); }}
                className={`p-5 flex items-center gap-4 cursor-pointer transition-all relative border-l-4 ${activeUser?.id === u.id ? 'bg-white border-[#ed5518] shadow-sm' : 'border-transparent hover:bg-slate-50'}`}
              >
                <div className={`h-12 w-12 rounded-2xl flex-shrink-0 flex items-center justify-center font-black text-xs text-white shadow-lg ${u.role === 'courier' ? 'bg-amber-500 shadow-amber-500/20' : 'bg-slate-900 shadow-slate-900/20'}`}>
                  {u.name.slice(0, 1).toUpperCase()}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black text-slate-900 uppercase tracking-tight truncate">{u.name}</span>
                    {u.unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded bg-[#ed5518] text-white text-[9px] font-black animate-pulse">
                        {u.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-medium text-slate-400 truncate">
                    {u.last}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`col-span-12 md:col-span-8 lg:col-span-9 flex flex-col h-full bg-white relative ${showMobileList ? 'hidden md:flex' : 'flex'}`}>
          {activeUser ? (
            <>
              {/* Chat Header */}
              <div className="p-4 md:p-6 border-b border-slate-50 flex items-center justify-between bg-white z-10">
                <div className="flex items-center gap-3 md:gap-4">
                  {/* Mobile Back Button */}
                  <button 
                    onClick={() => setShowMobileList(true)}
                    className="md:hidden h-10 w-10 flex items-center justify-center bg-slate-100 rounded-xl text-slate-500 hover:text-slate-900"
                  >
                    <X size={18} />
                  </button>
                  <div className={`h-10 w-10 rounded-xl flex-shrink-0 flex items-center justify-center font-black text-[10px] text-white ${activeUser.role === 'courier' ? 'bg-amber-500' : 'bg-slate-900'}`}>
                    {activeUser.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider truncate max-w-[120px] md:max-w-none">{activeUser.name}</h4>
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#ed5518]"></span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{activeUser.roleLabel}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 md:gap-4">
                  <button className="h-10 w-10 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors bg-slate-50 rounded-xl" title="Appeler">
                    <Phone size={18} />
                  </button>
                  <button className="hidden md:flex h-10 w-10 items-center justify-center text-slate-400 hover:text-slate-900 transition-colors bg-slate-50 rounded-xl" title="Plus">
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 md:space-y-6 custom-scrollbar bg-slate-50/10">
                {messages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center opacity-20 py-20">
                    <div className="h-20 w-20 rounded-3xl bg-slate-100 flex items-center justify-center text-4xl mb-4">💬</div>
                    <span className="text-sm font-black uppercase tracking-widest text-slate-900">Aucun message pour le moment</span>
                  </div>
                )}
                {messages.map((m, idx) => {
                  const isMe = m.sender_id === currentUser.id;
                  const showDate = idx === 0 || new Date(messages[idx - 1].created_at).toLocaleDateString() !== new Date(m.created_at).toLocaleDateString();

                  return (
                    <div key={m.id} className="space-y-4">
                      {showDate && (
                        <div className="flex justify-center my-8">
                          <span className="px-4 py-1.5 rounded-full bg-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-widest border border-slate-200/50">
                            {new Date(m.created_at).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                          </span>
                        </div>
                      )}

                      <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}>
                        <div className={`max-w-[80%] space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                          <div className={`p-4 rounded-[2rem] text-sm font-medium shadow-sm transition-all ${isMe
                              ? 'bg-slate-900 text-white rounded-br-lg shadow-slate-900/10'
                              : 'bg-white text-slate-900 border border-slate-100 rounded-bl-lg'
                            }`}>
                            {m.content}
                          </div>
                          <div className="flex items-center gap-2 px-2">
                            <span className="text-[9px] font-bold text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-tighter">
                              {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isMe && m.read_at && (
                              <Check className="text-[#ed5518]" size={10} />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {isPartnerTyping && (
                  <div className="flex items-center gap-3 animate-pulse">
                    <div className="flex gap-1">
                      <div className="h-1 w-1 bg-slate-400 rounded-full animate-bounce"></div>
                      <div className="h-1 w-1 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <div className="h-1 w-1 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                    <span className="text-[10px] font-black text-slate-300 uppercase italic">L'interlocuteur écrit...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 md:p-6 bg-white border-t border-slate-50 sticky bottom-0">
                <form onSubmit={sendMessage} className="relative flex items-center gap-4">
                  <div className="flex-1 relative">
                    <button type="button" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900">
                      <Paperclip size={18} />
                    </button>
                    <input
                      type="text"
                      placeholder="Écrivez votre message..."
                      className="w-full bg-slate-50 border border-transparent rounded-[2rem] pl-12 pr-12 py-4 text-sm font-medium focus:bg-white focus:border-slate-200 transition-all outline-none"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleTyping}
                    />
                    <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900">
                      <Smile size={18} />
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="h-14 w-14 flex items-center justify-center rounded-2xl bg-[#ed5518] text-white shadow-xl shadow-primary/20 hover:bg-[#ed5518] transition-all active:scale-95 disabled:opacity-50"
                  >
                    {sending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center opacity-40">
              <div className="h-24 w-24 rounded-[2.5rem] bg-slate-50 flex items-center justify-center text-5xl mb-6">🛰️</div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest mb-2">Centre de contrôle</h3>
              <p className="max-w-xs text-sm font-medium text-slate-500 leading-relaxed">
                Connectez-vous à une session active pour débuter l'assistance technique.
              </p>
            </div>
          )}
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-10 right-10 z-[200] animate-in fade-in slide-in-from-right-10 duration-500">
          <div className="bg-slate-900 text-white p-6 rounded-[2.5rem] shadow-2xl flex items-center gap-5 border border-white/10 backdrop-blur-xl">
            <div className="h-12 w-12 rounded-2xl bg-[#ed5518] flex items-center justify-center font-black text-xs">
              {toast.senderName?.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <div className="text-[10px] font-black uppercase text-[#ed5518] tracking-widest mb-1">Nouveau message</div>
              <div className="text-xs font-bold text-white/90 truncate max-w-[200px] italic">"{toast.content}"</div>
            </div>
            <button onClick={() => setToast(null)} className="h-8 w-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors">
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}



