import PublicHeader from "../../components/PublicHeader.jsx";
import PublicFooter from "../../components/PublicFooter.jsx";
import { Shield, Lock, Eye, FileText } from "lucide-react";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <PublicHeader />

      <section className="pt-32 pb-16 md:pt-48 md:pb-24 bg-white border-b border-slate-100">
        <div className="mx-auto max-w-4xl px-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-12 w-12 bg-orange-50 rounded-2xl flex items-center justify-center text-[#ed5518]">
              <Shield size={24} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 md:text-5xl tracking-tight">
              Confidentialité & Données
            </h1>
          </div>
          <p className="text-xl text-slate-600 leading-relaxed font-light">
            Chez One Connexion, la sécurité de vos informations professionnelles est fondamentale.
            Découvrez comment nous protégeons et utilisons vos données dans le cadre de nos services logistiques.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-4xl px-6 py-20">
        <div className="space-y-16">
          <section>
            <div className="flex items-center gap-3 mb-6 text-slate-900">
              <Eye size={20} className="text-[#ed5518]" />
              <h2 className="text-2xl font-black uppercase tracking-tight">Transparence de la Collecte</h2>
            </div>
            <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed space-y-4">
              <p>Nous collectons uniquement les informations essentielles à la fourniture de nos services de transport express :</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Identification :</strong> Nom, prénom, email professionnel et numéro de téléphone.</li>
                <li><strong>Logistique :</strong> Adresses de prise en charge et de destination, instructions spécifiques de livraison.</li>
                <li><strong>Facturation :</strong> Coordonnées de l'entreprise, numéro de SIRET et références bancaires pour les virements.</li>
              </ul>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-6 text-slate-900">
              <Lock size={20} className="text-[#ed5518]" />
              <h2 className="text-2xl font-black uppercase tracking-tight">Sécurité des Échanges</h2>
            </div>
            <p className="text-slate-600 leading-relaxed mb-4">
              Toutes les données transitant par notre plateforme sont chiffrées (SSL/TLS). Nos bases de données sont hébergées sur des serveurs hautement sécurisés, conformes aux standards européens les plus rigoureux.
            </p>
            <div className="bg-slate-100 p-6 rounded-2xl border border-slate-200 italic text-sm text-slate-500">
              "Nous ne vendons ni n'échangeons jamais vos données à des tiers à des fins commerciales. Vos informations servent exclusivement au bon déroulement de vos courses."
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-6 text-slate-900">
              <FileText size={20} className="text-[#ed5518]" />
              <h2 className="text-2xl font-black uppercase tracking-tight">Vos Droits & Contrôle</h2>
            </div>
            <p className="text-slate-600 leading-relaxed mb-6">
              Conformément au RGPD, vous disposez d'un contrôle total sur vos données personnelles :
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Droit d'accès et de consultation",
                "Droit de rectification immédiate",
                "Droit à l'effacement (Droit à l'oubli)",
                "Droit à la portabilité des données"
              ].map((right, idx) => (
                <div key={idx} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200">
                  <div className="h-2 w-2 bg-[#ed5518] rounded-full" />
                  <span className="text-sm font-bold text-slate-700">{right}</span>
                </div>
              ))}
            </div>
          </section>

          <footer className="pt-12 border-t border-slate-200">
            <p className="text-sm text-slate-500">
              Pour toute question relative à vos données personnelles, contactez notre délégué à la protection des données (DPO) :
              <a href="mailto:privacy@oneconnexion.fr" className="text-[#ed5518] font-bold ml-1 hover:underline">privacy@oneconnexion.fr</a>
            </p>
            <p className="text-xs text-slate-400 mt-4 italic">Dernière mise à jour : 23 février 2026</p>
          </footer>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}




