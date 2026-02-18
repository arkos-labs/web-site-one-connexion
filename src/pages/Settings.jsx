import { useState } from "react";
import { Bell, CreditCard } from "lucide-react";

export default function Settings() {
  const [billingOpen, setBillingOpen] = useState(false);
  const [billingMethod, setBillingMethod] = useState("card");
  const [rib, setRib] = useState("FR76 3000 4000 1200 0000 0000 123");
  const [cardMasked, setCardMasked] = useState("**** **** **** 1234");

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-4xl font-extrabold text-slate-900">Paramètres ⚙️</h1>
        <p className="mt-2 text-base font-medium text-slate-500">Personnalisez votre expérience One Connexion.</p>
      </header>

      <div className="grid gap-6">
        <SettingsCard icon={Bell} title="Notifications" desc="Gérez les alertes email et SMS">
          <Toggle label="Alertes commandes" defaultChecked />
          <Toggle label="Factures mensuelles" defaultChecked />
          <Toggle label="Rappels de paiement" />
        </SettingsCard>

        <SettingsCard icon={CreditCard} title="Facturation" desc="Préférences de paiement et factures">
          <Toggle label="Facture mensuelle automatique" defaultChecked />
          <Toggle label="Envoi facture par email" defaultChecked />
          <div className="flex flex-col gap-3 rounded-2xl bg-slate-50 px-4 py-4">
            <div className="text-sm font-semibold text-slate-700">Paiement automatique</div>
            <div className="text-xs text-slate-500">Choisissez une méthode pour payer automatiquement votre consommation.</div>
            <div className="flex flex-wrap gap-2">
              <button className={`rounded-full px-4 py-2 text-xs font-bold ring-1 ${billingMethod === "card" ? "bg-slate-900 text-white ring-slate-900" : "bg-white text-slate-700 ring-slate-200"}`}>Carte bancaire</button>
              <button className={`rounded-full px-4 py-2 text-xs font-bold ring-1 ${billingMethod === "rib" ? "bg-slate-900 text-white ring-slate-900" : "bg-white text-slate-700 ring-slate-200"}`}>Virement automatique</button>
              <button onClick={() => setBillingOpen(true)} className="rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white">Modifier</button>
            </div>
          </div>
        </SettingsCard>

        {billingOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Méthode de paiement</h3>
                <button onClick={() => setBillingOpen(false)} className="text-slate-400 hover:text-slate-900">✕</button>
              </div>
              <div className="grid gap-4">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Carte bancaire</div>
                      <div className="text-xs text-slate-500">Paiement automatique, carte non visible par l’admin.</div>
                    </div>
                    <input
                      type="radio"
                      checked={billingMethod === "card"}
                      onChange={() => setBillingMethod("card")}
                    />
                  </div>
                  {billingMethod === "card" && (
                    <div className="mt-3 text-xs text-slate-500">Carte enregistrée : {cardMasked}</div>
                  )}
                </div>

                <div className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Virement automatique (RIB)</div>
                      <div className="text-xs text-slate-500">Le RIB peut être consulté par l’admin pour les prélèvements.</div>
                    </div>
                    <input
                      type="radio"
                      checked={billingMethod === "rib"}
                      onChange={() => setBillingMethod("rib")}
                    />
                  </div>
                  {billingMethod === "rib" && (
                    <input
                      className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-slate-100"
                      value={rib}
                      onChange={(e) => setRib(e.target.value)}
                      placeholder="RIB / IBAN"
                    />
                  )}
                </div>

                <div className="text-[11px] leading-relaxed text-slate-400">
                  RGPD : les informations de carte ne sont jamais accessibles par les administrateurs. Le RIB/IBAN est utilisé uniquement pour les prélèvements et peut être consulté par les administrateurs habilités.
                </div>
                <div className="flex justify-end gap-3">
                  <button onClick={() => setBillingOpen(false)} className="rounded-full bg-slate-100 px-5 py-2 text-xs font-bold text-slate-700">Annuler</button>
                  <button onClick={() => setBillingOpen(false)} className="rounded-full bg-slate-900 px-5 py-2 text-xs font-bold text-white">Enregistrer</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Langue retirée (FR uniquement) */}
      </div>
    </div>
  );
}

function SettingsCard({ icon: Icon, title, desc, children }) {
  return (
    <div className="rounded-[2rem] bg-white p-8 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-500">{desc}</p>
        </div>
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-50 text-slate-500">
          <Icon size={20} />
        </div>
      </div>
      <div className="mt-4 space-y-3">{children}</div>
    </div>
  );
}

function Toggle({ label, defaultChecked }) {
  return (
    <label className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <input type="checkbox" defaultChecked={defaultChecked} className="h-5 w-5 accent-slate-900" />
    </label>
  );
}
