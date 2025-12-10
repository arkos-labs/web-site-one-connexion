/**
 * ONE CONNEXION - SYSTÈME DE TARIFICATION DYNAMIQUE
 * 
 * Ce module implémente la grille tarifaire complète pour les 3 formules :
 * - STANDARD : Livraison 2-3h, tarif premium accessible
 * - EXPRESS : Livraison 1-2h, tarif compétitif premium
 * - FLASH_EXPRESS : Livraison 30-60min, tarif haut de gamme
 * 
 * @version 1.0
 * @date 2024-12-02
 */

// ============================================================================
// TYPES ET INTERFACES
// ============================================================================

export type Zone = 'PARIS' | 'PETITE_COURONNE' | 'GRANDE_COURONNE' | 'HORS_ZONE';

export type Formule = 'STANDARD' | 'EXPRESS' | 'FLASH_EXPRESS';

export interface TarifZone {
    forfait: number;  // Forfait 0-10 km en € HT
    prixKm: number;   // Prix au km au-delà de 10 km en € HT
}

export interface PricingResult {
    // Données de base
    distanceKm: number;
    formule: Formule;
    zoneDepart: Zone;
    zoneArrivee: Zone;

    // Détail du calcul
    forfait: number;
    kmSupplementaires: number;
    coutKmSupplementaires: number;

    // Prix finaux
    prixHT: number;
    prixTTC: number;

