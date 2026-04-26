import { Info } from "lucide-react";

export function Step2Details({ form, setForm, vehicles }) {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid md:grid-cols-2 gap-12 md:gap-20">
        <div className="space-y-8">
          <div className="flex items-center gap-4 border-b border-noir/5 pb-4">
            <h2 className="text-2xl font-display italic text-noir">Planification</h2>
            <div className="flex-1 h-[1px] bg-noir/5"></div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-noir/40 ml-1">Date</label>
                <input type="date" className="w-full rounded-xl border border-noir/5 bg-white px-4 py-3 text-xs font-medium focus:border-noir transition-all" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-noir/40 ml-1">Enlèvement</label>
                <input type="time" className="w-full rounded-xl border border-noir/5 bg-white px-4 py-3 text-xs font-medium focus:border-noir transition-all" value={form.pickupTime} onChange={e => setForm({ ...form, pickupTime: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-noir/40 ml-1">Deadline</label>
                <input type="time" className="w-full rounded-xl border border-noir/5 bg-white px-4 py-3 text-xs font-medium focus:border-noir transition-all" value={form.deliveryDeadline} onChange={e => setForm({ ...form, deliveryDeadline: e.target.value })} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-noir/40 ml-1">Instructions Logistiques</label>
              <textarea
                className="w-full rounded-xl border border-noir/5 bg-white px-5 py-4 text-xs font-medium focus:border-noir transition-all min-h-[100px] placeholder:text-noir/20"
                placeholder="Ex: Ne pas livrer avant 14h, appeler au 06..."
                value={form.deliveryScheduleNotes || ""}
                onChange={e => setForm({ ...form, deliveryScheduleNotes: e.target.value })}
              />
            </div>

            <div className="rounded-xl bg-noir/[0.02] p-5 border border-noir/5 flex items-start gap-4">
              <div className="mt-0.5 h-4 w-4 bg-[#ed5518]/10 rounded-full flex items-center justify-center">
                <Info size={10} className="text-[#ed5518]" />
              </div>
              <p className="text-[10px] text-noir/60 leading-relaxed font-medium">
                Note : Le niveau de service (Normal, Super, Exclu) est adapté dynamiquement à vos délais de livraison.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="flex items-center gap-4 border-b border-noir/5 pb-4">
            <h2 className="text-2xl font-display italic text-noir">Chargement</h2>
            <div className="flex-1 h-[1px] bg-noir/5"></div>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-noir/40 ml-1">VÉHICULE REQUIS</label>
              <div className="flex gap-4">
                {vehicles.map(v => (
                  <button
                    key={v}
                    onClick={() => setForm({ ...form, vehicle: v.toLowerCase() })}
                    className={`flex-1 py-4 px-6 rounded-xl border font-bold text-[10px] uppercase tracking-[0.2em] transition-all
                      ${form.vehicle === v.toLowerCase() ? 'bg-noir text-white border-noir shadow-xl' : 'bg-white text-noir/40 border-noir/5 hover:border-noir/20'}
                    `}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-noir/40 ml-1">Type de colis</label>
                <select className="w-full rounded-xl border border-noir/5 bg-white px-4 py-3 text-xs font-bold text-noir outline-none appearance-none" value={form.packageType} onChange={e => setForm({ ...form, packageType: e.target.value })}>
                  {["Pli", "Colis", "Document", "Carton", "Palette"].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-noir/40 ml-1">Volume estimé</label>
                <select className="w-full rounded-xl border border-noir/5 bg-white px-4 py-3 text-xs font-bold text-noir outline-none appearance-none" value={form.packageWeight} onChange={e => setForm({ ...form, packageWeight: e.target.value })}>
                  <option value="">Non spécifié</option>
                  <option value="1">- de 1 kg</option>
                  <option value="5">1 à 5 kg</option>
                  <option value="10">5 à 10 kg</option>
                  <option value="30">10 à 30 kg</option>
                  <option value="+30">+ de 30 kg</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-noir/40 ml-1">Description du contenu</label>
              <input
                className="w-full rounded-xl border border-noir/5 bg-white px-5 py-4 text-xs font-medium text-noir placeholder:text-noir/20 focus:border-noir transition-all"
                placeholder="Ex: Documents juridiques, matériel informatique..."
                value={form.packageDesc}
                onChange={e => setForm({ ...form, packageDesc: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
