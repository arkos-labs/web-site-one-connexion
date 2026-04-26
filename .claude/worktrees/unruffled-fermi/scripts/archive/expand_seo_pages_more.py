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

extra_blocks = {
    "B2B Paris": [
        "<p className=\"mt-3 text-slate-600\">En cœur de ville, chaque minute compte. Nous proposons des créneaux immédiats, un dispatch optimisé et un suivi en temps réel pour les directions logistiques et services administratifs. La preuve de livraison est horodatée et centralisée.</p>",
        "<p className=\"mt-3 text-slate-600\">Nous opérons sur l’ensemble de Paris intra‑muros et adaptons la prise en charge selon la criticité : course urgente, envoi planifié, ou navette récurrente. Vous gardez la maîtrise de vos coûts avec une facturation mensuelle claire.</p>",
    ],
    "Île-de-France": [
        "<p className=\"mt-3 text-slate-600\">La région Île‑de‑France impose des délais variables et des distances plus longues. Nos algorithmes d’itinéraires et notre flotte multi‑véhicules permettent une qualité de service homogène sur toute la zone.</p>",
        "<p className=\"mt-3 text-slate-600\">Nous gérons vos flux inter‑sites (siège → entrepôt → point de vente) et proposons des tournées régulières pour stabiliser les coûts. Les équipes disposent d’un suivi GPS et de notifications d’arrivée.</p>",
    ],
    "Messagerie IDF": [
        "<p className=\"mt-3 text-slate-600\">Notre messagerie express cible les entreprises ayant besoin de fiabilité et d’une traçabilité complète. Les envois sont sécurisés, les livraisons confirmées par POD et les incidents suivis en temps réel.</p>",
        "<p className=\"mt-3 text-slate-600\">Des options de créneaux fixes et de priorisation garantissent la continuité d’activité. Vous bénéficiez d’un interlocuteur dédié pour ajuster le planning.</p>",
    ],
    "Navette IDF": [
        "<p className=\"mt-3 text-slate-600\">Les navettes régulières sont idéales pour les flux quotidiens : courrier, dossiers, échantillons, petites marchandises. Nous planifions des tournées optimisées et un passage à heure fixe.</p>",
        "<p className=\"mt-3 text-slate-600\">Chaque tournée est suivie en temps réel et peut être ajustée en fonction de vos pics d’activité. La facturation est mensuelle et prévisible.</p>",
    ],
    "Devis Paris": [
        "<p className=\"mt-3 text-slate-600\">Le devis intègre la distance réelle, le type de véhicule, le niveau d’urgence et les contraintes de livraison. Vous obtenez un prix clair avant validation.</p>",
        "<p className=\"mt-3 text-slate-600\">Pour les entreprises avec volumes récurrents, nous proposons des forfaits mensuels et des conditions préférentielles.</p>",
    ],
    "Tarifs Paris": [
        "<p className=\"mt-3 text-slate-600\">Nos tarifs sont alignés sur les standards du marché parisien tout en garantissant un niveau de service premium. Les coûts sont transparents et détaillés.</p>",
        "<p className=\"mt-3 text-slate-600\">Les clients réguliers bénéficient d’optimisations via des tournées planifiées et des remises volume.</p>",
    ],
    "Opticiens": [
        "<p className=\"mt-3 text-slate-600\">Pour les opticiens, la rapidité de livraison impacte directement la satisfaction client. Nous assurons des délais courts et une traçabilité complète des montures et verres.</p>",
        "<p className=\"mt-3 text-slate-600\">Livraisons entre boutiques, laboratoires et clients finaux selon vos besoins.</p>",
    ],
    "Dentistes": [
        "<p className=\"mt-3 text-slate-600\">Les cabinets dentaires exigent une précision logistique pour les prothèses et dossiers. Notre messagerie garantit sécurité, confidentialité et ponctualité.</p>",
        "<p className=\"mt-3 text-slate-600\">Nous proposons également des navettes entre laboratoires et cabinets pour sécuriser les délais.</p>",
    ],
    "Juridique": [
        "<p className=\"mt-3 text-slate-600\">Le secteur juridique nécessite des délais stricts et une confidentialité totale. Nous assurons la remise de documents avec preuve et horodatage.</p>",
        "<p className=\"mt-3 text-slate-600\">Service dédié pour cabinets, études notariales et directions juridiques d’entreprise.</p>",
    ],
    "Événementiel": [
        "<p className=\"mt-3 text-slate-600\">En événementiel, le moindre retard peut impacter l’organisation. Nous livrons supports, badges, matériel et urgences de dernière minute.</p>",
        "<p className=\"mt-3 text-slate-600\">Interventions possibles tôt le matin, tard le soir et le week‑end.</p>",
    ],
    "Automobile": [
        "<p className=\"mt-3 text-slate-600\">Pour éviter l’immobilisation de véhicules, nous livrons pièces et documents en urgence entre fournisseurs, garages et concessions.</p>",
        "<p className=\"mt-3 text-slate-600\">Suivi GPS et coordination atelier en temps réel pour une meilleure planification.</p>",
    ],
}

faq = """
        <section className=\"mt-8\">
          <h2 className=\"text-xl font-semibold\">Questions fréquentes</h2>
          <div className=\"mt-3 space-y-3 text-slate-600\">
            <p><strong>Quels délais ?</strong> De l’urgent immédiat aux créneaux planifiés selon vos besoins.</p>
            <p><strong>Preuve de livraison ?</strong> POD numérique horodaté, consultable par votre équipe.</p>
            <p><strong>Facturation ?</strong> Mensuelle et claire, avec récapitulatif détaillé.</p>
          </div>
        </section>
"""

for fname, key in files.items():
    path = os.path.join(base, fname)
    with open(path, encoding="utf-8") as f:
        txt = f.read()
    if "Questions fréquentes" in txt:
        continue
    blocks = "".join(extra_blocks[key])
    section = f"\n        <section className=\"mt-8\">{blocks}\n        </section>\n" + faq
    txt = txt.replace("</main>", section + "      </main>")
    with open(path, "w", encoding="utf-8") as f:
        f.write(txt)

print("done")
