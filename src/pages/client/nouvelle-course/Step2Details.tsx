import { Info } from "lucide-react";

export function Step2Details({ form, setForm, vehicles }) {
  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="grid md:grid-cols-2 gap-10">
        <div className="space-y-5">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Planification</h2>
          <div className="grid grid-cols-3 gap-4">
            <input type="date" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            <input type="time" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" value={form.pickupTime} onChange={e => setForm({ ...form, pickupTime: e.target.value })} />
            <input type="time" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-[#ed5518] outline-none" value={form.deliveryDeadline} onChange={e => setForm({ ...form, deliveryDeadline: e.target.value })} />
          </div>
          <div className="mt-4">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Commentaire sur l'horaire (optionnel)</label>
            <textarea 
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-[#ed5518] outline-none min-h-[80px]" 
              placeholder="Ex: Ne pas livrer entre 12h et 14h, appeler avant d'arriver..."
              value={form.deliveryScheduleNotes || ""} 
              onChange={e => setForm({ ...form, deliveryScheduleNotes: e.target.value })}
            />
          </div>
          <div className="rounded-2xl bg-orange-50 p-4 border border-[#ed5518] flex items-start gap-3 mt-4 text-[#ed5518] text-xs font-medium leading-relaxed">
            <Info size={18} className="shrink-0" />
            <p>Le niveau de service (Normal, Super, Exclu) est calculé automatiquement selon le délai entre l'enlèvement et la livraison.</p>
          </div>
        </div>
        <div className="space-y-5">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Nature du transport</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              {vehicles.map(v => <button key={v} onClick={() => setForm({ ...form, vehicle: v.toLowerCase() })} className={`flex-1 py-3 px-4 rounded-xl border font-bold text-sm ${form.vehicle === v.toLowerCase() ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-500 hover:border-slate-300 transition-all'}`}>{v}</button>)}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <select className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium" value={form.packageType} onChange={e => setForm({ ...form, packageType: e.target.value })}>{["Pli", "Colis", "Document", "Carton", "Palette"].map(t => <option key={t} value={t}>{t}</option>)}</select>
              <select className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium" value={form.packageWeight} onChange={e => setForm({ ...form, packageWeight: e.target.value })}><option value="">Poids : Non spécifié</option><option value="1">- de 1 kg</option><option value="5">1 à 5 kg</option><option value="10">5 à 10 kg</option><option value="30">10 à 30 kg</option><option value="+30">+ de 30 kg</option></select>
            </div>
            <input className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none" placeholder="Contenu (ex: Documents, Ordinateur...)" value={form.packageDesc} onChange={e => setForm({ ...form, packageDesc: e.target.value })} />
          </div>
        </div>
      </div>
    </div>
  );
}
