import { MapPin, User, Info } from "lucide-react";

export function Step3Contact({ form, setForm, fetchSuggestions, billingSuggestions, setBillingSuggestions }) {
    return (
        <div className="space-y-8 animate-fade-in-up max-w-xl mx-auto">
            <div className="text-center space-y-2">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-500 mb-4"><User size={32} /></div>
                <h2 className="text-2xl font-black text-slate-900">Vos coordonnées</h2>
                <p className="text-sm font-medium text-slate-500">Pour vous envoyer la confirmation et le bon de commande.</p>
            </div>
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <input className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none" placeholder="Prénom & Nom *" value={form.guestName} onChange={e => setForm(p => ({ ...p, guestName: e.target.value }))} />
                    <input className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none" placeholder="Société" value={form.guestCompany} onChange={e => setForm(p => ({ ...p, guestCompany: e.target.value }))} />
                </div>
                <input className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none" placeholder="Email *" value={form.guestEmail} onChange={e => setForm(p => ({ ...p, guestEmail: e.target.value }))} />
                <input className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none" placeholder="Téléphone" value={form.guestPhone} onChange={e => setForm(p => ({ ...p, guestPhone: e.target.value }))} />

                <div className="pt-4 border-t border-slate-100">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2"><MapPin size={14} /> Facturation</h3>
                    <div className="space-y-4 relative">
                        <input
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
                            placeholder="Adresse de facturation *"
                            value={form.billingAddress}
                            onChange={e => {
                                setForm(p => ({ ...p, billingAddress: e.target.value }));
                                fetchSuggestions(e.target.value, setBillingSuggestions);
                            }}
                        />
                        {billingSuggestions.length > 0 && (
                            <div className="absolute z-30 mt-2 w-full rounded-2xl border border-slate-100 bg-white p-2 shadow-xl ring-1 ring-slate-200">
                                {billingSuggestions.map((s, i) => (
                                    <button key={i} className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-slate-50 rounded-xl transition-colors"
                                        onClick={() => {
                                            setForm(p => ({ ...p, billingAddress: s.label, billingCity: s.city, billingPostcode: s.postcode }));
                                            setBillingSuggestions([]);
                                        }}>{s.label}</button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
