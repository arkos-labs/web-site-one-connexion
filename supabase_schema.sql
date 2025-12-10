-- ===================================================================
-- SCHÉMA SUPABASE POUR LES TARIFS ONE CONNEXION
-- ===================================================================

-- Table: tariffs_cities
CREATE TABLE IF NOT EXISTS tariffs_cities (
  id BIGSERIAL PRIMARY KEY,
  city_name VARCHAR(100) NOT NULL UNIQUE,
  postal_code VARCHAR(10) NOT NULL,
  department_code VARCHAR(2) NOT NULL,
  city_type VARCHAR(20) NOT NULL, -- 'paris_arrondissement' ou 'idf_city'
  
  -- Tarifs en bons
  normal INTEGER NOT NULL,
  express INTEGER NOT NULL,
  urgence INTEGER NOT NULL,
  vl_normal INTEGER NOT NULL,
  vl_express INTEGER NOT NULL,
  
  -- Métadonnées
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT valid_postal_code CHECK (postal_code ~ '^\d{5}$')
);

-- Index pour recherche rapide
CREATE INDEX idx_tariffs_cities_name ON tariffs_cities(LOWER(city_name));
CREATE INDEX idx_tariffs_cities_postal ON tariffs_cities(postal_code);
CREATE INDEX idx_tariffs_cities_dept ON tariffs_cities(department_code);
CREATE INDEX idx_tariffs_cities_type ON tariffs_cities(city_type);

-- ===================================================================
-- Table: tariff_calculations
-- Historique des calculs de tarifs
-- ===================================================================

CREATE TABLE IF NOT EXISTS tariff_calculations (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  
  -- Détails du calcul
  city_departure_id BIGINT REFERENCES tariffs_cities(id),
  city_departure_name VARCHAR(100) NOT NULL,
  postal_code_departure VARCHAR(10) NOT NULL,
  
  city_arrival_id BIGINT REFERENCES tariffs_cities(id),
  city_arrival_name VARCHAR(100) NOT NULL,
  postal_code_arrival VARCHAR(10) NOT NULL,
  
  formula VARCHAR(50) NOT NULL, -- 'normal', 'express', 'urgence', 'vl_normal', 'vl_express'
  
  -- Résultats du calcul
  distance_meters INTEGER,
  distance_km DECIMAL(10, 2),
  
  prise_en_charge_bons DECIMAL(10, 2) NOT NULL,
  supplement_bons DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_bons DECIMAL(10, 2) NOT NULL,
  total_euros DECIMAL(10, 2) NOT NULL,
  
  is_paris_trip BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Métadonnées
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT valid_formula CHECK (formula IN ('normal', 'express', 'urgence', 'vl_normal', 'vl_express'))
);

-- Index pour requêtes courantes
CREATE INDEX idx_calculations_user ON tariff_calculations(user_id, created_at DESC);
CREATE INDEX idx_calculations_formula ON tariff_calculations(formula);
CREATE INDEX idx_calculations_paris ON tariff_calculations(is_paris_trip);

-- ===================================================================
-- Table: departments
-- Reference des départements IDF
-- ===================================================================

CREATE TABLE IF NOT EXISTS departments (
  code VARCHAR(2) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  region VARCHAR(100) NOT NULL
);

INSERT INTO departments (code, name, region) VALUES
  ('75', 'Paris', 'Île-de-France'),
  ('77', 'Seine-et-Marne', 'Île-de-France'),
  ('78', 'Yvelines', 'Île-de-France'),
  ('91', 'Essonne', 'Île-de-France'),
  ('92', 'Hauts-de-Seine', 'Île-de-France'),
  ('93', 'Seine-Saint-Denis', 'Île-de-France'),
  ('94', 'Val-de-Marne', 'Île-de-France'),
  ('95', 'Val-d\'Oise', 'Île-de-France')
ON CONFLICT (code) DO NOTHING;

-- ===================================================================
-- Table: tariff_metadata
-- Constantes et métadonnées
-- ===================================================================

