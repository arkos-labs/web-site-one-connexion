import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, Plus, Clock, Loader2, AlertTriangle, Check, CheckCheck } from "lucide-react";
import { NewMessageModal } from "@/components/client/NewMessageModal";
import { NewComplaintModal } from "@/components/client/NewComplaintModal";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";
import { getThreads, getThreadMessages, sendMessage, markMessagesAsRead, Thread, Message } from "@/services/messaging";
import { supabase } from "@/lib/supabase";

const Messages = () => {
  const { profile, loading: profileLoading } = useProfile();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");

  const [isNewMessageModalOpen, setIsNewMessageModalOpen] = useState(false);
  const [isNewComplaintModalOpen, setIsNewComplaintModalOpen] = useState(false);

  const [isLoadingThreads, setIsLoadingThreads] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load Threads
  useEffect(() => {
    if (profile?.id) {
      loadThreads();
    } else if (!profileLoading && !profile) {
      setIsLoadingThreads(false);
    }
  }, [profile, profileLoading]);

  // Load Messages when thread selected
  useEffect(() => {
    if (selectedThreadId) {
      loadMessages(selectedThreadId);
    } else {
      setMessages([]);
    }
  }, [selectedThreadId]);

  // Scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Realtime Subscription
  useEffect(() => {
    if (!profile?.id) return;

    const channel = supabase
      .channel('client-messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const newMsg = payload.new as Message;

        // If message belongs to current thread, add it
        if (selectedThreadId && newMsg.thread_id === selectedThreadId) {
          setMessages(prev => [...prev, newMsg]);
          if (newMsg.sender_type === 'admin') {
            markMessagesAsRead(selectedThreadId, 'client');
          }
        }

        // Refresh threads list to update last message / unread count
        loadThreads();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id, selectedThreadId]);

  const loadThreads = async () => {
    try {
      const data = await getThreads(); // Uses auth.uid() implicitly via RLS or we might need to pass profile.id if we change getThreads
      // Actually getThreads in messaging.ts uses RLS for client view if no clientId passed? 
      // Wait, getThreads implementation:
      // if (clientId) query.eq('client_id', clientId)
      // If no clientId, it returns ALL threads? No, RLS restricts it.
      // So calling getThreads() as client returns own threads. Correct.
      setThreads(data);

      // Select first thread if none selected
      if (!selectedThreadId && data.length > 0) {
        setSelectedThreadId(data[0].id);
      }
    } catch (error) {
      console.error("Error loading threads:", error);
      toast.error("Impossible de charger les conversations");
    } finally {
      setIsLoadingThreads(false);
    }
  };

  const loadMessages = async (threadId: string) => {
    setIsLoadingMessages(true);
    try {
      const data = await getThreadMessages(threadId);
      setMessages(data);
      // Mark as read
      await markMessagesAsRead(threadId, 'client');
      // Refresh threads to clear unread badge
      loadThreads();
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedThreadId || !profile?.id) return;

    try {
      setIsSending(true);
      await sendMessage(selectedThreadId, profile.id, newMessage.trim(), 'client');
      setNewMessage("");
      // Message added via realtime or we can add optimistic
      // setMessages(prev => [...prev, optimisticMsg]); 
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Erreur lors de l'envoi du message");
    } finally {
      setIsSending(false);
    }
  };

  const handleThreadCreated = (threadId: string) => {
    loadThreads();
    setSelectedThreadId(threadId);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const selectedThread = threads.find(t => t.id === selectedThreadId);

  if (profileLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-display font-bold text-primary mb-2">
            Messagerie
          </h1>
          <p className="text-muted-foreground">
            Communiquez avec notre équipe support
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsNewComplaintModalOpen(true)} className="text-red-600 border-red-200 hover:bg-red-50">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Réclamation
          </Button>
          <Button variant="cta" onClick={() => setIsNewMessageModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau message
          </Button>
        </div>
      </div>

      {/* Messages Layout */}
      <div className="grid lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Threads List */}
        <Card className="lg:col-span-1 shadow-soft border-0 overflow-hidden flex flex-col">
          <div className="p-4 border-b bg-gray-50">
            <h2 className="font-semibold text-primary">Conversations</h2>
          </div>
          <div className="divide-y overflow-y-auto flex-1">
            {isLoadingThreads ? (
              <div className="p-8 text-center text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
            ) : threads.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">Aucune conversation</div>
            ) : (
              threads.map((thread) => (
                <div
                  key={thread.id}
                  onClick={() => setSelectedThreadId(thread.id)}
                  className={`p-4 cursor-pointer transition-colors hover:bg-muted/50 ${selectedThreadId === thread.id ? "bg-accent/10 border-l-4 border-accent-main" : ""
                    }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 overflow-hidden">
                      {thread.type === 'plainte' ? (
                        <AlertTriangle className="h-4 w-4 text-orange-500 flex-shrink-0" />
                      ) : (
                        <MessageSquare className={`h-4 w-4 flex-shrink-0 ${selectedThreadId === thread.id ? "text-accent-main" : "text-gray-400"}`} />
                      )}
                      <p className="font-semibold text-sm truncate">{thread.subject}</p>
                    </div>
                    {(thread.unread_count || 0) > 0 && (
                      <Badge className="text-[10px] px-1 py-0 h-5 bg-red-600 hover:bg-red-700 text-white border-0 animate-pulse">
                        {thread.unread_count}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate mb-2">
                    {thread.last_message ? (
                      <>
                        {thread.last_message.sender_type === 'client' ? 'Vous: ' : ''}
                        {thread.last_message.content}
                      </>
                    ) : 'Aucun message'}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(thread.updated_at).toLocaleDateString()}
                    </p>
                    {thread.status !== 'open' && (
                      <Badge variant="outline" className="text-[10px]">{thread.status}</Badge>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Messages View */}
        <Card className="lg:col-span-2 shadow-soft border-0 flex flex-col overflow-hidden">
          {selectedThread ? (
            <>
              <div className="p-4 border-b bg-gray-50 flex justify-between items-center flex-shrink-0">
                <div>
                  <h2 className="font-semibold text-primary text-lg flex items-center gap-2">
                    {selectedThread.type === 'plainte' && <AlertTriangle className="h-5 w-5 text-orange-500" />}
                    {selectedThread.subject}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedThread.status === 'open' ? 'Ouvert' : selectedThread.status}
                  </p>
                </div>
              </div>

              <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-slate-50">
                {isLoadingMessages ? (
                  <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender_type === 'client' ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl p-4 shadow-sm ${message.sender_type === 'admin'
                          ? "bg-white text-gray-800 rounded-tl-none border border-gray-100"
                          : "bg-gradient-hero text-white rounded-tr-none"
                          }`}
                      >
                        <p className="text-sm font-bold mb-1 opacity-90">
                          {message.sender_type === 'admin' ? "Support One Connexion" : "Vous"}
                        </p>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                        <div className={`flex items-center justify-end gap-1 mt-1 ${message.sender_type === 'admin' ? "text-gray-400" : "text-blue-100"}`}>
                          <p className="text-[10px]">
                            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          {message.sender_type === 'client' && (
                            message.is_read ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t bg-white flex-shrink-0">
                <div className="flex gap-3">
                  <Textarea
                    placeholder="Écrivez votre message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="min-h-[50px] max-h-[150px] resize-none border-gray-200 focus:border-accent-main focus:ring-accent-main"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button
                    variant="cta"
                    size="icon"
                    className="flex-shrink-0 h-auto w-12 rounded-xl"
                    onClick={handleSendMessage}
                    disabled={isSending || !newMessage.trim()}
                  >
                    {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
              <MessageSquare className="h-16 w-16 mb-4 opacity-20" />
              <p className="text-lg font-medium">Sélectionnez une conversation</p>
              <p className="text-sm">ou commencez-en une nouvelle</p>
            </div>
          )}
        </Card>
      </div>

      <NewMessageModal
        isOpen={isNewMessageModalOpen}
        onClose={() => setIsNewMessageModalOpen(false)}
        onMessageSent={handleThreadCreated}
      />

      <NewComplaintModal
        isOpen={isNewComplaintModalOpen}
        onClose={() => setIsNewComplaintModalOpen(false)}
        onComplaintSent={handleThreadCreated}
      />
    </div >
  );
};

export default Messages;
