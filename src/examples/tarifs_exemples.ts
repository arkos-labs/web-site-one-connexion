/**
 * EXEMPLES D'UTILISATION DU MODULE TARIFS_IDF
 * ============================================
 * 
 * Ce fichier contient des exemples pratiques d'utilisation
 * du système de tarification One Connexion.
 */

import tarifs from '@/data/tarifs_idf';

// ===================================================================
// EXEMPLE 1: CALCUL SIMPLE DE PRIX
// ===================================================================

console.log('=== EXEMPLE 1: Calcul simple ===');

// Cas 1: Melun + Express (exemple obligatoire)
try {
  const melun = tarifs.calculerPrix('77000', 'Melun', 'EXPRESS');
  console.log(melun);
  // Affiche:
  // {
  //   cp: '77000',
  //   ville: 'Melun',
  //   formule: 'EXPRESS',
  //   nb_bons: 27,
  //   prix_euros: 148.5,
  //   calcul: '27 × 5,5€ = 148,5€'
  // }
} catch (e) {
  console.error(e.message);
}

// Cas 2: Cachan + Urgence (exemple obligatoire)
try {
  const cachan = tarifs.calculerPrix('94230', 'Cachan', 'URGENCE');
  console.log(cachan);
  // Affiche: 11 bons = 60,5€
} catch (e) {
  console.error(e.message);
}

// ===================================================================
// EXEMPLE 2: VALIDER ET AFFICHER UN PRIX
// ===================================================================

console.log('\n=== EXEMPLE 2: Validation ===');

const cp = '75001';
const ville = 'Paris 1er';

if (tarifs.validerVille(cp, ville)) {
  const prix = tarifs.calculerPrix(cp, ville, 'EXPRESS');
  console.log(`✓ ${ville} (${cp})`);
  console.log(`  Prix: ${prix.calcul}`);
} else {
  console.log(`✗ Ville non trouvée: ${cp} ${ville}`);
}

// ===================================================================
// EXEMPLE 3: AFFICHER TOUS LES TARIFS D'UNE VILLE
// ===================================================================

console.log('\n=== EXEMPLE 3: Tous les tarifs d\'une ville ===');

const allPrices = tarifs.calculerTousLesPrix('77000', 'Melun');

console.log(`Tarifs pour Melun (77000):`);
for (const formule of tarifs.FORMULES) {
  const p = allPrices[formule];
  console.log(
    `  ${p.formule.padEnd(15)} : ${p.calcul}`
  );
}

// Affiche:
// Tarifs pour Melun (77000):
//   NORMAL          : 25 × 5,5€ = 137,5€
//   EXPRESS         : 27 × 5,5€ = 148,5€
//   URGENCE         : 35 × 5,5€ = 192,5€
//   VL_NORMAL       : 18 × 5,5€ = 99€
//   VL_EXPRESS      : 22 × 5,5€ = 121€

// ===================================================================
// EXEMPLE 4: AUTOCOMPLÉTION (RECHERCHE)
// ===================================================================

console.log('\n=== EXEMPLE 4: Autocomplétion ===');

// Chercher des villes commençant par "Paris"
const parisVilles = tarifs.rechercherVilles('Paris', 5);
console.log(`Villes trouvées pour "Paris":`);
parisVilles.forEach(v => {
  console.log(`  ${v.ville} (${v.cp})`);
});

// Chercher des villes par code postal
const villesCP75 = tarifs.rechercherVilles('75', 5);
console.log(`\nVilles trouvées pour CP "75":`);
villesCP75.forEach(v => {
  console.log(`  ${v.ville} (${v.cp})`);
});

// ===================================================================
// EXEMPLE 5: RÉCUPÉRER LES VILLES D'UN CODE POSTAL
// ===================================================================

console.log('\n=== EXEMPLE 5: Toutes les villes d\'un CP ===');

const villesParis = tarifs.getVillesParCP('75');
console.log(`Nombre d'arrondissements de Paris: ${villesParis.length}`);
console.log('Premiers arrondissements:');
villesParis.slice(0, 3).forEach(v => {
  console.log(`  ${v.ville}: ${v.formules.NORMAL} bons (NORMAL)`);
});

// ===================================================================
// EXEMPLE 6: GÉNÉRER UN DEVIS COMPLET
// ===================================================================

console.log('\n=== EXEMPLE 6: Devis complet ===');

const devis = tarifs.genererDevis('77000', 'Melun');
console.log(devis);

// Affiche:
// 📋 DEVIS - Melun (77000)
// ==================================================
//
// Livraison Normale
//   25 × 5,5€ = 137,5€
//
// Express
//   27 × 5,5€ = 148,5€
//
// Livraison d'urgence
//   35 × 5,5€ = 192,5€
//
// Véhicule Léger Normal
//   18 × 5,5€ = 99€
//
// Véhicule Léger Express
//   22 × 5,5€ = 121€

// ===================================================================
// EXEMPLE 7: GESTION D'ERREURS
// ===================================================================

console.log('\n=== EXEMPLE 7: Gestion d\'erreurs ===');

// Cas 1: Ville inexistante
try {
  tarifs.calculerPrix('99999', 'Ville Inexistante', 'EXPRESS');
} catch (e) {
  console.error(`❌ Erreur: ${e.message}`);
  // Affiche: Ville non trouvée: 99999 Ville Inexistante
}

// Cas 2: Formule inexistante
try {
  tarifs.getTarifBons('77000', 'Melun', 'INEXISTANT');
} catch (e) {
  console.error(`❌ Erreur: ${e.message}`);
}

// ===================================================================
// EXEMPLE 8: FORMATAGE POUR L'AFFICHAGE
// ===================================================================