CREATE TABLE IF NOT EXISTS tariff_metadata (
  id BIGSERIAL PRIMARY KEY,
  key VARCHAR(100) NOT NULL UNIQUE,
  value VARCHAR(500) NOT NULL,
  description TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO tariff_metadata (key, value, description) VALUES
  ('bon_value_eur', '5.5', 'Valeur d''un bon en EUR'),
  ('supplement_per_km_bons', '0.1', 'Supplément en bons par km (hors Paris)'),
  ('company_name', 'One Connexion', 'Nom de l''entreprise'),
  ('version', '1.0', 'Version du tarif')
ON CONFLICT (key) DO NOTHING;

-- ===================================================================
-- FONCTIONS SQL
-- ===================================================================

-- Fonction: Calculer un tarif
CREATE OR REPLACE FUNCTION calculate_tariff(
  p_city_departure VARCHAR(100),
  p_city_arrival VARCHAR(100),
  p_formula VARCHAR(50),
  p_distance_meters INTEGER,
  p_user_id UUID
)
RETURNS TABLE (
  city_departure_name VARCHAR,
  city_arrival_name VARCHAR,
  formula VARCHAR,
  prise_en_charge_bons DECIMAL,
  distance_km DECIMAL,
  supplement_bons DECIMAL,
  total_bons DECIMAL,
  total_euros DECIMAL,
  is_paris_trip BOOLEAN
) AS $$
DECLARE
  v_departure_tariff INTEGER;
  v_distance_km DECIMAL;
  v_supplement_bons DECIMAL;
  v_total_bons DECIMAL;
  v_total_euros DECIMAL;
  v_is_paris_trip BOOLEAN;
  v_departure_postal VARCHAR(10);
  v_arrival_postal VARCHAR(10);
  v_bon_value DECIMAL;
BEGIN
  -- Récupérer la valeur d'un bon
  SELECT value::DECIMAL INTO v_bon_value FROM tariff_metadata WHERE key = 'bon_value_eur';
  
  -- Récupérer la prise en charge et codes postaux
  SELECT normal, postal_code INTO v_departure_tariff, v_departure_postal 
  FROM tariffs_cities 
  WHERE LOWER(city_name) = LOWER(p_city_departure) 
  AND formula = p_formula;
  
  IF v_departure_tariff IS NULL THEN
    RAISE EXCEPTION 'Tarif non trouvé pour %', p_city_departure;
  END IF;
  
  -- Récupérer le code postal d'arrivée
  SELECT postal_code INTO v_arrival_postal FROM tariffs_cities WHERE LOWER(city_name) = LOWER(p_city_arrival);
  
  -- Déterminer si c'est un trajet Paris
  v_is_paris_trip := (v_departure_postal LIKE '75%' OR v_arrival_postal LIKE '75%');
  
  -- Calculer le supplément
  IF NOT v_is_paris_trip AND p_distance_meters IS NOT NULL THEN
    v_distance_km := p_distance_meters::DECIMAL / 1000;
    v_supplement_bons := v_distance_km * 0.1;
  ELSE
    v_distance_km := 0;
    v_supplement_bons := 0;
  END IF;
  
  -- Calculer le total
  v_total_bons := v_departure_tariff + v_supplement_bons;
  v_total_euros := v_total_bons * v_bon_value;
  
  -- Enregistrer le calcul
  INSERT INTO tariff_calculations (
    user_id, city_departure_name, postal_code_departure,
    city_arrival_name, postal_code_arrival,
    formula, distance_meters, distance_km,
    prise_en_charge_bons, supplement_bons, total_bons, total_euros, is_paris_trip
  ) VALUES (
    p_user_id, p_city_departure, v_departure_postal,
    p_city_arrival, COALESCE(v_arrival_postal, ''),
    p_formula, p_distance_meters, v_distance_km,
    v_departure_tariff, v_supplement_bons, v_total_bons, v_total_euros, v_is_paris_trip
  );
  
  RETURN QUERY
  SELECT 
    p_city_departure::VARCHAR,
    p_city_arrival::VARCHAR,
    p_formula::VARCHAR,
    v_departure_tariff::DECIMAL,
    v_distance_km,
    v_supplement_bons,
    v_total_bons,
    v_total_euros,
    v_is_paris_trip;
END;
$$ LANGUAGE plpgsql;

-- ===================================================================
-- ROW LEVEL SECURITY (RLS)
-- ===================================================================

ALTER TABLE tariff_calculations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see their own calculations" ON tariff_calculations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own calculations" ON tariff_calculations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ===================================================================
-- MIGRATION DATA (exemple: insérer les tarifs depuis JSON)
-- ===================================================================

-- Insérer les tarifs Paris
INSERT INTO tariffs_cities (city_name, postal_code, department_code, city_type, normal, express, urgence, vl_normal, vl_express) VALUES
  ('Paris 01', '75001', '75', 'paris_arrondissement', 2, 4, 7, 7, 14),
  ('Paris 02', '75002', '75', 'paris_arrondissement', 2, 4, 7, 7, 14),
  ('Paris 03', '75003', '75', 'paris_arrondissement', 3, 6, 9, 8, 18),
  -- ... continuer pour les 20 arrondissements

-- Insérer les tarifs IDF
INSERT INTO tariffs_cities (city_name, postal_code, department_code, city_type, normal, express, urgence, vl_normal, vl_express) VALUES
  ('MELUN', '77000', '77', 'idf_city', 24, 27, 30, 28, 31),
  ('COLLEGIEN', '77090', '77', 'idf_city', 15, 18, 21, 19, 22),
  -- ... continuer pour les 221 villes IDF

ON CONFLICT (city_name) DO NOTHING;

-- ===================================================================
-- VIEWS
-- ===================================================================

-- Vue: Tarifs actuels
CREATE OR REPLACE VIEW v_tariffs_current AS
SELECT 
  city_name,
  postal_code,
  department_code,
  city_type,
  normal,
  express,
  urgence,
  vl_normal,
  vl_express,
  (normal * 5.5)::DECIMAL(10, 2) as normal_eur,
  (express * 5.5)::DECIMAL(10, 2) as express_eur,
  (urgence * 5.5)::DECIMAL(10, 2) as urgence_eur,
  (vl_normal * 5.5)::DECIMAL(10, 2) as vl_normal_eur,
  (vl_express * 5.5)::DECIMAL(10, 2) as vl_express_eur
FROM tariffs_cities
ORDER BY postal_code, city_name;

-- Vue: Résumé des calculs utilisateur
CREATE OR REPLACE VIEW v_user_calculations_summary AS
SELECT 
  user_id,
  COUNT(*) as total_calculations,
  SUM(total_euros)::DECIMAL(15, 2) as total_revenue,
  AVG(distance_km)::DECIMAL(10, 2) as avg_distance,
  MAX(created_at) as last_calculation
FROM tariff_calculations
GROUP BY user_id;

-- ===================================================================
-- PERMISSIONS
-- ===================================================================

GRANT SELECT ON tariffs_cities TO anon;
GRANT SELECT ON v_tariffs_current TO anon;
GRANT EXECUTE ON FUNCTION calculate_tariff TO authenticated;
