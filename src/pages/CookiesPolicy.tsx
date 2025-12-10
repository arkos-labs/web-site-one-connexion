import PublicLayout from "@/layouts/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Cookie, Settings, Shield, Info, CheckCircle2, XCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Cookies() {
    return (
        <PublicLayout>
            <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-12">
                <div className="container mx-auto px-4 max-w-4xl">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                            <Cookie className="h-8 w-8 text-primary" />
                        </div>
                        <h1 className="text-4xl font-bold text-primary mb-4">
                            Politique de Cookies
                        </h1>
                        <p className="text-muted-foreground">
                            Comment nous utilisons les cookies sur One Connexion
                        </p>
                    </div>

                    <Card className="shadow-lg border-0">
                        <CardContent className="p-8 space-y-8">
                            {/* Introduction */}
                            <Alert>
                                <Info className="h-4 w-4" />
                                <AlertDescription>
                                    <strong>Qu'est-ce qu'un cookie ?</strong><br />
                                    Un cookie est un petit fichier texte déposé sur votre ordinateur ou appareil mobile lors de la visite d'un site web.
                                    Les cookies permettent au site de mémoriser vos actions et préférences.
                                </AlertDescription>
                            </Alert>

                            {/* Types de cookies */}
                            <section>
                                <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                                    <Cookie className="h-6 w-6" />
                                    Types de Cookies Utilisés
                                </h2>

                                {/* Cookies essentiels */}
                                <div className="mb-6">
                                    <h3 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                                        1. Cookies Essentiels (Obligatoires)
                                    </h3>
                                    <p className="text-muted-foreground leading-relaxed mb-3">
                                        Ces cookies sont nécessaires au fonctionnement du site et ne peuvent pas être désactivés.
                                    </p>
                                    <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                                        <div className="flex items-start gap-2">
                                            <span className="text-primary mt-1">•</span>
                                            <div>
                                                <strong className="text-foreground">Authentification :</strong>
                                                <span className="text-muted-foreground"> Maintien de votre session connectée</span>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <span className="text-primary mt-1">•</span>
                                            <div>
                                                <strong className="text-foreground">Sécurité :</strong>
                                                <span className="text-muted-foreground"> Protection contre les attaques CSRF</span>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <span className="text-primary mt-1">•</span>
                                            <div>
                                                <strong className="text-foreground">Panier :</strong>
                                                <span className="text-muted-foreground"> Sauvegarde de vos commandes en cours</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Cookies fonctionnels */}
                                <div className="mb-6">
                                    <h3 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                                        <Settings className="h-5 w-5 text-blue-600" />
                                        2. Cookies Fonctionnels (Optionnels)
                                    </h3>
                                    <p className="text-muted-foreground leading-relaxed mb-3">
                                        Ces cookies améliorent votre expérience en mémorisant vos préférences.
                                    </p>
                                    <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                                        <div className="flex items-start gap-2">
                                            <span className="text-primary mt-1">•</span>
                                            <div>
                                                <strong className="text-foreground">Langue :</strong>
                                                <span className="text-muted-foreground"> Mémorisation de votre langue préférée</span>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <span className="text-primary mt-1">•</span>
                                            <div>
                                                <strong className="text-foreground">Thème :</strong>
                                                <span className="text-muted-foreground"> Mode clair/sombre</span>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <span className="text-primary mt-1">•</span>
                                            <div>
                                                <strong className="text-foreground">Préférences :</strong>
                                                <span className="text-muted-foreground"> Adresses favorites, paramètres d'affichage</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Cookies analytiques */}
                                <div className="mb-6">
                                    <h3 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                                        <Shield className="h-5 w-5 text-purple-600" />
                                        3. Cookies Analytiques (Optionnels)
                                    </h3>
                                    <p className="text-muted-foreground leading-relaxed mb-3">
                                        Ces cookies nous aident à comprendre comment vous utilisez le site pour l'améliorer.
                                    </p>
                                    <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                                        <div className="flex items-start gap-2">
                                            <span className="text-primary mt-1">•</span>
                                            <div>
                                                <strong className="text-foreground">Google Analytics :</strong>
                                                <span className="text-muted-foreground"> Statistiques de visite anonymisées</span>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <span className="text-primary mt-1">•</span>
                                            <div>
                                                <strong className="text-foreground">Pages visitées :</strong>
                                                <span className="text-muted-foreground"> Analyse des pages les plus consultées</span>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <span className="text-primary mt-1">•</span>
                                            <div>
                                                <strong className="text-foreground">Temps de visite :</strong>
                                                <span className="text-muted-foreground"> Durée moyenne des sessions</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Cookies marketing */}
                                <div>
                                    <h3 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                                        <XCircle className="h-5 w-5 text-orange-600" />
                                        4. Cookies Marketing (Désactivés par défaut)
                                    </h3>
                                    <p className="text-muted-foreground leading-relaxed mb-3">
                                        Nous n'utilisons actuellement <strong>aucun cookie marketing ou publicitaire</strong>.
                                    </p>
                                </div>
                            </section>

                            {/* Gestion des cookies */}
                            <section>
                                <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                                    <Settings className="h-6 w-6" />
                                    Gérer vos Préférences
                                </h2>
                                <p className="text-muted-foreground leading-relaxed mb-4">
                                    Vous pouvez à tout moment modifier vos préférences de cookies :
                                </p>

                                <div className="space-y-4">
                                    <div className="bg-primary/5 rounded-lg p-4">
                                        <h4 className="font-semibold text-foreground mb-2">Via votre navigateur</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Vous pouvez configurer votre navigateur pour refuser les cookies ou être averti avant d'accepter un cookie.
                                        </p>
                                        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                                            <li className="flex items-center gap-2">
                                                <span className="text-primary">•</span>
                                                <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                                    Google Chrome
                                                </a>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <span className="text-primary">•</span>
                                                <a href="https://support.mozilla.org/fr/kb/activer-desactiver-cookies" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                                    Mozilla Firefox
                                                </a>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <span className="text-primary">•</span>
                                                <a href="https://support.apple.com/fr-fr/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                                    Safari
                                                </a>
                                            </li>
                                        </ul>
                                    </div>

                                    <Alert>
                                        <AlertDescription className="text-sm">
                                            <strong>⚠️ Attention :</strong> La désactivation de certains cookies peut affecter le fonctionnement du site
                                            et limiter l'accès à certaines fonctionnalités.
                                        </AlertDescription>
                                    </Alert>
                                </div>
                            </section>

                            {/* Durée de conservation */}
                            <section>
                                <h2 className="text-2xl font-bold text-primary mb-4">
                                    Durée de Conservation
                                </h2>
                                <div className="space-y-3 text-muted-foreground">
                                    <p className="flex items-start gap-2">
                                        <span className="text-primary mt-1">•</span>
                                        <span><strong className="text-foreground">Cookies de session :</strong> Supprimés à la fermeture du navigateur</span>
                                    </p>
                                    <p className="flex items-start gap-2">
                                        <span className="text-primary mt-1">•</span>
                                        <span><strong className="text-foreground">Cookies persistants :</strong> Conservés jusqu'à 12 mois maximum</span>
                                    </p>
                                    <p className="flex items-start gap-2">
                                        <span className="text-primary mt-1">•</span>
                                        <span><strong className="text-foreground">Cookies analytiques :</strong> Conservés jusqu'à 24 mois</span>
                                    </p>
                                </div>
                            </section>

                            {/* Cookies tiers */}
                            <section>
                                <h2 className="text-2xl font-bold text-primary mb-4">
                                    Cookies Tiers
                                </h2>
                                <p className="text-muted-foreground leading-relaxed mb-4">
                                    Certains cookies peuvent être déposés par des services tiers que nous utilisons :
                                </p>
                                <div className="space-y-3 text-muted-foreground">
                                    <p className="flex items-start gap-2">
                                        <span className="text-primary mt-1">•</span>
                                        <span><strong className="text-foreground">Supabase :</strong> Authentification et gestion des sessions</span>
                                    </p>
                                    <p className="flex items-start gap-2">
                                        <span className="text-primary mt-1">•</span>
                                        <span><strong className="text-foreground">Google Analytics :</strong> Statistiques de visite (si activé)</span>
                                    </p>
                                </div>
                                <p className="text-muted-foreground leading-relaxed mt-4">
                                    Ces services ont leurs propres politiques de confidentialité que nous vous invitons à consulter.
                                </p>
                            </section>

                            {/* Contact */}
                            <section>
                                <h2 className="text-2xl font-bold text-primary mb-4">
                                    Questions ?
                                </h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    Pour toute question concernant notre utilisation des cookies, contactez-nous à :{" "}
                                    <a href="mailto:privacy@oneconnexion.fr" className="text-primary hover:underline">
                                        privacy@oneconnexion.fr
                                    </a>
                                </p>
                            </section>

                            {/* Dernière mise à jour */}
                            <section className="pt-8 border-t">
                                <p className="text-sm text-muted-foreground text-center">
                                    <strong>Dernière mise à jour :</strong> 7 décembre 2025
                                </p>
                            </section>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </PublicLayout>
    );
}
