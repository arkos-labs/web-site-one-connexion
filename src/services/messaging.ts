import { supabase } from '@/lib/supabase';

export interface Thread {
    id: string;
    client_id?: string; // Optional for contact form and driver chat
    driver_id?: string; // NEW: For driver support
    subject: string;
    type: 'general' | 'plainte' | 'contact' | 'driver_support'; // Added 'driver_support'
    status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'new' | 'read' | 'replied' | 'archived';
    created_at: string;
    updated_at: string;
    unread_count?: number; // Calculated field
    last_message?: Message; // Calculated field
    client?: {
        company_name: string;
        email: string;
    };
    driver?: {
        first_name: string;
        last_name: string;
        email: string;
        phone: string;
    };
    source?: 'app' | 'contact_form'; // To distinguish source
    phone?: string; // For contact form
}

export interface Message {
    id: string;
    thread_id: string;
    client_id?: string;
    driver_id?: string; // NEW
    sender_type: 'client' | 'admin' | 'driver'; // Added 'driver'
    content: string;
    is_read: boolean;
    created_at: string;
}

export interface Plainte {
    id: string;
    client_id: string;
    thread_id: string;
    sujet: string;
    description: string;
    statut: string;
    created_at: string;
}

// ==================== THREADS ====================

export const getThreads = async (clientId?: string) => {
    // 1. Fetch threads without inner joining client immediately to avoid filtering NULLs
    let query = supabase
        .from('threads')
        .select(`
            *,
            messages (
                id,
                content,
                created_at,
                sender_type,
                is_read
            )
        `)
        .order('updated_at', { ascending: false });

    if (clientId) {
        query = query.eq('client_id', clientId);
    }

    const { data: threadsData, error: threadsError } = await query;

    let formattedThreads: Thread[] = [];

    if (threadsError) {
        console.error("Error fetching threads:", threadsError);
    } else if (threadsData) {
        // Collect IDs
        const driverIds = Array.from(new Set(threadsData.filter((t: any) => t.driver_id).map((t: any) => t.driver_id)));
        const clientIds = Array.from(new Set(threadsData.filter((t: any) => t.client_id).map((t: any) => t.client_id)));

        // Fetch Drivers
        let driversMap: Record<string, any> = {};
        if (driverIds.length > 0) {
            const { data: drivers } = await supabase
                .from('drivers')
                .select('user_id, first_name, last_name, email, phone')
                .in('user_id', driverIds);

            drivers?.forEach(d => {
                driversMap[d.user_id] = d;
            });
        }

        // Fetch Clients
        let clientsMap: Record<string, any> = {};
        if (clientIds.length > 0) {
            const { data: clients } = await supabase
                .from('clients')
                .select('id, company_name, email')
                .in('id', clientIds);

            clients?.forEach(c => {
                clientsMap[c.id] = c;
            });
        }

        formattedThreads = threadsData.map((thread: any) => {
            const sortedMessages = (thread.messages || []).sort((a: any, b: any) =>
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );
            const lastMessage = sortedMessages[sortedMessages.length - 1];

            const unreadCount = sortedMessages.filter((m: any) =>
                !m.is_read &&
                m.sender_type !== 'admin'
            ).length;

            return {
                ...thread,
                last_message: lastMessage,
                messages: sortedMessages,
                unread_count: unreadCount,
                source: 'app',
                driver: thread.driver_id ? driversMap[thread.driver_id] : undefined,
                client: thread.client_id ? clientsMap[thread.client_id] : undefined
            };
        });
    }

    // 2. Fetch contact messages (ONLY if we are Admin - i.e. no clientId provided)
    let contactThreads: Thread[] = [];
    if (!clientId) {
        const { data: contactData, error: contactError } = await supabase
            .from('contact_messages')
            .select('*')
            .order('created_at', { ascending: false });

        if (!contactError && contactData) {
            contactThreads = contactData.map((msg: any) => ({
                id: msg.id,
                client_id: undefined,
                subject: msg.subject,
                type: 'contact',
                status: msg.status,
                created_at: msg.created_at,
                updated_at: msg.created_at,
                source: 'contact_form',
                unread_count: msg.status === 'new' ? 1 : 0,
                phone: msg.phone,
                client: {
                    company_name: msg.name, // Use name as company name
                    email: msg.email
                },
                last_message: {
                    id: msg.id,
                    thread_id: msg.id,
                    sender_type: 'client',
                    content: msg.message,
                    is_read: msg.status !== 'new',
                    created_at: msg.created_at
                }
            }));
        }
    }

    // 3. Merge and sort
    const allThreads = [...formattedThreads, ...contactThreads].sort((a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );

    return allThreads;
};

export const getThreadMessages = async (threadId: string) => {
    // Check if it's a contact message (we can check by UUID or try fetching)
    // Optimization: We could pass the type to this function, but to keep signature same:

    // Try fetching from messages table first
    const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });

    if (!messagesError && messagesData && messagesData.length > 0) {
        return messagesData as Message[];
    }

    // If no messages found, check if it's a contact message
    const { data: contactData, error: contactError } = await supabase
        .from('contact_messages')
        .select('*')
        .eq('id', threadId)
        .single();

    if (contactData) {
        // Return as a single message
        return [{
            id: contactData.id,
            thread_id: contactData.id,
            sender_type: 'client',
            content: contactData.message,
            is_read: contactData.status !== 'new',
            created_at: contactData.created_at
        }] as Message[];
    }

    return [];
};

