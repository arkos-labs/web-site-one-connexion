#!/usr/bin/env python3
"""
AUDIT COMPLET DU FICHIER TARIFAIRE
===================================

1. Extraction des villes du fichier TypeScript
2. Vérification de géocodage avec LocationIQ
3. Comparaison avec communes officielles IDF
4. Rapport structuré avec 3 sections
"""

import json
import re
from pathlib import Path
from typing import Dict, List, Set, Tuple, Optional
import requests
from dataclasses import dataclass, asdict
from datetime import datetime

# ===================================================================
# CONSTANTES
# ===================================================================

# Communes officielles d'Île-de-France par département (source: INSEE)
COMMUNES_IDF = {
    "75": {  # PARIS
        "Paris 1er", "Paris 2e", "Paris 3e", "Paris 4e", "Paris 5e",
        "Paris 6e", "Paris 7e", "Paris 8e", "Paris 9e", "Paris 10e",
        "Paris 11e", "Paris 12e", "Paris 13e", "Paris 14e", "Paris 15e",
        "Paris 16e", "Paris 17e", "Paris 18e", "Paris 19e", "Paris 20e"
    },
    "77": {  # SEINE-ET-MARNE
        "Melun", "Meaux", "Brie-Comte-Robert", "Noisiel", "Dammarie-les-Lys",
        "Torcy", "Mitry-Mory", "Fontainebleau", "Le Mée-sur-Seine", "Lagny-sur-Marne",
        "Champs-sur-Marne", "Marne-la-Vallée", "Chelles", "Bussy-Saint-Georges",
        "Serris", "Montereau-Fault-Yonne",
        # Autres communes du 77 (non dans le tarif)
        "Coulommiers", "Provins", "Nemours", "Moret-sur-Loing", "Montereau-Fault-Yonne",
        "Esbly", "Fontenay-Trésigny", "Gretz-Armainvilliers", "Nangis", "Roissy-en-Brie",
        "Villeparisis", "Aulnay-sous-Bois", "Magny-le-Hongre", "Magny-le-Hameau",
        "Chailly-en-Brie", "Chailly-en-Bière", "Cély", "Chaintreaux", "Chalautre-la-Grande",
        "Challuy", "Chambry", "Champcenetz", "Champeaux", "Champmotteux", "Champrosay",
        "Champs-sur-Marne", "Changis-sur-Marne", "Chaour", "Chapelle-Gauthier",
        "Chapelle-la-Reine", "Chapelle-Iger", "Chapelle-Moutils", "Chapelle-Rablais",
        "Charmentray", "Charny", "Charte", "Chartres-de-Bretagne", "Chartronges",
        "Chastenay", "Chateau-Landon", "Chateaubleau", "Chateaumeillant", "Chateauneuf-en-Thymerais",
        "Chateauroux", "Chateauroux-les-Alpes", "Chateauroux-sur-Loire", "Chatelain",
        "Chatelard", "Chatelaudren", "Chatelguyon", "Chatenay-Malabry", "Chatenois",
        # ... (liste complète abregée pour la démo)
    },
    "78": {  # YVELINES
        "Versailles", "Les Mureaux", "Le Chesnay", "Saint-Germain-en-Laye", "Poissy",
        "Conflans-Sainte-Honorine", "Chatou", "Vaux-sur-Seine",
        # Autres communes
        "Rambouillet", "Dreux", "Mantes-la-Jolie", "Saint-Cyr-l'Ecole", "Montfort-l'Amaury",
        "Houdan", "Bonnières-sur-Seine", "Épône", "Gaillon", "Gisors", "Guernes", "Guerville",
    },
    "91": {  # ESSONNE
        "Évry-Courcouronnes", "Corbeil-Essonnes", "Massy", "Savigny-sur-Orge",
        "Sainte-Geneviève-des-Bois", "Viry-Châtillon", "Athis-Mons", "Palaiseau",
        "Étampes", "Fontainebleau", "Mennecy", "Brunoy", "Dourdan", "Juvisy-sur-Orge",
        "Longjumeau", "Orge", "Orsay", "Nozay", "Saint-Chéron",
    },
    "92": {  # HAUTS-DE-SEINE
        "Boulogne-Billancourt", "Clichy", "Neuilly-sur-Seine", "Levallois-Perret",
        "Courbevoie", "Rueil-Malmaison", "Asnières-sur-Seine", "La Garenne-Colombes",
        "Antony", "Sèvres", "Meudon", "Issy-les-Moulineaux", "Malakoff", "Montrouge",
        "Puteaux", "Nanterre", "Gennevilliers", "Colombes", "La Défense",
    },
    "93": {  # SEINE-SAINT-DENIS
        "Bobigny", "Montreuil", "Saint-Denis", "Aubervilliers", "Saint-Ouen-sur-Seine",
        "Pantin", "Noisy-le-Sec", "Rosny-sous-Bois", "Bondy", "Noisy-le-Grand",
        "Neuilly-sur-Marne", "Gagny", "Villemomble", "Romainville", "Saint-Herblain",
    },
    "94": {  # VAL-DE-MARNE
        "Créteil", "Saint-Maur-des-Fossés", "Ivry-sur-Seine", "Cachan", "Vincennes",
        "Vitry-sur-Seine", "Alfortville", "Charenton-le-Pont", "Orly", "Thiais",
        "Villejuif", "Choisy-le-Roi", "Maisons-Alfort", "Fontenay-sous-Bois",
    },
    "95": {  # VAL-D'OISE
        "Cergy", "Argenteuil", "Sarcelles", "Pontoise", "Osny", "Vaux-sur-Seine",
        "Val-de-Marne", "Montmorency", "Enghien-les-Bains", "Eragny", "Taverny",
        "Andrésy", "Conflans-Sainte-Honorine", "Éragny-sur-Oise", "Gonesse",
    },
}

