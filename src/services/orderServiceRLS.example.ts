// ============================================================================
// EXEMPLE DE MIGRATION FRONTEND POUR RLS
// ============================================================================
// Ce fichier montre comment adapter votre code frontend pour fonctionner
// avec les nouvelles politiques RLS sur la table orders.
//
// AUTEUR : Expert Sécurité Supabase
// DATE : 2025-12-19
// ============================================================================

import { supabase } from '@/lib/supabase';

// ============================================================================
// AVANT : Code NON sécurisé (à ne plus utiliser)
// ============================================================================

// ❌ MAUVAIS : Le client_id peut être manipulé côté client
export const createOrderOLD = async (userId: string, orderData: any) => {
    const { data, error } = await supabase
        .from('orders')
        .insert({
            client_id: userId, // ⚠️ Peut être falsifié !
            pickup_address: orderData.pickupAddress,
            delivery_address: orderData.deliveryAddress,
            delivery_type: orderData.deliveryType,
            price: orderData.price,
            status: 'pending'
        })
        .select();

    return { data, error };
};

// ============================================================================
// APRÈS : Code sécurisé avec RLS
// ============================================================================

// ✅ BON : Le client_id est forcé automatiquement par le trigger
export const createOrder = async (orderData: any) => {
    // Ne PAS inclure client_id - il sera défini automatiquement
    const { data, error } = await supabase
        .from('orders')
        .insert({
            // client_id sera automatiquement défini à auth.uid() par le trigger
            pickup_address: orderData.pickupAddress,
            delivery_address: orderData.deliveryAddress,
            delivery_type: orderData.deliveryType,
            price: orderData.price,
            status: 'pending',
            notes: orderData.notes || null,
            pickup_time: orderData.pickupTime || null
        })
        .select();

    if (error) {
        console.error('Erreur lors de la création de la commande:', error);
        return { data: null, error };
    }

    // Vérifier que le client_id a bien été défini
    console.log('Commande créée avec client_id:', data?.[0]?.client_id);

    return { data, error: null };
};

// ============================================================================
// CRÉATION DE COMMANDE PAR UN ADMIN (pour un client spécifique)
// ============================================================================

// ✅ Les admins peuvent spécifier le client_id
export const createOrderAsAdmin = async (clientId: string, orderData: any) => {
    // Vérifier d'abord que l'utilisateur est admin
    const { data: adminData } = await supabase
        .from('admins')
        .select('role')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

    if (!adminData || !['admin', 'super_admin', 'dispatcher'].includes(adminData.role)) {
        return {
            data: null,
            error: { message: 'Vous n\'avez pas les permissions nécessaires' }
        };
    }

    // L'admin peut spécifier le client_id
    const { data, error } = await supabase
        .from('orders')
        .insert({
            client_id: clientId, // OK pour les admins
            pickup_address: orderData.pickupAddress,
            delivery_address: orderData.deliveryAddress,
            delivery_type: orderData.deliveryType,
            price: orderData.price,
            status: 'pending',
            notes: orderData.notes || null,
            pickup_time: orderData.pickupTime || null
        })
        .select();

    return { data, error };
};

// ============================================================================
// LECTURE DES COMMANDES (automatiquement filtrée par RLS)
// ============================================================================

// ✅ RLS filtre automatiquement selon le rôle de l'utilisateur
export const getUserOrders = async (page: number = 1, limit: number = 10) => {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Pas besoin de filtrer par client_id - RLS le fait automatiquement !
    const { data, error, count } = await supabase
        .from('orders')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) {
        console.error('Erreur lors de la récupération des commandes:', error);
        return { data: null, error, count: 0 };
    }

    // Si l'utilisateur est un client, il ne verra que ses commandes
    // Si l'utilisateur est un admin, il verra toutes les commandes
    // Si l'utilisateur est un driver, il verra ses commandes assignées

    return {
        data,
        error: null,
        count: count || 0,
        totalPages: count ? Math.ceil(count / limit) : 0
    };
};

// ============================================================================
// LECTURE D'UNE COMMANDE SPÉCIFIQUE
// ============================================================================

