import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Scale, CheckCircle } from "lucide-react";
import Header from "@/components/client/Header";
import Footer from "@/components/client/Footer";

const Juridique = () => {
    return (
        <div className="min-h-screen font-sans">
            <Header />

            {/* Hero Section */}
            <section className="bg-primary text-primary-foreground py-20">
                <div className="container mx-auto px-4 text-center">
                    <div className="w-20 h-20 mx-auto bg-cta/20 rounded-full flex items-center justify-center mb-6">
                        <Scale className="h-10 w-10 text-cta" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display">Transport Juridique & Confidentiel</h1>
                    <p className="text-xl text-primary-foreground/80 max-w-3xl mx-auto font-medium">
                        Vos documents légaux, protégés et livrés avec rigueur.
                    </p>
                </div>
            </section>

            {/* Content Section - Light bg */}
            <section className="bg-secondary/30 py-20">
                <div className="container mx-auto px-4">

                    {/* Description */}
                    <div className="max-w-4xl mx-auto text-center mb-16">
                        <p className="text-muted-foreground text-lg leading-relaxed">
                            One Connexion accompagne avocats, notaires, huissiers, études et tribunaux dans l’acheminement sécurisé de documents sensibles.
                            <br />
                            Chaque dossier est transporté avec un niveau maximal de confidentialité, de rigueur et d’horodatage.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {/* Services Proposed */}
                        <Card className="p-8 bg-white border-none shadow-lg rounded-xl">
                            <h3 className="text-2xl font-bold text-primary mb-6 font-display">Services proposés</h3>
                            <ul className="space-y-4">
                                {[
                                    "Transport confidentiel de dossiers, actes, scellés, convocations",
                                    "Courses urgentes vers tribunaux, études, cours d’appel",
                                    "Remise sécurisée avec code client obligatoire",
                                    "Horodatage et preuve de livraison",
                                    "Acheminement express pour deadlines légales"
                                ].map((item, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <CheckCircle className="h-5 w-5 text-cta mt-1 flex-shrink-0" />
                                        <span className="text-primary font-medium">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </Card>

                        {/* Why One Connexion */}
                        <Card className="p-8 bg-white border-none shadow-lg rounded-xl">
                            <h3 className="text-2xl font-bold text-primary mb-6 font-display">Pourquoi One Connexion ?</h3>
                            <ul className="space-y-4">
                                {[
                                    "Confidentialité absolue",
                                    "Traçabilité et preuve horodatée",
                                    "Sécurité renforcée",
                                    "Rapidité pour les urgences juridiques",
                                    "Equipe spécialisée dans les secteurs réglementés"
                                ].map((item, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <CheckCircle className="h-5 w-5 text-cta mt-1 flex-shrink-0" />
                                        <span className="text-primary font-medium">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    </div>

                    {/* CTA Section */}
                    <div className="mt-16 text-center space-y-4 sm:space-y-0 sm:space-x-6">
                        <Link to="/contact">
                            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6 px-8 text-lg rounded-lg transition-all shadow-lg hover:shadow-xl min-w-[250px]">
                                Nous contacter
                            </Button>
                        </Link>
                    </div>

                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Juridique;
