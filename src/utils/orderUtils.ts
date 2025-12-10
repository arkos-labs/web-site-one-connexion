/**
 * Utilitaires pour la gestion des commandes
 */

import { ORDER_CONFIG } from '@/constants/orderConfig';

/**
 * Vérifie si une commande est différée (planifiée) ou immédiate (ASAP)
 * 
 * @param scheduledPickupTime - L'heure de prise en charge planifiée (peut être null/undefined)
 * @returns true si la commande est différée, false si elle est immédiate
 */
export function isOrderDeferred(scheduledPickupTime?: string | null): boolean {
    return !!scheduledPickupTime;
}

/**
 * Calcule l'heure à laquelle le dispatch d'une commande différée peut être déverrouillé
 * 
 * @param scheduledPickupTime - L'heure de prise en charge planifiée (ISO string)
 * @param advanceMinutes - Nombre de minutes d'avance (par défaut: 45 minutes)
 * @returns Date représentant l'heure de déverrouillage du dispatch
 * 
 * @example
 * // Pour une commande prévue à 14h00 avec 45 minutes d'avance
 * const unlockTime = calculateDispatchUnlockTime("2025-12-07T14:00:00Z");
 * // Retourne: 2025-12-07T13:15:00Z
 */
export function calculateDispatchUnlockTime(
    scheduledPickupTime: string,
    advanceMinutes: number = ORDER_CONFIG.DISPATCH_ADVANCE_TIME_MINUTES
): Date {
    const pickupTime = new Date(scheduledPickupTime);
    return new Date(pickupTime.getTime() - advanceMinutes * 60000);
}

/**
 * Vérifie si le dispatch d'une commande différée est actuellement verrouillé
 * 
 * @param scheduledPickupTime - L'heure de prise en charge planifiée (ISO string)
 * @param advanceMinutes - Nombre de minutes d'avance (par défaut: 45 minutes)
 * @returns true si le dispatch est verrouillé, false s'il est déverrouillé
 */
export function isDispatchLocked(
    scheduledPickupTime: string,
    advanceMinutes: number = ORDER_CONFIG.DISPATCH_ADVANCE_TIME_MINUTES
): boolean {
    const unlockTime = calculateDispatchUnlockTime(scheduledPickupTime, advanceMinutes);
    return new Date() < unlockTime;
}

/**
 * Calcule le temps restant avant le déverrouillage du dispatch
 * 
 * @param scheduledPickupTime - L'heure de prise en charge planifiée (ISO string)
 * @param advanceMinutes - Nombre de minutes d'avance (par défaut: 45 minutes)
 * @returns Objet contenant les jours, heures, minutes et secondes restants
 */
export function calculateTimeRemaining(
    scheduledPickupTime: string,
    advanceMinutes: number = ORDER_CONFIG.DISPATCH_ADVANCE_TIME_MINUTES
): { days: number; hours: number; minutes: number; seconds: number; totalMs: number } {
    const unlockTime = calculateDispatchUnlockTime(scheduledPickupTime, advanceMinutes);
    const now = new Date();
    const diff = unlockTime.getTime() - now.getTime();

    if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 };
    }

    return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        totalMs: diff,
    };
}

/**
 * Formate le temps restant en chaîne lisible
 * 
 * @param timeRemaining - Objet retourné par calculateTimeRemaining
 * @returns Chaîne formatée (ex: "2h 30m 15s" ou "1j 5h 20m 10s")
 */
export function formatTimeRemaining(timeRemaining: ReturnType<typeof calculateTimeRemaining>): string {
    const { days, hours, minutes, seconds } = timeRemaining;

    if (days > 0) {
        return `${days}j ${hours}h ${minutes}m ${seconds}s`;
    }
    return `${hours}h ${minutes}m ${seconds}s`;
}

/**
 * Vérifie si une commande planifiée est dans moins de X minutes
 * Utilisé pour la logique de grisement de la formule "Standard"
 * 
 * @param scheduledPickupTime - L'heure de prise en charge planifiée (ISO string)
 * @param thresholdMinutes - Seuil en minutes (par défaut: 60 minutes)
 * @returns true si la commande est dans moins de X minutes, false sinon
 */
export function isScheduledWithinMinutes(
    scheduledPickupTime: string,
    thresholdMinutes: number = ORDER_CONFIG.MINIMUM_SCHEDULE_DELAY_MINUTES
): boolean {
    const now = new Date();
    const scheduledTime = new Date(scheduledPickupTime);
    const delayInMinutes = (scheduledTime.getTime() - now.getTime()) / (1000 * 60);
    return delayInMinutes < thresholdMinutes;
}
