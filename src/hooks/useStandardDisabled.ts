import { useState, useEffect } from 'react';

/**
 * Hook personnalisé pour gérer la logique de grisement de la formule Standard
 * 
 * La formule Standard est désactivée dans les cas suivants :
 * 1. Prise en charge "Dès que possible" (immediate)
 * 2. Créneau choisi avec un délai < 60 minutes
 * 
 * @param orderType - Type de commande : 'immediate' | 'deferred'
 * @param pickupDate - Date de prise en charge (format YYYY-MM-DD)
 * @param pickupTime - Heure de prise en charge (format HH:mm)
 * @returns boolean - true si Standard doit être grisé, false sinon
 */
export const useStandardDisabled = (
    orderType: 'immediate' | 'deferred',
    pickupDate?: string,
    pickupTime?: string
): boolean => {
    const [isStandardDisabled, setIsStandardDisabled] = useState(false);

    useEffect(() => {
        if (orderType === 'immediate') {
            // Condition A: "Dès que possible" sélectionné → griser Standard
            setIsStandardDisabled(true);
        } else if (orderType === 'deferred') {
            // Condition B: Vérifier le délai du créneau choisi
            if (pickupDate && pickupTime) {
                const now = new Date();
                const selectedDateTime = new Date(`${pickupDate}T${pickupTime}`);
                const delayInMinutes = (selectedDateTime.getTime() - now.getTime()) / (1000 * 60);

                // Si le délai est strictement inférieur à 60 minutes → griser Standard
                setIsStandardDisabled(delayInMinutes < 60);
            } else {
                // Si pas de date/heure sélectionnée, ne pas griser
                setIsStandardDisabled(false);
            }
        } else {
            // Pour tout autre cas, ne pas griser
            setIsStandardDisabled(false);
        }
    }, [orderType, pickupDate, pickupTime]);

    return isStandardDisabled;
};

/**
 * Hook personnalisé pour gérer la logique de grisement de la formule Standard
 * Version alternative pour les formulaires utilisant le format 'asap' | 'slot'
 * 
 * @param schedule - Type de planification : 'asap' | 'slot'
 * @param scheduleTime - Date/heure au format datetime-local (YYYY-MM-DDTHH:mm)
 * @returns boolean - true si Standard doit être grisé, false sinon
 */
export const useStandardDisabledAlt = (
    schedule: 'asap' | 'slot',
    scheduleTime?: string
): boolean => {
    const [isStandardDisabled, setIsStandardDisabled] = useState(false);

    useEffect(() => {
        if (schedule === 'asap') {
            // Condition A: "Dès que possible" sélectionné → griser Standard
            setIsStandardDisabled(true);
        } else if (schedule === 'slot') {
            // Condition B: Vérifier le délai du créneau choisi
            if (scheduleTime) {
                const now = new Date();
                const selectedDateTime = new Date(scheduleTime);
                const delayInMinutes = (selectedDateTime.getTime() - now.getTime()) / (1000 * 60);

                // Si le délai est strictement inférieur à 60 minutes → griser Standard
                setIsStandardDisabled(delayInMinutes < 60);
            } else {
                // Si pas de date/heure sélectionnée, ne pas griser
                setIsStandardDisabled(false);
            }
        } else {
            // Pour tout autre cas, ne pas griser
            setIsStandardDisabled(false);
        }
    }, [schedule, scheduleTime]);

    return isStandardDisabled;
};

/**
 * Fonction utilitaire pour calculer le délai en minutes entre maintenant et une date/heure donnée
 * 
 * @param pickupDate - Date de prise en charge (format YYYY-MM-DD)
 * @param pickupTime - Heure de prise en charge (format HH:mm)
 * @returns number - Délai en minutes (peut être négatif si dans le passé)
 */
export const calculateDelayInMinutes = (pickupDate: string, pickupTime: string): number => {
    const now = new Date();
    const selectedDateTime = new Date(`${pickupDate}T${pickupTime}`);
    return (selectedDateTime.getTime() - now.getTime()) / (1000 * 60);
};

/**
 * Fonction utilitaire pour vérifier si un créneau est trop proche (< 60 minutes)
 * 
 * @param pickupDate - Date de prise en charge (format YYYY-MM-DD)
 * @param pickupTime - Heure de prise en charge (format HH:mm)
 * @returns boolean - true si le créneau est < 60 minutes, false sinon
 */
export const isSlotTooClose = (pickupDate: string, pickupTime: string): boolean => {
    const delayInMinutes = calculateDelayInMinutes(pickupDate, pickupTime);
    return delayInMinutes < 60;
};

/**
 * Constantes pour la logique de grisement
 */
export const STANDARD_DISABLED_CONSTANTS = {
    MIN_DELAY_MINUTES: 60,
    FORMULA_ID_NORMAL: 'NORMAL',
    FORMULA_ID_STANDARD: 'standard',
} as const;
