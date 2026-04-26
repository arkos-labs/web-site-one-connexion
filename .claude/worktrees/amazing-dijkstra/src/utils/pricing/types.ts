export type Zone = 'PARIS' | 'PETITE_COURONNE' | 'GRANDE_COURONNE' | 'HORS_ZONE';
export type Formule = 'STANDARD' | 'EXPRESS' | 'FLASH_EXPRESS';

export interface TarifZone {
    forfait: number;
    prixKm: number;
}

export interface PricingResult {
    distanceKm: number;
    formule: Formule;
    zoneDepart: Zone;
    zoneArrivee: Zone;
    forfait: number;
    kmSupplementaires: number;
    coutKmSupplementaires: number;
    prixHT: number;
    prixTTC: number;
    delaiEstime: string;
    assuranceIncluse: number;
    caracteristiques: string[];
}

export interface Supplement {
    code: string;
    libelle: string;
    montantHT: number;
    applicable: boolean;
}
