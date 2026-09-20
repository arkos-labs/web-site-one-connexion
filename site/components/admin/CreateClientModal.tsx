"use client";

import { useState } from "react";
import { X, User, Building2, Mail, Phone, Loader2 } from "lucide-react";

export function CreateClientModal({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess?: () => void }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
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
          company,
          accountType: "pro",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur lors de la création du client");

      if (onSuccess) onSuccess();
      onClose();
      // Reset form
      setFirstName(""); setLastName(""); setEmail(""); setPhone(""); setCompany("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative z-10 w-full max-w-lg flex flex-col rounded-2xl bg-white shadow-xl max-h-[95vh] sm:max-h-[90vh]">
        
        {/* Header Fixe */}
        <div className="shrink-0 flex items-center justify-between p-6 border-b border-gray-100 bg-white rounded-t-2xl">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-accent">Administration</p>
            <h2 className="text-xl font-bold text-ink">Nouveau Client</h2>
          </div>
          <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        {/* Contenu Défilant */}
        <div className="flex-1 overflow-y-auto p-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">Société *</label>
              <div className="relative">
                <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input required value={company} onChange={e => setCompany(e.target.value)} className="w-full pl-9 pr-3 py-2.5 border rounded-xl bg-gray-50 text-sm focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent" />
              </div>
            </div>

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
  );
}