    // Métadonnées
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

// ============================================================================
// GRILLE TARIFAIRE COMPLÈTE
// ============================================================================

const GRILLE_TARIFAIRE: Record<Formule, Record<string, TarifZone>> = {
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

// ============================================================================
// CARACTÉRISTIQUES DES FORMULES
// ============================================================================

const CARACTERISTIQUES_FORMULES: Record<Formule, {
    delai: string;
    assurance: number;
    caracteristiques: string[];
}> = {
    STANDARD: {
        delai: '2-3 heures',
        assurance: 100,
        caracteristiques: [
            'Suivi temps réel',
            'Assurance incluse jusqu\'à 100€',
            'Notification SMS + Email',
            'Support client standard'
        ]
    },
    EXPRESS: {
        delai: '1-2 heures',
        assurance: 300,
        caracteristiques: [
            'Suivi temps réel + Géolocalisation chauffeur',
            'Assurance incluse jusqu\'à 300€',
            'Notification SMS + Email + Push',
            'Priorité haute',
            'Support client renforcé'
        ]
    },
    FLASH_EXPRESS: {
        delai: '30-60 minutes',
        assurance: 1000,
        caracteristiques: [
            'Suivi temps réel + Géolocalisation + Contact direct chauffeur',
            'Assurance incluse jusqu\'à 1000€',
            'Notification SMS + Email + Push + Appel téléphonique',
            'Priorité maximale',
            'Chauffeur dédié et expérimenté',
            'Support client 24/7 ligne directe'
        ]
    }
};

// ============================================================================
// SUPPLÉMENTS OPTIONNELS
// ============================================================================

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

// ============================================================================
// CONSTANTES
// ============================================================================

const TVA = 0.20; // 20% TVA
const SEUIL_FORFAIT_KM = 10; // Forfait appliqué jusqu'à 10 km

// ============================================================================
// FONCTIONS UTILITAIRES
// ============================================================================

/**
 * Détermine la zone géographique à partir d'un code postal
 * 
 * @param codePostal - Code postal français (5 chiffres)
 * @returns Zone géographique
 */
export function determinerZone(codePostal: string): Zone {
    // Nettoyer le code postal (enlever espaces, etc.)
    const cp = parseInt(codePostal.replace(/\s/g, ''));

    if (isNaN(cp)) {
        return 'HORS_ZONE';
    }

    // Paris (75001 à 75020)
    if (cp >= 75001 && cp <= 75020) {
        return 'PARIS';
    }

    // Petite Couronne (92, 93, 94)
    if ((cp >= 92000 && cp < 93000) ||  // Hauts-de-Seine
        (cp >= 93000 && cp < 94000) ||  // Seine-Saint-Denis
        (cp >= 94000 && cp < 95000)) {  // Val-de-Marne
        return 'PETITE_COURONNE';
    }

    // Grande Couronne (77, 78, 91, 95)
    if ((cp >= 77000 && cp < 78000) ||  // Seine-et-Marne
        (cp >= 78000 && cp < 79000) ||  // Yvelines
        (cp >= 91000 && cp < 92000) ||  // Essonne
        (cp >= 95000 && cp < 96000)) {  // Val-d'Oise
        return 'GRANDE_COURONNE';
    }

    return 'HORS_ZONE';
}

/**
 * Génère la clé de zone pour accéder à la grille tarifaire
 * 
 * @param zoneDepart - Zone de départ
 * @param zoneArrivee - Zone d'arrivée
 * @returns Clé de zone (ex: "PARIS_PETITE_COURONNE")
 */
function genererCleZone(zoneDepart: Zone, zoneArrivee: Zone): string {
    return `${zoneDepart}_${zoneArrivee}`;
}

/**
 * Arrondit un nombre à 2 décimales
 * 
 * @param nombre - Nombre à arrondir
 * @returns Nombre arrondi à 2 décimales
 */
function arrondir(nombre: number): number {
    return Math.round(nombre * 100) / 100;
}

// ============================================================================
// FONCTION PRINCIPALE DE CALCUL
// ============================================================================

/**
 * Calcule le prix d'une course selon la grille tarifaire One Connexion
 * 
 * @param codePostalDepart - Code postal de départ (5 chiffres)
 * @param codePostalArrivee - Code postal d'arrivée (5 chiffres)
 * @param distanceKm - Distance en kilomètres (calculée via OSRM ou Google Maps)
 * @param formule - Formule choisie (STANDARD, EXPRESS, FLASH_EXPRESS)
 * @returns Résultat détaillé du calcul de prix
 * @throws Error si la zone n'est pas couverte ou si le tarif n'existe pas
 */
export function calculerPrix(
    codePostalDepart: string,
    codePostalArrivee: string,
    distanceKm: number,
    formule: Formule = 'STANDARD'
): PricingResult {
    // 1. Déterminer les zones
    const zoneDepart = determinerZone(codePostalDepart);
    const zoneArrivee = determinerZone(codePostalArrivee);

    // 2. Vérifier que les zones sont couvertes
    if (zoneDepart === 'HORS_ZONE' || zoneArrivee === 'HORS_ZONE') {
        throw new Error(
            `Zone non couverte. Départ: ${codePostalDepart} (${zoneDepart}), ` +
            `Arrivée: ${codePostalArrivee} (${zoneArrivee})`
        );
    }

    // 3. Récupérer le tarif correspondant
    const cleZone = genererCleZone(zoneDepart, zoneArrivee);
    const tarif = GRILLE_TARIFAIRE[formule][cleZone];

    if (!tarif) {
        throw new Error(
            `Tarif non trouvé pour la combinaison ${cleZone} en formule ${formule}`
        );
    }

    // 4. Calculer les kilomètres supplémentaires au-delà du forfait
    const kmSupplementaires = Math.max(0, distanceKm - SEUIL_FORFAIT_KM);

    // 5. Calculer le coût des kilomètres supplémentaires
    const coutKmSupplementaires = kmSupplementaires * tarif.prixKm;

    // 6. Calculer le prix HT
    const prixHT = tarif.forfait + coutKmSupplementaires;

    // 7. Calculer le prix TTC
    const prixTTC = prixHT * (1 + TVA);

    // 8. Récupérer les caractéristiques de la formule
    const caracteristiques = CARACTERISTIQUES_FORMULES[formule];

    // 9. Retourner le résultat complet
    return {
        distanceKm: arrondir(distanceKm),
        formule,
        zoneDepart,
        zoneArrivee,
        forfait: arrondir(tarif.forfait),
        kmSupplementaires: arrondir(kmSupplementaires),
        coutKmSupplementaires: arrondir(coutKmSupplementaires),
        prixHT: arrondir(prixHT),
        prixTTC: arrondir(prixTTC),
        delaiEstime: caracteristiques.delai,
        assuranceIncluse: caracteristiques.assurance,
        caracteristiques: caracteristiques.caracteristiques
    };
}

/**
 * Calcule les prix pour les 3 formules en une seule fois
 * Utile pour afficher une comparaison des formules au client
 * 
 * @param codePostalDepart - Code postal de départ
 * @param codePostalArrivee - Code postal d'arrivée
 * @param distanceKm - Distance en kilomètres
 * @returns Objet contenant les 3 résultats de calcul
 */
export function calculerToutesLesFormules(
    codePostalDepart: string,
    codePostalArrivee: string,
    distanceKm: number
): Record<Formule, PricingResult> {
    return {
        STANDARD: calculerPrix(codePostalDepart, codePostalArrivee, distanceKm, 'STANDARD'),
        EXPRESS: calculerPrix(codePostalDepart, codePostalArrivee, distanceKm, 'EXPRESS'),
        FLASH_EXPRESS: calculerPrix(codePostalDepart, codePostalArrivee, distanceKm, 'FLASH_EXPRESS')
    };
}

/**
 * Applique des suppléments au prix de base
 * 
 * @param prixBase - Résultat du calcul de prix de base
 * @param supplements - Liste des codes de suppléments à appliquer
 * @param quantites - Quantités pour chaque supplément (ex: nombre d'étages)
 * @returns Prix final avec suppléments
 */
export function appliquerSupplements(
    prixBase: PricingResult,
    supplements: string[] = [],
    quantites: Record<string, number> = {}
): PricingResult & { supplements: Supplement[], totalSupplementsHT: number } {
    let totalSupplementsHT = 0;
    const supplementsAppliques: Supplement[] = [];

    supplements.forEach(code => {
        const supplement = Object.values(SUPPLEMENTS_DISPONIBLES).find(s => s.code === code);

        if (supplement) {
            const quantite = quantites[code] || 1;
            let montant = 0;

            if ('pourcentage' in supplement && supplement.pourcentage) {
                // Supplément en pourcentage
                montant = (prixBase.prixHT * supplement.pourcentage) / 100;
            } else {
                // Supplément fixe
                montant = supplement.montantHT * quantite;
            }

            totalSupplementsHT += montant;

            supplementsAppliques.push({
                code: supplement.code,
                libelle: supplement.libelle,
                montantHT: arrondir(montant),
                applicable: true
            });
        }
    });

    const nouveauPrixHT = prixBase.prixHT + totalSupplementsHT;
    const nouveauPrixTTC = nouveauPrixHT * (1 + TVA);

    return {
        ...prixBase,
        prixHT: arrondir(nouveauPrixHT),
        prixTTC: arrondir(nouveauPrixTTC),
        supplements: supplementsAppliques,
        totalSupplementsHT: arrondir(totalSupplementsHT)
    };
}

/**
 * Formate un résultat de pricing pour l'affichage
 * 
 * @param result - Résultat du calcul de prix
 * @returns Chaîne formatée pour affichage
 */
export function formaterPrix(result: PricingResult): string {
    return `
╔════════════════════════════════════════════════════════════╗
║  ONE CONNEXION - ${result.formule.replace('_', ' ')}
╠════════════════════════════════════════════════════════════╣
║  Prix TTC : ${result.prixTTC.toFixed(2)}€
║  ────────────────────────────────────────────────────────
║  Délai estimé : ${result.delaiEstime}
║  Assurance incluse : ${result.assuranceIncluse}€
║  
║  Détail du calcul :
║  • Forfait 0-10 km : ${result.forfait.toFixed(2)}€ HT
║  • Distance supplémentaire : ${result.kmSupplementaires.toFixed(2)} km
║  • Coût km supplémentaires : ${result.coutKmSupplementaires.toFixed(2)}€ HT
║  • Total HT : ${result.prixHT.toFixed(2)}€
║  • TVA (20%) : ${(result.prixTTC - result.prixHT).toFixed(2)}€
║  • Total TTC : ${result.prixTTC.toFixed(2)}€
║  
║  Caractéristiques :
${result.caracteristiques.map(c => `║  ✓ ${c}`).join('\n')}
╚════════════════════════════════════════════════════════════╝
  `.trim();
}

// ============================================================================
// FONCTIONS DE VALIDATION
// ============================================================================

/**
 * Vérifie si un code postal est valide et couvert
 * 
 * @param codePostal - Code postal à vérifier
 * @returns true si le code postal est valide et couvert
 */
export function estCodePostalValide(codePostal: string): boolean {
    const zone = determinerZone(codePostal);
    return zone !== 'HORS_ZONE';
}

/**
 * Obtient le nom lisible d'une zone
 * 
 * @param zone - Zone
 * @returns Nom lisible de la zone
 */
export function getNomZone(zone: Zone): string {
    const noms: Record<Zone, string> = {
        'PARIS': 'Paris intra-muros',
        'PETITE_COURONNE': 'Petite Couronne (92, 93, 94)',
        'GRANDE_COURONNE': 'Grande Couronne (77, 78, 91, 95)',
        'HORS_ZONE': 'Zone non couverte'
    };
    return noms[zone];
}

/**
 * Obtient le nom lisible d'une formule
 * 
 * @param formule - Formule
 * @returns Nom lisible de la formule
 */
export function getNomFormule(formule: Formule): string {
    const noms: Record<Formule, string> = {
        'STANDARD': 'Standard',
        'EXPRESS': 'Express',
        'FLASH_EXPRESS': 'Flash Express'
    };
    return noms[formule];
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
    calculerPrix,
    calculerToutesLesFormules,
    appliquerSupplements,
    determinerZone,
    estCodePostalValide,
    getNomZone,
    getNomFormule,
    formaterPrix,
    GRILLE_TARIFAIRE,
    CARACTERISTIQUES_FORMULES,
    SUPPLEMENTS_DISPONIBLES
};
