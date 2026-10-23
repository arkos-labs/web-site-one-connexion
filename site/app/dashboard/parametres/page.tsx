"use client";

import React, { useState, useEffect } from "react";
import { markPasswordSet } from "@/lib/password-set";
import { User, Building2, MapPin, CreditCard, Lock, Save, ShieldCheck, Loader2, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PageShell, INPUT, LABEL, BTN_ACCENT, BTN_PRIMARY } from "@/components/dashboard/ui";
import PaymentMethodCard from "@/components/dashboard/PaymentMethodCard";
import { isProAccount } from "@/lib/dashboard-nav";

const TABS = [
  { id: "profil", label: "Profil utilisateur", icon: User },
  { id: "societe", label: "Société", icon: Building2 },
  { id: "facturation", label: "Facturation & paiement", icon: CreditCard },
  { id: "securite", label: "Sécurité", icon: Lock },
] as const;

// Champ verrouillé : lisible, mais visiblement non modifiable.
const LOCKED = "cursor-not-allowed bg-paper text-muted focus:ring-0";

function SectionTitle({ title, text }: { title: string; text: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-extrabold tracking-tight text-ink">{title}</h2>
      <p className="mt-0.5 text-[13px] text-muted">{text}</p>
    </div>
  );
}

export default function ParametresPage() {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]["id"]>("profil");
  const [methodSaved, setMethodSaved] = useState(false);

  // Retour de la page Stripe d'enregistrement : onglet Facturation, avec confirmation.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get("onglet") === "facturation") setActiveTab("facturation");
    if (q.get("moyen") === "ok") setMethodSaved(true);
  }, []);

  const [loading, setLoading] = useState(true);
  const [isPro, setIsPro] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [siret, setSiret] = useState("");
  const [vatNumber, setVatNumber] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  // Informations de la société déjà renseignées : verrouillées (trigger clients_lock_company_info),
  // seul l'admin les modifie. Un champ encore vide peut être complété.
  const [locked, setLocked] = useState({ company: false, siret: false, vat: false, billing: false });

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        setEmail(user.email || "");
        setIsPro(isProAccount(user));

        // Charger profil
        const { data: profileData } = await supabase
          .from("profiles")
          .select("full_name, phone")
          .eq("id", user.id)
          .maybeSingle();

        if (profileData) {
          setFullName(profileData.full_name || "");
          setPhone(profileData.phone || "");
        }

        // Charger données client (billing_address, siret, etc)
        const { data: clientData } = await supabase
          .from("clients")
          .select("company_name, siret, tax_id, billing_address")
          .eq("id", user.id)
          .maybeSingle();

        if (clientData) {
          const billing = clientData.billing_address === "À remplir" ? "" : clientData.billing_address || "";
          setCompany(clientData.company_name || "");
          setSiret(clientData.siret || "");
          setVatNumber(clientData.tax_id || "");
          setBillingAddress(billing);
          if (clientData.siret) setIsPro(true);
          setLocked({
            company: !!clientData.company_name?.trim(),
            siret: !!clientData.siret?.trim(),
            vat: !!clientData.tax_id?.trim(),
            billing: !!clientData.siret?.trim() && !!billing.trim(),
          });
        }
      } catch (err) {
        console.error("Erreur de chargement du profil:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveProfile = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setSaving(true);
    setSaveMessage(null);
    setSaveError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setSaveError("Session expirée. Veuillez vous reconnecter.");
        setSaving(false);
        return;
      }

      // Mettre à jour profil
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          full_name: fullName,
          phone,
        });

      if (profileError) {
        setSaveError(`Erreur: ${profileError.message}`);
        setSaving(false);
        return;
      }

      // Mettre à jour données client : seuls les champs encore modifiables sont envoyés.
      const clientUpdate: Record<string, string | null> = { id: user.id, contact_email: user.email || "" };
      if (!locked.company) clientUpdate.company_name = company;
      // siret est UNIQUE en base : on envoie null plutôt qu'une chaîne vide
      if (!locked.siret) clientUpdate.siret = siret?.trim() ? siret.trim() : null;
      if (!locked.vat) clientUpdate.tax_id = vatNumber?.trim() ? vatNumber.trim() : null;
      if (!locked.billing) clientUpdate.billing_address = billingAddress;
      const { error: clientError } = await supabase.from("clients").upsert(clientUpdate);

      if (clientError) {
        setSaveError(`Erreur: ${clientError.message}`);
      } else {
        // Ce qui vient d'être rempli est désormais verrouillé.
        setLocked((l) => ({
          company: l.company || !!company.trim(),
          siret: l.siret || !!siret.trim(),
          vat: l.vat || !!vatNumber.trim(),
          billing: l.billing || ((l.siret || !!siret.trim()) && !!billingAddress.trim()),
        }));
        setSaveMessage("Modifications enregistrées.");
        // Demande au layout de recharger le nom affiché dans la sidebar
        window.dispatchEvent(new Event("profile-updated"));
        setTimeout(() => setSaveMessage(null), 3000);
      }
    } catch (err) {
      setSaveError("Une erreur inattendue est survenue.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);
    setPasswordError(null);

    if (newPassword.length < 6) {
      setPasswordError("Le nouveau mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Les mots de passe ne correspondent pas.");
      return;
    }

    setPasswordSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setPasswordError(`Erreur: ${error.message}`);
      } else {
        setPasswordMessage("Mot de passe mis à jour.");
        markPasswordSet();
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      setPasswordError("Une erreur inattendue est survenue.");
    } finally {
      setPasswordSaving(false);
    }
  };

  const editable = activeTab === "profil" || activeTab === "societe";

  return (
    <PageShell
      fill
      eyebrow="Mon compte"
      title="Paramètres du compte"
      subtitle={isPro ? "Vos informations personnelles, professionnelles et vos préférences de facturation." : "Vos informations personnelles, votre adresse et vos préférences de paiement."}
    >
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        {/* Navigation */}
        <nav
          aria-label="Sections des paramètres"
          className="no-scrollbar flex shrink-0 gap-1 overflow-x-auto border-b border-line bg-paper-card p-3 md:w-64 md:flex-col md:overflow-visible md:border-b-0 md:border-r md:p-4"
        >
          {TABS.map(({ id, label: tabLabel, icon: tabIcon }) => {
            const label = id === "societe" && !isPro ? "Mon adresse" : tabLabel;
            const Icon = id === "societe" && !isPro ? MapPin : tabIcon;
            const active = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                aria-current={active ? "page" : undefined}
                className={`flex h-11 shrink-0 items-center gap-3 whitespace-nowrap rounded-lg px-3.5 text-sm font-bold transition-colors ${
                  active ? "bg-white text-ink shadow-sm ring-1 ring-line" : "text-muted hover:bg-white/70 hover:text-ink"
                }`}
              >
                <Icon size={17} className={active ? "text-accent" : "text-label"} />
                {label}
              </button>
            );
          })}
        </nav>

        {/* Contenu */}
        <form onSubmit={activeTab === "securite" ? handleChangePassword : handleSaveProfile} className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div key={activeTab} data-lenis-prevent className="step-enter no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-8">
            {loading ? (
              <div role="status" className="flex items-center gap-2.5 py-10 text-sm font-medium text-muted">
                <Loader2 size={18} className="animate-spin text-accent" />
                Chargement…
              </div>
            ) : (
              <>
                {activeTab === "profil" && (
                  <div className="max-w-2xl">
                    <SectionTitle title="Informations personnelles" text="Ces informations servent à vous contacter au sujet de vos courses." />
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label htmlFor="full-name" className={LABEL}>Nom complet</label>
                        <input id="full-name" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className={INPUT} />
                      </div>
                      <div>
                        <label htmlFor="email" className={LABEL}>{isPro ? "Email professionnel" : "Email"}</label>
                        <input id="email" type="email" value={email} disabled className={INPUT} />
                      </div>
                      <div>
                        <label htmlFor="phone" className={LABEL}>Téléphone portable</label>
                        <input
                          id="phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          maxLength={10}
                          placeholder="06 12 34 56 78"
                          className={INPUT}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "societe" && !isPro && (
                  <div className="max-w-2xl">
                    <SectionTitle title="Votre adresse" text="Elle figure sur vos factures." />
                    <div>
                      <label htmlFor="billing" className={LABEL}>Adresse complète</label>
                      <input
                        id="billing"
                        type="text"
                        autoComplete="street-address"
                        value={billingAddress}
                        onChange={(e) => setBillingAddress(e.target.value)}
                        placeholder="Ex : 12 rue de la Paix, 75002 Paris"
                        className={INPUT}
                      />
                    </div>
                  </div>
                )}

                {activeTab === "societe" && isPro && (
                  <div className="max-w-2xl">
                    <SectionTitle title="Informations de l'entreprise" text="Les détails de votre structure juridique, repris sur vos factures." />
                    {(locked.company || locked.siret || locked.vat || locked.billing) && (
                      <p className="mb-5 flex items-start gap-2.5 rounded-xl border border-line bg-paper px-4 py-3 text-[13px] font-medium text-muted">
                        <Lock size={15} className="mt-0.5 shrink-0 text-label" />
                        <span>
                          Les informations déjà enregistrées ne peuvent plus être modifiées, car elles figurent sur vos factures.
                          Pour les changer, contactez-nous au <a href="tel:+33666026707" className="font-bold text-ink underline">06 66 02 67 07</a> ou
                          à <a href="mailto:contact@oneconnexion.com" className="font-bold text-ink underline">contact@oneconnexion.com</a>.
                        </span>
                      </p>
                    )}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label htmlFor="company" className={LABEL}>Nom de la société / cabinet</label>
                        <input id="company" type="text" value={company} onChange={(e) => setCompany(e.target.value)} readOnly={locked.company} placeholder="Ex : Cabinet Dupont & Associés" className={`${INPUT} ${locked.company ? LOCKED : ""}`} />
                      </div>
                      <div>
                        <label htmlFor="siret" className={LABEL}>Numéro de SIRET</label>
                        <input id="siret" type="text" value={siret} onChange={(e) => setSiret(e.target.value)} readOnly={locked.siret} placeholder="123 456 789 00012" className={`${INPUT} ${locked.siret ? LOCKED : ""}`} />
                      </div>
                      <div>
                        <label htmlFor="vat" className={LABEL}>TVA intracommunautaire</label>
                        <input id="vat" type="text" value={vatNumber} onChange={(e) => setVatNumber(e.target.value)} readOnly={locked.vat} placeholder="FR 12 123456789" className={`${INPUT} ${locked.vat ? LOCKED : ""}`} />
                      </div>
                      <div className="sm:col-span-2">
                        <label htmlFor="billing" className={LABEL}>Adresse de facturation</label>
                        <input id="billing" type="text" value={billingAddress} onChange={(e) => setBillingAddress(e.target.value)} readOnly={locked.billing} placeholder="Adresse complète" className={`${INPUT} ${locked.billing ? LOCKED : ""}`} />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "facturation" && (
                  <div className="max-w-2xl">
                    <SectionTitle title={isPro ? "Facturation & paiement" : "Paiement"} text={isPro ? "Vos méthodes de paiement et vos conditions." : "Les particuliers règlent chaque course par carte bancaire."} />
                    {methodSaved && (
                      <p role="status" className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
                        Moyen de paiement enregistré. Vos prochaines commandes seront réglées en 1 clic.
                      </p>
                    )}
                    <PaymentMethodCard cardOnly={!isPro} />
                    <p className="mt-5 flex items-center gap-2.5 text-[13px] font-medium text-muted">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-50 text-green-600">
                        <ShieldCheck size={14} strokeWidth={2.5} />
                      </span>
                      Toutes les transactions sont chiffrées et sécurisées.
                    </p>
                  </div>
                )}

                {activeTab === "securite" && (
                  <div className="max-w-md">
                    <SectionTitle title="Sécurité du compte" text="Modifiez votre mot de passe et sécurisez votre accès." />
                    {passwordMessage && (
                      <div role="status" className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2.5 text-xs font-bold text-green-700">
                        <Check size={14} strokeWidth={3} /> {passwordMessage}
                      </div>
                    )}
                    {passwordError && (
                      <div role="alert" className="mb-4 rounded-lg bg-red-50 px-3 py-2.5 text-xs font-bold text-red-700">
                        {passwordError}
                      </div>
                    )}
                    <div className="flex flex-col gap-4">
                      <div>
                        <label htmlFor="new-pwd" className={LABEL}>Nouveau mot de passe</label>
                        <input id="new-pwd" type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className={INPUT} />
                      </div>
                      <div>
                        <label htmlFor="confirm-pwd" className={LABEL}>Confirmer le nouveau mot de passe</label>
                        <input id="confirm-pwd" type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className={INPUT} />
                      </div>
                      <button
                        type="button"
                        onClick={handleChangePassword}
                        disabled={passwordSaving}
                        className={`${BTN_PRIMARY} w-fit`}
                      >
                        {passwordSaving ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Mise à jour…
                          </>
                        ) : (
                          "Mettre à jour le mot de passe"
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {editable && (
            <div className="flex items-center justify-end gap-4 border-t border-line bg-white px-5 py-3.5 sm:px-8">
              {saveMessage && (
                <span role="status" className="flex items-center gap-1.5 text-xs font-bold text-green-700">
                  <Check size={14} strokeWidth={3} /> {saveMessage}
                </span>
              )}
              {saveError && <span role="alert" className="text-xs font-bold text-red-700">{saveError}</span>}
              <button type="submit" disabled={saving || loading} className={BTN_ACCENT}>
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Enregistrement…
                  </>
                ) : (
                  <>
                    <Save size={16} strokeWidth={2.5} />
                    Enregistrer
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </PageShell>
  );
}
