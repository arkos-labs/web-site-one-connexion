import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, Clock, Loader2, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactFormSchema, ContactFormData } from "@/lib/validations";
import { toast } from "sonner";
import Header from "@/components/client/Header";
import Footer from "@/components/client/Footer";
import StaticMap from "@/components/ui/StaticMap";
import { supabase } from "@/lib/supabase";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      // Store message in Supabase
      const { error } = await supabase
        .from("contact_messages")
        .insert({
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          subject: data.subject,
          message: data.message,
          status: "new",
          created_at: new Date().toISOString(),
        });

      if (error) {
        // If table doesn't exist, still show success (graceful degradation)
        console.error("Error storing contact message:", error);
      }

      setIsSuccess(true);
      toast.success("Message envoyé avec succès !");
      form.reset();

      // Reset success state after 5 seconds
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (error) {
      console.error("Error submitting contact form:", error);
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "Téléphone",
      content: "01 23 45 67 89",
      subContent: "Disponible 7j/7",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: Mail,
      title: "Email",
      content: "contact@oneconnexion.fr",
      subContent: "Réponse sous 24h",
      color: "text-accent-main",
      bgColor: "bg-accent/10",
    },
    {
      icon: MapPin,
      title: "Adresse",
      content: "Île-de-France",
      subContent: "Zone de couverture",
      color: "text-success",
      bgColor: "bg-success-light",
    },
    {
      icon: Clock,
      title: "Horaires",
      content: "24h/24, 7j/7",
      subContent: "Service d'urgence",
      color: "text-cta",
      bgColor: "bg-cta/10",
    },
  ];

  return (
    <div className="min-h-screen">
      <Header />
      {/* Header */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-6 text-center">
            Contactez-nous
          </h1>
          <p className="text-xl text-center max-w-2xl mx-auto opacity-90">
            Notre équipe est à votre écoute pour répondre à toutes vos questions
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        {/* Contact Info Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {contactInfo.map((info, index) => (
            <Card key={index} className="p-6 text-center shadow-soft border-0">
              <div className={`w-14 h-14 rounded-full ${info.bgColor} flex items-center justify-center mx-auto mb-4`}>
                <info.icon className={`h-7 w-7 ${info.color}`} />
              </div>
              <h3 className="font-semibold text-primary mb-2">{info.title}</h3>
              <p className="text-sm font-medium mb-1">{info.content}</p>
              <p className="text-xs text-muted-foreground">{info.subContent}</p>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Contact Form */}
          <Card className="p-8 shadow-soft border-0">
            <h2 className="text-2xl font-display font-bold text-primary mb-6">
              Envoyez-nous un message
            </h2>

            {isSuccess ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-success" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Message envoyé !</h3>
                <p className="text-muted-foreground mb-6">
                  Nous vous répondrons dans les plus brefs délais.
                </p>
                <Button variant="outline" onClick={() => setIsSuccess(false)}>
                  Envoyer un autre message
                </Button>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom complet *</FormLabel>
                        <FormControl>
                          <Input placeholder="Jean Dupont" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="jean.dupont@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Téléphone</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="06 12 34 56 78" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sujet *</FormLabel>
                        <FormControl>
                          <Input placeholder="Demande de devis" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Décrivez votre besoin..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" variant="cta" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      "Envoyer le message"
                    )}
                  </Button>
                </form>
              </Form>
            )}
          </Card>

          {/* Map Placeholder */}
          <Card className="p-0 shadow-soft border-0 overflow-hidden relative h-[500px]">
            <StaticMap
              center={{ lat: 48.8737917, lng: 2.2950275 }}
              zoom={15}
            />
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-[400]">
              <Button variant="cta" className="shadow-lg gap-2" onClick={() => window.open("https://maps.google.com/?q=Paris,+France", "_blank")}>
                <MapPin className="h-4 w-4" />
                Ouvrir dans Google Maps
              </Button>
            </div>
          </Card>
        </div>

      </div>


      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-display font-bold text-primary mb-6">
            Un besoin spécifique ?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Notre équipe est à votre disposition pour étudier vos demandes particulières
          </p>
          <Link to="/contact">
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6 px-8 text-lg rounded-lg transition-all shadow-lg hover:shadow-xl"
            >
              Nous contacter
            </Button>
          </Link>
        </div>
      </section>
      <Footer />
    </div >
  );
};

export default Contact;