// ✅ RLS vérifie automatiquement les permissions
export const getOrderById = async (orderId: string) => {
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

    if (error) {
        // Si l'utilisateur n'a pas le droit de voir cette commande,
        // RLS retournera une erreur ou null
        console.error('Erreur ou accès refusé:', error);
        return { data: null, error };
    }

    return { data, error: null };
};

// ============================================================================
// ANNULATION D'UNE COMMANDE PAR LE CLIENT
// ============================================================================

// ✅ RLS vérifie que le client est propriétaire de la commande
export const cancelOrder = async (orderId: string, reason: string) => {
    const { data, error } = await supabase
        .from('orders')
        .update({
            status: 'cancelled',
            cancellation_reason: reason,
            cancelled_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select();

    if (error) {
        // RLS empêchera l'annulation si :
        // - L'utilisateur n'est pas le propriétaire
        // - Le statut ne permet pas l'annulation
        console.error('Impossible d\'annuler la commande:', error);
        return { data: null, error };
    }

    return { data, error: null };
};

// ============================================================================
// MISE À JOUR D'UNE COMMANDE PAR UN DRIVER
// ============================================================================

// ✅ RLS vérifie que le driver est assigné à cette commande
export const updateOrderAsDriver = async (
    orderId: string,
    updates: {
        status?: string;
        driver_lat?: number;
        driver_lng?: number;
        pickup_time?: string;
        delivery_time?: string;
    }
) => {
    const { data, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId)
        .select();

    if (error) {
        // RLS empêchera la mise à jour si le driver n'est pas assigné
        console.error('Impossible de mettre à jour la commande:', error);
        return { data: null, error };
    }

    return { data, error: null };
};

// ============================================================================
// MISE À JOUR D'UNE COMMANDE PAR UN ADMIN
// ============================================================================

// ✅ Les admins peuvent tout modifier
export const updateOrderAsAdmin = async (orderId: string, updates: any) => {
    const { data, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId)
        .select();

    if (error) {
        console.error('Erreur lors de la mise à jour:', error);
        return { data: null, error };
    }

    return { data, error: null };
};

// ============================================================================
// SUPPRESSION D'UNE COMMANDE (SUPER ADMIN UNIQUEMENT)
// ============================================================================

// ⚠️ Préférez marquer comme 'cancelled' plutôt que supprimer
export const deleteOrder = async (orderId: string) => {
    // Seuls les super_admins peuvent supprimer
    const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

    if (error) {
        // RLS empêchera la suppression si l'utilisateur n'est pas super_admin
        console.error('Impossible de supprimer la commande:', error);
        return { success: false, error };
    }

    return { success: true, error: null };
};

// ============================================================================
// REALTIME : ÉCOUTER LES MISES À JOUR
// ============================================================================

// ✅ Realtime respecte automatiquement RLS
export const subscribeToOrderUpdates = (
    orderId: string,
    onUpdate: (payload: any) => void
) => {
    const channel = supabase
        .channel(`order-${orderId}`)
        .on(
            'postgres_changes',
            {
                event: 'UPDATE',
                schema: 'public',
                table: 'orders',
                filter: `id=eq.${orderId}`
            },
            (payload) => {
                // L'utilisateur ne recevra cette mise à jour que si RLS l'autorise
                console.log('Mise à jour reçue:', payload);
                onUpdate(payload.new);
            }
        )
        .subscribe();

    return channel;
};

// ✅ Écouter toutes les commandes (filtrées par RLS)
export const subscribeToAllOrders = (onUpdate: (payload: any) => void) => {
    const channel = supabase
        .channel('all-orders')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'orders'
            },
            (payload) => {
                // L'utilisateur ne recevra que les mises à jour des commandes
                // qu'il est autorisé à voir selon RLS
                console.log('Événement reçu:', payload);
                onUpdate(payload);
            }
        )
        .subscribe();

    return channel;
};

// ============================================================================
// EXEMPLE D'UTILISATION DANS UN COMPOSANT REACT
// ============================================================================

