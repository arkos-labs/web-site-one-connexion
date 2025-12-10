/**
 * EXEMPLE D'INTÉGRATION DU NOUVEAU MOTEUR TARIFAIRE
 * ==================================================
 * 
 * Ce fichier montre comment intégrer le nouveau moteur tarifaire
 * dans un composant React pour afficher le prix d'une course.
 */

import React, { useState, useEffect } from 'react';
import {
    calculateOneConnexionPrice,
    calculerToutesLesFormules,
    type FormuleNew,
    type CalculTarifaireResult
} from '@/utils/pricingEngineNew';

// ============================================================================
// COMPOSANT : Affichage du Prix d'une Course
// ============================================================================

interface PricingDisplayProps {
    villeDepart: string;
    villeArrivee: string;
    distanceMeters: number;
    formule: FormuleNew;
}

export const PricingDisplay: React.FC<PricingDisplayProps> = ({
    villeDepart,
    villeArrivee,
    distanceMeters,
    formule
}) => {
    const [pricing, setPricing] = useState<CalculTarifaireResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        try {
            const result = calculateOneConnexionPrice(
                villeDepart,
                villeArrivee,
                distanceMeters,
                formule
            );
            setPricing(result);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur de calcul');
            setPricing(null);
        }
    }, [villeDepart, villeArrivee, distanceMeters, formule]);

    if (error) {
        return (
            <div className="pricing-error">
                <p>❌ {error}</p>
            </div>
        );
    }

    if (!pricing) {
        return <div className="pricing-loading">Calcul en cours...</div>;
    }

    return (
        <div className="pricing-display">
            <h3>Détail du tarif</h3>

            <div className="pricing-route">
                <span>{pricing.villeDepart}</span>
                <span>→</span>
                <span>{pricing.villeArrivee}</span>
                <span className="distance">({pricing.distanceKm} km)</span>
            </div>

            <div className="pricing-breakdown">
                <div className="line-item">
                    <span>Prise en charge ({pricing.villeDepart})</span>
                    <span>{pricing.priseEnCharge} bons</span>
                </div>

                {pricing.supplementApplique ? (
                    <div className="line-item supplement">
                        <span>
                            Supplément kilométrique
                            <small>({pricing.distanceKm} km × 0,1 bon/km)</small>
                        </span>
                        <span>{pricing.supplement.toFixed(2)} bons</span>
                    </div>
                ) : (
                    <div className="line-item no-supplement">
                        <span>
                            Supplément kilométrique
                            <small>(Paris impliqué)</small>
                        </span>
                        <span>0 bon</span>
                    </div>
                )}

                <div className="line-item total-bons">
                    <span>Total en bons</span>
                    <span>{pricing.totalBons.toFixed(2)} bons</span>
                </div>

                <div className="line-item conversion">
                    <span>Conversion (1 bon = 5,5€)</span>
                    <span>{pricing.totalBons.toFixed(2)} × 5,5€</span>
                </div>
            </div>

            <div className="pricing-total">
                <span>Prix total</span>
                <span className="amount">{pricing.totalEuros.toFixed(2)}€</span>
            </div>

            <div className="pricing-info">
                <p className="formule">Formule : {pricing.formule}</p>
                {pricing.isParisDansTrajet && (
                    <p className="note">
                        ℹ️ Pas de supplément kilométrique car Paris est impliqué dans le trajet
                    </p>
                )}
            </div>
        </div>
    );
};

// ============================================================================
// COMPOSANT : Comparateur de Formules
// ============================================================================

interface FormuleComparatorProps {
    villeDepart: string;
    villeArrivee: string;
    distanceMeters: number;
    onSelectFormule?: (formule: FormuleNew) => void;
}

