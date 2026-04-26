import { useState } from "react";
import { Bell, CreditCard } from "lucide-react";

export default function Settings() {
  const [billingOpen, setBillingOpen] = useState(false);
  const [billingMethod, setBillingMethod] = useState("card");
  const [rib, setRib] = useState("FR76 3000 4000 1200 0000 0000 123");
  const [cardMasked] = useState("**** **** **** 1234");

  return (
    <div className="font-body pb-20">
      <header className="mb-16 space-y-4 border-b border-noir/5 pb-10">
        <h1 className="text-6xl font-display italic text-noir leading-none">
          Paramètres <span className="text-[#ed5518]">globaux.</span>
        </h1>
        <p className="text-noir/40 font-medium tracking-[0.1em]">Personnalisez votre interface et vos préférences de service.</p>
      </header>

      <div className="grid gap-12 max-w-4xl">
        <SettingsCard icon={Bell} title="Notifications" desc="Configurez vos alertes de suivi en temps réel.">
          <div className="space-y-4">
            <Toggle label="Alerte de prise en charge" defaultChecked />
            <Toggle label="Confirmation de livraison" defaultChecked />
            <Toggle label="Rapports mensuels automatiques" />
          </div>
        </SettingsCard>

        <SettingsCard icon={CreditCard} title="Facturation" desc="Gérez vos méthodes de paiement et vos cycles de facturation.">
          <div className="space-y-4">
            <Toggle label="Génération automatique des factures" defaultChecked />
            <Toggle label="Envoi par email sécurisé" defaultChecked />

            <div className="mt-8 p-10 rounded-[2rem] border border-noir/5 bg-noir/[0.01] space-y-6">
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-noir/30">Mode de règlement actif</p>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-16 bg-noir flex items-center justify-center rounded-lg">
                    <div className="h-4 w-4 rounded-full bg-white/20"></div>
                  </div>
                  <div>
                    <p className="text-lg font-display italic text-noir">
                      {billingMethod === "card" ? "Carte Bancaire" : "Virement (RIB)"}
                    </p>
                    <p className="text-[10px] font-medium text-noir/40 tracking-wider">
                      {billingMethod === "card" ? `Se termine par ${cardMasked.slice(-4)}` : "Prélèvement SEPA actif"}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setBillingOpen(true)}
                className="w-full py-4 text-[10px] font-bold uppercase tracking-[0.2em] bg-white border border-noir/10 rounded-xl hover:border-noir/30 hover:bg-noir hover:text-white transition-all shadow-sm"
              >
                Modifier les coordonnées bancaires
              </button>
            </div>
          </div>
        </SettingsCard>
      </div>

      {billingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-noir/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-[2.5rem] bg-white p-12 border border-noir/5 shadow-2xl space-y-10 relative">
            <button
              onClick={() => setBillingOpen(false)}
              className="absolute top-10 right-10 text-noir/20 hover:text-noir transition-colors"
            >
              <span className="text-[10px] font-bold uppercase tracking-widest">Fermer</span>
            </button>

            <header className="space-y-2">
              <h3 className="text-4xl font-display italic text-noir leading-none">Paiement.</h3>
              <p className="text-xs text-noir/40 font-medium tracking-wide">Sélectionnez votre méthode de règlement préférée.</p>
            </header>

            <div className="grid gap-4">
              <label
                className={`flex items-start justify-between p-8 rounded-3xl border transition-all cursor-pointer ${billingMethod === "card" ? "border-noir bg-noir/[0.02]" : "border-noir/5 hover:border-noir/20"
                  }`}
                onClick={() => setBillingMethod("card")}
              >
                <div className="space-y-1">
                  <p className="text-sm font-bold uppercase tracking-widest text-noir">Carte bancaire</p>
                  <p className="text-xs text-noir/40">Débit immédiat après chaque course.</p>
                </div>
                <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${billingMethod === "card" ? "border-[#ed5518]" : "border-noir/10"
                  }`}>
                  {billingMethod === "card" && <div className="h-3 w-3 rounded-full bg-[#ed5518]"></div>}
                </div>
              </label>

              <label
                className={`flex items-start justify-between p-8 rounded-3xl border transition-all cursor-pointer ${billingMethod === "rib" ? "border-noir bg-noir/[0.02]" : "border-noir/5 hover:border-noir/20"
                  }`}
                onClick={() => setBillingMethod("rib")}
              >
                <div className="space-y-1">
                  <p className="text-sm font-bold uppercase tracking-widest text-noir">Virement (RIB)</p>
                  <p className="text-xs text-noir/40">Prélèvement mensuel sur votre compte.</p>
                </div>
                <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${billingMethod === "rib" ? "border-[#ed5518]" : "border-noir/10"
                  }`}>
                  {billingMethod === "rib" && <div className="h-3 w-3 rounded-full bg-[#ed5518]"></div>}
                </div>
              </label>

              {billingMethod === "rib" && (
                <div className="px-2 pt-2 animate-in fade-in slide-in-from-top-2">
                  <input
                    className="w-full bg-noir/[0.02] border border-noir/5 rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:border-[#ed5518]/30 transition-all font-mono"
                    value={rib}
                    onChange={(e) => setRib(e.target.value)}
                    placeholder="IBAN / SWIFT"
                  />
                </div>
              )}
            </div>

            <p className="text-[10px] leading-relaxed text-noir/20 font-medium tracking-wide">
              * Confidentialité : vos données bancaires sont cryptées et traitées par notre partenaire sécurisé. Les gestionnaires One Connexion n'ont jamais accès à vos numéros de carte.
            </p>

            <div className="flex justify-end gap-6 pt-4">
              <button
                onClick={() => setBillingOpen(false)}
                className="text-[10px] font-bold uppercase tracking-widest text-noir/30 hover:text-noir transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => setBillingOpen(false)}
                className="px-10 py-5 rounded-xl bg-noir text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#ed5518] transition-all shadow-xl shadow-noir/20"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SettingsCard({ icon: Icon, title, desc, children }) {
  return (
    <div className="bg-white rounded-[2.5rem] border border-noir/5 p-12 space-y-10 shadow-sm overflow-hidden group">
      <div className="flex items-start justify-between gap-10">
        <div className="space-y-2">
          <h2 className="text-3xl font-display italic text-noir leading-none group-hover:text-[#ed5518] transition-colors">{title}</h2>
          <p className="text-sm text-noir/40 leading-relaxed font-body italic">{desc}</p>
        </div>
        <div className="h-16 w-16 shrink-0 rounded-2xl bg-noir/[0.02] border border-noir/5 flex items-center justify-center text-noir/10 group-hover:bg-[#ed5518]/5 group-hover:text-[#ed5518] transition-all">
          <Icon size={24} strokeWidth={1} />
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Toggle({ label, defaultChecked }) {
  return (
    <label className="flex items-center justify-between p-6 rounded-2xl border border-noir/5 hover:border-noir/10 cursor-pointer group transition-all">
      <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-noir/40 group-hover:text-noir transition-colors">{label}</span>
      <div className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" className="sr-only peer" defaultChecked={defaultChecked} />
        <div className="w-11 h-6 bg-noir/[0.05] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-noir/10 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ed5518]"></div>
      </div>
    </label>
  );
}


