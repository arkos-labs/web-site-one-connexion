import { StateCreator } from "zustand";
import Decimal from "decimal.js";
import { Order } from "../../types";
import { AppStore, OrderSlice } from "../types";
import { supabase } from "@/lib/supabase";

/**
 * OrderSlice - Manages orders, earnings, and order lifecycle
 * 
 * CRITICAL SECURITY:
 * - This slice is NEVER persisted to avoid "ghost orders" after app restart
 * - Prices are stored in cents (integers) to avoid floating-point errors
 * - All price calculations use Decimal.js for precision
 */
let assignmentSubscription: any = null;

export const createOrderSlice: StateCreator<
    AppStore,
    [],
    [],
    OrderSlice
> = (set, get) => ({
    // Order state (NEVER persisted)
    orders: [],
    currentOrder: null,
    history: [],
    earningsInCents: 0,
    lastCompletedOrder: null,

    // Actions
    acceptOrder: (orderId) => set((state) => {
        const order = state.orders.find(o => o.id === orderId);
        if (!order) return state;

        return {
            currentOrder: { ...order, status: "accepted" as const },
            orders: state.orders.filter(o => o.id !== orderId),
            driverStatus: "busy" as const,
        };
    }),

    updateOrderStatus: (status) => set((state) => {
        if (!state.currentOrder) return state;
        return { currentOrder: { ...state.currentOrder, status } };
    }),

    completeOrder: () => set((state) => {
        if (!state.currentOrder) return state;

        const completedOrder: Order = {
            ...state.currentOrder,
            status: 'completed',
            completedAt: new Date().toISOString()
        };

        // RULE: Driver earns 40% of the total order price.
        const totalOrderPrice = new Decimal(state.currentOrder.price);
        const driverShare = totalOrderPrice.times(0.40);

        const priceInCents = driverShare
            .times(100)
            .toDecimalPlaces(0)
            .toNumber();

        const newEarningsInCents = new Decimal(state.earningsInCents)
            .plus(priceInCents)
            .toNumber();

        return {
            earningsInCents: newEarningsInCents,
            history: [completedOrder, ...state.history],
            currentOrder: null,
            driverStatus: "online" as const,
            lastCompletedOrder: completedOrder
        };
    }),

    clearSummary: () => set({ lastCompletedOrder: null }),

    rejectOrder: (orderId) => set((state) => ({
        orders: state.orders.filter(o => o.id !== orderId)
    })),

    triggerNewOrder: (mockOrder?: Order) => set((state) => {
        if (mockOrder) return { orders: [...state.orders, mockOrder] };

        // Mock fallback
        const id = Math.random().toString(36).substring(2, 11);
        const newOrder: Order = {
            id,
            clientName: "Client Test",
            pickupLocation: { lat: 48.85, lng: 2.35, address: "Paris Centre" },
            dropoffLocation: { lat: 48.86, lng: 2.36, address: "Paris Nord" },
            price: 25.50,
            distance: "3.5 km",
            status: "pending",
            reference: "TEST-01"
        };
        return { orders: [...state.orders, newOrder] };
    }),

    subscribeToAssignments: (driverUserId: string) => {
        if (assignmentSubscription) return;

        console.log(`📡 [OrderSlice] Subscribing to assignments for Driver Auth ID: ${driverUserId}`);
        assignmentSubscription = supabase
            .channel('driver-assignments-v2')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'orders',
                    filter: `driver_id=eq.${driverUserId}` // ✅ FIX: Utiliser Auth ID (user_id)
                },
                (payload) => {
                    const newOrderRow = payload.new as any;
                    const oldOrderRow = payload.old as any;

                    console.log(`🔔 [OrderSlice] Order UPDATE received:`, {
                        orderId: newOrderRow.id,
                        reference: newOrderRow.reference,
                        oldStatus: oldOrderRow?.status,
                        newStatus: newOrderRow.status,
                        driverId: newOrderRow.driver_id
                    });

                    // Déclencher uniquement si la commande vient d'être assignée
                    if (newOrderRow.status === 'assigned' && oldOrderRow?.status !== 'assigned') {
                        // ✅ FIX: Mapper les vraies coordonnées GPS depuis la DB
                        const mappedOrder: Order = {
                            id: newOrderRow.id,
                            clientName: newOrderRow.client_name || "Nouveau Client",
                            pickupLocation: {
                                // Utiliser pickup_location si c'est un objet JSON, sinon pickup_lat/lng
                                lat: newOrderRow.pickup_location?.latitude || newOrderRow.pickup_lat || 48.8566,
                                lng: newOrderRow.pickup_location?.longitude || newOrderRow.pickup_lng || 2.3522,
                                address: newOrderRow.pickup_address
                            },
                            dropoffLocation: {
                                // Utiliser delivery_location si c'est un objet JSON, sinon delivery_lat/lng
                                lat: newOrderRow.delivery_location?.latitude || newOrderRow.delivery_lat || 48.8600,
                                lng: newOrderRow.delivery_location?.longitude || newOrderRow.delivery_lng || 2.3600,
                                address: newOrderRow.delivery_address
                            },
                            price: newOrderRow.price, // ✅ Prix TOTAL client (100%)
                            distance: newOrderRow.distance_km ? `${newOrderRow.distance_km} km` : "0 km",
                            status: "pending", // Statut local pour affichage dans NewOrderModal
                            reference: newOrderRow.reference
                        };

                        console.log(`✅ [OrderSlice] New order mapped and triggered:`, mappedOrder);
                        get().triggerNewOrder(mappedOrder);
                    }
                }
            )
            .subscribe((status: string) => {
                console.log(`📡 [OrderSlice] Realtime subscription status:`, status);
                if (status === 'SUBSCRIBED') {
                    console.log(`✅ [OrderSlice] Successfully subscribed to driver assignments`);
                }
            });
    },

    unsubscribeFromAssignments: () => {
        if (assignmentSubscription) {
            supabase.removeChannel(assignmentSubscription);
            assignmentSubscription = null;
        }
    },

    getEarnings: () => {
        const state = get();
        return new Decimal(state.earningsInCents)
            .dividedBy(100)
            .toDecimalPlaces(2)
            .toNumber();
    },
});
