const fs = require('fs');
const path = require('path');

const inputPath = path.resolve(__dirname, '../tarifs_input.txt');
const inputContent = fs.readFileSync(inputPath, 'utf8');
const inputLines = inputContent.split('\n').filter(l => l.trim() && !l.startsWith('Prix') && !l.startsWith('Villes') && !l.startsWith('Page') && !l.startsWith('Tél') && !l.startsWith('Tarifs'));

const cities = [];

cities.push(`(
    'PARIS', 
    '75000', 
    2, 
    4, 
    7, 
    7, 
    10,
    NOW(),
    NOW()
)`);

inputLines.forEach(line => {
    const match = line.match(/^(.+?)\s+(\d{5})\s+(\d+)\s+[\d,]+\s+(\d+)\s+[\d,]+\s+(\d+)\s+[\d,]+\s+(\d+)\s+[\d,]+\s+(\d+)\s+[\d,]+\s+(\d+)\s+[\d,]+/);

    if (match) {
        const [_, ville, cp, motoNormal, motoExclu, motoSuper, voitureNormal, voitureExclu, voitureSuper] = match;
        const safeVille = ville.trim().replace(/'/g, "''");

        cities.push(`(
    '${safeVille}', 
    '${cp.trim()}', 
    ${motoNormal}, 
    ${motoExclu}, 
    ${motoSuper}, 
    ${voitureNormal}, 
    ${voitureExclu},
    NOW(),
    NOW()
)`);
    }
});

const sql = `
-- REINITIALISATION COMPLETE DE LA TABLE CITY_PRICING
-- Date: ${new Date().toISOString()}

-- 1. Supprimer la table si elle existe (ATTENTION: Données perdues)
DROP TABLE IF EXISTS city_pricing CASCADE;

-- 2. Recréer la table avec la bonne structure et contraintes
CREATE TABLE city_pricing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city_name TEXT NOT NULL,
    zip_code TEXT NOT NULL,
    price_normal INTEGER NOT NULL DEFAULT 0,
    price_express INTEGER NOT NULL DEFAULT 0,
    price_urgence INTEGER NOT NULL DEFAULT 0,
    price_vl_normal INTEGER NOT NULL DEFAULT 0,
    price_vl_express INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Contrainte d'unicité pour éviter les doublons futurs
    CONSTRAINT unique_city_zip UNIQUE (city_name, zip_code)
);

-- 3. Activer RLS (Sécurité)
ALTER TABLE city_pricing ENABLE ROW LEVEL SECURITY;

-- 4. Politique de lecture publique (tout le monde peut lire les prix)
CREATE POLICY "Public Read Access" 
ON city_pricing FOR SELECT 
USING (true);

-- 5. Politique d'écriture (Seul les admins/service_role peuvent écrire)
-- Note: Par défaut, si pas de politique INSERT/UPDATE, personne ne peut écrire sauf service_role.
-- On peut ajouter une politique pour les admins authentifiés si besoin.

-- 6. Réinsérer les données propres (${cities.length} villes)
INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    created_at,
    updated_at
)
VALUES 
${cities.join(',\n')};
`;

fs.writeFileSync(path.resolve(__dirname, '../../SUPABASE_RESET_TABLE.sql'), sql, 'utf8');
console.log(`✅ Fichier SQL généré : SUPABASE_RESET_TABLE.sql`);
