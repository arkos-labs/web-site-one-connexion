import os

base = r"C:\Users\CHERK\OneDrive\Desktop\livraison-react\src\pages"
files = {
    "CoursierB2BParis.jsx": "B2B Paris",
    "CoursierIDF.jsx": "Île-de-France",
    "MessagerieExpressIDF.jsx": "Messagerie IDF",
    "NavetteReguliereIDF.jsx": "Navette IDF",
    "DevisCoursierParis.jsx": "Devis Paris",
    "TarifsCoursierParis.jsx": "Tarifs Paris",
    "CoursierOpticienParis.jsx": "Opticiens",
    "CoursierDentisteParis.jsx": "Dentistes",
    "CoursierJuridiqueParis.jsx": "Juridique",
    "CoursierEvenementielParis.jsx": "Événementiel",
    "CoursierAutomobileParis.jsx": "Automobile",
}

extra = {
    "B2B Paris": [
        "Délais courts, prise en charge rapide et suivi GPS en continu pour vos flux critiques.",
        "POD numérique et facturation mensuelle claire pour simplifier l’administratif.",
        "Flotte adaptée : moto, voiture, utilitaire selon le gabarit et l’urgence.",
    ],
    "Île-de-France": [
        "Couverture Paris + petite/grande couronne avec itinéraires optimisés.",
        "Courses ponctuelles ou navettes régulières entre sites.",
        "Visibilité complète : notifications, suivi, preuve de livraison.",
    ],
    "Messagerie IDF": [
        "Transport express de plis, colis, échantillons et pièces sensibles.",
        "Service B2B conçu pour la réactivité et la traçabilité.",
        "Option de créneaux fixes pour une organisation régulière.",
    ],
    "Navette IDF": [
        "Tournées programmées et créneaux récurrents pour vos flux internes.",
        "Optimisation des coûts avec itinéraires planifiés.",
        "Un interlocuteur dédié pour ajuster le planning.",
    ],
    "Devis Paris": [
        "Devis rapide selon distance, véhicule, urgence et gabarit.",
        "Possibilité de forfaits mensuels pour entreprises régulières.",
        "Engagement de transparence sur les tarifs.",
    ],
    "Tarifs Paris": [
        "Tarification claire basée sur la distance et le niveau d’urgence.",
        "Remises volume et forfaits B2B disponibles.",
        "Comparables aux standards du marché parisien.",
    ],
    "Opticiens": [
        "Acheminement rapide de montures, verres et documents.",
        "Respect des délais pour éviter les retards client.",
        "Suivi GPS et POD à chaque livraison.",
    ],
    "Dentistes": [
        "Transport sécurisé de prothèses et dossiers médicaux.",
        "Livraisons urgentes entre cabinets et laboratoires.",
        "Service discret et traçable.",
    ],
    "Juridique": [
        "Acheminement de pièces sensibles avec confidentialité.",
        "Respect strict des délais de dépôt.",
        "POD pour preuve de remise.",
    ],
    "Événementiel": [
        "Livraison de matériel, badges, stands et supports.",
        "Interventions rapides y compris hors horaires classiques.",
        "Coordination pour éviter les ruptures sur site.",
    ],
    "Automobile": [
        "Livraison de pièces pour éviter l’immobilisation de véhicules.",
        "Courses urgentes entre fournisseurs et garages.",
        "Suivi en temps réel pour coordination atelier.",
    ],
}

section_tpl = """
        <section className=\"mt-10\">
          <h2 className=\"text-xl font-semibold\">Pourquoi choisir One Connexion ?</h2>
          <ul className=\"mt-4 list-disc pl-6 space-y-2\">{bullets}</ul>
          <p className=\"mt-4 text-slate-600\">Contactez-nous pour un devis rapide et une prise en charge immédiate.</p>
        </section>
        <section className=\"mt-8\">
          <h2 className=\"text-xl font-semibold\">Cas d’usage B2B</h2>
          <p className=\"mt-3 text-slate-600\">Nos clients utilisent le service pour la messagerie quotidienne, les urgences et les tournées régulières. Nous adaptons les véhicules et les délais à chaque besoin.</p>
        </section>
"""

for fname, key in files.items():
    path = os.path.join(base, fname)
    with open(path, encoding="utf-8") as f:
        txt = f.read()
    if "Pourquoi choisir One Connexion" in txt:
        continue
    bullets = "".join([f"<li className=\"text-slate-600\">{b}</li>" for b in extra[key]])
    section = section_tpl.format(bullets=bullets)
    txt = txt.replace("</main>", section + "      </main>")
    with open(path, "w", encoding="utf-8") as f:
        f.write(txt)

print("done")
