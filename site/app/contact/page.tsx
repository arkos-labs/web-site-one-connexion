"use client";

import React, { useState } from "react";
import { Mail, Phone, MapPin, Clock, ArrowRight, Send } from "lucide-react";
import { PHONE_DISPLAY, PHONE_TEL, EMAIL, LEGAL } from "@/lib/site-content";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulation d'envoi
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: "", email: "", company: "", message: "" });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFB]">
      
      {/* ── HEADER HERO ── */}
      <section className="relative overflow-hidden bg-ink py-20 text-white lg:py-28">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        <div className="relative mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-accent"></span>
            Assistance 7j/7
          </div>
          <h1 className="mb-6 text-[clamp(2.5rem,5vw,4rem)] font-extrabold leading-[1.05] tracking-tight text-white">
            Contactez <span className="text-accent">Nous</span>.
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-white/60 md:text-xl">
            Une urgence, une question sur nos services ou un besoin sur-mesure ? Notre équipe de régulation est à votre écoute pour vous apporter une solution immédiate.
          </p>
        </div>
      </section>

      {/* ── CONTENT SECTION ── */}
      <section className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-16 lg:py-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.5fr_1fr] lg:gap-20">
          
          {/* Formulaire */}
          <div className="rounded-2xl border border-line bg-white p-6 shadow-xl shadow-ink/5 sm:p-10">
            <h2 className="mb-2 text-2xl font-bold text-ink">Envoyez-nous un message</h2>
            <p className="mb-8 text-sm text-muted">Nous vous répondrons dans les plus brefs délais.</p>
            
            {isSubmitted ? (
              <div className="flex flex-col items-center justify-center rounded-xl bg-green-50 px-6 py-12 text-center text-green-700">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <Send size={24} className="text-green-600" />
                </div>
                <h3 className="mb-2 text-lg font-bold">Message Envoyé !</h3>
                <p className="text-sm">Notre équipe de régulation a bien reçu votre demande et vous contactera rapidement.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-ink">Nom complet</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-[6px] border border-line bg-paper px-4 py-3.5 text-[14px] text-ink placeholder:text-label/60 transition-colors focus:border-accent focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/15"
                      placeholder="Jean Dupont"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-ink">Société</label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full rounded-[6px] border border-line bg-paper px-4 py-3.5 text-[14px] text-ink placeholder:text-label/60 transition-colors focus:border-accent focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/15"
                      placeholder="Nom de votre entreprise"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-ink">Email professionnel</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-[6px] border border-line bg-paper px-4 py-3.5 text-[14px] text-ink placeholder:text-label/60 transition-colors focus:border-accent focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/15"
                    placeholder="jean@entreprise.com"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-ink">Votre demande</label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full resize-y rounded-[6px] border border-line bg-paper px-4 py-3.5 text-[14px] text-ink placeholder:text-label/60 transition-colors focus:border-accent focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/15"
                    placeholder="Décrivez votre besoin de livraison express..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="group mt-4 flex items-center justify-center gap-2 rounded-[6px] bg-accent py-4 text-[14px] font-bold text-white transition-colors hover:bg-accent-dark"
                >
                  Envoyer le message
                  <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" strokeWidth={2.5} />
                </button>
              </form>
            )}
          </div>

          {/* Informations de contact */}
          <div className="flex flex-col justify-start gap-8">
            <div className="flex flex-col rounded-2xl bg-ink p-8 text-white shadow-xl">
              <h3 className="mb-6 text-xl font-bold">Informations directes</h3>
              
              <div className="flex flex-col gap-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent">
                    <Phone size={18} strokeWidth={2.5} />
                  </div>
                  <div>
                    <div className="font-mono text-[11px] uppercase tracking-wider text-white/50">Dispatching / Urgences</div>
                    <a href={`tel:${PHONE_TEL}`} className="mt-1 block text-[17px] font-bold hover:text-accent transition-colors">
                      {PHONE_DISPLAY}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white">
                    <Mail size={18} strokeWidth={2.5} />
                  </div>
                  <div>
                    <div className="font-mono text-[11px] uppercase tracking-wider text-white/50">Email général</div>
                    <a href={`mailto:${EMAIL}`} className="mt-1 block text-[15px] font-medium hover:text-white/80 transition-colors">
                      {EMAIL}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white">
                    <Clock size={18} strokeWidth={2.5} />
                  </div>
                  <div>
                    <div className="font-mono text-[11px] uppercase tracking-wider text-white/50">Horaires d'opération</div>
                    <div className="mt-1 text-[15px] font-medium">7j/7 — 7h00 à 23h00</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white">
                    <MapPin size={18} strokeWidth={2.5} />
                  </div>
                  <div>
                    <div className="font-mono text-[11px] uppercase tracking-wider text-white/50">Siège social</div>
                    <div className="mt-1 text-[15px] font-medium leading-relaxed">
                      {LEGAL.adresse}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
