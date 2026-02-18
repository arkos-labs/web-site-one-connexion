import PublicHeader from "../components/PublicHeader.jsx";
import PublicFooter from "../components/PublicFooter.jsx";
import { Mail, Phone, MapPin, Clock, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export default function Contact() {
  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      <main className="blog-page">
        <p className="text-xs text-slate-500">Publié le <time dateTime="2026-01-23">23/01/2026</time> • Par One Connexion</p>
        <h1>Contact — Devis coursier express Paris & Île‑de‑France</h1>
        <p>
          Besoin d’un devis pour un coursier express à Paris ou en Île‑de‑France ?
          Notre équipe B2B répond rapidement et vous propose une solution adaptée à votre volume,
          votre secteur et vos délais.
        </p>

        <h2>Pourquoi nous contacter</h2>
        <ul>
          <li>Demande de devis immédiat pour une course urgente.</li>
          <li>Mise en place de tournées régulières ou navettes inter‑sites.</li>
          <li>Ouverture d’un compte pro avec facturation mensuelle.</li>
          <li>Besoin d’un interlocuteur dédié pour un flux récurrent.</li>
        </ul>

        <h2>Informations pratiques</h2>
        <p><strong>Email :</strong> contact@oneconnexion.fr</p>
        <p><strong>Téléphone :</strong> 01 00 00 00 00</p>
        <p><strong>Zone :</strong> Paris & Île‑de‑France</p>
        <p><strong>Disponibilité :</strong> 7j/7 selon besoins B2B</p>

        <h2>Formulaire</h2>
        <p>
          Utilisez le formulaire ci‑dessous pour une réponse rapide. Indiquez le type de course,
          la fréquence et l’urgence afin que nous puissions vous proposer la solution la plus adaptée.
        </p>

        <div className="mt-8 rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
          <form className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Nom</label>
                <input type="text" placeholder="Votre nom" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Entreprise</label>
                <input type="text" placeholder="Nom de l'entreprise" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all" />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Email</label>
                <input type="email" placeholder="nom@entreprise.com" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Téléphone</label>
                <input type="tel" placeholder="06 00 00 00 00" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Sujet</label>
              <input type="text" placeholder="Ex: Devis course urgente" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Message</label>
              <textarea rows={5} placeholder="Expliquez votre besoin..." className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all resize-none" />
            </div>

            <button type="button" className="w-full rounded-full bg-slate-900 py-4 text-sm font-bold text-white shadow-lg shadow-slate-900/20 transition-all hover:bg-slate-800 hover:shadow-xl">
              Envoyer
            </button>
          </form>
        </div>

        <h2 className="mt-10">Réseaux</h2>
        <div className="mt-4 flex gap-4 text-slate-500">
          <Facebook size={20} />
          <Twitter size={20} />
          <Instagram size={20} />
          <Linkedin size={20} />
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
