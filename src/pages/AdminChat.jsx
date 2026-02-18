import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabase";
import { Loader2, Send, User as UserIcon, Phone, Video, MoreVertical, Paperclip, Smile, Search, X } from "lucide-react";

export default function AdminChat() {
  const [users, setUsers] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [search, setSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const messagesEndRef = useRef(null);

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

  const [toast, setToast] = useState(null); // { content: string, senderName: string }
  const [typingUsers, setTypingUsers] = useState({}); // { userId: timestamp }
  const typingTimeoutRef = useRef(null);
  const activeUserRef = useRef(null);

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

    console.log("AdminChat: Setting up global listener for admin:", currentUser.id);

    // Global listener to update sidebar and toast for ANY new message
    const globalChannel = supabase
      .channel('admin-chat-global-' + currentUser.id)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, async (payload) => {
        const msg = payload.new;
        console.log("Admin Global: New message detected:", msg);

        // Always update sidebar (user list)
        fetchUsers(currentUser.id);

        // Trigger toast if not from me
        if (msg.sender_id !== currentUser.id) {
          const { data: profile } = await supabase.from('profiles').select('details').eq('id', msg.sender_id).single();
          const senderName = profile?.details?.full_name || "Client";
          triggerToast(msg.content, senderName);
        }

        // IMPORTANT: Directly update the conversation if this is the active user
        const currentActive = activeUserRef.current;
        if (currentActive && (msg.sender_id === currentActive.id || msg.recipient_id === currentActive.id)) {
          console.log("Updating active conversation messages state...");
          setMessages(prev => (prev.some(m => m.id === msg.id) ? prev : [...prev, msg]));

          // Mark as read if it's for me
          if (msg.recipient_id === currentUser.id) {
            markAsRead(currentActive.id);
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(globalChannel);
    };
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser || !activeUser?.id) return;

    const channelId = `chat-${[currentUser.id, activeUser.id].sort().join('-')}`;
    console.log("AdminChat: Joining private conversation channel:", channelId);

    const chatChannel = supabase
      .channel(channelId)
      .on('broadcast', { event: 'new_message' }, (payload) => {
        const msg = payload.payload;
        console.log("AdminChat: Broadcast received for active conversation:", msg);
        setMessages(prev => (prev.some(m => m.id === msg.id) ? prev : [...prev, msg]));
      })
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

    return () => {
      supabase.removeChannel(chatChannel);
      window._currentChatChannel = null;
    };
  }, [currentUser?.id, activeUser?.id]);

  // Handle typing detection
  const handleTyping = () => {
    if (!currentUser) return;
    window._broadcastAdminTyping?.(true);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      window._broadcastAdminTyping?.(false);
    }, 3000);
  };

  const isPartnerTyping = activeUser && typingUsers[activeUser.id] && (Date.now() - typingUsers[activeUser.id] < 4000);

  // Stabilize activeUser identification
  useEffect(() => {
    if (!currentUser || !activeUser?.id) return;

    // Deterministic channel ID for this specific conversation
    const channelId = `chat-${[currentUser.id, activeUser.id].sort().join('-')}`;

    console.log("Subscribing to private channel:", channelId);

    const chatChannel = supabase
      .channel(channelId)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `recipient_id=eq.${currentUser.id}`
      }, (payload) => {
        const msg = payload.new;
        if (msg.sender_id === activeUser.id) {
          setMessages(prev => (prev.some(m => m.id === msg.id) ? prev : [...prev, msg]));
          markAsRead(activeUser.id);
        }
      })
      .on('broadcast', { event: 'new_message' }, (payload) => {
        const msg = payload.payload;
        console.log("Broadcast message received:", msg);
        setMessages(prev => (prev.some(m => m.id === msg.id) ? prev : [...prev, msg]));
      })
      .on('broadcast', { event: 'typing' }, (payload) => {
        const { userId, typing } = payload.payload;
        setTypingUsers(prev => ({
          ...prev,
          [userId]: typing ? Date.now() : 0
        }));
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log("Admin linked to private chat channel");
        }
      });

    // Share broadcaster globally for this effect scope
    window._currentChatChannel = chatChannel;

    fetchMessages(activeUser.id);
    markAsRead(activeUser.id);

    return () => {
      supabase.removeChannel(chatChannel);
      window._currentChatChannel = null;
    };
  }, [activeUser?.id, currentUser?.id]);

  // Global channel just for sidebar updates (any new message anywhere)
  useEffect(() => {
    if (!currentUser) return;
    const globalChannel = supabase
      .channel('admin-global-sidebar-' + currentUser.id)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        fetchUsers(currentUser.id);
      })
      .subscribe();

    return () => { supabase.removeChannel(globalChannel); };
  }, [currentUser?.id]);

  const markAsRead = async (partnerId) => {
    if (!currentUser) return;
    await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('sender_id', partnerId)
      .eq('recipient_id', currentUser.id)
      .is('read_at', null);

    fetchUsers(currentUser?.id); // Refresh list to clear badge
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
          roleColor: p.role === 'courier' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700',
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
    const roleMatch = (u.role || "").toLowerCase().includes(search.toLowerCase());
    const tabMatch = activeTab === "all" || (activeTab === "courier" && u.role === "courier") || (activeTab === "client" && u.role === "client");
    return (nameMatch || roleMatch) && tabMatch;
  });

  const fetchMessages = async (partnerId) => {
    if (!currentUser) return;
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${partnerId},recipient_id.eq.${partnerId}`)
      .order('created_at', { ascending: true });

    // Filtrage manuel pour être sûr de ne pas voir les messages des autres discussions 
    // (même si RLS devrait s'en charger, c'est plus propre)
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
    setNewMessage(""); // Clear early for speed
    setSending(true);

    // Optimistic update
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
      console.error("SendMessage error:", error);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== tempId));
      alert("Erreur d'envoi");
    } else if (data) {
      // Broadcast for zero-latency
      window._currentChatChannel?.send({
        type: 'broadcast',
        event: 'new_message',
        payload: data
      });
      // Replace optimistic with real data to update the ID
      setMessages(prev => prev.map(m => m.id === tempId ? data : m));
    }

    setSending(false);
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-slate-400" /></div>;

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      <header className="mb-6">
        <h1 className="text-4xl font-extrabold text-slate-900">Messagerie Support 💬</h1>
        <p className="mt-2 text-base font-medium text-slate-500">Échangez en  avec vos clients et collaborateurs.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr] flex-1 overflow-hidden">
        {/* Sidebar: Users List */}
        <div className="flex flex-col overflow-hidden border-r border-slate-100 bg-white pr-4">
          <div className="mb-6 flex items-center justify-between px-2">
            <h2 className="text-2xl font-bold text-slate-900">Messages</h2>
            <button
              onClick={() => setShowUserModal(true)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition-colors hover:bg-blue-100"
              title="Nouvelle discussion"
            >
              +
            </button>
          </div>

          <div className="mb-6 px-2 flex justify-between items-center">
            {isSearching || search ? (
              <div className="relative w-full animate-fadeIn">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  autoFocus
                  type="text"
                  placeholder="Rechercher..."
                  className="w-full rounded-2xl border-none bg-slate-50 py-2.5 pl-10 pr-10 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-100"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onBlur={() => !search && setIsSearching(false)}
                />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <X size={14} />
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsSearching(true)}
                className="ml-auto p-2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <Search size={20} />
              </button>
            )}
          </div>

          {/* Role Filter Tabs */}
          <div className="flex gap-1 px-2 mb-4">
            <button
              onClick={() => setActiveTab("all")}
              className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === "all" ? "bg-slate-900 text-white shadow-sm" : "bg-slate-50 text-slate-400 hover:bg-slate-100"}`}
            >
              Tous
            </button>
            <button
              onClick={() => setActiveTab("client")}
              className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === "client" ? "bg-blue-600 text-white shadow-sm" : "bg-slate-50 text-slate-400 hover:bg-slate-100"}`}
            >
              Clients
            </button>
            <button
              onClick={() => setActiveTab("courier")}
              className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === "courier" ? "bg-amber-500 text-white shadow-sm" : "bg-slate-50 text-slate-400 hover:bg-slate-100"}`}
            >
              Livreurs
            </button>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto px-2">
            {filteredUsers.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-400">Aucune conversation</div>
            ) : filteredUsers.map((u) => {
              const isActive = activeUser?.id === u.id;
              const initials = u.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

              return (
                <button
                  key={u.id}
                  onClick={() => setActiveUser(u)}
                  className={`group flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-all ${isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                    : "bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                >
                  <div className="relative shrink-0">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold ${isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                      }`}>
                      {initials}
                    </div>
                    {/* Fake online indicator */}
                    <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500"></div>
                  </div>

                  <div className="flex-1 overflow-hidden">
                    <div className="mb-0.5 flex items-center justify-between">
                      <span className={`truncate text-base font-bold ${isActive ? "text-white" : "text-slate-900"}`}>
                        {u.name}
                      </span>
                      <span className={`text-xs ${isActive ? "text-blue-100" : "text-slate-400"}`}>
                        {u.lastDate.getHours()}:{String(u.lastDate.getMinutes()).padStart(2, '0')}
                      </span>
                    </div>
                    <p className={`truncate text-sm ${isActive ? "text-blue-100" : "text-slate-500"}`}>
                      {u.last}
                    </p>
                  </div>

                  {u.unreadCount > 0 && (
                    <div className={`flex h-5 min-w-[20px] items-center justify-center rounded-full text-[10px] font-bold ${isActive ? "bg-white text-blue-600" : "bg-rose-500 text-white"
                      }`}>
                      {u.unreadCount}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex flex-col overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-slate-200/50">
          {activeUser ? (
            <>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-50 bg-white px-8 py-5">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
                      {activeUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500"></div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-slate-900">{activeUser.name}</div>
                    <div className="text-sm font-medium text-slate-400">En ligne</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-slate-400">
                  <button className="rounded-full p-2 hover:bg-slate-50 hover:text-blue-600"><Phone size={20} /></button>
                  <button className="rounded-full p-2 hover:bg-slate-50 hover:text-blue-600"><Video size={20} /></button>
                  <button className="rounded-full p-2 hover:bg-slate-50 hover:text-slate-600"><MoreVertical size={20} /></button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto bg-white p-8 space-y-6">
                {messages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-slate-400">
                    <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                      <Send className="opacity-20" size={32} />
                    </div>
                    <div className="text-sm">Démarrez la conversation avec {activeUser.name}</div>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isAdmin = (m.is_admin_message ?? (m.sender_id === currentUser?.id)) === true;

                    // Gestion des pseudos/initiales
                    let initials = "??";
                    if (isAdmin) {
                      initials = currentUser?.email ? currentUser.email.substring(0, 2).toUpperCase() : "AD";
                    } else {
                      initials = activeUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                    }

                    return (
                      <div key={m.id} className={`flex items-end gap-3 ${isAdmin ? "flex-row-reverse" : "flex-row"}`}>
                        {/* Avatar Message (Visible des deux côtés maintenant) */}
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold shadow-sm ${isAdmin ? "bg-slate-900 text-white" : "bg-white border border-slate-100 text-slate-600"
                          }`}>
                          {initials}
                        </div>

                        <div className={`flex max-w-[65%] flex-col ${isAdmin ? "items-end" : "items-start"}`}>
                          <div className={`mb-1 text-xs font-semibold uppercase tracking-widest ${isAdmin ? "text-blue-500" : "text-slate-400"}`}>
                            {isAdmin ? "Vous" : activeUser.name}
                          </div>
                          <div className={`px-5 py-3 text-[17px] leading-relaxed shadow-sm ${isAdmin
                            ? "rounded-2xl rounded-br-none bg-blue-600 text-white"
                            : "rounded-2xl rounded-bl-none bg-white border border-slate-100 text-slate-700"
                            }`}>
                            {m.content}
                          </div>
                          <div className={`mt-1.5 text-xs font-medium text-slate-400 ${isAdmin ? "text-right" : "text-left"}`}>
                            {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                {isPartnerTyping && (
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 animate-pulse pb-4">
                    <div className="flex gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-300 animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-300 animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-300 animate-bounce"></span>
                    </div>
                    {activeUser.name} est en train d'écrire...
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-6 pt-2">
                <form onSubmit={sendMessage} className="flex items-center gap-2 rounded-3xl bg-slate-50 p-2 pr-3 border border-slate-100 focus-within:ring-2 focus-within:ring-blue-100/50 transition-all">
                  <div className="flex gap-1 px-2 text-slate-400">
                    <button type="button" className="p-2 hover:text-slate-600 transition-colors"><Paperclip size={20} /></button>
                    <button type="button" className="p-2 hover:text-slate-600 transition-colors"><Smile size={20} /></button>
                  </div>
                  <input
                    className="flex-1 bg-transparent px-2 py-3 text-base font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none"
                    placeholder="Écrivez votre message..."
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleTyping();
                    }}
                  />
                  <button
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    <Send size={18} className="translate-x-0.5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center text-slate-300">
              <div className="mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-slate-50">
                <div className="relative">
                  <div className="absolute -left-4 top-0 h-10 w-10 rounded-full bg-blue-100"></div>
                  <div className="absolute right-0 top-8 h-12 w-12 rounded-full bg-indigo-100"></div>
                  <Send className="relative z-10 text-slate-400" size={48} />
                </div>
              </div>
              <p className="text-lg font-medium text-slate-400">Sélectionnez une conversation</p>
            </div>
          )}
        </div>
      </div>

      {/* User Selection Modal for New Message */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-[2.5rem] bg-white p-6 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">Nouveau message</h3>
              <button onClick={() => setShowUserModal(false)} className="text-slate-400 hover:text-slate-900">✕</button>
            </div>

            <div className="mb-4">
              <input
                type="text"
                placeholder="Chercher un client ou chauffeur..."
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-slate-100"
                autoFocus
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
              {users.filter(u => u.name.toLowerCase().includes(search.toLowerCase())).map(u => (
                <button
                  key={u.id}
                  onClick={() => {
                    setActiveUser(u);
                    setShowUserModal(false);
                    setSearch("");
                  }}
                  className="w-full flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-left hover:bg-slate-100 transition-colors group"
                >
                  <div>
                    <div className="text-sm font-bold text-slate-900">{u.name}</div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{u.role === 'courier' ? 'Chauffeur' : 'Client'}</div>
                  </div>
                  <div className="text-xs font-bold text-slate-300 group-hover:text-slate-900 transition-colors">Discuter →</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Dynamic Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] max-w-sm animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="bg-slate-900 text-white rounded-[1.5rem] p-4 shadow-2xl flex items-center gap-4 border border-white/10 backdrop-blur-xl">
            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 animate-pulse">
              <Send size={18} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-0.5">Nouveau message</div>
              <div className="text-[13px] font-bold text-white truncate">{toast.senderName}</div>
              <div className="text-xs text-slate-300 truncate">{toast.content}</div>
            </div>
            <button onClick={() => setToast(null)} className="text-slate-500 hover:text-white p-1">
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
