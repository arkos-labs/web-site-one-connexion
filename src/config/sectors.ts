export const SECTORS = [
    "Médical",
    "Juridique",
    "Événementiel",
    "Automobile",
] as const;

export type Sector = (typeof SECTORS)[number];

export const SECTOR_COLORS: Record<string, string> = {
    "Médical": "#10B981", // Emerald 500
    "Juridique": "#3B82F6", // Blue 500
    "Événementiel": "#F59E0B", // Amber 500
    "Automobile": "#6366F1", // Indigo 500
    "Autre": "#9CA3AF", // Gray 400
};
