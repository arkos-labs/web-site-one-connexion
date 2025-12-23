import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, Search, Loader2, Check, CheckCheck, AlertTriangle, Filter, Globe, Mail } from "lucide-react";
import { toast } from "sonner";
import { getThreads, getThreadMessages, sendMessage, markMessagesAsRead, updateComplaintStatus, createThread, markContactMessageAsRead, Thread, Message } from "@/services/messaging";
import { supabase } from "@/lib/supabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { PlusCircle } from "lucide-react";

const Messaging = () => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [filteredThreads, setFilteredThreads] = useState<Thread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<'all' | 'plainte' | 'general' | 'contact'>('all');

  const [isLoadingThreads, setIsLoadingThreads] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Broadcast State
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [broadcastSubject, setBroadcastSubject] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [allClients, setAllClients] = useState<{ id: string, company_name: string, email: string }[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadThreads();

    // Realtime subscription for Admin (listen to all messages)
    const channel = supabase
      .channel('admin-messages-all')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const newMsg = payload.new as Message;

        if (selectedThreadId && newMsg.thread_id === selectedThreadId) {
          setMessages(prev => [...prev, newMsg]);
          if (newMsg.sender_type === 'client') {
            markMessagesAsRead(selectedThreadId, 'admin');
          }
        }
        loadThreads();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'contact_messages' }, () => {
        loadThreads();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedThreadId]);

  useEffect(() => {
    if (selectedThreadId) {
      loadMessages(selectedThreadId);
    } else {
      setMessages([]);
    }
  }, [selectedThreadId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isBroadcastOpen) {
      fetchClients();
    }
  }, [isBroadcastOpen]);

  const fetchClients = async () => {
    setIsLoadingClients(true);
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, company_name, email')
        .order('company_name');
      if (error) throw error;
      setAllClients(data || []);
    } catch (error) {
      console.error("Error fetching clients:", error);
      toast.error("Erreur lors du chargement des clients");
    } finally {
      setIsLoadingClients(false);
    }
  };

  useEffect(() => {
    let res = threads;
    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      res = res.filter(t =>
        t.subject.toLowerCase().includes(lowerQ) ||
        t.client?.company_name.toLowerCase().includes(lowerQ) ||
        t.client?.email.toLowerCase().includes(lowerQ)
      );
    }
    if (filterType !== 'all') {
      res = res.filter(t => t.type === filterType);
    }
    setFilteredThreads(res);
  }, [threads, searchQuery, filterType]);

  const loadThreads = async () => {
    try {
      const data = await getThreads(); // Admin sees all threads
      setThreads(data);
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
      // Only mark as read if it's a standard message thread
      const thread = threads.find(t => t.id === threadId);
      if (thread) {
        if (thread.source === 'contact_form') {
          // Mark contact message as read if it's new
          if (thread.status === 'new') {
            await markContactMessageAsRead(threadId);
          }
        } else {
          await markMessagesAsRead(threadId, 'admin');
        }
      }

      loadThreads(); // Refresh to update unread counts/order
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedThreadId) return;

    const thread = threads.find(t => t.id === selectedThreadId);
    if (!thread) return;

    // If it's a contact form message, we can't reply via app yet
    if (thread.source === 'contact_form') {
      window.location.href = `mailto:${thread.client?.email}?subject=Re: ${thread.subject}&body=${encodeURIComponent(newMessage)}`;
      return;
    }

    try {
      setIsSending(true);
      await sendMessage(selectedThreadId, thread.client_id!, newMessage.trim(), 'admin');
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Erreur lors de l'envoi du message");
    } finally {
      setIsSending(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    if (!selectedThreadId) return;
    try {
      await updateComplaintStatus(selectedThreadId, status);
      toast.success(`Statut mis à jour : ${status}`);
      loadThreads(); // Refresh to show new status
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Erreur lors de la mise à jour du statut");
    }
  };

  const handleSendBroadcast = async () => {
    if (!broadcastSubject || !broadcastMessage || selectedRecipients.length === 0) {
      toast.error("Veuillez remplir tous les champs et sélectionner au moins un destinataire");
      return;
    }

    setIsSending(true);
    try {
      let successCount = 0;
      let lastError: any = null;
      for (const clientId of selectedRecipients) {
        try {
          await createThread(clientId, broadcastSubject, 'general', broadcastMessage, 'admin');
          successCount++;
        } catch (e) {
          console.error(`Failed to send to ${clientId}`, e);
          lastError = e;
        }
      }

      if (successCount === 0 && selectedRecipients.length > 0) {
        toast.error(`Échec de l'envoi. Détail: ${lastError?.message || lastError?.code || 'Erreur inconnue'}`);
      } else {
        toast.success(`${successCount} messages envoyés avec succès`);
        if (successCount < selectedRecipients.length) {
          toast.warning(`${selectedRecipients.length - successCount} échecs.`);
        }
        setIsBroadcastOpen(false);
        setBroadcastSubject("");
        setBroadcastMessage("");
        setSelectedRecipients([]);
        loadThreads();
      }
    } catch (error) {
      console.error("Error sending broadcast:", error);
      toast.error("Erreur critique lors de l'envoi en masse");
    } finally {
      setIsSending(false);
    }
  };

  const toggleRecipient = (clientId: string) => {
    setSelectedRecipients(prev =>
      prev.includes(clientId)
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const toggleAllRecipients = () => {
    if (selectedRecipients.length === allClients.length) {
      setSelectedRecipients([]);
    } else {
      setSelectedRecipients(allClients.map(c => c.id));
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const selectedThread = threads.find(t => t.id === selectedThreadId);

  return (
    <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-display font-bold text-primary mb-2">
            Messagerie Support
          </h1>
          <p className="text-muted-foreground">
            Gérez les demandes et réclamations clients
          </p>
        </div>
        <Dialog open={isBroadcastOpen} onOpenChange={setIsBroadcastOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Nouveau Message
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Envoyer un message (Diffusion)</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4 overflow-y-auto px-1">
              <div className="grid gap-2">
                <Label htmlFor="subject">Sujet</Label>
                <Input
                  id="subject"
                  value={broadcastSubject}
                  onChange={(e) => setBroadcastSubject(e.target.value)}
                  placeholder="Ex: Mise à jour des tarifs, Promotion..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="Votre message..."
                  rows={5}
                />
              </div>
              <div className="grid gap-2">
                <Label>Destinataires ({selectedRecipients.length})</Label>
                <div className="border rounded-md p-4 max-h-[200px] overflow-y-auto space-y-2">
                  <div className="flex items-center space-x-2 pb-2 border-b mb-2 sticky top-0 bg-background z-10">
                    <Checkbox
                      id="all"
                      checked={selectedRecipients.length === allClients.length && allClients.length > 0}
                      onCheckedChange={toggleAllRecipients}
                    />
                    <label
                      htmlFor="all"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      Tout sélectionner
                    </label>
                  </div>
                  {isLoadingClients ? (
                    <div className="flex justify-center p-4"><Loader2 className="animate-spin h-4 w-4" /></div>
                  ) : (
                    allClients.map(client => (
                      <div key={client.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`client-${client.id}`}
                          checked={selectedRecipients.includes(client.id)}
                          onCheckedChange={() => toggleRecipient(client.id)}
                        />
                        <label
                          htmlFor={`client-${client.id}`}
                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {client.company_name} <span className="text-muted-foreground text-xs">({client.email})</span>
                        </label>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsBroadcastOpen(false)}>Annuler</Button>
              <Button onClick={handleSendBroadcast} disabled={isSending || selectedRecipients.length === 0}>
                {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Envoyer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Messaging Layout */}
      <div className="grid lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Threads List */}
        <Card className="lg:col-span-1 shadow-soft border-0 flex flex-col overflow-hidden">
          <div className="p-4 border-b space-y-3 bg-white">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher un client, un sujet..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={filterType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('all')}
                className="text-xs"
              >
                Tout
              </Button>
              <Button
                variant={filterType === 'general' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('general')}
                className="text-xs"
              >
                Messages
              </Button>
              <Button
                variant={filterType === 'plainte' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('plainte')}
                className="text-xs"
              >
                Plaintes
              </Button>
              <Button
                variant={filterType === 'contact' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('contact')}
                className="text-xs"
              >
                Site Web
              </Button>
            </div>
          </div>
          <div className="divide-y overflow-y-auto flex-1">
            {isLoadingThreads ? (
              <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
            ) : filteredThreads.length === 0 ? (
              <div className="p-4 text-center text-gray-500">Aucune conversation trouvée</div>
            ) : (
              filteredThreads.map((thread) => (
                <div
                  key={thread.id}
                  onClick={() => setSelectedThreadId(thread.id)}
                  className={`p-4 cursor-pointer transition-colors hover:bg-muted/50 ${selectedThreadId === thread.id ? "bg-accent/10 border-l-4 border-primary" : ""
                    }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex flex-col overflow-hidden">
                      <p className="font-semibold text-sm truncate">{thread.client?.company_name || "Client Inconnu"}</p>
                      <p className="text-xs text-muted-foreground truncate">{thread.subject}</p>
                    </div>
                    <div className="flex gap-1">
                      {thread.type === 'plainte' && (
                        <Badge className="text-[10px] px-1 py-0 h-5 bg-orange-500 hover:bg-orange-600 text-white border-0">Plainte</Badge>
                      )}
                      {thread.source === 'contact_form' && (
                        <Badge className="text-[10px] px-1 py-0 h-5 bg-blue-500 hover:bg-blue-600">Site Web</Badge>
                      )}
                      {(thread.unread_count || 0) > 0 && (
                        <Badge className="text-[10px] px-1 py-0 h-5 bg-red-600 hover:bg-red-700 text-white border-0 animate-pulse">
                          {thread.unread_count}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-end mt-2">
                    <p className="text-xs text-muted-foreground truncate max-w-[70%]">
                      {thread.last_message ? (
                        <>
                          {thread.last_message.sender_type === 'admin' ? 'Vous: ' : ''}
                          {thread.last_message.content}
                        </>
                      ) : '...'}
                    </p>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap">
                      {new Date(thread.updated_at).toLocaleDateString()}
                    </span>
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
              <div className="p-4 border-b flex-shrink-0 bg-white z-10 flex justify-between items-start">
                <div>
                  <h2 className="font-semibold text-primary flex items-center gap-2">
                    {selectedThread.client?.company_name}
                    {selectedThread.type === 'plainte' && <AlertTriangle className="h-4 w-4 text-orange-500" />}
                    {selectedThread.source === 'contact_form' && <Globe className="h-4 w-4 text-blue-500" />}
                  </h2>
                  <p className="text-sm font-medium text-gray-700">{selectedThread.subject}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{selectedThread.client?.email}</span>
                    {selectedThread.phone && (
                      <>
                        <span>•</span>
                        <span>{selectedThread.phone}</span>
                      </>
                    )}
                  </div>
                </div>
                {selectedThread.type === 'plainte' && (
                  <div className="flex gap-2">
                    <Button
                      variant={selectedThread.status === 'open' ? 'default' : 'outline'}
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => handleStatusChange('open')}
                    >
                      Ouvert
                    </Button>
                    <Button
                      variant={selectedThread.status === 'in_progress' ? 'default' : 'outline'}
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => handleStatusChange('in_progress')}
                    >
                      En cours
                    </Button>
                    <Button
                      variant={selectedThread.status === 'resolved' ? 'default' : 'outline'}
                      size="sm"
                      className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleStatusChange('resolved')}
                    >
                      Résolu
                    </Button>
                  </div>
                )}
                {selectedThread.source === 'contact_form' && (
                  <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
                    Formulaire Contact
                  </Badge>
                )}
              </div>

              <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-gray-50/50">
                {isLoadingMessages ? (
                  <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <MessageSquare className="h-12 w-12 mb-2 opacity-20" />
                    <p>Aucun message</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender_type === 'admin' ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 shadow-sm ${message.sender_type === 'admin'
                          ? "bg-primary text-white"
                          : "bg-white border border-gray-100 text-gray-800"
                          }`}
                      >
                        <p className="text-xs font-bold mb-1 opacity-80">
                          {message.sender_type === 'admin' ? "Vous" : selectedThread.client?.company_name || "Client"}
                        </p>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <div className={`flex items-center justify-end gap-1 mt-1 ${message.sender_type === 'admin' ? "text-white/70" : "text-gray-400"}`}>
                          <p className="text-[10px]">
                            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          {message.sender_type === 'admin' && (
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
                {selectedThread.source === 'contact_form' ? (
                  <div className="flex flex-col gap-2">
                    <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-800 flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Ce message provient du formulaire de contact public.
                    </div>
                    <Button
                      className="w-full gap-2"
                      variant="outline"
                      onClick={() => window.location.href = `mailto:${selectedThread.client?.email}?subject=Re: ${selectedThread.subject}`}
                    >
                      <Mail className="h-4 w-4" />
                      Répondre par email ({selectedThread.client?.email})
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Répondre au client..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="min-h-[80px] resize-none"
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
                      className="flex-shrink-0 h-[80px] w-[60px]"
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || isSending}
                    >
                      {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    </Button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <MessageSquare className="h-16 w-16 mb-4 opacity-20" />
              <p className="text-lg">Sélectionnez une conversation</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Messaging;
