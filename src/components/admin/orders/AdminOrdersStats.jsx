export default function AdminOrdersStats({ activeOrders, historyOrders }) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            {[
                { label: "En attente", count: activeOrders.filter(o => o.status.includes('pending')).length, color: "text-rose-600", bg: "bg-rose-50", icon: "🚨" },
                { label: "À Assigner", count: activeOrders.filter(o => o.status === 'accepted').length, color: "text-indigo-600", bg: "bg-indigo-50", icon: "🧭" },
                { label: "En mission", count: activeOrders.filter(o => ['assigned', 'in_progress'].includes(o.status)).length, color: "text-amber-600", bg: "bg-amber-50", icon: "🚚" },
                { label: "Total Livrées", count: historyOrders.filter(o => o.status === 'delivered').length, color: "text-emerald-600", bg: "bg-emerald-50", icon: "💰" },
            ].map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-xl transition-all duration-300">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</span>
                        <span className={`text-3xl font-black ${stat.color}`}>{stat.count}</span>
                    </div>
                    <div className={`h-12 w-12 rounded-2xl ${stat.bg} flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-300`}>
                        {stat.icon}
                    </div>
                </div>
            ))}
        </div>
    );
}
