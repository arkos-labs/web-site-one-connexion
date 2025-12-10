import PublicLayout from "@/layouts/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Calendar, Shield, CreditCard, AlertCircle } from "lucide-react";

export default function CGV() {
  return (
    <PublicLayout>
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-primary mb-4">
              Conditions Générales de Vente
            </h1>
            <p className="text-muted-foreground">
              Dernière mise à jour : 7 décembre 2025
            </p>
          </div>

          <Card className="shadow-lg border-0">
            <CardContent className="p-8 space-y-8">
              {/* Article 1 */}
              <section>
                <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">1</span>
                  Objet
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre <strong>One Connexion</strong>,
                  société spécialisée dans le transport express et la livraison de colis, et ses clients (particuliers ou professionnels).
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  Toute commande implique l'acceptation sans réserve des présentes CGV.
                </p>
              </section>

              {/* Article 2 */}
              <section>
                <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">2</span>
                  Services proposés
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  One Connexion propose les services suivants :
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span><strong>Livraison Standard</strong> : Délai de 2h à 4h</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span><strong>Livraison Express</strong> : Délai de 1h à 2h</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span><strong>Livraison Flash</strong> : Délai de 30 min à 1h</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span><strong>Livraison Véhicule Léger</strong> : Pour colis volumineux</span>
                  </li>
                </ul>
              </section>

              {/* Article 3 */}
              <section>
                <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                  <CreditCard className="h-6 w-6" />
                  Tarifs et Paiement
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Les tarifs sont calculés en fonction de :
                </p>
                <ul className="space-y-2 text-muted-foreground mb-4">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>La distance entre le point de retrait et le point de livraison</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>La formule choisie (Standard, Express, Flash)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Le type de véhicule requis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Les éventuelles majorations (nuit, week-end)</span>
                  </li>
                </ul>
                <p className="text-muted-foreground leading-relaxed">
                  Le paiement s'effectue par carte bancaire, virement ou système de bons.
                  Une facture est émise pour chaque prestation et envoyée par email.
                </p>
              </section>

              {/* Article 4 */}
              <section>
                <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                  <Calendar className="h-6 w-6" />
                  Commande et Exécution
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  <strong>Commande :</strong> Le client peut passer commande via le site web ou par téléphone.
                  Une confirmation est envoyée par email avec le numéro de suivi.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  <strong>Délais :</strong> Les délais indiqués sont donnés à titre indicatif.
                  One Connexion s'engage à respecter au mieux ces délais, mais ne peut être tenu responsable
                  en cas de retard dû à des circonstances indépendantes de sa volonté (trafic, intempéries, etc.).
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  <strong>Suivi :</strong> Le client peut suivre sa commande en temps réel via son espace personnel.
                </p>
              </section>

              {/* Article 5 */}
              <section>
                <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                  <Shield className="h-6 w-6" />
                  Responsabilité et Assurance
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  One Connexion s'engage à transporter les colis avec le plus grand soin.
                  Une assurance couvre les colis jusqu'à <strong>500€</strong> de valeur déclarée.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  <strong>Exclusions :</strong> Ne sont pas couverts :
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-destructive mt-1">✗</span>
                    <span>Les objets de valeur non déclarés</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive mt-1">✗</span>
                    <span>Les denrées périssables</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive mt-1">✗</span>
                    <span>Les matières dangereuses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive mt-1">✗</span>
                    <span>Les emballages non conformes</span>
                  </li>
                </ul>
              </section>

              {/* Article 6 */}
              <section>
                <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                  <AlertCircle className="h-6 w-6" />
                  Annulation et Réclamations
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  <strong>Annulation :</strong> Toute annulation doit être notifiée au moins 30 minutes avant
                  l'heure de retrait prévue. Passé ce délai, des frais d'annulation de 50% du montant de la course seront appliqués.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  <strong>Réclamations :</strong> Toute réclamation doit être formulée par écrit dans les 48h
                  suivant la livraison à l'adresse : <a href="mailto:reclamations@oneconnexion.fr" className="text-primary hover:underline">reclamations@oneconnexion.fr</a>
                </p>
              </section>

              {/* Article 7 */}
              <section>
                <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">7</span>
                  Protection des Données
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Les données personnelles collectées sont utilisées uniquement pour la gestion des commandes
                  et la facturation. Conformément au RGPD, le client dispose d'un droit d'accès, de rectification
                  et de suppression de ses données. Pour plus d'informations, consultez notre{" "}
                  <a href="/politique-confidentialite" className="text-primary hover:underline">Politique de Confidentialité</a>.
                </p>
              </section>

              {/* Article 8 */}
              <section>
                <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">8</span>
                  Droit Applicable
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Les présentes CGV sont soumises au droit français. En cas de litige, une solution amiable sera
                  recherchée avant toute action judiciaire. À défaut, les tribunaux français seront seuls compétents.
                </p>
              </section>

              {/* Contact */}
              <section className="pt-8 border-t">
                <h3 className="text-xl font-bold text-primary mb-4">Contact</h3>
                <div className="space-y-2 text-muted-foreground">
                  <p><strong>One Connexion</strong></p>
                  <p>Email : <a href="mailto:contact@oneconnexion.fr" className="text-primary hover:underline">contact@oneconnexion.fr</a></p>
                  <p>Téléphone : <a href="tel:+33123456789" className="text-primary hover:underline">01 23 45 67 89</a></p>
                </div>
              </section>
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
}
