import { Zone, Formule, PricingResult, Supplement } from "./types";
import { GRILLE_TARIFAIRE, CARACTERISTIQUES_FORMULES, SUPPLEMENTS_DISPONIBLES, TVA, SEUIL_FORFAIT_KM } from "./constants";

const arrondir = (n: number) => Math.round(n * 100) / 100;

export function determinerZone(codePostal: string): Zone {
    const cp = parseInt(codePostal.replace(/\s/g, ''));
    if (isNaN(cp)) return 'HORS_ZONE';
    if (cp >= 75001 && cp <= 75020) return 'PARIS';
    if ((cp >= 92000 && cp < 95000)) return 'PETITE_COURONNE';
    if ((cp >= 77000 && cp < 79000) || (cp >= 91000 && cp < 92000) || (cp >= 95000 && cp < 96000)) return 'GRANDE_COURONNE';
    return 'HORS_ZONE';
}

export function calculerPrix(
    codePostalDepart: string,
    codePostalArrivee: string,
    distanceKm: number,
    formule: Formule = 'STANDARD'
): PricingResult {
    const zoneDepart = determinerZone(codePostalDepart);
    const zoneArrivee = determinerZone(codePostalArrivee);
    if (zoneDepart === 'HORS_ZONE' || zoneArrivee === 'HORS_ZONE') {
        throw new Error(`Zone non couverte. Départ: ${codePostalDepart}, Arrivée: ${codePostalArrivee}`);
    }
    const cleZone = `${zoneDepart}_${zoneArrivee}`;
    const tarif = GRILLE_TARIFAIRE[formule][cleZone];
    if (!tarif) throw new Error(`Tarif non trouvé pour ${cleZone} (${formule})`);

    const kmSupp = Math.max(0, distanceKm - SEUIL_FORFAIT_KM);
    const coutKmSupp = kmSupp * tarif.prixKm;
    const prixHT = tarif.forfait + coutKmSupp;
    const caracteristiques = CARACTERISTIQUES_FORMULES[formule];

    return {
        distanceKm: arrondir(distanceKm),
        formule, zoneDepart, zoneArrivee,
        forfait: arrondir(tarif.forfait),
        kmSupplementaires: arrondir(kmSupp),
        coutKmSupplementaires: arrondir(coutKmSupp),
        prixHT: arrondir(prixHT),
        prixTTC: arrondir(prixHT * (1 + TVA)),
        delaiEstime: caracteristiques.delai,
        assuranceIncluse: caracteristiques.assurance,
        caracteristiques: caracteristiques.caracteristiques
    };
}

export function calculerToutesLesFormules(cpD: string, cpA: string, d: number): Record<Formule, PricingResult> {
    return {
        STANDARD: calculerPrix(cpD, cpA, d, 'STANDARD'),
        EXPRESS: calculerPrix(cpD, cpA, d, 'EXPRESS'),
        FLASH_EXPRESS: calculerPrix(cpD, cpA, d, 'FLASH_EXPRESS')
    };
}

export function appliquerSupplements(
    prixBase: PricingResult,
    supplements: string[] = [],
    quantites: Record<string, number> = {}
): PricingResult & { supplements: Supplement[], totalSupplementsHT: number } {
    let totalSuppHT = 0;
    const supplementsAppliques: Supplement[] = [];

    supplements.forEach(code => {
        const supplement = Object.values(SUPPLEMENTS_DISPONIBLES).find(s => s.code === code);
        if (supplement) {
            const quantite = quantites[code] || 1;
            let montant = (supplement as any).pourcentage ? (prixBase.prixHT * (supplement as any).pourcentage) / 100 : supplement.montantHT * quantite;
            totalSuppHT += montant;
            supplementsAppliques.push({ code: supplement.code, libelle: supplement.libelle, montantHT: arrondir(montant), applicable: true });
        }
    });

    const nouveauPrixHT = prixBase.prixHT + totalSuppHT;
    return {
        ...prixBase,
        prixHT: arrondir(nouveauPrixHT),
        prixTTC: arrondir(nouveauPrixHT * (1 + TVA)),
        supplements: supplementsAppliques,
        totalSupplementsHT: arrondir(totalSuppHT)
    };
}
