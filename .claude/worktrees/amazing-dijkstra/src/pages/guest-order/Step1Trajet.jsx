import { MapPin } from "lucide-react";

export function Step1Trajet({ form, setForm, fetchSuggestions, pickupSuggestions, setPickupSuggestions, deliverySuggestions, setDeliverySuggestions }) {
    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="grid md:grid-cols-2 gap-8">
                {/* Pickup Address */}
                <div className="space-y-5 relative">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                        <div className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold">1</div>
                        <h2 className="text-xl font-bold text-slate-900">Enlèvement</h2>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Adresse de départ *</label>
                            <input
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-[#ed5518] outline-none"
                                placeholder="Saisissez l'adresse complète"
                                value={form.pickup}
                                onChange={e => {
                                    setForm(prev => ({ ...prev, pickup: e.target.value }));
                                    fetchSuggestions(e.target.value, setPickupSuggestions);
                                }}
                            />
                            {pickupSuggestions.length > 0 && (
                                <div className="absolute z-30 mt-2 w-full rounded-2xl border border-slate-100 bg-white p-2 shadow-xl ring-1 ring-slate-200">
                                    {pickupSuggestions.map((s, i) => (
                                        <button key={i} className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-slate-50 rounded-xl transition-colors"
                                            onClick={() => {
                                                setForm(prev => ({ ...prev, pickup: s.label, pickupCity: s.city, pickupPostcode: s.postcode }));
                                                setPickupSuggestions([]);
                                            }}>{s.label}</button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <input className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none" placeholder="Société" value={form.pickupName} onChange={e => setForm(p => ({ ...p, pickupName: e.target.value }))} />
                            <input className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none" placeholder="Contact" value={form.pickupContact} onChange={e => setForm(p => ({ ...p, pickupContact: e.target.value }))} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <input className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none" placeholder="Téléphone" value={form.pickupPhone} onChange={e => setForm(p => ({ ...p, pickupPhone: e.target.value }))} />
                            <input className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none" placeholder="Digicode / Étage" value={form.pickupAccessCode} onChange={e => setForm(p => ({ ...p, pickupAccessCode: e.target.value }))} />
                        </div>
                    </div>
                </div>

                {/* Delivery Address */}
                <div className="space-y-5 relative">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                        <div className="h-8 w-8 rounded-full bg-[#ed5518] text-white flex items-center justify-center font-bold">2</div>
                        <h2 className="text-xl font-bold text-slate-900">Livraison</h2>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Adresse d'arrivée *</label>
                            <input
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-[#ed5518] outline-none"
                                placeholder="Saisissez l'adresse complète"
                                value={form.delivery}
                                onChange={e => {
                                    setForm(prev => ({ ...prev, delivery: e.target.value }));
                                    fetchSuggestions(e.target.value, setDeliverySuggestions);
                                }}
                            />
                            {deliverySuggestions.length > 0 && (
                                <div className="absolute z-30 mt-2 w-full rounded-2xl border border-slate-100 bg-white p-2 shadow-xl ring-1 ring-slate-200">
                                    {deliverySuggestions.map((s, i) => (
                                        <button key={i} className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-slate-50 rounded-xl transition-colors"
                                            onClick={() => {
                                                setForm(prev => ({ ...prev, delivery: s.label, deliveryCity: s.city, deliveryPostcode: s.postcode }));
                                                setDeliverySuggestions([]);
                                            }}>{s.label}</button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <input className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none" placeholder="Société" value={form.deliveryName} onChange={e => setForm(p => ({ ...p, deliveryName: e.target.value }))} />
                            <input className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none" placeholder="Contact" value={form.deliveryContact} onChange={e => setForm(p => ({ ...p, deliveryContact: e.target.value }))} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <input className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none" placeholder="Téléphone" value={form.deliveryPhone} onChange={e => setForm(p => ({ ...p, deliveryPhone: e.target.value }))} />
                            <input className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none" placeholder="Digicode / Étage" value={form.deliveryAccessCode} onChange={e => setForm(p => ({ ...p, deliveryAccessCode: e.target.value }))} />
                        </div>
                        <input className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none" placeholder="Instructions de livraison" value={form.deliveryInstructions} onChange={e => setForm(p => ({ ...p, deliveryInstructions: e.target.value }))} />
                    </div>
                </div>
            </div>
        </div>
    );
}