// ==================== ACTIONS ====================

export const createThread = async (
    clientId: string,
    subject: string,
    type: 'general' | 'plainte',
    initialMessage: string,
    senderType: 'client' | 'admin'
) => {
    // 1. Create Thread
    const { data: thread, error: threadError } = await supabase
        .from('threads')
        .insert({
            client_id: clientId,
            subject,
            type,
            status: 'open'
        })
        .select()
        .single();

    if (threadError) throw threadError;

    // 2. Create Initial Message
    const { error: messageError } = await supabase
        .from('messages')
        .insert({
            thread_id: thread.id,
            client_id: clientId,
            sender_type: senderType,
            content: initialMessage,
            is_read: false
        });

    if (messageError) throw messageError;

    return thread;
};

export const sendMessage = async (
    threadId: string,
    clientId: string | undefined | null,
    content: string,
    senderType: 'client' | 'admin' | 'driver',
    driverId?: string // Optional driverId for driver chats
) => {
    const payload: any = {
        thread_id: threadId,
        sender_type: senderType,
        content,
        is_read: false
    };

    if (clientId) payload.client_id = clientId;
    if (driverId) payload.driver_id = driverId;

    const { data, error } = await supabase
        .from('messages')
        .insert(payload)
        .select()
        .single();

    if (error) throw error;

    // Update thread updated_at
    await supabase.from('threads').update({ updated_at: new Date().toISOString() }).eq('id', threadId);

    return data;
};

export const markMessagesAsRead = async (threadId: string, userType: 'client' | 'admin' | 'driver') => {
    // If user is client, mark messages FROM admin as read.
    // If user is driver, mark messages FROM admin as read.
    // If user is admin, mark messages FROM (client OR driver) as read.

    let senderToMark = 'admin'; // Default if user is client/driver

    if (userType === 'admin') {
        // We want to mark everything NOT from admin as read
        const { error } = await supabase
            .from('messages')
            .update({ is_read: true })
            .eq('thread_id', threadId)
            .neq('sender_type', 'admin') // Read everything incoming
            .eq('is_read', false);

        if (error) throw error;
        return;
    }

    // Standard case for client/driver reading admin messages
    const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('thread_id', threadId)
        .eq('sender_type', 'admin')
        .eq('is_read', false);

    if (error) throw error;
};

// ==================== PLAINTES ====================

export const createComplaint = async (
    clientId: string,
    subject: string,
    description: string
) => {
    // 1. Create Thread
    const { data: thread, error: threadError } = await supabase
        .from('threads')
        .insert({
            client_id: clientId,
            subject: subject,
            type: 'plainte',
            status: 'open'
        })
        .select()
        .single();

    if (threadError) throw threadError;

    // 2. Create Complaint Record
    const { error: plainteError } = await supabase
        .from('plaintes')
        .insert({
            client_id: clientId,
            thread_id: thread.id,
            sujet: subject,
            description: description,
            statut: 'ouvert'
        });

    if (plainteError) throw plainteError;

    // 3. Create Initial Message (Description)
    const { error: messageError } = await supabase
        .from('messages')
        .insert({
            thread_id: thread.id,
            client_id: clientId,
            sender_type: 'client',
            content: description,
            is_read: false
        });

    if (messageError) throw messageError;

    return thread;
};

export const updateComplaintStatus = async (threadId: string, status: string) => {
    // Update thread status
    const { error: threadError } = await supabase
        .from('threads')
        .update({ status })
        .eq('id', threadId);

    if (threadError) throw threadError;

    // Update plainte status
    const { error: plainteError } = await supabase
        .from('plaintes')
        .update({ statut: status })
        .eq('thread_id', threadId);

    if (plainteError) throw plainteError;
};

export const markContactMessageAsRead = async (id: string) => {
    const { error } = await supabase
        .from('contact_messages')
        .update({ status: 'read' })
        .eq('id', id)
        .eq('status', 'new');

    if (error) throw error;
};

export const createDriverThread = async (
    driverId: string,
    subject: string,
    initialMessage: string,
    senderType: 'admin'
) => {
    // 1. Create Thread
    const { data: thread, error: threadError } = await supabase
        .from('threads')
        .insert({
            driver_id: driverId,
            subject,
            type: 'driver_support',
            status: 'open'
        })
        .select()
        .single();

    if (threadError) throw threadError;

    // 2. Create Initial Message
    const { error: messageError } = await supabase
        .from('messages')
        .insert({
            thread_id: thread.id,
            driver_id: driverId,
            sender_type: senderType,
            content: initialMessage,
            is_read: false
        });

    if (messageError) throw messageError;

    return thread;
};