console.log('\n=== EXEMPLE 8: Formatage ===');

const prix1 = tarifs.calculerPrix('77000', 'Melun', 'EXPRESS');
console.log(tarifs.formaterPrix(prix1.prix_euros, prix1.nb_bons));
// Affiche: 27 bons = 148,50€

console.log(tarifs.formaterPrix(price1.prix_euros));
// Affiche: 148,50€

console.log(tarifs.formaterResultat(prix1));
// Affiche: Melun (77000) - Express
//         27 × 5,5€ = 148,5€

// ===================================================================
// EXEMPLE 9: RECHERCHE PAR NOM EXACT
// ===================================================================

console.log('\n=== EXEMPLE 9: Recherche par nom ===');

const tarifParNom = tarifs.getTarifParNom('Versailles');
if (tarifParNom) {
  console.log(`Tarifs pour ${tarifParNom.ville}:`);
  console.log(`  CP: ${tarifParNom.cp}`);
  console.log(`  NORMAL: ${tarifParNom.formules.NORMAL} bons`);
}

// ===================================================================
// EXEMPLE 10: COMPOSANT REACT COMPLET
// ===================================================================

console.log('\n=== EXEMPLE 10: Composant React ===');

// Code TypeScript/React
/*

import React, { useState } from 'react';
import tarifs from '@/data/tarifs_idf';

export function CalculatricePrice() {
  const [cp, setCp] = useState('');
  const [ville, setVille] = useState('');
  const [formule, setFormule] = useState('NORMAL');
  const [resultat, setResultat] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  const handleSearchVille = (text) => {
    setVille(text);
    if (text.length >= 2) {
      setSuggestions(tarifs.rechercherVilles(text, 10));
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectVille = (v) => {
    setCp(v.cp);
    setVille(v.ville);
    setSuggestions([]);
  };

  const handleCalculer = () => {
    try {
      const prix = tarifs.calculerPrix(cp, ville, formule);
      setResultat(prix);
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="calculatrice">
      <h1>Calculatrice de prix</h1>

      <div className="form-group">
        <label>Code Postal</label>
        <input
          type="text"
          value={cp}
          onChange={(e) => setCp(e.target.value)}
          placeholder="Ex: 77000"
        />
      </div>

      <div className="form-group">
        <label>Ville</label>
        <input
          type="text"
          value={ville}
          onChange={(e) => handleSearchVille(e.target.value)}
          placeholder="Ex: Melun"
        />
        {suggestions.length > 0 && (
          <ul className="suggestions">
            {suggestions.map((v) => (
              <li key={`${v.cp}_${v.ville}`}>
                <button onClick={() => handleSelectVille(v)}>
                  {v.ville} ({v.cp})
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="form-group">
        <label>Formule</label>
        <select
          value={formule}
          onChange={(e) => setFormule(e.target.value)}
        >
          {tarifs.FORMULES.map((f) => (
            <option key={f} value={f}>
              {tarifs.NOMS_FORMULES[f]}
            </option>
          ))}
        </select>
      </div>

      <button onClick={handleCalculer}>Calculer le prix</button>

      {resultat && (
        <div className="resultat">
          <h2>{resultat.ville} ({resultat.cp})</h2>
          <p className="formule">{tarifs.NOMS_FORMULES[resultat.formule]}</p>
          <p className="calcul">{resultat.calcul}</p>
          <p className="prix">{resultat.prix_euros}€</p>
        </div>
      )}
    </div>
  );
}

*/

// ===================================================================
// EXEMPLE 11: API BACKEND EXPRESS
// ===================================================================

console.log('\n=== EXEMPLE 11: API Backend ===');

// Code Express.js
/*

import express from 'express';
import tarifs from '@/data/tarifs_idf';

const app = express();
app.use(express.json());

// Endpoint: Calculer un prix
app.post('/api/prix', (req, res) => {
  const { cp, ville, formule = 'NORMAL' } = req.body;

  if (!cp || !ville) {
    return res.status(400).json({
      error: 'CP et ville requis'
    });
  }

  try {
    const resultat = tarifs.calculerPrix(cp, ville, formule);
    res.json(resultat);
  } catch (e) {
    res.status(404).json({
      error: e.message
    });
  }
});

// Endpoint: Chercher des villes
app.get('/api/villes', (req, res) => {
  const { q, limit = 10 } = req.query;

  if (!q || q.length < 2) {
    return res.status(400).json({
      error: 'Query q requis (minimum 2 caractères)'
    });
  }

  const resultats = tarifs.rechercherVilles(q, parseInt(limit));
  res.json(resultats);
});

// Endpoint: Devis
app.get('/api/devis/:cp/:ville', (req, res) => {
  const { cp, ville } = req.params;

  try {
    const devis = tarifs.genererDevis(cp, decodeURIComponent(ville));
    res.send(`<pre>${devis}</pre>`);
  } catch (e) {
    res.status(404).json({
      error: e.message
    });
  }
});

app.listen(3000, () => {
  console.log('API listening on http://localhost:3000');
});

*/

// ===================================================================
// RÉSUMÉ DES FORMULES CLÉS
// ===================================================================

console.log('\n=== RÉSUMÉ ===');
console.log(`
FORMULE DE CALCUL:
  prix_euros = nombre_de_bons × 5,5

FORMULES DISPONIBLES:
  ${tarifs.FORMULES.map(f => `- ${f}: ${tarifs.NOMS_FORMULES[f]}`).join('\n  ')}

NOMBRE DE VILLES: ${tarifs.TARIFS_BONS.length}

STATUT: ✓ Prêt pour production
`);