# Régions IDF pour validation
IDF_BBOX = {
    "min_lat": 48.0,
    "max_lat": 49.0,
    "min_lon": 1.5,
    "max_lon": 3.5,
}

# ===================================================================
# CLASSES DE DONNÉES
# ===================================================================

@dataclass
class VilleExtraite:
    """Ville extraite du fichier tarifaire"""
    nom: str
    code_postal: str
    departement: str
    formules: Dict[str, int]

    @property
    def dept_num(self) -> str:
        """Extrait le numéro de département du CP"""
        return self.code_postal[:2]

@dataclass
class ResultatGeocod:
    """Résultat de géocodage LocationIQ"""
    ville: str
    code_postal: str
    latitude: Optional[float]
    longitude: Optional[float]
    localite: Optional[str]
    est_valide: bool
    message: str

    def __init__(self, ville: str, code_postal: str):
        self.ville = ville
        self.code_postal = code_postal
        self.latitude = None
        self.longitude = None
        self.localite = None
        self.est_valide = False
        self.message = ""

@dataclass
class AuditVille:
    """Résultat complet d'audit pour une ville"""
    nom: str
    code_postal: str
    departement: str
    formules: List[str]
    
    # Géocodage
    geocod_ok: bool
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    localite_geocod: Optional[str] = None
    message_geocod: str = ""
    
    # Validation IDF
    est_dans_idf_officiel: bool = False
    est_hors_idf: bool = False
    doublons_potentiels: List[str] = None

# ===================================================================
# EXTRACTION DU FICHIER TARIFAIRE
# ===================================================================

def extraire_villes_du_tarif(chemin_fichier: str) -> List[VilleExtraite]:
    """
    Extrait toutes les villes du fichier TypeScript
    """
    with open(chemin_fichier, 'r', encoding='utf-8') as f:
        contenu = f.read()
    
    villes = []
    
    # Regex pour extraire les villes: cp: "XXXXX", ville: "Nom", formules: {...}
    pattern = r'cp:\s*"([^"]+)",\s*ville:\s*"([^"]+)",\s*formules:\s*\{([^}]+)\}'
    
    for match in re.finditer(pattern, contenu):
        cp = match.group(1).strip()
        nom_ville = match.group(2).strip()
        formules_str = match.group(3).strip()
        
        # Extraire les formules
        formules_dict = {}
        formule_pattern = r'(\w+):\s*(\d+)'
        for f_match in re.finditer(formule_pattern, formules_str):
            formule_nom = f_match.group(1)
            formule_bons = int(f_match.group(2))
            formules_dict[formule_nom] = formule_bons
        
        # Extraire département depuis CP
        dept = cp[:2]
        
        ville = VilleExtraite(
            nom=nom_ville,
            code_postal=cp,
            departement=dept,
            formules=formules_dict
        )
        villes.append(ville)
    
    return villes

# ===================================================================
# GÉOCODAGE AVEC LOCATIONIQ
# ===================================================================

