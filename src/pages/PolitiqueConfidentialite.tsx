import PublicLayout from "@/layouts/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Database, Lock, Eye, Mail, FileText } from "lucide-react";

export default function PolitiqueConfidentialite() {
    return (
        <PublicLayout>
            <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-12">
                <div className="container mx-auto px-4 max-w-4xl">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                            <Shield className="h-8 w-8 text-primary" />
                        </div>
                        <h1 className="text-4xl font-bold text-primary mb-4">
                            Politique de Confidentialité
                        </h1>
                        <p className="text-muted-foreground">
                            Dernière mise à jour : 7 décembre 2025
                        </p>
                    </div>

                    <Card className="shadow-lg border-0">
                        <CardContent className="p-8 space-y-8">
                            {/* Introduction */}
                            <section>
                                <h2 className="text-2xl font-bold text-primary mb-4">Introduction</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    <strong className="text-foreground">One Connexion</strong> s'engage à protéger la vie privée
                                    de ses utilisateurs. Cette politique de confidentialité explique comment nous collectons,
                                    utilisons, partageons et protégeons vos données personnelles conformément au Règlement Général
                                    sur la Protection des Données (RGPD) et à la loi Informatique et Libertés.
                                </p>
                            </section>

                            {/* Données collectées */}
                            <section>
                                <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                                    <Database className="h-6 w-6" />
                                    Données collectées
                                </h2>

                                <div className="space-y-4">
                                    {/* Données d'identification */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-foreground mb-2">
                                            1. Données d'identification
                                        </h3>
                                        <ul className="space-y-2 text-muted-foreground ml-4">
                                            <li className="flex items-start gap-2">
                                                <span className="text-primary mt-1">•</span>
                                                <span>Nom et prénom</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-primary mt-1">•</span>
                                                <span>Adresse email</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-primary mt-1">•</span>
                                                <span>Numéro de téléphone</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-primary mt-1">•</span>
                                                <span>Adresse postale</span>
                                            </li>
                                        </ul>
                                    </div>

                                    {/* Données de commande */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-foreground mb-2">
                                            2. Données de commande
                                        </h3>
                                        <ul className="space-y-2 text-muted-foreground ml-4">
                                            <li className="flex items-start gap-2">
                                                <span className="text-primary mt-1">•</span>
                                                <span>Adresses de retrait et de livraison</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-primary mt-1">•</span>
                                                <span>Détails des colis transportés</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-primary mt-1">•</span>
                                                <span>Historique des commandes</span>
                                            </li>
                                        </ul>
                                    </div>

                                    {/* Données de paiement */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-foreground mb-2">
                                            3. Données de paiement
                                        </h3>
                                        <ul className="space-y-2 text-muted-foreground ml-4">
                                            <li className="flex items-start gap-2">
                                                <span className="text-primary mt-1">•</span>
                                                <span>Informations de facturation</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-primary mt-1">•</span>
                                                <span>SIRET (pour les professionnels)</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-primary mt-1">•</span>
                                                <span>Historique des transactions</span>
                                            </li>
                                        </ul>
                                        <p className="text-sm text-muted-foreground mt-2 italic">
                                            Note : Les données bancaires sont traitées directement par notre prestataire de paiement
                                            sécurisé (Stripe). Nous ne stockons jamais vos coordonnées bancaires complètes.
                                        </p>
                                    </div>

                                    {/* Données techniques */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-foreground mb-2">
                                            4. Données techniques
                                        </h3>
                                        <ul className="space-y-2 text-muted-foreground ml-4">
                                            <li className="flex items-start gap-2">
                                                <span className="text-primary mt-1">•</span>
                                                <span>Adresse IP</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-primary mt-1">•</span>
                                                <span>Type de navigateur et appareil</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-primary mt-1">•</span>
                                                <span>Cookies et traceurs (voir notre <a href="/cookies" className="text-primary hover:underline">Politique de Cookies</a>)</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </section>

                            {/* Finalités */}
                            <section>
                                <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                                    <FileText className="h-6 w-6" />
                                    Finalités du traitement
                                </h2>
                                <p className="text-muted-foreground leading-relaxed mb-4">
                                    Nous utilisons vos données personnelles pour :
                                </p>
                                <ul className="space-y-2 text-muted-foreground">
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-1">✓</span>
                                        <span><strong>Gestion des commandes</strong> : Traiter et livrer vos colis</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-1">✓</span>
                                        <span><strong>Communication</strong> : Vous tenir informé de l'état de vos commandes</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-1">✓</span>
                                        <span><strong>Facturation</strong> : Établir et envoyer les factures</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-1">✓</span>
                                        <span><strong>Support client</strong> : Répondre à vos questions et réclamations</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-1">✓</span>
                                        <span><strong>Amélioration du service</strong> : Analyser l'utilisation pour améliorer notre plateforme</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-1">✓</span>
                                        <span><strong>Obligations légales</strong> : Respecter nos obligations comptables et fiscales</span>
                                    </li>
                                </ul>
                            </section>

                            {/* Base légale */}
                            <section>
                                <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                                    <Lock className="h-6 w-6" />
                                    Base légale du traitement
                                </h2>
                                <div className="space-y-3 text-muted-foreground">
                                    <p className="flex items-start gap-2">
                                        <span className="text-primary mt-1">•</span>
                                        <span><strong>Exécution du contrat</strong> : Traitement de vos commandes</span>
                                    </p>
                                    <p className="flex items-start gap-2">
                                        <span className="text-primary mt-1">•</span>
                                        <span><strong>Obligation légale</strong> : Facturation, comptabilité</span>
                                    </p>
                                    <p className="flex items-start gap-2">
                                        <span className="text-primary mt-1">•</span>
                                        <span><strong>Intérêt légitime</strong> : Amélioration du service, prévention de la fraude</span>
                                    </p>
                                    <p className="flex items-start gap-2">
                                        <span className="text-primary mt-1">•</span>
                                        <span><strong>Consentement</strong> : Newsletter, cookies non essentiels</span>
                                    </p>
                                </div>
                            </section>

                            {/* Partage des données */}
                            <section>
                                <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                                    <Eye className="h-6 w-6" />
                                    Partage des données
                                </h2>
                                <p className="text-muted-foreground leading-relaxed mb-4">
                                    Vos données peuvent être partagées avec :
                                </p>
                                <ul className="space-y-3 text-muted-foreground">
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-1">•</span>
                                        <div>
                                            <strong className="text-foreground">Nos chauffeurs</strong>
                                            <br />
                                            <span className="text-sm">Uniquement les informations nécessaires à la livraison (nom, téléphone, adresses)</span>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-1">•</span>
                                        <div>
                                            <strong className="text-foreground">Prestataires de paiement</strong>
                                            <br />
                                            <span className="text-sm">Stripe (certifié PCI-DSS)</span>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-1">•</span>
                                        <div>
                                            <strong className="text-foreground">Hébergement</strong>
                                            <br />
                                            <span className="text-sm">Supabase (serveurs en Union Européenne)</span>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-1">•</span>
                                        <div>
                                            <strong className="text-foreground">Autorités</strong>
                                            <br />
                                            <span className="text-sm">Sur demande légale uniquement</span>
                                        </div>
                                    </li>
                                </ul>
                                <p className="text-sm text-muted-foreground mt-4 italic">
                                    Nous ne vendons jamais vos données personnelles à des tiers.
                                </p>
                            </section>

                            {/* Durée de conservation */}
                            <section>
                                <h2 className="text-2xl font-bold text-primary mb-4">Durée de conservation</h2>
                                <div className="space-y-2 text-muted-foreground">
                                    <p className="flex items-start gap-2">
                                        <span className="text-primary mt-1">•</span>
                                        <span><strong>Données de commande</strong> : 3 ans après la dernière commande</span>
                                    </p>
                                    <p className="flex items-start gap-2">
                                        <span className="text-primary mt-1">•</span>
                                        <span><strong>Données de facturation</strong> : 10 ans (obligation légale)</span>
                                    </p>
                                    <p className="flex items-start gap-2">
                                        <span className="text-primary mt-1">•</span>
                                        <span><strong>Données de compte inactif</strong> : Suppression après 3 ans d'inactivité</span>
                                    </p>
                                    <p className="flex items-start gap-2">
                                        <span className="text-primary mt-1">•</span>
                                        <span><strong>Cookies</strong> : Voir notre <a href="/cookies" className="text-primary hover:underline">Politique de Cookies</a></span>
                                    </p>
                                </div>
                            </section>

                            {/* Vos droits */}
                            <section>
                                <h2 className="text-2xl font-bold text-primary mb-4">Vos droits (RGPD)</h2>
                                <p className="text-muted-foreground leading-relaxed mb-4">
                                    Conformément au RGPD, vous disposez des droits suivants :
                                </p>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="bg-primary/5 p-4 rounded-lg">
                                        <h3 className="font-semibold text-foreground mb-2">✓ Droit d'accès</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Obtenir une copie de vos données personnelles
                                        </p>
                                    </div>
                                    <div className="bg-primary/5 p-4 rounded-lg">
                                        <h3 className="font-semibold text-foreground mb-2">✓ Droit de rectification</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Corriger vos données inexactes ou incomplètes
                                        </p>
                                    </div>
                                    <div className="bg-primary/5 p-4 rounded-lg">
                                        <h3 className="font-semibold text-foreground mb-2">✓ Droit à l'effacement</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Demander la suppression de vos données
                                        </p>
                                    </div>
                                    <div className="bg-primary/5 p-4 rounded-lg">
                                        <h3 className="font-semibold text-foreground mb-2">✓ Droit d'opposition</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Vous opposer au traitement de vos données
                                        </p>
                                    </div>
                                    <div className="bg-primary/5 p-4 rounded-lg">
                                        <h3 className="font-semibold text-foreground mb-2">✓ Droit à la portabilité</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Récupérer vos données dans un format structuré
                                        </p>
                                    </div>
                                    <div className="bg-primary/5 p-4 rounded-lg">
                                        <h3 className="font-semibold text-foreground mb-2">✓ Droit de limitation</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Limiter le traitement de vos données
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Sécurité */}
                            <section>
                                <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                                    <Shield className="h-6 w-6" />
                                    Sécurité des données
                                </h2>
                                <p className="text-muted-foreground leading-relaxed mb-4">
                                    Nous mettons en œuvre des mesures techniques et organisationnelles pour protéger vos données :
                                </p>
                                <ul className="space-y-2 text-muted-foreground">
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-1">🔒</span>
                                        <span>Chiffrement SSL/TLS pour toutes les communications</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-1">🔒</span>
                                        <span>Authentification sécurisée avec hashage des mots de passe</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-1">🔒</span>
                                        <span>Hébergement dans des datacenters certifiés (Union Européenne)</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-1">🔒</span>
                                        <span>Accès restreint aux données (principe du moindre privilège)</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-1">🔒</span>
                                        <span>Sauvegardes régulières et plan de reprise d'activité</span>
                                    </li>
                                </ul>
                            </section>

                            {/* Contact */}
                            <section className="pt-8 border-t">
                                <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                                    <Mail className="h-5 w-5" />
                                    Exercer vos droits
                                </h3>
                                <div className="space-y-3 text-muted-foreground">
                                    <p>
                                        Pour exercer vos droits ou pour toute question concernant vos données personnelles,
                                        contactez notre Délégué à la Protection des Données (DPO) :
                                    </p>
                                    <div className="bg-primary/5 p-4 rounded-lg">
                                        <p><strong className="text-foreground">Email :</strong>{" "}
                                            <a href="mailto:dpo@oneconnexion.fr" className="text-primary hover:underline">
                                                dpo@oneconnexion.fr
                                            </a>
                                        </p>
                                        <p className="mt-2"><strong className="text-foreground">Courrier :</strong>{" "}
                                            One Connexion - DPO<br />
                                            123 Avenue des Champs-Élysées<br />
                                            75008 Paris, France
                                        </p>
                                    </div>
                                    <p className="text-sm italic">
                                        Nous nous engageons à répondre à votre demande dans un délai d'un mois.
                                    </p>
                                    <p className="text-sm">
                                        Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation
                                        auprès de la CNIL :{" "}
                                        <a
                                            href="https://www.cnil.fr"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary hover:underline"
                                        >
                                            www.cnil.fr
                                        </a>
                                    </p>
                                </div>
                            </section>

                            {/* Modifications */}
                            <section className="pt-8 border-t">
                                <h3 className="text-xl font-bold text-primary mb-4">Modifications de cette politique</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment.
                                    Toute modification sera publiée sur cette page avec une nouvelle date de mise à jour.
                                    Nous vous encourageons à consulter régulièrement cette page.
                                </p>
                            </section>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </PublicLayout>
    );
}
