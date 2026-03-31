import os

base = r"C:\Users\CHERK\OneDrive\Desktop\livraison-react\src\pages"
files = [
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
    "About.jsx",
    "Privacy.jsx",
    "Contact.jsx",
]

for fname in files:
    path = os.path.join(base, fname)
    with open(path, encoding="utf-8") as f:
        txt = f.read()
    txt = txt.replace('className="mx-auto max-w-4xl px-6 py-16"', 'className="blog-page"')
    txt = txt.replace('className="mx-auto max-w-3xl px-6 py-16"', 'className="blog-page"')
    txt = txt.replace('className="mx-auto w-full max-w-7xl px-8 py-16"', 'className="blog-page"')
    with open(path, "w", encoding="utf-8") as f:
        f.write(txt)

print("done")
