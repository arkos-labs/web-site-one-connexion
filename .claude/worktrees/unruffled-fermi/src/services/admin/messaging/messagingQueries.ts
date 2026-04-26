import { supabase } from '@/lib/supabase';
import { MessageData } from '../types';

export const getClientMessages = async (clientId: string): Promise<MessageData[]> => {
    const { data, error } = await supabase
        .from('messages')
        .select('*, threads(subject)')
        .eq('client_id', clientId)
        .order('created_at', { ascending: true });

    if (error) throw error;

    return data.map((m: any) => ({
        id: m.id,
        client_id: m.client_id,
        sender_type: m.sender_type,
        subject: m.threads?.subject,
        message: m.content,
        is_read: m.is_read,
        created_at: m.created_at,
        thread_id: m.thread_id
    }));
};

export const sendMessageToClient = async (clientId: string, message: string, subject?: string) => {
    let threadId: string;

    const { data: threads } = await supabase
        .from('threads')
        .select('id')
        .eq('client_id', clientId)
        .eq('type', 'general')
        .eq('status', 'open')
        .order('updated_at', { ascending: false })
        .limit(1);

    if (threads && threads.length > 0) {
        threadId = threads[0].id;
    } else {
        const { data: newThread, error: threadError } = await supabase
            .from('threads')
            .insert({
                client_id: clientId,
                subject: subject || 'Message du support',
                type: 'general',
                status: 'open'
            })
            .select()
            .single();

        if (threadError) throw threadError;
        threadId = newThread.id;
    }

    const { error } = await supabase
        .from('messages')
        .insert({
            thread_id: threadId,
            client_id: clientId,
            sender_type: 'admin',
            content: message,
            is_read: false
        });

    if (error) throw error;
};

export const subscribeToMessages = (callback: (payload: any) => void) => {
    return supabase
        .channel('admin-messages')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, callback)
        .subscribe();
};

export const markAllClientMessagesAsRead = async (clientId: string) => {
    const { error } = await supabase
        .from('messages')
        .update({
            is_read: true,
            read_at: new Date().toISOString()
        })
        .eq('client_id', clientId)
        .eq('is_read', false);

    if (error) throw error;
};

export const getUnreadMessagesCount = async (): Promise<number> => {
    const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false)
        .eq('sender_type', 'client');

    if (error) throw error;
    return count || 0;
};

export const markMessageAsRead = async (messageId: string) => {
    const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId);

    if (error) throw error;
};
