import { Formule, TarifZone } from "./types";

export const GRILLE_TARIFAIRE: Record<Formule, Record<string, TarifZone>> = {
    STANDARD: {
        'PARIS_PARIS': { forfait: 14.90, prixKm: 1.20 },
        'PARIS_PETITE_COURONNE': { forfait: 18.90, prixKm: 1.35 },
        'PARIS_GRANDE_COURONNE': { forfait: 28.90, prixKm: 1.50 },
        'PETITE_COURONNE_PETITE_COURONNE': { forfait: 16.90, prixKm: 1.25 },
        'PETITE_COURONNE_PARIS': { forfait: 18.90, prixKm: 1.35 },
        'PETITE_COURONNE_GRANDE_COURONNE': { forfait: 24.90, prixKm: 1.40 },
        'GRANDE_COURONNE_GRANDE_COURONNE': { forfait: 22.90, prixKm: 1.30 },
        'GRANDE_COURONNE_PARIS': { forfait: 28.90, prixKm: 1.50 },
        'GRANDE_COURONNE_PETITE_COURONNE': { forfait: 24.90, prixKm: 1.40 }
    },
    EXPRESS: {
        'PARIS_PARIS': { forfait: 22.90, prixKm: 1.80 },
        'PARIS_PETITE_COURONNE': { forfait: 29.90, prixKm: 2.00 },
        'PARIS_GRANDE_COURONNE': { forfait: 44.90, prixKm: 2.20 },
        'PETITE_COURONNE_PETITE_COURONNE': { forfait: 26.90, prixKm: 1.90 },
        'PETITE_COURONNE_PARIS': { forfait: 29.90, prixKm: 2.00 },
        'PETITE_COURONNE_GRANDE_COURONNE': { forfait: 38.90, prixKm: 2.10 },
        'GRANDE_COURONNE_GRANDE_COURONNE': { forfait: 34.90, prixKm: 1.95 },
        'GRANDE_COURONNE_PARIS': { forfait: 44.90, prixKm: 2.20 },
        'GRANDE_COURONNE_PETITE_COURONNE': { forfait: 38.90, prixKm: 2.10 }
    },
    FLASH_EXPRESS: {
        'PARIS_PARIS': { forfait: 34.90, prixKm: 2.80 },
        'PARIS_PETITE_COURONNE': { forfait: 46.90, prixKm: 3.10 },
        'PARIS_GRANDE_COURONNE': { forfait: 69.90, prixKm: 3.40 },
        'PETITE_COURONNE_PETITE_COURONNE': { forfait: 41.90, prixKm: 2.95 },
        'PETITE_COURONNE_PARIS': { forfait: 46.90, prixKm: 3.10 },
        'PETITE_COURONNE_GRANDE_COURONNE': { forfait: 59.90, prixKm: 3.25 },
        'GRANDE_COURONNE_GRANDE_COURONNE': { forfait: 54.90, prixKm: 3.00 },
        'GRANDE_COURONNE_PARIS': { forfait: 69.90, prixKm: 3.40 },
        'GRANDE_COURONNE_PETITE_COURONNE': { forfait: 59.90, prixKm: 3.25 }
    }
};

export const CARACTERISTIQUES_FORMULES: Record<Formule, {
    delai: string;
    assurance: number;
    caracteristiques: string[];
}> = {
    STANDARD: { delai: '2-3 heures', assurance: 100, caracteristiques: ['Suivi temps réel', 'Assurance incluse jusqu\'à 100€', 'Notification SMS + Email', 'Support client standard'] },
    EXPRESS: { delai: '1-2 heures', assurance: 300, caracteristiques: ['Suivi temps réel + Géolocalisation chauffeur', 'Assurance incluse jusqu\'à 300€', 'Notification SMS + Email + Push', 'Priorité haute', 'Support client renforcé'] },
    FLASH_EXPRESS: { delai: '30-60 minutes', assurance: 1000, caracteristiques: ['Suivi temps réel + Géolocalisation + Contact direct chauffeur', 'Assurance incluse jusqu\'à 1000€', 'Notification SMS + Email + Push + Appel téléphonique', 'Priorité maximale', 'Chauffeur dédié et expérimenté', 'Support client 24/7 ligne directe'] }
};

export const SUPPLEMENTS_DISPONIBLES = {
    COLIS_FRAGILE: { code: 'FRAGILE', libelle: 'Colis fragile', montantHT: 5.00 },
    COLIS_VOLUMINEUX: { code: 'VOLUMINEUX', libelle: 'Colis volumineux (>50cm)', montantHT: 8.00 },
    COLIS_LOURD: { code: 'LOURD', libelle: 'Colis lourd (>20kg)', montantHT: 10.00 },
    ATTENTE_SUR_PLACE: { code: 'ATTENTE', libelle: 'Attente sur place (par heure)', montantHT: 15.00 },
    LIVRAISON_ETAGE: { code: 'ETAGE', libelle: 'Livraison étage sans ascenseur (par étage)', montantHT: 3.00 },
    LIVRAISON_NUIT: { code: 'NUIT', libelle: 'Livraison nuit (22h-6h)', montantHT: 0, pourcentage: 30 },
    WEEKEND_FERIE: { code: 'WEEKEND', libelle: 'Weekend / Jour férié', montantHT: 0, pourcentage: 20 },
    RETOUR_PREUVE: { code: 'RETOUR', libelle: 'Retour avec preuve', montantHT: 8.00 },
    MULTI_POINTS: { code: 'MULTI', libelle: 'Multi-points (par arrêt supplémentaire)', montantHT: 5.00 }
};

export const TVA = 0.20;
export const SEUIL_FORFAIT_KM = 10;
