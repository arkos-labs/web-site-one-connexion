import PublicLayout from "@/layouts/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Cookie, Settings, Shield, Eye, Trash2 } from "lucide-react";

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
              Dernière mise à jour : 7 décembre 2025
            </p>
          </div>

          <Card className="shadow-lg border-0">
            <CardContent className="p-8 space-y-8">
              {/* Qu'est-ce qu'un cookie */}
              <section>
                <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                  <Cookie className="h-6 w-6" />
                  Qu'est-ce qu'un cookie ?
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Un cookie est un petit fichier texte déposé sur votre ordinateur, tablette ou smartphone
                  lors de la visite d'un site internet. Il permet au site de mémoriser des informations sur
                  votre visite, comme votre langue préférée et d'autres paramètres.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Les cookies facilitent votre prochaine visite et rendent le site plus utile pour vous.
                </p>
              </section>

              {/* Types de cookies */}
              <section>
                <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                  <Settings className="h-6 w-6" />
                  Types de cookies utilisés
                </h2>

                {/* Cookies essentiels */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    1. Cookies essentiels (obligatoires)
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-2">
                    Ces cookies sont nécessaires au fonctionnement du site et ne peuvent pas être désactivés.
                  </p>
                  <ul className="space-y-2 text-muted-foreground ml-4">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span><strong>Authentification</strong> : Maintenir votre session connectée</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span><strong>Sécurité</strong> : Protection contre les attaques CSRF</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span><strong>Panier</strong> : Mémoriser vos commandes en cours</span>
                    </li>
                  </ul>
                </div>

                {/* Cookies fonctionnels */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    2. Cookies fonctionnels (optionnels)
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-2">
                    Ces cookies améliorent votre expérience utilisateur.
                  </p>
                  <ul className="space-y-2 text-muted-foreground ml-4">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span><strong>Préférences</strong> : Langue, devise, thème</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span><strong>Localisation</strong> : Adresses récentes pour faciliter les commandes</span>
                    </li>
                  </ul>
                </div>

                {/* Cookies analytiques */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    3. Cookies analytiques (optionnels)
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-2">
                    Ces cookies nous aident à comprendre comment vous utilisez le site.
                  </p>
                  <ul className="space-y-2 text-muted-foreground ml-4">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span><strong>Google Analytics</strong> : Statistiques de visite anonymisées</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span><strong>Performance</strong> : Temps de chargement, erreurs techniques</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Cookies tiers */}
              <section>
                <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                  <Eye className="h-6 w-6" />
                  Cookies tiers
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Certains cookies sont déposés par des services tiers que nous utilisons :
                </p>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <div>
                      <strong className="text-foreground">Google Analytics</strong>
                      <br />
                      <span className="text-sm">Analyse d'audience et statistiques de visite</span>
                      <br />
                      <a
                        href="https://policies.google.com/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm"
                      >
                        Politique de confidentialité Google
                      </a>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <div>
                      <strong className="text-foreground">Supabase</strong>
                      <br />
                      <span className="text-sm">Authentification et base de données</span>
                      <br />
                      <a
                        href="https://supabase.com/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm"
                      >
                        Politique de confidentialité Supabase
                      </a>
                    </div>
                  </li>
                </ul>
              </section>

              {/* Gestion des cookies */}
              <section>
                <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                  <Settings className="h-6 w-6" />
                  Gérer vos préférences
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Vous pouvez à tout moment modifier vos préférences de cookies :
                </p>

                <div className="space-y-4">
                  {/* Via le navigateur */}
                  <div className="bg-primary/5 p-4 rounded-lg">
                    <h3 className="font-semibold text-foreground mb-2">Via votre navigateur</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Vous pouvez configurer votre navigateur pour refuser les cookies :
                    </p>
                    <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                      <li>• <strong>Chrome</strong> : Paramètres → Confidentialité et sécurité → Cookies</li>
                      <li>• <strong>Firefox</strong> : Options → Vie privée et sécurité → Cookies</li>
                      <li>• <strong>Safari</strong> : Préférences → Confidentialité → Cookies</li>
                      <li>• <strong>Edge</strong> : Paramètres → Cookies et autorisations</li>
                    </ul>
                  </div>

                  {/* Suppression */}
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Trash2 className="h-5 w-5 text-amber-600 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-amber-900 mb-1">Supprimer les cookies</h3>
                        <p className="text-sm text-amber-800">
                          Vous pouvez supprimer tous les cookies déjà déposés sur votre appareil via
                          les paramètres de votre navigateur. Attention : cela vous déconnectera du site.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Durée de conservation */}
              <section>
                <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                  <Shield className="h-6 w-6" />
                  Durée de conservation
                </h2>
                <div className="space-y-2 text-muted-foreground">
                  <p className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span><strong>Cookies de session</strong> : Supprimés à la fermeture du navigateur</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span><strong>Cookies persistants</strong> : Conservés jusqu'à 13 mois maximum</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span><strong>Cookies analytiques</strong> : Conservés jusqu'à 26 mois (Google Analytics)</span>
                  </p>
                </div>
              </section>

              {/* Contact */}
              <section className="pt-8 border-t">
                <h3 className="text-xl font-bold text-primary mb-4">Questions ?</h3>
                <div className="space-y-2 text-muted-foreground">
                  <p>
                    Pour toute question concernant notre utilisation des cookies, contactez-nous :
                  </p>
                  <p>
                    <strong>Email :</strong>{" "}
                    <a href="mailto:privacy@oneconnexion.fr" className="text-primary hover:underline">
                      privacy@oneconnexion.fr
                    </a>
                  </p>
                </div>
              </section>
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
}