/*
import { useState, useEffect } from 'react';
import { createOrder, getUserOrders, subscribeToAllOrders } from './orderService';

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Charger les commandes (filtrées automatiquement par RLS)
    const loadOrders = async () => {
      const { data, error } = await getUserOrders(1, 10);
      if (data) setOrders(data);
      setLoading(false);
    };

    loadOrders();

    // S'abonner aux mises à jour en temps réel (filtrées par RLS)
    const channel = subscribeToAllOrders((payload) => {
      if (payload.eventType === 'INSERT') {
        setOrders(prev => [payload.new, ...prev]);
      } else if (payload.eventType === 'UPDATE') {
        setOrders(prev => 
          prev.map(order => 
            order.id === payload.new.id ? payload.new : order
          )
        );
      } else if (payload.eventType === 'DELETE') {
        setOrders(prev => 
          prev.filter(order => order.id !== payload.old.id)
        );
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleCreateOrder = async (orderData) => {
    // Créer une commande (client_id sera automatiquement défini)
    const { data, error } = await createOrder(orderData);
    
    if (error) {
      alert('Erreur lors de la création de la commande');
      return;
    }

    alert('Commande créée avec succès !');
  };

  return (
    <div>
      <h1>Mes Commandes</h1>
      {loading ? (
        <p>Chargement...</p>
      ) : (
        <ul>
          {orders.map(order => (
            <li key={order.id}>
              {order.pickup_address} → {order.delivery_address}
              <span>Statut: {order.status}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
*/

// ============================================================================
// GESTION DES ERREURS RLS
// ============================================================================

export const handleRLSError = (error: any) => {
    if (error?.code === 'PGRST301') {
        // Aucune ligne retournée (peut être dû à RLS)
        return 'Vous n\'avez pas accès à cette ressource';
    }

    if (error?.code === '42501') {
        // Permission denied
        return 'Permission refusée';
    }

    if (error?.message?.includes('client_id')) {
        return 'Erreur de validation du client';
    }

    return error?.message || 'Une erreur est survenue';
};

// ============================================================================
// TESTS UNITAIRES RECOMMANDÉS
// ============================================================================

/*
describe('Order Service with RLS', () => {
  it('should create order without client_id', async () => {
    const { data, error } = await createOrder({
      pickupAddress: '123 Test St',
      deliveryAddress: '456 Test Ave',
      deliveryType: 'express',
      price: 25.00
    });

    expect(error).toBeNull();
    expect(data[0].client_id).toBeDefined();
    expect(data[0].client_id).toBe(currentUser.id);
  });

  it('should not allow client to create order for another user', async () => {
    // Même si on essaie de spécifier un autre client_id,
    // le trigger le forcera à auth.uid()
    const { data } = await createOrder({
      client_id: 'other-user-id', // Sera ignoré
      pickupAddress: '123 Test St',
      deliveryAddress: '456 Test Ave',
      deliveryType: 'express',
      price: 25.00
    });

    expect(data[0].client_id).toBe(currentUser.id);
    expect(data[0].client_id).not.toBe('other-user-id');
  });

  it('should only return user\'s own orders', async () => {
    const { data } = await getUserOrders();
    
    data.forEach(order => {
      expect(order.client_id).toBe(currentUser.id);
    });
  });

  it('should not allow client to update another user\'s order', async () => {
    const { error } = await cancelOrder('other-user-order-id', 'Test');
    
    expect(error).toBeDefined();
  });
});
*/

// ============================================================================
// NOTES IMPORTANTES
// ============================================================================

/*
1. NE JAMAIS faire confiance aux données côté client
   - RLS protège au niveau base de données
   - Mais validez toujours les entrées utilisateur

2. Toujours gérer les erreurs RLS
   - Un accès refusé peut retourner null ou une erreur
   - Affichez des messages clairs à l'utilisateur

3. Tester avec différents rôles
   - Client : ne voit que ses commandes
   - Driver : voit ses commandes assignées
   - Admin : voit tout

4. Realtime respecte RLS
   - Pas besoin de filtrer manuellement les événements
   - Supabase le fait automatiquement

5. Performance
   - Les index créés optimisent les vérifications RLS
   - Pas d'impact notable sur les performances

6. Service Role
   - NE JAMAIS utiliser la service role key côté client
   - Elle bypass RLS et expose toutes les données
*/

export default {
    createOrder,
    createOrderAsAdmin,
    getUserOrders,
    getOrderById,
    cancelOrder,
    updateOrderAsDriver,
    updateOrderAsAdmin,
    deleteOrder,
    subscribeToOrderUpdates,
    subscribeToAllOrders,
    handleRLSError
};
