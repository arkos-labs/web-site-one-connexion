export type Zone = 0 | 1 | 2 | 3 | 4;
export type ServiceLevel = 'navette' | 'standard' | 'urgent' | 'flash';

const PRICING_GRID = {
  navette: [15.00, 25.00, 35.00, 45.00, 65.00],
  standard: [17.50, 35.00, 65.00, 80.00, 91.00],
  urgent: [26.25, 52.50, 97.50, 120.00, 136.50],
  flash: [35.00, 70.00, 130.00, 160.00, 182.00]
};

export function getDepartmentFromAddress(address: string): string | null {
  const match = address.match(/\b([0-9]{2})[0-9]{3}\b/);
  return match ? match[1] : null;
}

export function getZoneFromDepartment(dept: string | null): Zone {
  if (!dept) return 4; // Par défaut, zone la plus chère si introuvable (ou gérer l'erreur)
  if (dept === '75') return 0; // Intra-muros
  if (['92', '93', '94'].includes(dept)) return 1; // Petite Couronne
  if (['77', '78', '91', '95'].includes(dept)) return 2; // Moyenne Couronne (simplification)
  // Par défaut pour le reste de l'IDF
  return 3;
}

export function calculatePrice(pickup: string, dropoff: string, service: ServiceLevel): number {
  const deptPickup = getDepartmentFromAddress(pickup);
  const deptDropoff = getDepartmentFromAddress(dropoff);

  const zonePickup = getZoneFromDepartment(deptPickup);
  const zoneDropoff = getZoneFromDepartment(deptDropoff);

  const maxZone = Math.max(zonePickup, zoneDropoff) as Zone;

  return PRICING_GRID[service][maxZone];
}
