import PublicLayout from "@/layouts/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, User, Globe, Shield, Mail, Phone } from "lucide-react";
import SEO from "@/components/SEO";

export default function MentionsLegales() {
  return (
    <PublicLayout>
      <SEO
        title="Mentions Légales - One Connexion"
        description="Consultez nos mentions légales. Informations sur l'éditeur du site, l'hébergement, la propriété intellectuelle et la protection des données (RGPD)."
        keywords="Mentions légales société transport, Informations juridiques One Connexion, Éediteur site logistique, Hébergement données transport, Propriété intellectuelle site web transport"
      />
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-primary mb-4">
              Mentions Légales
            </h1>
            <p className="text-muted-foreground">
              Informations légales concernant One Connexion
            </p>
          </div>

          <Card className="shadow-lg border-0">
            <CardContent className="p-8 space-y-8">
              {/* Éditeur du site */}
              <section>
                <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                  <Building2 className="h-6 w-6" />
                  Éditeur du Site
                </h2>
                <div className="space-y-3 text-muted-foreground">
                  <p><strong className="text-foreground">Raison sociale :</strong> One Connexion</p>
                  <p><strong className="text-foreground">Forme juridique :</strong> SAS (Société par Actions Simplifiée)</p>
                  <p><strong className="text-foreground">Capital social :</strong> 10 000 €</p>
                  <p><strong className="text-foreground">SIRET :</strong> 123 456 789 00012</p>
                  <p><strong className="text-foreground">N° TVA intracommunautaire :</strong> FR12 123456789</p>
                  <p><strong className="text-foreground">Siège social :</strong> 123 Avenue des Champs-Élysées, 75008 Paris, France</p>
                </div>
              </section>

              {/* Directeur de publication */}
              <section>
                <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                  <User className="h-6 w-6" />
                  Directeur de Publication
                </h2>
                <p className="text-muted-foreground">
                  <strong className="text-foreground">Nom :</strong> M. Jean Dupont<br />
                  <strong className="text-foreground">Fonction :</strong> Président
                </p>
              </section>

              {/* Contact */}
              <section>
                <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                  <Mail className="h-6 w-6" />
                  Contact
                </h2>
                <div className="space-y-3 text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary" />
                    <span><strong className="text-foreground">Email :</strong>{" "}
                      <a href="mailto:contact@oneconnexion.fr" className="text-primary hover:underline">
                        contact@oneconnexion.fr
                      </a></span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary" />
                    <span><strong className="text-foreground">Téléphone :</strong>{" "}
                      <a href="tel:+33123456789" className="text-primary hover:underline">
                        01 23 45 67 89
                      </a></span>
                  </p>
                </div>
              </section>

              {/* Hébergeur */}
              <section>
                <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                  <Globe className="h-6 w-6" />
                  Hébergement
                </h2>
                <div className="space-y-3 text-muted-foreground">
                  <p><strong className="text-foreground">Hébergeur :</strong> Vercel Inc.</p>
                  <p><strong className="text-foreground">Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, USA</p>
                  <p><strong className="text-foreground">Site web :</strong>{" "}
                    <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      vercel.com
                    </a>
                  </p>
                </div>
              </section>

              {/* Base de données */}
              <section>
                <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                  <Shield className="h-6 w-6" />
                  Base de Données
                </h2>
                <div className="space-y-3 text-muted-foreground">
                  <p><strong className="text-foreground">Service :</strong> Supabase</p>
                  <p><strong className="text-foreground">Localisation :</strong> Union Européenne (conformité RGPD)</p>
                  <p><strong className="text-foreground">Site web :</strong>{" "}
                    <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      supabase.com
                    </a>
                  </p>
                </div>
              </section>

              {/* Propriété intellectuelle */}
              <section>
                <h2 className="text-2xl font-bold text-primary mb-4">
                  Propriété Intellectuelle
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  L'ensemble du contenu de ce site (textes, images, logos, graphismes, vidéos, etc.) est la propriété
                  exclusive de <strong>One Connexion</strong> ou de ses partenaires.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Toute reproduction, représentation, modification, publication ou adaptation de tout ou partie des
                  éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite sans l'autorisation
                  écrite préalable de One Connexion.
                </p>
              </section>

              {/* Données personnelles */}
              <section>
                <h2 className="text-2xl font-bold text-primary mb-4">
                  Protection des Données Personnelles
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés,
                  vous disposez d'un droit d'accès, de rectification, de suppression et d'opposition aux données personnelles
                  vous concernant.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Pour exercer ces droits ou pour toute question sur le traitement de vos données, contactez-nous à :{" "}
                  <a href="mailto:dpo@oneconnexion.fr" className="text-primary hover:underline">
                    dpo@oneconnexion.fr
                  </a>
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  Pour plus d'informations, consultez notre{" "}
                  <a href="/politique-confidentialite" className="text-primary hover:underline">
                    Politique de Confidentialité
                  </a>.
                </p>
              </section>

              {/* Cookies */}
              <section>
                <h2 className="text-2xl font-bold text-primary mb-4">
                  Cookies
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Ce site utilise des cookies pour améliorer l'expérience utilisateur et analyser le trafic.
                  Vous pouvez gérer vos préférences de cookies à tout moment.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  Pour plus d'informations, consultez notre{" "}
                  <a href="/cookies" className="text-primary hover:underline">
                    Politique de Cookies
                  </a>.
                </p>
              </section>

              {/* Responsabilité */}
              <section>
                <h2 className="text-2xl font-bold text-primary mb-4">
                  Limitation de Responsabilité
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  One Connexion s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur ce site.
                  Toutefois, One Connexion ne peut garantir l'exactitude, la précision ou l'exhaustivité des informations
                  mises à disposition sur ce site.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  One Connexion ne pourra être tenu responsable des dommages directs ou indirects résultant de l'accès
                  au site ou de l'utilisation du site, y compris l'inaccessibilité, les pertes de données, détériorations,
                  destructions ou virus qui pourraient affecter l'équipement informatique de l'utilisateur.
                </p>
              </section>

              {/* Droit applicable */}
              <section>
                <h2 className="text-2xl font-bold text-primary mb-4">
                  Droit Applicable et Juridiction
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Les présentes mentions légales sont régies par le droit français. En cas de litige et à défaut d'accord
                  amiable, le litige sera porté devant les tribunaux français conformément aux règles de compétence en vigueur.
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
