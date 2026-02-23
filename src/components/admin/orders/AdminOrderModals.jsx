export default function AdminOrderModals({
    decisionOpen,
    setDecisionOpen,
    reason,
    setReason,
    confirmDecision,
    dispatchOpen,
    setDispatchOpen,
    dispatchDriver,
    setDispatchDriver,
    drivers,
    dispatchNote,
    setDispatchNote,
    confirmDispatch
}) {
    return (
        <>
            {decisionOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setDecisionOpen(false)}></div>
                    <div className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-300">
                        <div className="h-16 w-16 rounded-2xl bg-slate-900 flex items-center justify-center text-3xl mb-8 shadow-xl shadow-slate-900/20">
                            🤝
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2">Accepter la mission ?</h3>
                        <p className="text-sm font-medium text-slate-500 mb-8 leading-relaxed">
                            Une fois acceptée, vous pourrez dispatcher cette mission à un livreur de votre flotte.
                        </p>

                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Note Interne</label>
                                <textarea
                                    className="w-full rounded-2xl border-none bg-slate-100 p-5 text-sm font-medium focus:ring-2 focus:ring-slate-900 transition-all shadow-inner"
                                    placeholder="Ex: Client VIP, adresse difficile..."
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    rows={3}
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={() => setDecisionOpen(false)}
                                    className="flex-1 py-4 text-xs font-black text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest border border-slate-100 rounded-2xl"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={confirmDecision}
                                    className="flex-1 bg-slate-900 text-white rounded-2xl py-4 text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-95"
                                >
                                    Confirmer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {dispatchOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setDispatchOpen(false)}></div>
                    <div className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-300">
                        <div className="h-16 w-16 rounded-2xl bg-orange-500 flex items-center justify-center text-3xl mb-8 shadow-xl shadow-orange-500/20">
                            🧭
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2">Dispatch Mission</h3>
                        <p className="text-sm font-medium text-slate-500 mb-8 leading-relaxed">
                            Sélectionnez un livreur disponible pour prendre en charge cette course.
                        </p>

                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Livreur Connecté</label>
                                <select
                                    className="w-full rounded-2xl border-none bg-slate-100 p-5 text-sm font-black focus:ring-2 focus:ring-slate-900 transition-all shadow-inner appearance-none cursor-pointer"
                                    value={dispatchDriver}
                                    onChange={(e) => setDispatchDriver(e.target.value)}
                                >
                                    <option value="">— Sélectionner —</option>
                                    {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Note pour le livreur (optionnel)</label>
                                <textarea
                                    className="w-full rounded-2xl border-none bg-slate-100 p-5 text-sm font-medium focus:ring-2 focus:ring-slate-900 transition-all shadow-inner"
                                    placeholder="Ex: Demander signature, code 1234..."
                                    value={dispatchNote}
                                    onChange={(e) => setDispatchNote(e.target.value)}
                                    rows={2}
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={() => setDispatchOpen(false)}
                                    className="flex-1 py-4 text-xs font-black text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest border border-slate-100 rounded-2xl"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={confirmDispatch}
                                    className="flex-1 bg-slate-900 text-white rounded-2xl py-4 text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-95"
                                >
                                    Assigner
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
