"use client";

import React, { useState, useEffect } from "react";
import { User, Building2, CreditCard, Lock, Save, ShieldCheck, Loader2, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PageShell, INPUT, LABEL, BTN_ACCENT, BTN_PRIMARY } from "@/components/dashboard/ui";

const TABS = [
  { id: "profil", label: "Profil utilisateur", icon: User },
  { id: "societe", label: "Société", icon: Building2 },
  { id: "facturation", label: "Facturation & paiement", icon: CreditCard },
  { id: "securite", label: "Sécurité", icon: Lock },
] as const;

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

  const [loading, setLoading] = useState(true);
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
          .select("company_name, siret, billing_address")
          .eq("id", user.id)
          .maybeSingle();

        if (clientData) {
          setCompany(clientData.company_name || "");
          setSiret(clientData.siret || "");
          setBillingAddress(clientData.billing_address || "");
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

      // Mettre à jour données client
      const { error: clientError } = await supabase
        .from("clients")
        .upsert({
          id: user.id,
          company_name: company,
          // siret est UNIQUE en base : on envoie null plutôt qu'une chaîne vide
          siret: siret?.trim() ? siret.trim() : null,
          billing_address: billingAddress,
          contact_email: user.email || "",
        });

      if (clientError) {
        setSaveError(`Erreur: ${clientError.message}`);
      } else {
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
      subtitle="Vos informations personnelles, professionnelles et vos préférences de facturation."
    >
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        {/* Navigation */}
        <nav
          aria-label="Sections des paramètres"
          className="no-scrollbar flex shrink-0 gap-1 overflow-x-auto border-b border-line bg-paper-card p-3 md:w-64 md:flex-col md:overflow-visible md:border-b-0 md:border-r md:p-4"
        >
          {TABS.map(({ id, label, icon: Icon }) => {
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
                        <label htmlFor="email" className={LABEL}>Email professionnel</label>
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

                {activeTab === "societe" && (
                  <div className="max-w-2xl">
                    <SectionTitle title="Informations de l'entreprise" text="Les détails de votre structure juridique, repris sur vos factures." />
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label htmlFor="company" className={LABEL}>Nom de la société / cabinet</label>
                        <input id="company" type="text" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Ex : Cabinet Dupont & Associés" className={INPUT} />
                      </div>
                      <div>
                        <label htmlFor="siret" className={LABEL}>Numéro de SIRET</label>
                        <input id="siret" type="text" value={siret} onChange={(e) => setSiret(e.target.value)} placeholder="123 456 789 00012" className={INPUT} />
                      </div>
                      <div>
                        <label htmlFor="vat" className={LABEL}>TVA intracommunautaire</label>
                        <input id="vat" type="text" value={vatNumber} onChange={(e) => setVatNumber(e.target.value)} placeholder="FR 12 123456789" className={INPUT} />
                      </div>
                      <div className="sm:col-span-2">
                        <label htmlFor="billing" className={LABEL}>Adresse de facturation</label>
                        <input id="billing" type="text" value={billingAddress} onChange={(e) => setBillingAddress(e.target.value)} placeholder="Adresse complète" className={INPUT} />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "facturation" && (
                  <div className="max-w-2xl">
                    <SectionTitle title="Facturation & paiement" text="Vos méthodes de paiement et vos conditions." />
                    <div className="rounded-xl border border-line bg-paper-card p-5">
                      <h3 className="text-sm font-extrabold text-ink">Méthode de paiement</h3>
                      <p className="mt-1 text-[13px] text-muted">Aucune méthode de paiement enregistrée pour le moment.</p>
                    </div>
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
