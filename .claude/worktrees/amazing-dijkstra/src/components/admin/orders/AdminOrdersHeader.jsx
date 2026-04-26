export default function AdminOrdersHeader({ view, setView, exportCsv }) {
    return (
        <header className="flex flex-wrap items-center justify-between gap-6">
            <div className="animate-in fade-in slide-in-from-left-4 duration-700">
                <h2 className="text-4xl font-black tracking-tight text-slate-900">Missions Fleet</h2>
                <p className="mt-2 text-base font-medium text-slate-500 max-w-2xl">
                    Supervisez l'ensemble des courses et gérez le dispatch en temps réel.
                </p>
            </div>

            <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-700">
                <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/50">
                    <button
                        onClick={() => setView("dispatch")}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${view === "dispatch" ? "bg-white text-slate-900 shadow-xl shadow-slate-200/50 scale-[1.02]" : "text-slate-400 hover:text-slate-600"
                            }`}
                    >
                        DISPATCH
                    </button>
                    <button
                        onClick={() => setView("history")}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${view === "history" ? "bg-white text-slate-900 shadow-xl shadow-slate-200/50 scale-[1.02]" : "text-slate-400 hover:text-slate-600"
                            }`}
                    >
                        HISTORIQUE
                    </button>
                </div>
                <button
                    onClick={exportCsv}
                    className="hidden sm:flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-xs font-black text-slate-600 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all"
                >
                    EXPORT CSV
                </button>
            </div>
        </header>
    );
}