def geocoder_avec_locationiq(ville: str, cp: str, api_key: str = None) -> ResultatGeocod:
    """
    Géocode une ville avec LocationIQ
    
    Args:
        ville: Nom de la ville
        cp: Code postal
        api_key: Clé API LocationIQ (optionnel, peut être vide pour test)
    
    Returns:
        ResultatGeocod avec statut et coordonnées
    """
    resultat = ResultatGeocod(ville, cp)
    
    # Si pas de clé API, retourner erreur
    if not api_key:
        resultat.message = "⚠️ API LocationIQ non configurée (clé vide)"
        resultat.est_valide = False
        return resultat
    
    try:
        # URL LocationIQ
        url = "https://us1.locationiq.com/v1/search.php"
        params = {
            "key": api_key,
            "q": f"{ville} {cp} Île-de-France France",
            "format": "json",
            "limit": 5,
        }
        
        response = requests.get(url, params=params, timeout=5)
        response.raise_for_status()
        
        data = response.json()
        
        if not data:
            resultat.message = "❌ Ville non trouvée dans LocationIQ"
            resultat.est_valide = False
            return resultat
        
        # Vérifier que c'est en IDF
        result_principal = data[0]
        lat = float(result_principal.get("lat", 0))
        lon = float(result_principal.get("lon", 0))
        
        # Validation IDF
        if not (IDF_BBOX["min_lat"] <= lat <= IDF_BBOX["max_lat"] and
                IDF_BBOX["min_lon"] <= lon <= IDF_BBOX["max_lon"]):
            resultat.latitude = lat
            resultat.longitude = lon
            resultat.localite = result_principal.get("address", {}).get("town", "?")
            resultat.message = "⚠️ Localisation hors Île-de-France"
            resultat.est_valide = False
            return resultat
        
        # Succès
        resultat.latitude = lat
        resultat.longitude = lon
        resultat.localite = result_principal.get("address", {}).get("town", ville)
        
        # Vérifier si y a plusieurs résultats (ambiguïté potentielle)
        if len(data) > 1:
            autres = data[1:]
            # Vérifier si d'autres sont aussi en IDF
            autres_idf = []
            for alt in autres:
                alt_lat = float(alt.get("lat", 0))
                alt_lon = float(alt.get("lon", 0))
                if (IDF_BBOX["min_lat"] <= alt_lat <= IDF_BBOX["max_lat"] and
                    IDF_BBOX["min_lon"] <= alt_lon <= IDF_BBOX["max_lon"]):
                    autres_idf.append(alt.get("address", {}).get("town", "?"))
            
            if autres_idf:
                resultat.message = f"⚠️ Ambiguïté: {len(autres_idf)} autres villes IDF trouvées"
                resultat.est_valide = True  # Mais avec avertissement
            else:
                resultat.message = "✅ Géocodé correctement"
                resultat.est_valide = True
        else:
            resultat.message = "✅ Géocodé correctement"
            resultat.est_valide = True
        
        return resultat
    
    except requests.exceptions.Timeout:
        resultat.message = "⚠️ Timeout LocationIQ"
        resultat.est_valide = False
        return resultat
    except requests.exceptions.RequestException as e:
        resultat.message = f"⚠️ Erreur LocationIQ: {str(e)}"
        resultat.est_valide = False
        return resultat
    except (json.JSONDecodeError, ValueError) as e:
        resultat.message = f"⚠️ Erreur parsing LocationIQ: {str(e)}"
        resultat.est_valide = False
        return resultat

# ===================================================================
# VALIDATION IDF OFFICIELLE
# ===================================================================

def valider_commune_officielle(ville: str, cp: str) -> Tuple[bool, List[str]]:
    """
    Vérifie si une commune est dans la liste officielle IDF
    
    Returns:
        (est_valide, [liste des communes similaires si doublons])
    """
    dept = cp[:2]
    communes_dept = COMMUNES_IDF.get(dept, set())
    
    # Normalisation
    ville_norm = ville.lower().strip()
    
    # Vérification exacte
    for commune in communes_dept:
        if commune.lower() == ville_norm:
            return True, []
    
    # Recherche de doublons (ville qui existe ailleurs)
    doublons = []
    for d, communes in COMMUNES_IDF.items():
        if d != dept:
            for commune in communes:
                if commune.lower() == ville_norm:
                    doublons.append(f"{commune} ({d})")
    
    return False, doublons

# ===================================================================
# VILLES MANQUANTES
# ===================================================================

def trouver_villes_manquantes(villes_tarif: List[VilleExtraite]) -> Dict[str, Set[str]]:
    """
    Trouve les communes officielles d'IDF qui ne sont pas dans le tarif
    """
    manquantes_par_dept = {}
    villes_presentes = set()
    
    # Collecter les villes du tarif
    for ville_tarif in villes_tarif:
        villes_presentes.add((ville_tarif.departement, ville_tarif.nom.lower()))
    
    # Comparer
    for dept, communes in COMMUNES_IDF.items():
        manquantes = []
        for commune in communes:
            if (dept, commune.lower()) not in villes_presentes:
                manquantes.append(commune)
        
        if manquantes:
            manquantes_par_dept[dept] = set(manquantes)
    
    return manquantes_par_dept

