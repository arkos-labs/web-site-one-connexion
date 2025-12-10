import React, { useEffect, useState } from 'react';
import { calculerToutesLesFormules, PricingResult, Formule } from '@/utils/pricingEngine';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const TestPricing = () => {
    const [results, setResults] = useState<{
        depart: string;
        arrivee: string;
        prices: Record<Formule, PricingResult>;
    }[]>([]);

    useEffect(() => {
        // Test specific scenarios to verify the fix
        const testScenarios = [
            // Paris to suburbs (should use suburb tariff)
            { depart: "PARIS", arrivee: "LES MUREAUX" },
            { depart: "PARIS", arrivee: "BEAUMONT-SUR-OISE" },
            { depart: "PARIS", arrivee: "VERSAILLES" },
            { depart: "PARIS", arrivee: "NANTERRE" },
            { depart: "PARIS", arrivee: "CERGY" },

            // Suburbs to Paris (should use Paris tariff)
            { depart: "LES MUREAUX", arrivee: "PARIS" },
            { depart: "VERSAILLES", arrivee: "PARIS" },
            { depart: "NANTERRE", arrivee: "PARIS" },

            // Paris to Paris
            { depart: "PARIS", arrivee: "PARIS" },

            // Suburb to suburb (should use arrival suburb tariff)
            { depart: "NANTERRE", arrivee: "VERSAILLES" },
            { depart: "VERSAILLES", arrivee: "NANTERRE" },
            { depart: "CLICHY", arrivee: "LEVALLOIS-PERRET" },

            // Additional test cases
            { depart: "PARIS", arrivee: "NEUILLY-SUR-SEINE" },
            { depart: "PARIS", arrivee: "BOULOGNE-BILLANCOURT" },
            { depart: "PARIS", arrivee: "ISSY-LES-MOULINEAUX" },
            { depart: "LEVALLOIS-PERRET", arrivee: "PARIS" },
            { depart: "NEUILLY-SUR-SEINE", arrivee: "BOULOGNE-BILLANCOURT" },
            { depart: "ANTONY", arrivee: "MASSY" },
            { depart: "SAINT-DENIS", arrivee: "AUBERVILLIERS" },
            { depart: "VINCENNES", arrivee: "MONTREUIL" },
        ];

        const newResults = testScenarios.map(scenario => {
            const prices = calculerToutesLesFormules(scenario.depart, scenario.arrivee);
            return { depart: scenario.depart, arrivee: scenario.arrivee, prices };
        });

        setResults(newResults);
    }, []);

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-2xl font-bold mb-6">Test de Tarification (20 Scénarios)</h1>
            <Card className="p-6">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Départ</TableHead>
                            <TableHead>Arrivée</TableHead>
                            <TableHead>Standard (N)</TableHead>
                            <TableHead>Express (E)</TableHead>
                            <TableHead>Flash (F)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {results.map((r, index) => (
                            <TableRow key={index}>
                                <TableCell>{r.depart}</TableCell>
                                <TableCell>{r.arrivee}</TableCell>
                                <TableCell>
                                    {r.prices.STANDARD.prixTotal.toFixed(2)}€
                                    <span className="text-xs text-gray-500 ml-2">({r.prices.STANDARD.nombreBons} bons)</span>
                                </TableCell>
                                <TableCell>
                                    {r.prices.EXPRESS.prixTotal.toFixed(2)}€
                                    <span className="text-xs text-gray-500 ml-2">({r.prices.EXPRESS.nombreBons} bons)</span>
                                </TableCell>
                                <TableCell>
                                    {r.prices.FLASH_EXPRESS.prixTotal.toFixed(2)}€
                                    <span className="text-xs text-gray-500 ml-2">({r.prices.FLASH_EXPRESS.nombreBons} bons)</span>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
};

export default TestPricing;
