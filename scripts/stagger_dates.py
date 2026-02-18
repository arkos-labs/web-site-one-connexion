import os
import re
from datetime import date, timedelta

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
    "Landing.jsx",
]

start = date(2026, 1, 20)

for i, fname in enumerate(files):
    path = os.path.join(base, fname)
    if not os.path.exists(path):
        continue
    d = start + timedelta(days=i*3)
    display = d.strftime("%d/%m/%Y")
    iso = d.isoformat()
    with open(path, encoding="utf-8") as f:
        txt = f.read()
    # replace time tag if present
    txt = re.sub(r"<time dateTime=\"[0-9\-]+\">[0-9/]+</time>", f"<time dateTime=\"{iso}\">{display}</time>", txt)
    # replace plain date strings
    txt = re.sub(r"Publié le [0-9]{2}/[0-9]{2}/[0-9]{4}", f"Publié le {display}", txt)
    txt = re.sub(r"Publié le [0-9]{4}-[0-9]{2}-[0-9]{2}", f"Publié le {display}", txt)
    with open(path, "w", encoding="utf-8") as f:
        f.write(txt)

print("done")
