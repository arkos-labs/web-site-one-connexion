"use client";

import { useState, useEffect } from "react";
import { X, MapPin, Loader2, User, Zap, Clock, Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { calculatePrice, ServiceLevel } from "@/lib/pricing";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";

type Profile = { id: string; full_name: string | null; company: string | null };
type Driver = { id: string; name: string };

export function CreateOrderModal({ isOpen, onClose, onSuccess, profiles, drivers }: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSuccess?: () => void;
  profiles: Profile[];
  drivers: Driver[];
}) {
  const [clientId, setClientId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [dropoffAddress, setDropoffAddress] = useState("");
  const [format, setFormat] = useState("doc");
  const [delai, setDelai] = useState<ServiceLevel>("standard");
  const [notes, setNotes] = useState("");
  const [price, setPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // New Client States
  const [newClientFirstName, setNewClientFirstName] = useState("");
  const [newClientLastName, setNewClientLastName] = useState("");
  const [newClientCompany, setNewClientCompany] = useState("");
  const [newClientSiret, setNewClientSiret] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");

  const supabase = createClient();

  useEffect(() => {
    if (pickupAddress && dropoffAddress) {
      setPrice(calculatePrice(pickupAddress, dropoffAddress, delai));
    } else {
      setPrice(null);
    }
  }, [pickupAddress, dropoffAddress, delai]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) { setError("Veuillez sélectionner un client"); return; }
    
    setLoading(true);
    setError("");

    try {
      let finalClientId = clientId;

      if (clientId === "NEW_CLIENT") {
        if (!newClientFirstName || !newClientLastName || !newClientEmail || !newClientCompany || !newClientSiret) {
          throw new Error("Veuillez remplir tous les champs du nouveau client.");
        }

        const res = await fetch("/api/admin/create-client", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: newClientFirstName,
            lastName: newClientLastName,
            email: newClientEmail,
            phone: newClientPhone,
            company: newClientCompany,
            siret: newClientSiret,
            accountType: "pro",
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erreur lors de la création du client");
        finalClientId = data.user.id;
      }

      const trackingCode = `OC-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
      
      const { error: insertError } = await supabase.from("orders").insert({
        tracking_code: trackingCode,
        user_id: finalClientId,
        pickup_address: pickupAddress,
        dropoff_address: dropoffAddress,
        stops: [],
        format,
        delai,
        notes,
        status: driverId ? "confirmee" : "en_attente",
        driver_id: driverId || null,
        price_estimate: price,
        client_type: 'entreprise',
        source: 'admin',
      });

      if (insertError) throw new Error(insertError.message);

      if (onSuccess) onSuccess();
      onClose();
      // Reset
      setClientId(""); setDriverId(""); setPickupAddress(""); setDropoffAddress(""); setNotes(""); setPrice(null);
      setNewClientFirstName(""); setNewClientLastName(""); setNewClientEmail(""); setNewClientCompany(""); setNewClientSiret(""); setNewClientPhone("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-[100]" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
          <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 w-full max-w-xl flex flex-col max-h-[95dvh] sm:max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4 shrink-0">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-accent">Administration</p>
                <h2 className="text-xl font-bold text-ink">Saisir une commande</h2>
              </div>
              <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto pb-32">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">Client *</label>
                <select required value={clientId} onChange={e => setClientId(e.target.value)} className="w-full px-4 py-3 border rounded-xl bg-gray-50 text-sm focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent">
                  <option value="">-- Sélectionner un client --</option>
                  <option value="NEW_CLIENT" className="font-bold text-accent">+ Créer un nouveau client Pro</option>
                  {profiles.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.full_name} {p.company ? `(${p.company})` : ""} {p.siret ? `— SIRET: ${p.siret}` : ""}</option>
                  ))}
                </select>
              </div>

              {clientId === "NEW_CLIENT" && (
                <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex flex-col gap-3">
                  <div className="text-xs font-bold uppercase tracking-widest text-accent mb-2">Informations du nouveau client</div>
                  <div className="grid grid-cols-2 gap-3">
                    <input required value={newClientFirstName} onChange={e => setNewClientFirstName(e.target.value)} placeholder="Prénom *" className="w-full px-3 py-2 border rounded-lg bg-white text-sm focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent" />
                    <input required value={newClientLastName} onChange={e => setNewClientLastName(e.target.value)} placeholder="Nom *" className="w-full px-3 py-2 border rounded-lg bg-white text-sm focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent" />
                  </div>
                  <input required type="email" value={newClientEmail} onChange={e => setNewClientEmail(e.target.value)} placeholder="Email professionnel *" className="w-full px-3 py-2 border rounded-lg bg-white text-sm focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent" />
                  <input required value={newClientPhone} onChange={e => setNewClientPhone(e.target.value)} placeholder="Téléphone *" className="w-full px-3 py-2 border rounded-lg bg-white text-sm focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent" />
                  <input required value={newClientCompany} onChange={e => setNewClientCompany(e.target.value)} placeholder="Nom de l'entreprise *" className="w-full px-3 py-2 border rounded-lg bg-white text-sm focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent" />
                  <input required value={newClientSiret} onChange={e => setNewClientSiret(e.target.value)} placeholder="Numéro de SIRET (14 chiffres) *" className="w-full px-3 py-2 border rounded-lg bg-white text-sm focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent" />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">Adresse d'enlèvement *</label>
                <AddressAutocomplete value={pickupAddress} onChange={setPickupAddress} required />
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">Adresse de livraison *</label>
                <AddressAutocomplete value={dropoffAddress} onChange={setDropoffAddress} required />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">Format</label>
              <div className="grid grid-cols-3 gap-2">
                {["doc", "petit", "volumineux"].map((f) => (
                  <button key={f} type="button" onClick={() => setFormat(f)} className={`py-2 text-sm font-semibold rounded-lg border-2 transition-colors ${format === f ? "border-accent bg-accent/5 text-accent" : "border-gray-100 text-gray-500"}`}>
                    {f === "doc" ? "Doc" : f === "petit" ? "Petit" : "Volumineux"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">Délai</label>
              <div className="flex flex-col gap-2">
                <button type="button" onClick={() => setDelai('standard')} className={`flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${delai === 'standard' ? 'bg-accent text-white' : 'bg-gray-100 text-gray-600'}`}>
                  <div className="flex items-center gap-2"><Clock size={16} /> NORMAL : 3h</div>
                </button>
                <button type="button" onClick={() => setDelai('urgent')} className={`flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${delai === 'urgent' ? 'bg-accent text-white' : 'bg-gray-100 text-gray-600'}`}>
                  <div className="flex items-center gap-2"><Zap size={16} /> URGENT : 1h30</div>
                </button>
                <button type="button" onClick={() => setDelai('flash')} className={`flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${delai === 'flash' ? 'bg-accent text-white' : 'bg-gray-100 text-gray-600'}`}>
                  <div className="flex items-center gap-2"><Zap size={16} className={delai === "flash" ? "text-white" : "text-red-500"} /> SUPER : 1h</div>
                </button>
              </div>
            </div>

            {price !== null && (
              <div className="p-4 bg-green-50 border border-green-100 rounded-xl flex items-center justify-between">
                <span className="font-bold text-green-800">Tarif calculé :</span>
                <span className="text-xl font-extrabold text-green-700">{price.toFixed(2)} €</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">Assigner un chauffeur (Optionnel)</label>
              <select value={driverId} onChange={e => setDriverId(e.target.value)} className="w-full px-4 py-3 border rounded-xl bg-gray-50 text-sm focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent">
                <option value="">-- Aucun chauffeur (laisser en attente) --</option>
                {drivers.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">Notes (Optionnel)</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full px-4 py-3 border rounded-xl bg-gray-50 text-sm focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent" rows={2}></textarea>
            </div>

            {error && <div className="p-3 bg-red-50 text-red-600 font-medium text-sm rounded-xl">{error}</div>}

            <button disabled={loading} type="submit" className="w-full bg-accent text-white py-3 rounded-xl font-bold hover:bg-accent-dark transition-colors flex justify-center items-center gap-2 disabled:opacity-60">
              {loading ? <Loader2 className="animate-spin" size={18} /> : "Créer la commande"}
            </button>
          </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
