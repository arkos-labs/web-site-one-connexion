const fs = require('fs');

// Read Input
const inputContent = fs.readFileSync(__dirname + '/tarifs_input.txt', 'utf8');
const inputLines = inputContent.split('\n').filter(l => l.trim() && !l.startsWith('Prix') && !l.startsWith('Villes') && !l.startsWith('Page') && !l.startsWith('Tél') && !l.startsWith('Tarifs'));

// Generate Data
const items = inputLines.map(line => {
  // Regex pour capturer: Ville (texte), CP (code), suivi de 6 paires de (Bons, Prix)
  // Exemple: Alfortville 94140 6 30,00 10 50,00 14 70,00 11 55,00 16 80,00 21 105,00
  // On doit gérer les villes avec espaces, tirets, apostrophes
  const match = line.match(/^(.+?)\s+(\d{5})\s+(\d+)\s+[\d,]+\s+(\d+)\s+[\d,]+\s+(\d+)\s+[\d,]+\s+(\d+)\s+[\d,]+\s+(\d+)\s+[\d,]+\s+(\d+)\s+[\d,]+/);

  if (!match) return null;

  const [_, ville, cp, motoNormal, motoExclu, motoSuper, voitureNormal, voitureExclu, voitureSuper] = match;

  return `  {
    "cp": "${cp.trim()}",
    "ville": "${ville.trim()}",
    "formules": {
      "NORMAL": ${parseInt(motoNormal)},
      "EXPRESS": ${parseInt(motoExclu)},
      "URGENCE": ${parseInt(motoSuper)},
      "VL_NORMAL": ${parseInt(voitureNormal)},
      "VL_EXPRESS": ${parseInt(voitureExclu)}
    }
  }`;
}).filter(x => x);

const generatedArray = `export const TARIFS_BONS: TarifVille[] = [\n${items.join(',\n')}\n];`;

// Read Original File
const originalPath = __dirname + '/data/tarifs_idf.ts';
const originalContent = fs.readFileSync(originalPath, 'utf8');

// Find Split Points
// Header ends before TARIFS_BONS definition
const headerMatch = originalContent.match(/([\s\S]*?)export const TARIFS_BONS/);
if (!headerMatch) {
  console.error("Could not find header split point");
  process.exit(1);
}
const header = headerMatch[1];

// Footer starts at INDEX_TARIFS
const footerMatch = originalContent.match(/(export const INDEX_TARIFS[\s\S]*)/);
if (!footerMatch) {
  console.error("Could not find footer split point");
  process.exit(1);
}
const footer = footerMatch[1]; // Includes the start marker

// Combine
const newContent = header + generatedArray + "\n\n// ===================================================================\n// INDEX DE RECHERCHE RAPIDE\n// ===================================================================\n\n" + footer;

fs.writeFileSync(originalPath, newContent, 'utf8');
console.log("Updated tarifs_idf.ts successfully with " + items.length + " cities.");
