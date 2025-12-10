
import re
import unicodedata

def normalize_city(city):
    """
    Replicates the TypeScript normalization logic:
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
    .replace(/'/g, '-') // Remplace les apostrophes par des tirets
    .replace(/\s+/g, '-') // Remplace les espaces par des tirets
    .replace(/-+/g, '-') // Évite les doubles tirets
    .trim()
    """
    city = city.upper()
    city = unicodedata.normalize('NFD', city).encode('ascii', 'ignore').decode('utf-8')
    city = city.replace("'", "-")
    city = re.sub(r'\s+', '-', city)
    city = re.sub(r'-+', '-', city)
    return city.strip()

# 1. READ parse_tariffs.py TO GET RAW DATA
try:
    with open('parse_tariffs.py', 'r', encoding='utf-8') as f:
        content = f.read()
        
        # Extract raw_data string
        match = re.search(r'raw_data = """(.*?)"""', content, re.DOTALL)
        if match:
            raw_data = match.group(1)
        else:
            print("Error: raw_data not found in parse_tariffs.py")
            exit(1)
            
except FileNotFoundError:
    print("Error: parse_tariffs.py not found")
    exit(1)

# 2. EXTRACT CITIES FROM RAW DATA
user_cities = []
for line in raw_data.strip().split('\n'):
    line = line.strip()
    if not line: continue
    
    parts = line.split()
    if len(parts) < 7: continue
    
    # City is everything between CP (index 0) and prices (last 5)
    city_parts = parts[1:-5]
    city_name = " ".join(city_parts)
    user_cities.append(city_name)

# 3. READ PRICING ENGINE TO GET SUPPORTED CITIES
supported_cities = set()
try:
    with open('src/utils/pricingEngineNew.ts', 'r', encoding='utf-8') as f:
        content = f.read()
        
        # Extract keys from PRISES_EN_CHARGE object
        matches = re.findall(r'"([^"]+)":\s*{', content)
        for match in matches:
            supported_cities.add(match)
            
except FileNotFoundError:
    print("Error: src/utils/pricingEngineNew.ts not found")
    exit(1)

# 4. CHECK AND REPORT
missing_cities = []

print(f"Total cities in file: {len(user_cities)}")
print(f"Total supported cities in engine: {len(supported_cities)}")
print("-" * 50)

for city in user_cities:
    normalized = normalize_city(city)
    
    # Check if found directly
    found = False
    if normalized in supported_cities:
        found = True
    else:
        # Check partial match (as per finding logic)
        for supported in supported_cities:
            if normalized in supported or supported in normalized:
                found = True
                break
    
    if not found:
        missing_cities.append(f"{city} (Normalized: {normalized})")

if missing_cities:
    print(f"Found {len(missing_cities)} cities not locatable/localizable:")
    for c in missing_cities:
        print(f"- {c}")
else:
    print("All cities are locatable!")