export const FormuleComparator: React.FC<FormuleComparatorProps> = ({
    villeDepart,
    villeArrivee,
    distanceMeters,
    onSelectFormule
}) => {
    const [comparaison, setComparaison] = useState<Record<FormuleNew, CalculTarifaireResult> | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        try {
            const result = calculerToutesLesFormules(
                villeDepart,
                villeArrivee,
                distanceMeters
            );
            setComparaison(result);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur de calcul');
            setComparaison(null);
        }
    }, [villeDepart, villeArrivee, distanceMeters]);

    if (error) {
        return (
            <div className="comparator-error">
                <p>❌ {error}</p>
            </div>
        );
    }

    if (!comparaison) {
        return <div className="comparator-loading">Calcul en cours...</div>;
    }

    const formules: FormuleNew[] = ['NORMAL', 'EXPRESS', 'URGENCE', 'VL_NORMAL', 'VL_EXPRESS'];

    const formuleLabels: Record<FormuleNew, string> = {
        NORMAL: 'Normal',
        EXPRESS: 'Express',
        URGENCE: 'Urgence',
        VL_NORMAL: 'VL Normal',
        VL_EXPRESS: 'VL Express'
    };

    const formuleDescriptions: Record<FormuleNew, string> = {
        NORMAL: 'Livraison standard',
        EXPRESS: 'Livraison rapide',
        URGENCE: 'Livraison en urgence',
        VL_NORMAL: 'Véhicule léger normal',
        VL_EXPRESS: 'Véhicule léger express'
    };

    return (
        <div className="formule-comparator">
            <h3>Comparez les formules</h3>

            <div className="formules-grid">
                {formules.map((formule) => {
                    const pricing = comparaison[formule];

                    return (
                        <div
                            key={formule}
                            className="formule-card"
                            onClick={() => onSelectFormule?.(formule)}
                        >
                            <div className="formule-header">
                                <h4>{formuleLabels[formule]}</h4>
                                <p className="description">{formuleDescriptions[formule]}</p>
                            </div>

                            <div className="formule-pricing">
                                <div className="price-main">
                                    <span className="amount">{pricing.totalEuros.toFixed(2)}€</span>
                                </div>

                                <div className="price-details">
                                    <div className="detail-line">
                                        <span>Prise en charge</span>
                                        <span>{pricing.priseEnCharge} bons</span>
                                    </div>
                                    <div className="detail-line">
                                        <span>Supplément</span>
                                        <span>{pricing.supplement.toFixed(2)} bons</span>
                                    </div>
                                    <div className="detail-line total">
                                        <span>Total</span>
                                        <span>{pricing.totalBons.toFixed(2)} bons</span>
                                    </div>
                                </div>
                            </div>

                            <button className="select-button">
                                Choisir cette formule
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// ============================================================================
// COMPOSANT : Formulaire de Commande avec Calcul de Prix
// ============================================================================

export const OrderFormWithPricing: React.FC = () => {
    const [villeDepart, setVilleDepart] = useState('');
    const [villeArrivee, setVilleArrivee] = useState('');
    const [distanceMeters, setDistanceMeters] = useState(0);
    const [formule, setFormule] = useState<FormuleNew>('NORMAL');
    const [showPricing, setShowPricing] = useState(false);

    const handleCalculate = () => {
        // Dans une vraie application, vous appelleriez LocationIQ ici
        // pour obtenir la distance réelle
        setShowPricing(true);
    };

    return (
        <div className="order-form">
            <h2>Nouvelle Commande</h2>

            <div className="form-group">
                <label>Ville de départ</label>
                <input
                    type="text"
                    value={villeDepart}
                    onChange={(e) => setVilleDepart(e.target.value)}
                    placeholder="Ex: Paris"
                />
            </div>

            <div className="form-group">
                <label>Ville d'arrivée</label>
                <input
                    type="text"
                    value={villeArrivee}
                    onChange={(e) => setVilleArrivee(e.target.value)}
                    placeholder="Ex: Melun"
                />
            </div>

            <div className="form-group">
                <label>Distance (mètres)</label>
                <input
                    type="number"
                    value={distanceMeters}
                    onChange={(e) => setDistanceMeters(Number(e.target.value))}
                    placeholder="Ex: 47300"
                />
                <small>Normalement obtenu via LocationIQ</small>
            </div>

            <div className="form-group">
                <label>Formule</label>
                <select
                    value={formule}
                    onChange={(e) => setFormule(e.target.value as FormuleNew)}
                >
                    <option value="NORMAL">Normal</option>
                    <option value="EXPRESS">Express</option>
                    <option value="URGENCE">Urgence</option>
                    <option value="VL_NORMAL">VL Normal</option>
                    <option value="VL_EXPRESS">VL Express</option>
                </select>
            </div>

            <button onClick={handleCalculate}>
                Calculer le prix
            </button>

            {showPricing && villeDepart && villeArrivee && distanceMeters > 0 && (
                <div className="pricing-section">
                    <PricingDisplay
                        villeDepart={villeDepart}
                        villeArrivee={villeArrivee}
                        distanceMeters={distanceMeters}
                        formule={formule}
                    />
                </div>
            )}
        </div>
    );
};

// ============================================================================
// STYLES CSS (exemple)
// ============================================================================

const styles = `
.pricing-display {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.pricing-route {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  font-size: 16px;
  font-weight: 600;
}

.pricing-breakdown {
  border-top: 1px solid #e0e0e0;
  border-bottom: 1px solid #e0e0e0;
  padding: 15px 0;
  margin: 15px 0;
}

.line-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
}

.line-item small {
  display: block;
  font-size: 12px;
  color: #666;
}

.line-item.supplement {
  color: #0066cc;
}

.line-item.no-supplement {
  color: #999;
}

.line-item.total-bons {
  font-weight: 600;
  border-top: 1px dashed #ccc;
  margin-top: 10px;
  padding-top: 10px;
}

.pricing-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 4px;
  margin-top: 15px;
}

.pricing-total .amount {
  font-size: 24px;
  font-weight: 700;
  color: #0066cc;
}

.pricing-info {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #e0e0e0;
}

.pricing-info .note {
  font-size: 14px;
  color: #666;
  background: #f0f8ff;
  padding: 10px;
  border-radius: 4px;
  margin-top: 10px;
}

.formule-comparator {
  padding: 20px;
}

.formules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.formule-card {
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.formule-card:hover {
  border-color: #0066cc;
  box-shadow: 0 4px 8px rgba(0,102,204,0.2);
}

.formule-header h4 {
  margin: 0 0 5px 0;
  color: #333;
}

.formule-header .description {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.formule-pricing {
  margin: 20px 0;
}

.price-main {
  text-align: center;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 4px;
  margin-bottom: 15px;
}

.price-main .amount {
  font-size: 28px;
  font-weight: 700;
  color: #0066cc;
}

.price-details {
  font-size: 14px;
}

.detail-line {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
}

.detail-line.total {
  font-weight: 600;
  border-top: 1px solid #ccc;
  margin-top: 5px;
  padding-top: 10px;
}

.select-button {
  width: 100%;
  padding: 10px;
  background: #0066cc;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}

.select-button:hover {
  background: #0052a3;
}
`;

export default styles;
