export function Step1Trajet({ form, setForm, fetchSuggestions, pickupSuggestions, setPickupSuggestions, deliverySuggestions, setDeliverySuggestions }) {
  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-5 relative">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold">1</div>
            <h2 className="text-xl font-bold text-slate-900">Enlèvement</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Adresse de départ *</label>
              <input className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:ring-2 focus:ring-[#ed5518] outline-none" placeholder="Saisissez l'adresse complète" value={form.pickup} onChange={e => { setForm({ ...form, pickup: e.target.value }); fetchSuggestions(e.target.value, setPickupSuggestions); }} />
              {pickupSuggestions.length > 0 && (
                <div className="absolute z-30 mt-2 w-full rounded-2xl border border-slate-100 bg-white p-2 shadow-xl ring-1 ring-slate-200">
                  {pickupSuggestions.map((s, i) => <button key={i} className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 rounded-xl" onClick={() => { setForm({ ...form, pickup: s.label, pickupCity: s.city, pickupPostcode: s.postcode }); setPickupSuggestions([]); }}>{s.label}</button>)}
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none" placeholder="Société" value={form.pickupName} onChange={e => setForm({ ...form, pickupName: e.target.value })} />
              <input className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none" placeholder="Contact" value={form.pickupContact} onChange={e => setForm({ ...form, pickupContact: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none" placeholder="Téléphone" value={form.pickupPhone} onChange={e => setForm({ ...form, pickupPhone: e.target.value })} />
              <input className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none" placeholder="Digicode / Étage" value={form.pickupInstructions} onChange={e => setForm({ ...form, pickupInstructions: e.target.value })} />
            </div>
          </div>
        </div>
        <div className="space-y-5 relative">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="h-8 w-8 rounded-full bg-[#ed5518] text-white flex items-center justify-center font-bold">2</div>
            <h2 className="text-xl font-bold text-slate-900">Livraison</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Adresse d'arrivée *</label>
              <input className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:ring-2 focus:ring-[#ed5518] outline-none" placeholder="Saisissez l'adresse complète" value={form.delivery} onChange={e => { setForm({ ...form, delivery: e.target.value }); fetchSuggestions(e.target.value, setDeliverySuggestions); }} />
              {deliverySuggestions.length > 0 && (
                <div className="absolute z-30 mt-2 w-full rounded-2xl border border-slate-100 bg-white p-2 shadow-xl ring-1 ring-slate-200">
                  {deliverySuggestions.map((s, i) => <button key={i} className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 rounded-xl" onClick={() => { setForm({ ...form, delivery: s.label, deliveryCity: s.city, deliveryPostcode: s.postcode }); setDeliverySuggestions([]); }}>{s.label}</button>)}
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none" placeholder="Société" value={form.deliveryName} onChange={e => setForm({ ...form, deliveryName: e.target.value })} />
              <input className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none" placeholder="Contact" value={form.deliveryContact} onChange={e => setForm({ ...form, deliveryContact: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none" placeholder="Téléphone" value={form.deliveryPhone} onChange={e => setForm({ ...form, deliveryPhone: e.target.value })} />
              <input className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none" placeholder="Digicode / Étage" value={form.deliveryInstructions} onChange={e => setForm({ ...form, deliveryInstructions: e.target.value })} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
