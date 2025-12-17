/**
 * Configuration des commandes
 * Constantes utilisées pour la gestion des commandes
 */

export const ORDER_CONFIG = {
    /**
     * Délai minimum (en minutes) avant l'heure d'enlèvement prévue
     * pour autoriser le dispatch d'une commande différée.
     * 
     * Exemple : Si une commande est prévue pour 14h00 et que DISPATCH_ADVANCE_TIME_MINUTES = 45,
     * le dispatch sera autorisé à partir de 13h15.
     */
    DISPATCH_ADVANCE_TIME_MINUTES: 45,

    /**
     * Délai minimum (en minutes) pour considérer qu'une commande planifiée
     * est trop proche et doit être traitée comme une commande urgente.
     * 
     * Utilisé pour la logique de grisement de la formule "Standard".
     */
    MINIMUM_SCHEDULE_DELAY_MINUTES: 60,

    /**
     * Intervalle de rafraîchissement (en millisecondes) pour le compte à rebours
     * du déverrouillage du dispatch.
     */
    DISPATCH_COUNTDOWN_REFRESH_INTERVAL: 1000,
} as const;

/**
 * Type helper pour garantir la cohérence des types
 */
export type OrderConfig = typeof ORDER_CONFIG;
