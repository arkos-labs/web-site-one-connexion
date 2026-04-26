export function Step1Trajet({ form, setForm, fetchSuggestions, pickupSuggestions, setPickupSuggestions, deliverySuggestions, setDeliverySuggestions }) {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid md:grid-cols-2 gap-12 md:gap-20">
        {/* ENLÈVEMENT */}
        <div className="space-y-8 relative">
          <div className="flex items-center gap-4 border-b border-noir/5 pb-4">
            <h2 className="text-2xl font-display italic text-noir">Enlèvement</h2>
            <div className="flex-1 h-[1px] bg-noir/5"></div>
          </div>

          <div className="space-y-6">
            <div className="relative group">
              <label className="text-[9px] font-bold uppercase tracking-[0.3em] text-noir/40 mb-2 block ml-1">Adresse de départ</label>
              <input
                className="w-full rounded-xl border border-noir/5 bg-white px-5 py-4 text-sm font-medium text-noir placeholder:text-noir/20 focus:border-[#ed5518] focus:ring-0 transition-all shadow-sm"
                placeholder="Rue, numéro, ville..."
                value={form.pickup}
                onChange={e => { setForm({ ...form, pickup: e.target.value }); fetchSuggestions(e.target.value, setPickupSuggestions); }}
              />
              {pickupSuggestions.length > 0 && (
                <div className="absolute z-50 mt-2 w-full rounded-xl border border-noir/5 bg-white p-2 shadow-2xl overflow-hidden backdrop-blur-xl">
                  {pickupSuggestions.map((s, i) => (
                    <button
                      key={i}
                      className="w-full text-left px-5 py-3 text-xs font-medium text-noir/60 hover:bg-cream hover:text-noir transition-all rounded-lg"
                      onClick={() => { setForm({ ...form, pickup: s.label, pickupCity: s.city, pickupPostcode: s.postcode }); setPickupSuggestions([]); }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-noir/40 ml-1">Société</label>
                <input className="w-full rounded-xl border border-noir/5 bg-white px-4 py-3 text-xs font-medium outline-none focus:border-noir transition-all" placeholder="Nom de l'entreprise" value={form.pickupName} onChange={e => setForm({ ...form, pickupName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-noir/40 ml-1">Contact</label>
                <input className="w-full rounded-xl border border-noir/5 bg-white px-4 py-3 text-xs font-medium outline-none focus:border-noir transition-all" placeholder="Prénom Nom" value={form.pickupContact} onChange={e => setForm({ ...form, pickupContact: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-noir/40 ml-1">Téléphone</label>
                <input className="w-full rounded-xl border border-noir/5 bg-white px-4 py-3 text-xs font-medium outline-none focus:border-noir transition-all" placeholder="06..." value={form.pickupPhone} onChange={e => setForm({ ...form, pickupPhone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-noir/40 ml-1">Accès / Étage</label>
                <input className="w-full rounded-xl border border-noir/5 bg-white px-4 py-3 text-xs font-medium outline-none focus:border-noir transition-all" placeholder="Code, Bureau..." value={form.pickupInstructions} onChange={e => setForm({ ...form, pickupInstructions: e.target.value })} />
              </div>
            </div>
          </div>
        </div>

        {/* LIVRAISON */}
        <div className="space-y-8 relative">
          <div className="flex items-center gap-4 border-b border-noir/5 pb-4">
            <h2 className="text-2xl font-display italic text-noir">Livraison</h2>
            <div className="flex-1 h-[1px] bg-noir/5"></div>
          </div>

          <div className="space-y-6">
            <div className="relative group">
              <label className="text-[9px] font-bold uppercase tracking-[0.3em] text-noir/40 mb-2 block ml-1">Adresse d'arrivée</label>
              <input
                className="w-full rounded-xl border border-noir/5 bg-white px-5 py-4 text-sm font-medium text-noir placeholder:text-noir/20 focus:border-[#ed5518] focus:ring-0 transition-all shadow-sm"
                placeholder="Destination complète..."
                value={form.delivery}
                onChange={e => { setForm({ ...form, delivery: e.target.value }); fetchSuggestions(e.target.value, setDeliverySuggestions); }}
              />
              {deliverySuggestions.length > 0 && (
                <div className="absolute z-50 mt-2 w-full rounded-xl border border-noir/5 bg-white p-2 shadow-2xl overflow-hidden backdrop-blur-xl">
                  {deliverySuggestions.map((s, i) => (
                    <button
                      key={i}
                      className="w-full text-left px-5 py-3 text-xs font-medium text-noir/60 hover:bg-cream hover:text-noir transition-all rounded-lg"
                      onClick={() => { setForm({ ...form, delivery: s.label, deliveryCity: s.city, deliveryPostcode: s.postcode }); setDeliverySuggestions([]); }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-noir/40 ml-1">Société</label>
                <input className="w-full rounded-xl border border-noir/5 bg-white px-4 py-3 text-xs font-medium outline-none focus:border-noir transition-all" placeholder="Nom Destinataire" value={form.deliveryName} onChange={e => setForm({ ...form, deliveryName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-noir/40 ml-1">Contact</label>
                <input className="w-full rounded-xl border border-noir/5 bg-white px-4 py-3 text-xs font-medium outline-none focus:border-noir transition-all" placeholder="Nom du contact" value={form.deliveryContact} onChange={e => setForm({ ...form, deliveryContact: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-noir/40 ml-1">Téléphone</label>
                <input className="w-full rounded-xl border border-noir/5 bg-white px-4 py-3 text-xs font-medium outline-none focus:border-noir transition-all" placeholder="Mobile..." value={form.deliveryPhone} onChange={e => setForm({ ...form, deliveryPhone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-noir/40 ml-1">Digicode / Étage</label>
                <input className="w-full rounded-xl border border-noir/5 bg-white px-4 py-3 text-xs font-medium outline-none focus:border-noir transition-all" placeholder="Détail Livraison" value={form.deliveryInstructions} onChange={e => setForm({ ...form, deliveryInstructions: e.target.value })} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
