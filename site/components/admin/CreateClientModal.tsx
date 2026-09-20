"use client";

import { useState } from "react";
import { X, User, Building2, Mail, Phone, Loader2 } from "lucide-react";

export function CreateClientModal({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess?: () => void }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [siret, setSiret] = useState("");
  const [accountType, setAccountType] = useState<"pro" | "particulier">("pro");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/create-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          company: accountType === "pro" ? company : "",
          siret: accountType === "pro" ? siret : "",
          accountType,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur lors de la création du client");

      if (onSuccess) onSuccess();
      onClose();
      // Reset form
      setFirstName(""); setLastName(""); setEmail(""); setPhone(""); setCompany(""); setSiret(""); setAccountType("pro");
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
          <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 w-full max-w-lg">
            <div className="flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-accent">Administration</p>
                <h2 className="text-xl font-bold text-ink">Nouveau Client</h2>
              </div>
              <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex p-1 bg-gray-100 rounded-xl">
              {(["pro", "particulier"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setAccountType(t)}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${accountType === t ? "bg-white text-ink shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                >
                  {t === "pro" ? "Professionnel" : "Particulier"}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">Prénom *</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input required value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full pl-9 pr-3 py-2.5 border rounded-xl bg-gray-50 text-sm focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">Nom *</label>
                <input required value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-3 py-2.5 border rounded-xl bg-gray-50 text-sm focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent" />
              </div>
            </div>

            {accountType === "pro" && (
              <>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">Société *</label>
                  <div className="relative">
                    <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input required value={company} onChange={e => setCompany(e.target.value)} className="w-full pl-9 pr-3 py-2.5 border rounded-xl bg-gray-50 text-sm focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">Numéro de SIRET *</label>
                  <input required value={siret} onChange={e => setSiret(e.target.value)} placeholder="14 chiffres" className="w-full px-4 py-2.5 border rounded-xl bg-gray-50 text-sm focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent" />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">Email *</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-9 pr-3 py-2.5 border rounded-xl bg-gray-50 text-sm focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">Téléphone *</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full pl-9 pr-3 py-2.5 border rounded-xl bg-gray-50 text-sm focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent" />
              </div>
            </div>

            {error && <div className="p-3 bg-red-50 text-red-600 font-medium text-sm rounded-xl">{error}</div>}

            <button disabled={loading} type="submit" className="mt-4 w-full bg-accent text-white py-3 rounded-xl font-bold hover:bg-accent-dark transition-colors flex justify-center items-center gap-2 disabled:opacity-60">
              {loading ? <Loader2 className="animate-spin" size={18} /> : "Créer la fiche client"}
            </button>
          </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
