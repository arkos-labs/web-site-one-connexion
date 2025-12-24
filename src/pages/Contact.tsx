import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, Clock, Loader2, CheckCircle, ArrowRight } from "lucide-react";
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
        console.error("Error storing contact message:", error);
      }

      setIsSuccess(true);
      toast.success("Message envoyé avec succès !");
      form.reset();
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
      color: "text-[#D4AF37]",
      bgColor: "bg-[#D4AF37]/10",
    },
    {
      icon: Mail,
      title: "Email",
      content: "contact@oneconnexion.fr",
      subContent: "Réponse sous 24h",
      color: "text-[#D4AF37]",
      bgColor: "bg-[#D4AF37]/10",
    },
    {
      icon: MapPin,
      title: "Adresse",
      content: "Île-de-France",
      subContent: "Zone de couverture",
      color: "text-[#D4AF37]",
      bgColor: "bg-[#D4AF37]/10",
    },
    {
      icon: Clock,
      title: "Horaires",
      content: "24h/24, 7j/7",
      subContent: "Service d'urgence",
      color: "text-[#D4AF37]",
      bgColor: "bg-[#D4AF37]/10",
    },
  ];

  return (
    <div className="min-h-screen bg-background font-sans">
      <Header />

      {/* Hero Section */}
      <section className="relative py-24 bg-[#0B1525] text-white overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-radial from-blue-900/20 to-transparent opacity-50 pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 text-xs font-bold uppercase tracking-widest mb-6 animate-fade-in">
            Nous joindre
          </span>
          <h1 className="text-4xl md:text-6xl font-serif mb-6 animate-fade-in-up">
            Contactez <span className="text-[#D4AF37] italic">OneConnexion</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 font-light leading-relaxed animate-fade-in-up delay-100">
            Une question ? Une demande spécifique ? Notre équipe est à votre disposition 24/7 pour vous répondre.
          </p>
        </div>
      </section>

      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-16 -mt-10 relative z-20">

          {/* Contact Info Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {contactInfo.map((info, index) => (
              <Card key={index} className="p-6 text-center border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 bg-white group">
                <div className={`w-14 h-14 rounded-full ${info.bgColor} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  <info.icon className={`h-6 w-6 ${info.color}`} />
                </div>
                <h3 className="font-serif font-bold text-[#0B1525] mb-2">{info.title}</h3>
                <p className="text-sm font-medium text-gray-600 mb-1">{info.content}</p>
                <p className="text-xs text-gray-400 font-light">{info.subContent}</p>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Contact Form */}
            <Card className="p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 bg-white rounded-2xl">
              <div className="mb-8">
                <h2 className="text-2xl font-serif font-bold text-[#0B1525] mb-2">
                  Envoyez-nous un message
                </h2>
                <p className="text-gray-500 font-light">Remplissez le formulaire ci-dessous, nous vous recontacterons rapidement.</p>
              </div>

              {isSuccess ? (
                <div className="flex flex-col items-center justify-center py-12 text-center bg-green-50 rounded-xl border border-green-100">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4 animate-bounce">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-green-800 mb-2">Message envoyé !</h3>
                  <p className="text-green-700/80 mb-6 font-light">
                    Votre demande a bien été prise en compte.<br />Nous vous répondrons dans les plus brefs délais.
                  </p>
                  <Button variant="outline" className="border-green-200 text-green-700 hover:bg-green-100" onClick={() => setIsSuccess(false)}>
                    Envoyer un autre message
                  </Button>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <div className="grid md:grid-cols-2 gap-5">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[#0B1525]">Nom complet *</FormLabel>
                            <FormControl>
                              <Input placeholder="Votre nom" {...field} className="bg-gray-50 border-gray-200 focus:border-[#D4AF37] h-11" />
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
                            <FormLabel className="text-[#0B1525]">Téléphone</FormLabel>
                            <FormControl>
                              <Input type="tel" placeholder="06 12 34 56 78" {...field} className="bg-gray-50 border-gray-200 focus:border-[#D4AF37] h-11" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#0B1525]">Email *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="votre@email.com" {...field} className="bg-gray-50 border-gray-200 focus:border-[#D4AF37] h-11" />
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
                          <FormLabel className="text-[#0B1525]">Sujet *</FormLabel>
                          <FormControl>
                            <Input placeholder="L'objet de votre demande" {...field} className="bg-gray-50 border-gray-200 focus:border-[#D4AF37] h-11" />
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
                          <FormLabel className="text-[#0B1525]">Message *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Détaillez votre besoin..."
                              className="min-h-[150px] bg-gray-50 border-gray-200 focus:border-[#D4AF37] resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full bg-[#0B1525] hover:bg-[#1a2c4e] text-white h-12 text-lg font-medium shadow-lg hover:shadow-xl transition-all rounded-lg" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Envoi en cours...
                        </>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          Envoyer le message <ArrowRight className="w-5 h-5" />
                        </span>
                      )}
                    </Button>
                  </form>
                </Form>
              )}
            </Card>

            {/* Map Placeholder */}
            <Card className="p-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden relative h-[500px] lg:h-auto rounded-2xl group">
              <StaticMap
                center={{ lat: 48.8737917, lng: 2.2950275 }}
                zoom={15}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1525]/60 to-transparent pointer-events-none opacity-60" />
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-[400] w-full px-8 text-center">
                <div className="inline-block p-4 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-white/20">
                  <h4 className="font-serif font-bold text-[#0B1525] mb-1">Siège Social</h4>
                  <p className="text-sm text-gray-500 mb-3">Paris, Île-de-France</p>
                  <Button className="bg-[#D4AF37] hover:bg-[#b5952f] text-white shadow-md w-full" onClick={() => window.open("https://maps.google.com/?q=Paris,+France", "_blank")}>
                    <MapPin className="h-4 w-4 mr-2" />
                    Ouvrir le plan
                  </Button>
                </div>
              </div>
            </Card>
          </div>

        </div>
      </div>
      <Footer />
    </div >
  );
};
export default Contact;
