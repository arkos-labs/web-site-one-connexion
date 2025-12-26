-- Syncing 296 cities to Supabase

INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Ablon-sur-Seine',
    '94480',
    9,
    14,
    19,
    14,
    19,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Alfortville',
    '94140',
    4,
    9,
    14,
    9,
    14,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Antony',
    '92160',
    6,
    11,
    16,
    11,
    16,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Arcueil',
    '94110',
    3,
    8,
    13,
    8,
    13,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Arnouville',
    '95400',
    14,
    19,
    24,
    19,
    24,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Arpajon',
    '91290',
    17,
    22,
    27,
    22,
    27,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Asni├¿res-sur-Seine',
    '92600',
    3,
    8,
    13,
    8,
    13,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Athis-Mons',
    '91200',
    9,
    14,
    19,
    14,
    19,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Aubergenville',
    '78410',
    26,
    31,
    36,
    31,
    36,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Aulnay-sous-Bois',
    '93600',
    10,
    15,
    20,
    15,
    20,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Bagneux',
    '92220',
    3,
    8,
    13,
    8,
    13,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Bagnolet',
    '93170',
    3,
    8,
    13,
    8,
    13,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Bezons',
    '95870',
    8,
    13,
    18,
    13,
    18,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Bi├¿vres',
    '91570',
    8,
    13,
    18,
    13,
    18,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Blanc-Mesnil (Le)',
    '93150',
    6,
    11,
    16,
    11,
    16,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Bobigny',
    '93000',
    5,
    10,
    15,
    10,
    15,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Bois-Colombes',
    '92270',
    5,
    10,
    15,
    10,
    15,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Bois-d''Arcy',
    '78390',
    15,
    20,
    25,
    20,
    25,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Boissy-Saint-L├®ger',
    '94470',
    9,
    14,
    19,
    14,
    19,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Bondoufle',
    '91070',
    17,
    22,
    27,
    22,
    27,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Bondy',
    '93140',
    6,
    11,
    16,
    11,
    16,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Bonneuil-sur-Marne',
    '94380',
    8,
    13,
    18,
    13,
    18,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Bouff├®mont',
    '95570',
    15,
    20,
    25,
    20,
    25,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Bougival',
    '78380',
    9,
    14,
    19,
    14,
    19,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Bourg-la-Reine',
    '92340',
    5,
    10,
    15,
    10,
    15,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Bourget (Le)',
    '93350',
    7,
    12,
    17,
    12,
    17,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Boussy-Saint-Antoine',
    '91800',
    17,
    22,
    27,
    22,
    27,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Br├®tigny-sur-Orge',
    '91220',
    16,
    21,
    26,
    21,
    26,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Brie-Comte-Robert',
    '77170',
    14,
    19,
    24,
    19,
    24,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Briis-sous-Forges',
    '91640',
    21,
    26,
    31,
    26,
    31,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Bry-sur-Marne',
    '94360',
    7,
    12,
    17,
    12,
    17,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Buc',
    '78530',
    13,
    18,
    23,
    18,
    23,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Bures-sur-Yvette',
    '91440',
    16,
    21,
    26,
    21,
    26,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Cachan',
    '94230',
    4,
    9,
    14,
    9,
    14,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Carri├¿res-sur-Seine',
    '78420',
    9,
    14,
    19,
    14,
    19,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Celle-Saint-Cloud (La)',
    '78170',
    12,
    17,
    22,
    17,
    22,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Cergy',
    '95000',
    16,
    21,
    26,
    21,
    26,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Chambourcy',
    '78240',
    20,
    25,
    30,
    25,
    30,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Champigny-sur-Marne',
    '94500',
    7,
    12,
    17,
    12,
    17,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Champlan',
    '91160',
    11,
    16,
    21,
    16,
    21,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Champs-sur-Marne',
    '77420',
    12,
    17,
    22,
    17,
    22,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Chanteloup-les-Vignes',
    '78570',
    22,
    27,
    32,
    27,
    32,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Chantilly',
    '60500',
    24,
    29,
    34,
    29,
    34,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Charenton-le-Pont',
    '94220',
    3,
    8,
    13,
    8,
    13,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Ch├ótenay-Malabry',
    '92290',
    6,
    11,
    16,
    11,
    16,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Ch├ótillon',
    '92320',
    4,
    9,
    14,
    9,
    14,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Chatou',
    '78400',
    9,
    14,
    19,
    14,
    19,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Chaville',
    '92370',
    10,
    15,
    20,
    15,
    20,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Chelles',
    '77500',
    14,
    19,
    24,
    19,
    24,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Chennevi├¿res-sur-Marne',
    '94430',
    9,
    14,
    19,
    14,
    19,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Chesnay-Rocquencourt (Le)',
    '78150',
    15,
    20,
    25,
    20,
    25,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Chevilly-Larue',
    '94550',
    6,
    11,
    16,
    11,
    16,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Chevreuse',
    '78460',
    20,
    25,
    30,
    25,
    30,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Chevry-Cossigny',
    '77173',
    20,
    25,
    30,
    25,
    30,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Choisy-le-Roi',
    '94600',
    7,
    12,
    17,
    12,
    17,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Clamart',
    '92140',
    5,
    10,
    15,
    10,
    15,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Clayes-sous-Bois (Les)',
    '78340',
    20,
    25,
    30,
    25,
    30,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Clichy',
    '92110',
    3,
    8,
    13,
    8,
    13,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Clichy-sous-Bois',
    '93390',
    11,
    16,
    21,
    16,
    21,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Coll├®gien',
    '77090',
    18,
    23,
    28,
    23,
    28,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Colombes',
    '92700',
    7,
    12,
    17,
    12,
    17,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Combs-la-Ville',
    '77380',
    15,
    20,
    25,
    20,
    25,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Compi├¿gne',
    '60200',
    42,
    47,
    52,
    47,
    52,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Conflans-Sainte-Honorine',
    '78700',
    18,
    23,
    28,
    23,
    28,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Corbeil-Essonnes',
    '91100',
    19,
    24,
    29,
    24,
    29,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Cormeilles-en-Parisis',
    '95240',
    14,
    19,
    24,
    19,
    24,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Coudray-Montceaux (Le)',
    '91830',
    22,
    27,
    32,
    27,
    32,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Courbevoie',
    '92400',
    3,
    8,
    13,
    8,
    13,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Courcouronnes',
    '91080',
    17,
    22,
    27,
    22,
    27,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Courneuve (La)',
    '93120',
    6,
    11,
    16,
    11,
    16,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Cr├®cy-la-Chapelle',
    '77580',
    27,
    32,
    37,
    32,
    37,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Creil',
    '60100',
    31,
    36,
    41,
    36,
    41,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Cr├®teil',
    '94000',
    8,
    13,
    18,
    13,
    18,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Croissy-Beaubourg',
    '77183',
    18,
    23,
    28,
    23,
    28,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Croissy-sur-Seine',
    '78290',
    15,
    20,
    25,
    20,
    25,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Crosne',
    '91560',
    11,
    16,
    21,
    16,
    21,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Dammarie-les-Lys',
    '77190',
    32,
    37,
    42,
    37,
    42,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Deuil-la-Barre',
    '95170',
    8,
    13,
    18,
    13,
    18,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Domont',
    '95330',
    12,
    17,
    22,
    17,
    22,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Dourdan',
    '91410',
    27,
    32,
    37,
    32,
    37,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Drancy',
    '93700',
    6,
    11,
    16,
    11,
    16,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Dugny',
    '93440',
    8,
    13,
    18,
    13,
    18,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Eaubonne',
    '95600',
    10,
    15,
    20,
    15,
    20,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Ecouen',
    '95440',
    11,
    16,
    21,
    16,
    21,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Elancourt',
    '78990',
    21,
    26,
    31,
    26,
    31,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Emerainville',
    '77184',
    18,
    23,
    28,
    23,
    28,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Enghien-les-Bains',
    '95880',
    8,
    13,
    18,
    13,
    18,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Epinay-sur-Orge',
    '91360',
    12,
    17,
    22,
    17,
    22,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Epinay-sur-Seine',
    '93800',
    7,
    12,
    17,
    12,
    17,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Epinay-sous-S├®nart',
    '91860',
    13,
    18,
    23,
    18,
    23,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Eragny',
    '95610',
    17,
    22,
    27,
    22,
    27,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Ermont',
    '95120',
    11,
    16,
    21,
    16,
    21,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Etampes',
    '91150',
    27,
    32,
    37,
    32,
    37,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Etang-la-Ville (L'')',
    '78620',
    17,
    22,
    27,
    22,
    27,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Eurodisney',
    '77700',
    22,
    27,
    32,
    27,
    32,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Evry',
    '91000',
    16,
    21,
    26,
    21,
    26,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Ezanville',
    '95460',
    12,
    17,
    22,
    17,
    22,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Feucherolles',
    '78810',
    24,
    29,
    34,
    29,
    34,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Fleury-M├®rogis',
    '91700',
    15,
    20,
    25,
    20,
    25,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Fontainebleau',
    '77300',
    32,
    37,
    42,
    37,
    42,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Fontenay-Tr├®signy',
    '77610',
    25,
    30,
    35,
    30,
    35,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Fontenay-aux-Roses',
    '92260',
    5,
    10,
    15,
    10,
    15,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Fontenay-le-Fleury',
    '78330',
    17,
    22,
    27,
    22,
    27,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Fontenay-sous-Bois',
    '94120',
    5,
    10,
    15,
    10,
    15,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Fosses',
    '95470',
    20,
    25,
    30,
    25,
    30,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Franconville',
    '95130',
    11,
    16,
    21,
    16,
    21,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Fresnes',
    '94260',
    11,
    16,
    21,
    16,
    21,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Gagny',
    '93220',
    12,
    17,
    22,
    17,
    22,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Garches',
    '92380',
    10,
    15,
    20,
    15,
    20,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Garenne-Colombes (La)',
    '92250',
    6,
    11,
    16,
    11,
    16,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Garges-l├¿s-Gonesse',
    '95140',
    14,
    19,
    24,
    19,
    24,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Garonor',
    '93600',
    10,
    15,
    20,
    15,
    20,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Gennevilliers',
    '92230',
    5,
    10,
    15,
    10,
    15,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Gentilly',
    '94250',
    3,
    8,
    13,
    8,
    13,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Gif-sur-Yvette',
    '91190',
    17,
    22,
    27,
    22,
    27,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Gonesse',
    '95500',
    10,
    15,
    20,
    15,
    20,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Gournay-sur-Marne',
    '93460',
    14,
    19,
    24,
    19,
    24,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Goussainville',
    '95190',
    15,
    20,
    25,
    20,
    25,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Gretz-Armainvilliers',
    '77220',
    20,
    25,
    30,
    25,
    30,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Grisy-les-Pl├ótres',
    '95810',
    22,
    27,
    32,
    27,
    32,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Groslay',
    '95410',
    10,
    15,
    20,
    15,
    20,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Guerville',
    '78930',
    34,
    39,
    44,
    39,
    44,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Guyancourt',
    '78280',
    19,
    24,
    29,
    24,
    29,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Ha├┐-les-Roses (L'')',
    '94240',
    6,
    11,
    16,
    11,
    16,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Herblay',
    '95220',
    14,
    19,
    24,
    19,
    24,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Houilles',
    '78800',
    11,
    16,
    21,
    16,
    21,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Igny',
    '91430',
    13,
    18,
    23,
    18,
    23,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Ile-Saint-Denis (L'')',
    '93450',
    5,
    10,
    15,
    10,
    15,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Issy-les-Moulineaux',
    '92130',
    3,
    8,
    13,
    8,
    13,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Ivry-sur-Seine',
    '94200',
    3,
    8,
    13,
    8,
    13,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Joinville-le-Pont',
    '94340',
    6,
    11,
    16,
    11,
    16,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Jouy-en-Josas',
    '78350',
    15,
    20,
    25,
    20,
    25,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Juvisy-sur-Orge',
    '91260',
    11,
    16,
    21,
    16,
    21,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Kremlin-Bic├¬tre (Le)',
    '94270',
    3,
    8,
    13,
    8,
    13,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'La Chapelle-en-Vexin',
    '95420',
    32,
    37,
    42,
    37,
    42,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'La D├®fense',
    '92000',
    3,
    8,
    13,
    8,
    13,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'La Frette-sur-Seine',
    '95530',
    14,
    19,
    24,
    19,
    24,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'La Plaine-Saint-Denis',
    '93210',
    3,
    8,
    13,
    8,
    13,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'La Queue-en-Brie',
    '94510',
    10,
    15,
    20,
    15,
    20,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'La Verri├¿re',
    '78320',
    21,
    26,
    31,
    26,
    31,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Lagny-sur-Marne',
    '77400',
    17,
    22,
    27,
    22,
    27,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Le Mesnil-Aubry',
    '95720',
    14,
    19,
    24,
    19,
    24,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Le Mesnil-le-Roi',
    '78600',
    14,
    19,
    24,
    19,
    24,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Le Pecq',
    '78230',
    16,
    21,
    26,
    21,
    26,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Le Perreux-sur-Marne',
    '94170',
    7,
    12,
    17,
    12,
    17,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Le Plessis-Robinson',
    '92350',
    6,
    11,
    16,
    11,
    16,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Le Pr├®-Saint-Gervais',
    '93310',
    3,
    8,
    13,
    8,
    13,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Le Raincy',
    '93340',
    10,
    15,
    20,
    15,
    20,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Le V├®sinet',
    '78110',
    13,
    18,
    23,
    18,
    23,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Les Lilas',
    '93260',
    3,
    8,
    13,
    8,
    13,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Les Mureaux',
    '78130',
    25,
    30,
    35,
    30,
    35,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Les Ulis',
    '91940',
    15,
    20,
    25,
    20,
    25,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Levallois-Perret',
    '92300',
    3,
    8,
    13,
    8,
    13,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Lieusaint',
    '77127',
    26,
    31,
    36,
    31,
    36,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Limeil-Br├®vannes',
    '94450',
    10,
    15,
    20,
    15,
    20,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Limours',
    '91470',
    20,
    25,
    30,
    25,
    30,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Linas',
    '91310',
    15,
    20,
    25,
    20,
    25,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Lisses',
    '91090',
    18,
    23,
    28,
    23,
    28,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Livry-Gargan',
    '93190',
    11,
    16,
    21,
    16,
    21,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Loges-en-Josas (Les)',
    '78350',
    15,
    20,
    25,
    20,
    25,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Lognes',
    '77185',
    18,
    23,
    28,
    23,
    28,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Longjumeau',
    '91160',
    11,
    16,
    21,
    16,
    21,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Louvres',
    '95380',
    15,
    20,
    25,
    20,
    25,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Maffliers',
    '95560',
    18,
    23,
    28,
    23,
    28,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Maisons-Alfort',
    '94700',
    5,
    10,
    15,
    10,
    15,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Maisons-Laffitte',
    '78600',
    13,
    18,
    23,
    18,
    23,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Malakoff',
    '92240',
    3,
    8,
    13,
    8,
    13,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Mandres-les-Roses',
    '94520',
    17,
    22,
    27,
    22,
    27,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Mantes-la-Jolie',
    '78200',
    32,
    37,
    42,
    37,
    42,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Mareil-Marly',
    '78750',
    15,
    20,
    25,
    20,
    25,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Margency',
    '95580',
    12,
    17,
    22,
    17,
    22,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Marly-la-Ville',
    '95670',
    20,
    25,
    30,
    25,
    30,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Marly-le-Roi',
    '78160',
    14,
    19,
    24,
    19,
    24,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Marne-la-Vall├®e',
    '77420',
    18,
    23,
    28,
    23,
    28,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Marnes-la-Coquette',
    '92430',
    10,
    15,
    20,
    15,
    20,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Massy',
    '91300',
    10,
    15,
    20,
    15,
    20,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Maurepas',
    '78310',
    22,
    27,
    32,
    27,
    32,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Meaux',
    '77100',
    26,
    31,
    36,
    31,
    36,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Melun',
    '77000',
    29,
    34,
    39,
    34,
    39,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Mennecy',
    '91540',
    24,
    29,
    34,
    29,
    34,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Meudon',
    '92190',
    7,
    12,
    17,
    12,
    17,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Mitry-Mory',
    '77290',
    17,
    22,
    27,
    22,
    27,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Montesson',
    '78360',
    13,
    18,
    23,
    18,
    23,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Montfermeil',
    '93370',
    13,
    18,
    23,
    18,
    23,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Montlh├®ry',
    '91310',
    14,
    19,
    24,
    19,
    24,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Montigny-le-Bretonneux',
    '78180',
    19,
    24,
    29,
    24,
    29,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Montlignon',
    '95680',
    13,
    18,
    23,
    18,
    23,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Montmagny',
    '95360',
    7,
    12,
    17,
    12,
    17,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Montmorency',
    '95160',
    9,
    14,
    19,
    14,
    19,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Montreuil',
    '93100',
    3,
    8,
    13,
    8,
    13,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Montrouge',
    '92120',
    3,
    8,
    13,
    8,
    13,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Neuilly-sur-Seine',
    '92200',
    3,
    8,
    13,
    8,
    13,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Nogent-sur-Marne',
    '94130',
    5,
    10,
    15,
    10,
    15,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Noiseau',
    '94880',
    11,
    16,
    21,
    16,
    21,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Noisiel',
    '77186',
    17,
    22,
    27,
    22,
    27,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Noisy-le-Grand',
    '93160',
    10,
    15,
    20,
    15,
    20,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Noisy-le-Roi',
    '78590',
    16,
    21,
    26,
    21,
    26,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Noisy-le-Sec',
    '93130',
    5,
    10,
    15,
    10,
    15,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Orgeval',
    '78630',
    21,
    26,
    31,
    26,
    31,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Orly',
    '94310',
    8,
    13,
    18,
    13,
    18,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Ormesson-sur-Marne',
    '94490',
    9,
    14,
    19,
    14,
    19,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Orsay',
    '91400',
    15,
    20,
    25,
    20,
    25,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Osny',
    '95930',
    17,
    22,
    27,
    22,
    27,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Ozoir-la-Ferri├¿re',
    '77330',
    17,
    22,
    27,
    22,
    27,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Palaiseau',
    '91120',
    12,
    17,
    22,
    17,
    22,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Pantin',
    '93500',
    3,
    8,
    13,
    8,
    13,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Paray-Vieille-Poste',
    '91550',
    9,
    14,
    19,
    14,
    19,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Pavillons-sous-Bois (Les)',
    '93320',
    9,
    14,
    19,
    14,
    19,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Perray-en-Yvelines (Le)',
    '78610',
    27,
    32,
    37,
    32,
    37,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Persan',
    '95340',
    23,
    28,
    33,
    28,
    33,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Pierrefitte-sur-Seine',
    '93380',
    7,
    12,
    17,
    12,
    17,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Piscop',
    '95350',
    10,
    15,
    20,
    15,
    20,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Plaisir',
    '78370',
    21,
    26,
    31,
    26,
    31,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Poissy',
    '78300',
    18,
    23,
    28,
    23,
    28,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Pontault-Combault',
    '77340',
    15,
    20,
    25,
    20,
    25,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Pontoise',
    '95000',
    16,
    21,
    26,
    21,
    26,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Port-Marly (Le)',
    '78560',
    15,
    20,
    25,
    20,
    25,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Puteaux',
    '92800',
    3,
    8,
    13,
    8,
    13,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Quincy-sous-S├®nart',
    '91480',
    16,
    21,
    26,
    21,
    26,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Rambouillet',
    '78120',
    32,
    37,
    42,
    37,
    42,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Ris-Orangis',
    '91130',
    15,
    20,
    25,
    20,
    25,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Rocquencourt',
    '78150',
    17,
    22,
    27,
    22,
    27,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Roissy-en-Brie',
    '77680',
    15,
    20,
    25,
    20,
    25,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Roissy-en-France',
    '95700',
    13,
    18,
    23,
    18,
    23,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Romainville',
    '93230',
    4,
    9,
    14,
    9,
    14,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Rosny-sous-Bois',
    '93110',
    5,
    10,
    15,
    10,
    15,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Rueil-Malmaison',
    '92500',
    7,
    12,
    17,
    12,
    17,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Rungis',
    '94150',
    7,
    12,
    17,
    12,
    17,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Saclay',
    '91400',
    14,
    19,
    24,
    19,
    24,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Saint-Arnoult-en-Yvelines',
    '78730',
    27,
    32,
    37,
    32,
    37,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Saint-Brice-sous-For├¬t',
    '95350',
    10,
    15,
    20,
    15,
    20,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Saint-Cloud',
    '92210',
    6,
    11,
    16,
    11,
    16,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Saint-Cyr-l''├ëcole',
    '78210',
    18,
    23,
    28,
    23,
    28,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Saint-Denis',
    '93200',
    5,
    10,
    15,
    10,
    15,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Saint-Germain-en-Laye',
    '78100',
    17,
    22,
    27,
    22,
    27,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Saint-Mand├®',
    '94160',
    3,
    8,
    13,
    8,
    13,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Saint-Maur-des-Foss├®s',
    '94100',
    7,
    12,
    17,
    12,
    17,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Saint-Michel-sur-Orge',
    '91240',
    15,
    20,
    25,
    20,
    25,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Saint-Nom-la-Bret├¿che',
    '78860',
    17,
    22,
    27,
    22,
    27,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Saint-Ouen',
    '93400',
    3,
    8,
    13,
    8,
    13,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Saint-Ouen-l''Aum├┤ne',
    '95310',
    16,
    21,
    26,
    21,
    26,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Saint-Quentin-en-Yvelines',
    '78190',
    17,
    22,
    27,
    22,
    27,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Saint-Thibault-des-Vignes',
    '77400',
    18,
    23,
    28,
    23,
    28,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Sainte-Genevi├¿ve-des-Bois',
    '91700',
    14,
    19,
    24,
    19,
    24,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Sannois',
    '95110',
    10,
    15,
    20,
    15,
    20,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Santeny',
    '94440',
    13,
    18,
    23,
    18,
    23,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Sarcelles',
    '95200',
    9,
    14,
    19,
    14,
    19,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Sartrouville',
    '78500',
    11,
    16,
    21,
    16,
    21,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Saulx-les-Chartreux',
    '91160',
    12,
    17,
    22,
    17,
    22,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Savigny-le-Temple',
    '77176',
    23,
    28,
    33,
    28,
    33,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Savigny-sur-Orge',
    '91600',
    12,
    17,
    22,
    17,
    22,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Sceaux',
    '92330',
    5,
    10,
    15,
    10,
    15,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Sevran',
    '93270',
    11,
    16,
    21,
    16,
    21,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'S├¿vres',
    '92310',
    4,
    9,
    14,
    9,
    14,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Soisy-sous-Montmorency',
    '95230',
    10,
    15,
    20,
    15,
    20,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Soisy-sur-Seine',
    '91450',
    18,
    23,
    28,
    23,
    28,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Stains',
    '93240',
    6,
    11,
    16,
    11,
    16,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Sucy-en-Brie',
    '94370',
    8,
    13,
    18,
    13,
    18,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Suresnes',
    '92150',
    3,
    8,
    13,
    8,
    13,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Taverny',
    '95150',
    14,
    19,
    24,
    19,
    24,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Thiais',
    '94320',
    7,
    12,
    17,
    12,
    17,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Torcy',
    '77200',
    16,
    21,
    26,
    21,
    26,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Trappes',
    '78190',
    16,
    21,
    26,
    21,
    26,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Tremblay-en-France',
    '93290',
    14,
    19,
    24,
    19,
    24,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Triel-sur-Seine',
    '78510',
    22,
    27,
    32,
    27,
    32,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Vaires-sur-Marne',
    '77360',
    15,
    20,
    25,
    20,
    25,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Valenton',
    '94460',
    9,
    14,
    19,
    14,
    19,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Vanves',
    '92170',
    3,
    8,
    13,
    8,
    13,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Vaucresson',
    '92420',
    8,
    13,
    18,
    13,
    18,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Vaujours',
    '93410',
    15,
    20,
    25,
    20,
    25,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'V├®lizy-Villacoublay',
    '78140',
    9,
    14,
    19,
    14,
    19,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Verneuil-sur-Seine',
    '78480',
    24,
    29,
    34,
    29,
    34,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Vernouillet',
    '78540',
    24,
    29,
    34,
    29,
    34,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Verri├¿res-le-Buisson',
    '91370',
    10,
    15,
    20,
    15,
    20,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Versailles',
    '78000',
    10,
    15,
    20,
    15,
    20,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Vigneux-sur-Seine',
    '91270',
    12,
    17,
    22,
    17,
    22,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Ville-d''Avray',
    '92410',
    7,
    12,
    17,
    12,
    17,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Villebon-sur-Yvette',
    '91140',
    15,
    20,
    25,
    20,
    25,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Villecresnes',
    '94440',
    11,
    16,
    21,
    16,
    21,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Villejuif',
    '94800',
    9,
    14,
    19,
    14,
    19,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Villemomble',
    '93250',
    8,
    13,
    18,
    13,
    18,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Villeneuve-la-Garenne',
    '92390',
    7,
    12,
    17,
    12,
    17,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Villeneuve-le-Roi',
    '94290',
    8,
    13,
    18,
    13,
    18,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Villeneuve-Saint-Georges',
    '94190',
    8,
    13,
    18,
    13,
    18,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Villeparisis',
    '77270',
    15,
    20,
    25,
    20,
    25,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Villepinte',
    '93420',
    10,
    15,
    20,
    15,
    20,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Villetaneuse',
    '93430',
    6,
    11,
    16,
    11,
    16,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Villiers-le-Bel',
    '95400',
    12,
    17,
    22,
    17,
    22,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Villiers-sur-Marne',
    '94350',
    8,
    13,
    18,
    13,
    18,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Vincennes',
    '94300',
    3,
    8,
    13,
    8,
    13,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Viroflay',
    '78220',
    11,
    16,
    21,
    16,
    21,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Viry-Ch├ótillon',
    '91170',
    13,
    18,
    23,
    18,
    23,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Vitry-sur-Seine',
    '94400',
    4,
    9,
    14,
    9,
    14,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Voisins-le-Bretonneux',
    '78960',
    18,
    23,
    28,
    23,
    28,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Wissous',
    '91320',
    8,
    13,
    18,
    13,
    18,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();


INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express,
    updated_at
) VALUES (
    'Yerres',
    '91330',
    12,
    17,
    22,
    17,
    22,
    NOW()
) ON CONFLICT (city_name) DO UPDATE SET
    zip_code = EXCLUDED.zip_code,
    price_normal = EXCLUDED.price_normal,
    price_express = EXCLUDED.price_express,
    price_urgence = EXCLUDED.price_urgence,
    price_vl_normal = EXCLUDED.price_vl_normal,
    price_vl_express = EXCLUDED.price_vl_express,
    updated_at = NOW();

