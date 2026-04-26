import os

base = r"C:\Users\CHERK\OneDrive\Desktop\livraison-react\src\pages"
public_pages = [
    "Landing.jsx",
    "About.jsx",
    "Contact.jsx",
    "Privacy.jsx",
    "CoursierB2BParis.jsx",
    "CoursierIDF.jsx",
    "MessagerieExpressIDF.jsx",
    "NavetteReguliereIDF.jsx",
    "DevisCoursierParis.jsx",
    "TarifsCoursierParis.jsx",
    "CoursierOpticienParis.jsx",
    "CoursierDentisteParis.jsx",
    "CoursierJuridiqueParis.jsx",
    "CoursierEvenementielParis.jsx",
    "CoursierAutomobileParis.jsx",
]

for fname in public_pages:
    path = os.path.join(base, fname)
    if not os.path.exists(path):
        continue
    with open(path, encoding="utf-8") as f:
        txt = f.read()
    if "PublicFooter" not in txt:
        # add import
        if "PublicHeader" in txt:
            txt = txt.replace('import PublicHeader from "../components/PublicHeader.jsx";\n', 'import PublicHeader from "../components/PublicHeader.jsx";\nimport PublicFooter from "../components/PublicFooter.jsx";\n')
        else:
            txt = 'import PublicFooter from "../components/PublicFooter.jsx";\n' + txt
        # add component before closing main or before closing div
        if "</main>" in txt and "<PublicFooter" not in txt:
            txt = txt.replace("</main>", "</main>\n      <PublicFooter />")
        elif "</div>" in txt and "<PublicFooter" not in txt:
            txt = txt.replace("</div>\n  );", "    <PublicFooter />\n    </div>\n  );")
    with open(path, "w", encoding="utf-8") as f:
        f.write(txt)

print("done")
