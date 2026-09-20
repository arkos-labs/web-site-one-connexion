"use client";

import React, { useState, useEffect } from "react";
import { MapPin, Plus, Trash2, X, User, Phone, Star, Loader2 } from "lucide-react";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";
import { createClient } from "@/lib/supabase/client";
import { PageShell, KpiStrip, EmptyState, LoadingState, INPUT, TEXTAREA, LABEL, BTN_ACCENT, BTN_GHOST } from "@/components/dashboard/ui";

export default function AdressesPage() {
  const supabase = createClient();

  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [label, setLabel] = useState("");
  const [address, setAddress] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  const loadAddresses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erreur de chargement des adresses:", error);
        setAddresses([]);
      } else {
        setAddresses(data || []);
      }
    } catch (err) {
      console.error("Erreur:", err);
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Échap ferme la fenêtre d'ajout
  useEffect(() => {
    if (!isModalOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsModalOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isModalOpen]);

  const resetForm = () => {
    setLabel("");
    setAddress("");
    setContactName("");
    setContactPhone("");
    setNotes("");
    setIsDefault(false);
    setSubmitError(null);
  };

  const openModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setSubmitError("Session expirée. Veuillez vous reconnecter.");
        setSubmitting(false);
        return;
      }

      if (isDefault) {
        await supabase
          .from("addresses")
          .update({ is_default: false })
          .eq("user_id", user.id);
      }

      const { error } = await supabase
        .from("addresses")
        .insert({
          user_id: user.id,
          label,
          address,
          contact_name: contactName || null,
          contact_phone: contactPhone || null,
          notes: notes || null,
          is_default: isDefault,
        });

      if (error) {
        setSubmitError(`Erreur: ${error.message}`);
      } else {
        setIsModalOpen(false);
        resetForm();
        loadAddresses();
      }
    } catch (err) {
      setSubmitError("Une erreur inattendue est survenue.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette adresse ?")) return;
    const { error } = await supabase.from("addresses").delete().eq("id", id);
    if (!error) {
      setAddresses(addresses.filter((a) => a.id !== id));
    }
  };

  const withContact = addresses.filter((a) => a.contact_name || a.contact_phone).length;

  return (
    <>
      <PageShell
        eyebrow="Carnet d'adresses"
        title="Adresses favorites"
        subtitle="Vos adresses d'enlèvement et de livraison récurrentes, disponibles en un clic à la commande."
        actions={
          <button type="button" onClick={openModal} className={BTN_ACCENT}>
            <Plus size={18} strokeWidth={2.5} />
            Nouvelle adresse
          </button>
        }
      >
        {loading ? (
          <LoadingState text="Chargement de vos adresses…" />
        ) : addresses.length === 0 ? (
          <EmptyState
            icon={MapPin}
            title="Aucune adresse favorite"
            text="Ajoutez vos adresses habituelles pour gagner du temps lors de vos commandes."
            action={
              <button type="button" onClick={openModal} className={BTN_ACCENT}>
                <Plus size={18} strokeWidth={2.5} />
                Ajouter une adresse
              </button>
            }
          />
        ) : (
          <>
            <KpiStrip
              items={[
                { label: "Adresses", value: addresses.length },
                { label: "Avec contact sur place", value: withContact },
                { label: "Par défaut", value: addresses.find((a) => a.is_default)?.label ?? "—" },
              ]}
            />
            <div className="min-h-0 flex-1 overflow-y-auto bg-paper-card p-5 sm:p-8">
              <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {addresses.map((addr) => (
                  <li
                    key={addr.id}
                    className="group flex flex-col rounded-xl border border-line bg-white p-4 transition-colors hover:border-[#c9c5bd]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent-dark">
                          <MapPin size={17} strokeWidth={2.25} />
                        </span>
                        <div className="min-w-0">
                          <h2 className="truncate text-sm font-extrabold text-ink">{addr.label}</h2>
                          {addr.is_default && (
                            <span className="label-mono inline-flex items-center gap-1 text-[10px] font-medium text-accent-dark">
                              <Star size={10} fill="currentColor" /> Par défaut
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDelete(addr.id)}
                        aria-label={`Supprimer ${addr.label}`}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-label transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <p className="mt-3 line-clamp-2 text-[13px] font-semibold leading-snug text-ink">{addr.address}</p>

                    {(addr.contact_name || addr.contact_phone) && (
                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line pt-3 text-xs text-muted">
                        {addr.contact_name && (
                          <span className="inline-flex items-center gap-1.5"><User size={12} className="text-label" />{addr.contact_name}</span>
                        )}
                        {addr.contact_phone && (
                          <span className="inline-flex items-center gap-1.5"><Phone size={12} className="text-label" />{addr.contact_phone}</span>
                        )}
                      </div>
                    )}

                    {addr.notes && <p className="mt-2 line-clamp-1 text-xs italic text-muted">{addr.notes}</p>}
                  </li>
                ))}

                <li>
                  <button
                    type="button"
                    onClick={openModal}
                    className="flex h-full min-h-[104px] w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#c9c5bd] bg-transparent text-sm font-bold text-muted transition-colors hover:border-accent hover:bg-accent/5 hover:text-accent-dark"
                  >
                    <Plus size={16} strokeWidth={2.5} />
                    Ajouter une adresse
                  </button>
                </li>
              </ul>
            </div>
          </>
        )}
      </PageShell>

      {/* Fenêtre : nouvelle adresse */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm"
          onMouseDown={(e) => e.target === e.currentTarget && setIsModalOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="addr-title"
            className="step-enter w-full max-w-lg rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <h2 id="addr-title" className="text-lg font-extrabold tracking-tight text-ink">Nouvelle adresse</h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="Fermer"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-label transition-colors hover:bg-paper hover:text-ink"
              >
                <X size={18} />
              </button>
            </div>

            <form className="flex flex-col gap-4 p-6" onSubmit={handleSubmit}>
              {submitError && (
                <div role="alert" className="rounded-lg bg-red-50 px-3 py-2.5 text-xs font-medium text-red-700">
                  {submitError}
                </div>
              )}

              <div>
                <label htmlFor="addr-label" className={LABEL}>Nom de l&apos;adresse</label>
                <input
                  id="addr-label"
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Ex : Entrepôt Nord"
                  className={INPUT}
                  required
                />
              </div>

              <div>
                <span className={LABEL}>Adresse complète</span>
                <div className="[&_input]:h-11 [&_input]:rounded-lg [&_input]:bg-white [&_input]:py-0 [&_input]:font-medium [&_input]:focus:ring-2 [&_input]:focus:ring-accent/15">
                  <AddressAutocomplete value={address} onChange={setAddress} required={true} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="addr-contact" className={LABEL}>Contact sur place</label>
                  <input
                    id="addr-contact"
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Nom du contact"
                    className={INPUT}
                  />
                </div>
                <div>
                  <label htmlFor="addr-phone" className={LABEL}>Téléphone</label>
                  <input
                    id="addr-phone"
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    maxLength={10}
                    placeholder="06 12 34 56 78"
                    className={INPUT}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="addr-notes" className={LABEL}>Notes pour le coursier (optionnel)</label>
                <textarea
                  id="addr-notes"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Code porte, étage, instructions spécifiques…"
                  className={TEXTAREA}
                />
              </div>

              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="h-5 w-5 rounded border-line accent-[#ed5518]"
                />
                <span className="text-sm font-semibold text-ink">Définir comme adresse par défaut</span>
              </label>

              <div className="mt-2 flex justify-end gap-3 border-t border-line pt-5">
                <button type="button" onClick={() => setIsModalOpen(false)} className={BTN_GHOST}>
                  Annuler
                </button>
                <button type="submit" disabled={submitting} className={BTN_ACCENT}>
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Ajout…
                    </>
                  ) : (
                    "Ajouter l'adresse"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
