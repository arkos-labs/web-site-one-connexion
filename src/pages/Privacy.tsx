import Header from "@/components/client/Header";
import Footer from "@/components/client/Footer";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Shield, Mail, Lock, Eye, Database, Clock, UserCheck, FileText } from "lucide-react";

const Privacy = () => {
    const sections = [
        {
            icon: Database,
            title: "1. Données collectées",
            content: `Nous collectons les données suivantes dans le cadre de notre service de livraison express :

**Données d'identification :**
- Nom, prénom
- Adresse email
- Numéro de téléphone
- Adresse postale (enlèvement et livraison)

**Données professionnelles :**
- Nom de l'entreprise
- SIRET (optionnel)
- Secteur d'activité

**Données de navigation :**
- Adresse IP
- Type de navigateur
- Pages consultées
- Cookies (voir notre politique cookies)`
        },
        {
            icon: Eye,
            title: "2. Finalités du traitement",
            content: `Vos données personnelles sont utilisées pour :

- **Exécution du service** : Gestion de vos commandes, suivi des livraisons, facturation
- **Communication** : Notifications de statut, confirmations, support client
- **Amélioration du service** : Analyses statistiques anonymisées, amélioration de l'expérience utilisateur
- **Marketing** (avec votre consentement) : Offres promotionnelles, newsletter

Nous ne vendons jamais vos données à des tiers.`
        },
        {
            icon: Lock,
            title: "3. Base légale du traitement",
            content: `Le traitement de vos données repose sur :

- **L'exécution du contrat** : Les données nécessaires à la réalisation des livraisons
- **L'intérêt légitime** : Amélioration de nos services, sécurité
- **Le consentement** : Communications marketing, cookies non essentiels
- **L'obligation légale** : Conservation des factures, obligations comptables`
        },
        {
            icon: Clock,
            title: "4. Durée de conservation",
            content: `Vos données sont conservées selon les durées suivantes :

- **Données de compte** : Durée de la relation commerciale + 3 ans
- **Données de commande** : 10 ans (obligations légales comptables)
- **Données de navigation** : 13 mois maximum
- **Cookies** : Selon leur nature (voir politique cookies)

À l'expiration de ces délais, vos données sont supprimées ou anonymisées.`
        },
        {
            icon: UserCheck,
            title: "5. Vos droits",
            content: `Conformément au RGPD, vous disposez des droits suivants :

- **Droit d'accès** : Obtenir une copie de vos données personnelles
- **Droit de rectification** : Corriger des données inexactes
- **Droit à l'effacement** : Demander la suppression de vos données
- **Droit à la portabilité** : Recevoir vos données dans un format structuré
- **Droit d'opposition** : Vous opposer au traitement de vos données
- **Droit à la limitation** : Limiter le traitement de vos données

Pour exercer ces droits, contactez-nous à : **privacy@oneconnexion.fr**`
        },
        {
            icon: Shield,
            title: "6. Sécurité des données",
            content: `Nous mettons en œuvre des mesures de sécurité appropriées :

- Chiffrement SSL/TLS pour toutes les communications
- Stockage sécurisé des données (serveurs certifiés)
- Accès restreint aux données personnelles
- Audits de sécurité réguliers
- Formations de notre personnel à la protection des données

En cas de violation de données, nous vous en informerons dans les 72 heures conformément au RGPD.`
        },
        {
            icon: FileText,
            title: "7. Sous-traitants",
            content: `Nos sous-traitants autorisés :

- **Supabase** : Hébergement et base de données (UE)
- **Stripe** : Traitement des paiements (certifié PCI-DSS)
- **SendGrid** : Envoi d'emails transactionnels

Tous nos sous-traitants sont soumis à des obligations contractuelles garantissant la protection de vos données.`
        },
        {
            icon: Mail,
            title: "8. Contact",
            content: `Pour toute question relative à la protection de vos données :

**Responsable du traitement :**
One Connexion Express
Email : privacy@oneconnexion.fr
Téléphone : 01 XX XX XX XX

**Délégué à la Protection des Données (DPO) :**
Email : dpo@oneconnexion.fr

**Autorité de contrôle :**
Vous pouvez introduire une réclamation auprès de la CNIL :
www.cnil.fr`
        }
    ];

    return (
        <div className="min-h-screen font-sans">
            <Header />

            {/* Hero Section */}
            <section className="bg-primary text-primary-foreground py-20">
                <div className="container mx-auto px-4 text-center">
                    <Badge className="mb-4 bg-cta text-cta-foreground hover:bg-cta/90">RGPD</Badge>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 font-display">
                        Politique de confidentialité
                    </h1>
                    <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
                        Votre vie privée est importante pour nous. Découvrez comment nous collectons,
                        utilisons et protégeons vos données personnelles.
                    </p>
                    <p className="text-sm text-primary-foreground/60 mt-4">
                        Dernière mise à jour : 6 décembre 2025
                    </p>
                </div>
            </section>

            {/* Content */}
            <section className="py-16 bg-secondary/30">
                <div className="container mx-auto px-4 max-w-4xl">
                    <Card className="p-8 mb-8 border-0 shadow-soft bg-white">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <Shield className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-primary mb-2">Notre engagement</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    One Connexion Express s'engage à protéger la vie privée de ses utilisateurs
                                    conformément au Règlement Général sur la Protection des Données (RGPD)
                                    et à la loi Informatique et Libertés. Cette politique détaille nos pratiques
                                    en matière de collecte et de traitement des données personnelles.
                                </p>
                            </div>
                        </div>
                    </Card>

                    <div className="space-y-6">
                        {sections.map((section, index) => (
                            <Card key={index} className="p-6 border-0 shadow-soft bg-white">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <section.icon className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-primary mb-3">{section.title}</h3>
                                        <div className="text-muted-foreground prose prose-sm max-w-none">
                                            {section.content.split('\n').map((paragraph, pIndex) => {
                                                if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                                                    return <p key={pIndex} className="font-semibold text-foreground mt-3 mb-1">{paragraph.replace(/\*\*/g, '')}</p>;
                                                }
                                                if (paragraph.startsWith('- ')) {
                                                    return <li key={pIndex} className="ml-4">{paragraph.substring(2).replace(/\*\*/g, '')}</li>;
                                                }
                                                if (paragraph.trim()) {
                                                    return <p key={pIndex} className="mb-2">{paragraph.replace(/\*\*/g, '')}</p>;
                                                }
                                                return null;
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Privacy;
