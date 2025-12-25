import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Quote } from "lucide-react";
import Header from "@/components/client/Header";
import Footer from "@/components/client/Footer";
import SEO from "@/components/SEO";

const Reviews = () => {
    const reviews = [
        {
            name: "Sophie Martin",
            role: "Directrice Logistique",
            company: "MediLab Paris",
            content: "Un service irréprochable pour nos transports d'échantillons. La traçabilité est parfaite et les chauffeurs sont très professionnels.",
            rating: 5,
            date: "Il y a 2 jours"
        },
        {
            name: "Thomas Dubois",
            role: "Avocat Associé",
            company: "Cabinet Dubois & Co",
            content: "Rapidité et confidentialité. C'est exactement ce dont nous avons besoin pour nos dossiers urgents vers les tribunaux.",
            rating: 5,
            date: "Il y a 1 semaine"
        },
        {
            name: "Julie Leroy",
            role: "Event Manager",
            company: "Events Pro",
            content: "One Connexion nous a sauvés sur plusieurs événements. Leur réactivité est impressionnante, même le dimanche !",
            rating: 5,
            date: "Il y a 2 semaines"
        },
        {
            name: "Karim Benali",
            role: "Gérant",
            company: "Garage Auto Express",
            content: "Livraison de pièces en moins de 2h comme promis. Ça nous permet de ne pas bloquer les véhicules de nos clients.",
            rating: 4,
            date: "Il y a 3 semaines"
        },
        {
            name: "Claire Moreau",
            role: "Assistante de Direction",
            company: "Tech Solutions",
            content: "Interface de commande super simple et facturation claire. Je recommande vivement pour les entreprises.",
            rating: 5,
            date: "Il y a 1 mois"
        },
        {
            name: "Pierre Durand",
            role: "Architecte",
            company: "ArchiDesign",
            content: "Service fiable pour l'envoi de maquettes fragiles. Tout est arrivé en parfait état.",
            rating: 5,
            date: "Il y a 1 mois"
        }
    ];

    return (
        <div className="min-h-screen font-sans">
            <SEO
                title="Avis Clients - One Connexion"
                description="Découvrez les témoignages de nos clients professionnels. Plus de 500 avis positifs sur la qualité, la rapidité et la fiabilité de nos livraisons."
                keywords="Témoignages clients B2B transport, Note One Connexion Google, Références clients logistique, Avis service livraison express, Recommandation transporteur paris, Satisfaction client logistique"
            />
            <Header />

            {/* Hero Section */}
            <section className="bg-primary text-primary-foreground py-20">
                <div className="container mx-auto px-4 text-center">
                    <Badge className="mb-4 bg-cta text-cta-foreground hover:bg-cta/90">Témoignages</Badge>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 font-display">Ils nous font confiance</h1>
                    <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
                        Découvrez ce que nos clients disent de nous. La satisfaction client est notre priorité absolue.
                    </p>
                    <div className="mt-8 flex items-center justify-center gap-2">
                        <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} className="w-6 h-6 text-cta fill-cta" />
                            ))}
                        </div>
                        <span className="text-lg font-bold">4.9/5</span>
                        <span className="text-primary-foreground/60">(+500 avis)</span>
                    </div>
                </div>
            </section>

            {/* Reviews Grid */}
            <section className="py-20 bg-secondary/30">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {reviews.map((review, index) => (
                            <Card key={index} className="p-8 border-none shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full bg-white">
                                <div className="mb-6">
                                    <Quote className="w-10 h-10 text-primary/10 mb-4" />
                                    <p className="text-gray-600 italic leading-relaxed mb-6">
                                        "{review.content}"
                                    </p>
                                </div>
                                <div className="mt-auto flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center text-primary font-bold text-lg">
                                        {review.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-primary">{review.name}</h4>
                                        <p className="text-sm text-muted-foreground">{review.role}</p>
                                        <p className="text-xs text-cta font-medium">{review.company}</p>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm">
                                    <div className="flex">
                                        {[...Array(review.rating)].map((_, i) => (
                                            <Star key={i} className="w-4 h-4 text-cta fill-cta" />
                                        ))}
                                    </div>
                                    <span className="text-gray-400">{review.date}</span>
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

export default Reviews;