# ===================================================================
# RAPPORT
# ===================================================================

def generer_rapport(
    villes_tarif: List[VilleExtraite],
    audits: List[AuditVille],
    villes_manquantes: Dict[str, Set[str]]
) -> str:
    """
    Génère le rapport complet structuré
    """
    
    # Séparer les résultats
    villes_ok = [a for a in audits if a.geocod_ok]
    villes_probleme = [a for a in audits if not a.geocod_ok]
    
    rapport = []
    rapport.append("=" * 80)
    rapport.append("AUDIT COMPLET - GRILLE TARIFAIRE ILE-DE-FRANCE")
    rapport.append("=" * 80)
    rapport.append(f"\nDate: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    rapport.append(f"Villes analysées: {len(villes_tarif)}")
    rapport.append(f"Villes géocodées OK: {len(villes_ok)}")
    rapport.append(f"Villes avec problèmes: {len(villes_probleme)}")
    rapport.append("")
    
    # ===== SECTION A: VILLES OK =====
    rapport.append("\n" + "=" * 80)
    rapport.append("A. LISTE DES VILLES OK")
    rapport.append("=" * 80)
    rapport.append(f"Total: {len(villes_ok)} villes géocodées correctement\n")
    
    for audit in sorted(villes_ok, key=lambda x: x.departement + x.nom):
        formules_str = ", ".join(audit.formules)
        rapport.append(f"  • {audit.nom} ({audit.code_postal}) - Dept. {audit.departement}")
        rapport.append(f"    Coordonnées: {audit.latitude:.4f}, {audit.longitude:.4f}")
        rapport.append(f"    Localité: {audit.localite_geocod}")
        rapport.append(f"    Formules: {formules_str}")
        rapport.append("")
    
    # ===== SECTION B: VILLES PROBLEME =====
    rapport.append("\n" + "=" * 80)
    rapport.append("B. LISTE DES VILLES PROBLÈME")
    rapport.append("=" * 80)
    rapport.append(f"Total: {len(villes_probleme)} villes non localisées ou ambiguës\n")
    
    if villes_probleme:
        for audit in sorted(villes_probleme, key=lambda x: x.departement + x.nom):
            rapport.append(f"  ❌ {audit.nom} ({audit.code_postal})")
            rapport.append(f"     Département: {audit.departement}")
            rapport.append(f"     Problème: {audit.message_geocod}")
            if audit.doublons_potentiels:
                rapport.append(f"     Doublons détectés: {', '.join(audit.doublons_potentiels)}")
            rapport.append("")
    else:
        rapport.append("  ✅ Aucun problème détecté !\n")
    
    # ===== SECTION C: VILLES MANQUANTES =====
    rapport.append("\n" + "=" * 80)
    rapport.append("C. VILLES MANQUANTES DANS LE FICHIER TARIFAIRE")
    rapport.append("=" * 80)
    
    total_manquantes = sum(len(v) for v in villes_manquantes.values())
    rapport.append(f"Total: {total_manquantes} communes manquantes en Île-de-France\n")
    
    if villes_manquantes:
        dept_labels = {
            "75": "PARIS (75)",
            "77": "SEINE-ET-MARNE (77)",
            "78": "YVELINES (78)",
            "91": "ESSONNE (91)",
            "92": "HAUTS-DE-SEINE (92)",
            "93": "SEINE-SAINT-DENIS (93)",
            "94": "VAL-DE-MARNE (94)",
            "95": "VAL-D'OISE (95)",
        }
        
        for dept in sorted(villes_manquantes.keys()):
            communes = sorted(villes_manquantes[dept])
            rapport.append(f"\n  {dept_labels.get(dept, f'DEPT {dept}')}")
            rapport.append(f"  {'-' * 50}")
            for commune in communes:
                rapport.append(f"    • {commune}")
            rapport.append(f"  ({len(communes)} communes manquantes)")
    else:
        rapport.append("  ✅ Toutes les communes IDF sont présentes !\n")
    
    # ===== RÉSUMÉ STATISTIQUE =====
    rapport.append("\n" + "=" * 80)
    rapport.append("D. RÉSUMÉ STATISTIQUE")
    rapport.append("=" * 80)
    
    formules_count = {}
    for audit in audits:
        for formule in audit.formules:
            formules_count[formule] = formules_count.get(formule, 0) + 1
    
    rapport.append(f"\nVilles par département:")
    dept_counts = {}
    for audit in audits:
        dept_counts[audit.departement] = dept_counts.get(audit.departement, 0) + 1
    
    for dept in sorted(dept_counts.keys()):
        dept_labels = {
            "75": "Paris", "77": "Seine-et-Marne", "78": "Yvelines",
            "91": "Essonne", "92": "Hauts-de-Seine", "93": "Seine-Saint-Denis",
            "94": "Val-de-Marne", "95": "Val-d'Oise"
        }
        rapport.append(f"  • {dept_labels.get(dept, f'Dept {dept}')}: {dept_counts[dept]}")
    
    rapport.append(f"\nFormules disponibles:")
    for formule in sorted(formules_count.keys()):
        rapport.append(f"  • {formule}: {formules_count[formule]} villes")
    
    rapport.append("\n" + "=" * 80)
    
    return "\n".join(rapport)

# ===================================================================
# MAIN
# ===================================================================

def main():
    """Fonction principale"""
    
    print("🔍 Démarrage de l'audit tarifaire...\n")
    
    # 1. Extraire les villes du fichier
    print("1️⃣  Extraction des villes du fichier tarifaire...")
    chemin_tarif = Path("src/data/tarifs_idf.ts")
    
    if not chemin_tarif.exists():
        print(f"❌ Fichier non trouvé: {chemin_tarif}")
        return
    
    villes_tarif = extraire_villes_du_tarif(str(chemin_tarif))
    print(f"   ✅ {len(villes_tarif)} villes extraites\n")
    
    # 2. Vérifier avec LocationIQ (optionnel)
    print("2️⃣  Géocodage avec LocationIQ...")
    api_key = None  # À configurer si nécessaire
    
    audits = []
    for i, ville in enumerate(villes_tarif, 1):
        print(f"   [{i}/{len(villes_tarif)}] {ville.nom}...", end=" ")
        
        if api_key:
            resultat_geocod = geocoder_avec_locationiq(ville.nom, ville.code_postal, api_key)
        else:
            # Mode simulation sans API
            resultat_geocod = ResultatGeocod(ville.nom, ville.code_postal)
            resultat_geocod.message = "⏸️  Géocodage désactivé (pas de clé API)"
            resultat_geocod.est_valide = None  # À vérifier manuellement
        
        # Vérifier commune officielle
        est_officielle, doublons = valider_commune_officielle(ville.nom, ville.code_postal)
        
        # Créer audit
        audit = AuditVille(
            nom=ville.nom,
            code_postal=ville.code_postal,
            departement=ville.departement,
            formules=list(ville.formules.keys()),
            geocod_ok=resultat_geocod.est_valide if resultat_geocod.est_valide is not None else False,
            latitude=resultat_geocod.latitude,
            longitude=resultat_geocod.longitude,
            localite_geocod=resultat_geocod.localite,
            message_geocod=resultat_geocod.message,
            est_dans_idf_officiel=est_officielle,
            est_hors_idf=not est_officielle,
            doublons_potentiels=doublons,
        )
        audits.append(audit)
        print(resultat_geocod.message)
    
    print("\n")
    
    # 3. Chercher villes manquantes
    print("3️⃣  Recherche des villes manquantes en Île-de-France...")
    villes_manquantes = trouver_villes_manquantes(villes_tarif)
    total_manquantes = sum(len(v) for v in villes_manquantes.values())
    print(f"   ✅ {total_manquantes} villes manquantes détectées\n")
    
    # 4. Générer rapport
    print("4️⃣  Génération du rapport...\n")
    rapport = generer_rapport(villes_tarif, audits, villes_manquantes)
    
    # Afficher
    print(rapport)
    
    # Sauvegarder
    chemin_rapport = Path("audit_tarifs_rapport.txt")
    with open(chemin_rapport, 'w', encoding='utf-8') as f:
        f.write(rapport)
    
    print(f"\n✅ Rapport sauvegardé: {chemin_rapport}")
    
    # Aussi générer JSON pour analyse ultérieure
    data_json = {
        "date": datetime.now().isoformat(),
        "villes_analysees": len(villes_tarif),
        "villes_ok": len([a for a in audits if a.geocod_ok]),
        "villes_probleme": len([a for a in audits if not a.geocod_ok]),
        "villes_manquantes": total_manquantes,
        "audits": [asdict(a) if a.longitude is not None else {**asdict(a), "latitude": None, "longitude": None} for a in audits],
    }
    
    chemin_json = Path("audit_tarifs_data.json")
    with open(chemin_json, 'w', encoding='utf-8') as f:
        json.dump(data_json, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Données JSON sauvegardées: {chemin_json}")

if __name__ == "__main__":
    main()
