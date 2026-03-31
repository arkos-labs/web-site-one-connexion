import { PricingResult, Zone, Formule } from "./types";

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

export function getNomZone(zone: Zone): string {
    const noms: Record<Zone, string> = {
        'PARIS': 'Paris intra-muros',
        'PETITE_COURONNE': 'Petite Couronne (92, 93, 94)',
        'GRANDE_COURONNE': 'Grande Couronne (77, 78, 91, 95)',
        'HORS_ZONE': 'Zone non couverte'
    };
    return noms[zone];
}

export function getNomFormule(formule: Formule): string {
    const noms: Record<Formule, string> = {
        'STANDARD': 'Standard',
        'EXPRESS': 'Express',
        'FLASH_EXPRESS': 'Flash Express'
    };
    return noms[formule];
}
