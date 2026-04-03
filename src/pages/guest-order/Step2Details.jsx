import { Info, Loader2 } from "lucide-react";

export function Step2Details({ form, setForm, price, calculatingPrice }) {
    const VEHICLES = ["Moto", "Voiture"];
    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-5">
                    <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Planification</h2>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Date</label>
                            <input type="date" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Enlèvement</label>
                            <input type="time" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" value={form.pickupTime} onChange={e => setForm(p => ({ ...p, pickupTime: e.target.value }))} />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Livraison max</label>
                            <input type="time" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" value={form.deliveryDeadline} onChange={e => setForm(p => ({ ...p, deliveryDeadline: e.target.value }))} />
                        </div>
                    </div>
                    <div className="mt-4">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Commentaire sur l'horaire (optionnel)</label>
                        <textarea 
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-[#ed5518] outline-none min-h-[80px]" 
                            placeholder="Ex: Ne pas livrer entre 12h et 14h, appeler avant d'arriver..."
                            value={form.deliveryScheduleNotes || ""} 
                            onChange={e => setForm(p => ({ ...p, deliveryScheduleNotes: e.target.value }))}
                        />
                    </div>
                    {price !== null && (
                        <div className="rounded-2xl bg-slate-900 p-5 text-white flex items-center justify-between mt-4">
                            <div>
                                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Prix estimé</div>
                                <div className="text-xs text-slate-400">Service : <span className="text-white font-bold capitalize">{form.service}</span></div>
                            </div>
                            {calculatingPrice ? <Loader2 className="animate-spin text-slate-400" /> : <div className="text-3xl font-black tabular-nums">{Number(price).toFixed(2)}€ <span className="text-xs font-bold text-slate-400">HT</span></div>}
                        </div>
                    )}
                </div>
                <div className="space-y-5">
                    <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Nature du transport</h2>
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            {VEHICLES.map(v => (
                                <button key={v} onClick={() => setForm(p => ({ ...p, vehicle: v.toLowerCase() }))} className={`flex-1 py-3 px-4 rounded-xl border font-bold text-sm ${form.vehicle === v.toLowerCase() ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500'}`}>{v}</button>
                            ))}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <select className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" value={form.packageType} onChange={e => setForm(p => ({ ...p, packageType: e.target.value }))}>
                                {["Pli", "Colis", "Document", "Carton", "Palette"].map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                            <select className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" value={form.packageWeight} onChange={e => setForm(p => ({ ...p, packageWeight: e.target.value }))}>
                                <option value="">Poids non spécifié</option>
                                <option value="1">Moins de 1 kg</option>
                                <option value="5">1 à 5 kg</option>
                                <option value="30">Plus de 5 kg</option>
                            </select>
                        </div>
                        <input className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" placeholder="Description courte (ex: documents...)" value={form.packageDesc} onChange={e => setForm(p => ({ ...p, packageDesc: e.target.value }))} />
                    </div>
                </div>
            </div>
        </div>
    );
}
